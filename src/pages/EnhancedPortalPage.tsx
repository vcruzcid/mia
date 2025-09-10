import { useState, useEffect, useMemo } from 'react';
import { useAuth } from '../hooks/useAuth';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { supabaseService } from '../services/supabaseService';
import { Header } from '../components/Header';
import { Footer } from '../components/Footer';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Spinner } from '@/components/ui/spinner';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

import { CheckCircleIcon, XCircleIcon, ExclamationTriangleIcon } from '@heroicons/react/24/solid';

// Form schemas
const personalInfoSchema = z.object({
  firstName: z.string().min(2, 'El nombre debe tener al menos 2 caracteres'),
  lastName: z.string().min(2, 'El apellido debe tener al menos 2 caracteres'),
  country: z.string().default('España'),
  phone: z.string().optional(),
  address: z.string().optional(),
  postalCode: z.string().optional(),
  province: z.string().optional(),
  autonomousCommunity: z.string().optional(),
  biography: z.string().max(1000, 'La biografía no puede exceder 1000 caracteres').optional(),
  socialMedia: z.object({
    linkedin: z.string().url().optional().or(z.literal('')),
    instagram: z.string().url().optional().or(z.literal('')),
    twitter: z.string().url().optional().or(z.literal('')),
    facebook: z.string().url().optional().or(z.literal('')),
    website: z.string().url().optional().or(z.literal('')),
    vimeo: z.string().url().optional().or(z.literal('')),
    youtube: z.string().url().optional().or(z.literal('')),
    artstation: z.string().url().optional().or(z.literal(''))
  }).optional(),
  privacyLevel: z.enum(['public', 'members-only', 'private']).default('public')
});

const professionalInfoSchema = z.object({
  mainProfession: z.string().min(2, 'La profesión principal es requerida'),
  isStudent: z.boolean().default(false),
  otherProfessions: z.array(z.string()).optional(),
  company: z.string().optional(),
  yearsExperience: z.number().min(0).max(50).optional(),
  professionalRole: z.enum(['junior', 'senior', 'supervisor', 'director', 'freelancer', 'student', 'other']).optional(),
  employmentStatus: z.enum(['empleada', 'autonoma', 'estudiante', 'desempleada', 'jubilada']).optional(),
  educationLevel: z.string().optional(),
  studiesCompleted: z.string().optional(),
  educationalInstitution: z.string().optional()
});

const researchDataSchema = z.object({
  acceptsNewsletter: z.boolean().default(false),
  acceptsJobOffers: z.boolean().default(false),
  participateInResearch: z.boolean().default(false),
  salaryRange: z.number().optional(),
  personalSituation: z.enum(['soltera', 'casada', 'pareja', 'divorciada', 'viuda', 'prefiero-no-decir']).optional(),
  hasChildren: z.boolean().optional(),
  workLifeBalance: z.boolean().optional(),
  experiencedGenderDiscrimination: z.boolean().optional(),
  experiencedSalaryDiscrimination: z.boolean().optional(),
  experiencedSexualHarassment: z.boolean().optional(),
  experiencedSexualAbuse: z.boolean().optional(),
  experiencedGlassCeiling: z.boolean().optional(),
  experiencedInequalityEpisode: z.boolean().optional(),
  otherAssociations: z.array(z.string()).optional()
});

type PersonalInfoData = z.infer<typeof personalInfoSchema>;
type ProfessionalInfoData = z.infer<typeof professionalInfoSchema>;
type ResearchData = z.infer<typeof researchDataSchema>;

interface CompletionStatus {
  personalInfo: boolean;
  professionalInfo: boolean;
  paymentMethod: boolean;
  profileVisibility: boolean;
  socialMedia: boolean;
}

export function EnhancedPortalPage() {
  const { member, logout, updateProfile, isLoading } = useAuth();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [message, setMessage] = useState<{ type: 'success' | 'error' | 'info'; text: string } | null>(null);
  const [completionStatus, setCompletionStatus] = useState<CompletionStatus>({
    personalInfo: false,
    professionalInfo: false,
    paymentMethod: false,
    profileVisibility: false,
    socialMedia: false
  });
  const [subscriptionData, setSubscriptionData] = useState<any>(null);
  const [uploading, setUploading] = useState(false);
  
  // Check for demo authentication
  const isDemoAuth = localStorage.getItem('demo_auth') === 'true';
  
  // Create demo member data
  const demoMember = {
    id: 'demo-123',
    email: 'demo@mia-animation.com',
    firstName: 'Ana',
    lastName: 'García',
    phone: '+34 600 123 456',
    address: 'Calle Example 123',
    postalCode: '28001',
    province: 'Madrid',
    autonomousCommunity: 'Comunidad de Madrid',
    country: 'España',
    biography: 'Directora de animación con 10 años de experiencia en la industria. Especializada en animación 2D y storytelling.',
    mainProfession: 'Directora de Animación',
    otherProfessions: ['Animadora 2D', 'Storyboard Artist'],
    company: 'Estudio Animación Madrid',
    member_number: 'MIA-2024-001',
    memberNumber: 'MIA-2024-001',
    membershipType: 'socia-de-pleno-derecho',
    membershipStatus: 'active',
    joinDate: '2024-01-15',
    subscriptionExpires: '2024-12-31',
    profileImageUrl: null,
    cvDocumentUrl: null,
    socialMedia: {
      linkedin: 'https://linkedin.com/in/ana-garcia-animation',
      instagram: 'https://instagram.com/ana_animates',
      vimeo: 'https://vimeo.com/anagarcia'
    },
    privacyLevel: 'public'
  };
  
  // Normalize member data with memoization
  const currentMember = useMemo(() => {
    if (isDemoAuth) {
      return demoMember;
    }
    
    if (member) {
      return {
        ...member,
        firstName: member.first_name,
        lastName: member.last_name,
        phone: member.phone,
        address: member.address,
        postalCode: member.postal_code,
        province: member.province,
        autonomousCommunity: member.autonomous_community,
        country: member.country,
        biography: member.biography,
        mainProfession: member.main_profession,
        otherProfessions: member.other_professions || [],
        memberNumber: member.member_number,
        membershipType: member.membership_type,
        membershipStatus: member.is_active ? 'active' : 'inactive',
        joinDate: member.created_at,
        profileImageUrl: member.profile_image_url,
        cvDocumentUrl: member.cv_document_url,
        socialMedia: member.social_media || {},
        privacyLevel: member.privacy_level || 'public'
      };
    }
    
    return null;
  }, [isDemoAuth, member]);

  // Form setups
  const personalInfoForm = useForm<PersonalInfoData>({
    resolver: zodResolver(personalInfoSchema),
    defaultValues: {
      firstName: '',
      lastName: '',
      phone: '',
      address: '',
      postalCode: '',
      province: '',
      autonomousCommunity: '',
      country: 'España',
      biography: '',
      socialMedia: {},
      privacyLevel: 'public'
    }
  });

  const professionalInfoForm = useForm<ProfessionalInfoData>({
    resolver: zodResolver(professionalInfoSchema),
    defaultValues: {
      mainProfession: '',
      isStudent: false,
      otherProfessions: [],
      company: ''
    }
  });

  const researchDataForm = useForm<ResearchData>({
    resolver: zodResolver(researchDataSchema),
    defaultValues: {
      acceptsNewsletter: false,
      acceptsJobOffers: false,
      participateInResearch: false,
      salaryRange: undefined,
      personalSituation: undefined,
      hasChildren: undefined,
      workLifeBalance: undefined,
      experiencedGenderDiscrimination: false,
      experiencedSalaryDiscrimination: false,
      experiencedSexualHarassment: false,
      experiencedSexualAbuse: false,
      experiencedGlassCeiling: false,
      experiencedInequalityEpisode: false,
      otherAssociations: []
    }
  });

  // Populate forms when member data changes
  useEffect(() => {
    if (currentMember) {
      personalInfoForm.reset({
        firstName: currentMember.firstName || '',
        lastName: currentMember.lastName || '',
        phone: currentMember.phone || '',
        address: currentMember.address || '',
        postalCode: currentMember.postalCode || '',
        province: currentMember.province || '',
        autonomousCommunity: currentMember.autonomousCommunity || '',
        country: currentMember.country || 'España',
        biography: currentMember.biography || '',
        socialMedia: currentMember.socialMedia || {},
        privacyLevel: (currentMember.privacyLevel as 'public' | 'members-only' | 'private') || 'public'
      });

      professionalInfoForm.reset({
        mainProfession: currentMember.mainProfession || '',
        otherProfessions: currentMember.otherProfessions || [],
        company: currentMember.company || ''
      });
    }
  }, [currentMember, personalInfoForm, professionalInfoForm]);

  // Load subscription data
  useEffect(() => {
    if (!isDemoAuth && member) {
      loadSubscriptionData();
    } else if (isDemoAuth) {
      setSubscriptionData({
        status: 'active',
        current_period_end: '2024-12-31T23:59:59Z',
        amount: 50,
        currency: 'EUR',
        interval: 'year'
      });
    }
  }, [member, isDemoAuth]);

  // Calculate completion status
  useEffect(() => {
    if (currentMember) {
      setCompletionStatus({
        personalInfo: !!(currentMember.firstName && currentMember.lastName && currentMember.biography),
        professionalInfo: !!(currentMember.mainProfession && currentMember.otherProfessions?.length),
        paymentMethod: false, // Removed checkmark as requested
        profileVisibility: !!currentMember.privacyLevel,
        socialMedia: !!(currentMember.socialMedia && Object.keys(currentMember.socialMedia).some(key => (currentMember.socialMedia as any)?.[key]))
      });
    }
  }, [currentMember, subscriptionData]);

  const loadSubscriptionData = async () => {
    try {
      const data = await supabaseService.getMemberSubscriptionStatus();
      setSubscriptionData(data);
    } catch (error) {
      console.error('Error loading subscription data:', error);
    }
  };

  const handleLogout = async () => {
    if (isDemoAuth) {
      localStorage.removeItem('demo_auth');
      window.location.href = '/';
    } else {
      await logout();
    }
  };

  const onUpdatePersonalInfo = async (data: PersonalInfoData) => {
    setMessage(null);
    
    if (isDemoAuth) {
      setMessage({ type: 'success', text: 'Información personal actualizada (modo demo)' });
      return;
    }
    
    try {
      const updateData = {
        first_name: data.firstName,
        last_name: data.lastName,
        phone: data.phone,
        address: data.address,
        postal_code: data.postalCode,
        province: data.province,
        autonomous_community: data.autonomousCommunity,
        country: data.country,
        biography: data.biography,
        social_media: data.socialMedia,
        privacy_level: data.privacyLevel
      };
      
      await updateProfile(updateData);
      setMessage({ type: 'success', text: 'Información personal actualizada correctamente' });
    } catch (error) {
      setMessage({ type: 'error', text: error instanceof Error ? error.message : 'Error al actualizar' });
    }
  };

  const onUpdateProfessionalInfo = async (data: ProfessionalInfoData) => {
    setMessage(null);
    
    if (isDemoAuth) {
      setMessage({ type: 'success', text: 'Información profesional actualizada (modo demo)' });
      return;
    }
    
    try {
      const updateData = {
        main_profession: data.mainProfession,
        other_professions: data.otherProfessions,
        company: data.company,
        years_experience: data.yearsExperience,
        professional_role: data.professionalRole,
        employment_status: data.employmentStatus,
        education_level: data.educationLevel,
        studies_completed: data.studiesCompleted,
        educational_institution: data.educationalInstitution,
        is_student: data.isStudent
      };
      
      await updateProfile(updateData);
      setMessage({ type: 'success', text: 'Información profesional actualizada correctamente' });
    } catch (error) {
      setMessage({ type: 'error', text: error instanceof Error ? error.message : 'Error al actualizar' });
    }
  };

  const onUpdateResearchData = async (data: ResearchData) => {
    setMessage(null);
    
    if (isDemoAuth) {
      setMessage({ type: 'success', text: 'Datos de investigación guardados (modo demo)' });
      return;
    }
    
    try {
      const updateData = {
        salary_range: data.salaryRange,
        personal_situation: data.personalSituation,
        has_children: data.hasChildren,
        work_life_balance: data.workLifeBalance,
        experienced_gender_discrimination: data.experiencedGenderDiscrimination,
        experienced_salary_discrimination: data.experiencedSalaryDiscrimination,
        experienced_sexual_harassment: data.experiencedSexualHarassment,
        experienced_sexual_abuse: data.experiencedSexualAbuse,
        experienced_glass_ceiling: data.experiencedGlassCeiling,
        experienced_inequality_episode: data.experiencedInequalityEpisode,
        other_associations: data.otherAssociations,
        accepts_newsletter: data.acceptsNewsletter,
        accepts_job_offers: data.acceptsJobOffers
      };
      
      await updateProfile(updateData);
      setMessage({ type: 'success', text: 'Datos de investigación guardados correctamente' });
    } catch (error) {
      setMessage({ type: 'error', text: error instanceof Error ? error.message : 'Error al guardar' });
    }
  };

  const handleFileUpload = async (file: File, type: 'profile' | 'cv') => {
    if (isDemoAuth) {
      setMessage({ type: 'info', text: 'Carga de archivos no disponible en modo demo' });
      return;
    }
    
    setUploading(true);
    try {
      const url = await supabaseService.uploadMemberFile(file, type);
      const updateData = type === 'profile' ? 
        { profile_image_url: url } : 
        { cv_document_url: url };
      
      await updateProfile(updateData);
      setMessage({ type: 'success', text: `${type === 'profile' ? 'Foto de perfil' : 'CV'} actualizado correctamente` });
    } catch (error) {
      setMessage({ type: 'error', text: error instanceof Error ? error.message : 'Error al subir archivo' });
    } finally {
      setUploading(false);
    }
  };

  const openStripePortal = async () => {
    if (isDemoAuth) {
      setMessage({ type: 'info', text: 'Portal de Stripe no disponible en modo demo' });
      return;
    }
    
    try {
      const { url } = await supabaseService.createStripePortalSession();
      window.open(url, '_blank');
    } catch {
      setMessage({ type: 'error', text: 'Error al abrir el portal de pagos' });
    }
  };

  const getCompletionPercentage = () => {
    const completed = Object.values(completionStatus).filter(Boolean).length;
    return Math.round((completed / Object.keys(completionStatus).length) * 100);
  };

  const getMembershipTypeLabel = (type: string) => {
    switch (type) {
      case 'socia-de-pleno-derecho': return 'Socia de Pleno Derecho';
      case 'estudiante': return 'Socia Estudiante';
      case 'colaboradora': return 'Colaboradora';
      default: return type;
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'active': return 'Activa';
      case 'pending': return 'Pendiente';
      case 'suspended': return 'Suspendida';
      case 'expired': return 'Expirada';
      default: return status;
    }
  };

  if (!currentMember && !isDemoAuth) {
    return (
      <div className="min-h-screen flex flex-col bg-gray-900 dark">
        <Header />
        <main className="flex-1 flex items-center justify-center">
          <Spinner className="h-12 w-12" />
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-900 dark">
      <Header />
      
      {/* Portal Header */}
      <div className="bg-gray-800 border-b border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <h1 className="text-xl font-semibold text-white">Portal de Socias</h1>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-300">
                Hola, {currentMember?.firstName}
                {currentMember?.memberNumber && (
                  <span className="ml-2 text-xs text-gray-400">
                    #{currentMember.memberNumber}
                  </span>
                )}
              </span>
              <Button
                onClick={handleLogout}
                variant="outline"
                size="sm"
                className="border-gray-700 text-gray-300 hover:bg-gray-700 hover:text-white"
              >
                Salir
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="flex-1 max-w-7xl mx-auto py-6 sm:px-6 lg:px-8 w-full">
        <div className="px-4 py-6 sm:px-0">
          {message && (
            <div className={`p-4 rounded-lg border flex items-start gap-3 mb-6 ${
              message.type === 'success' 
                ? 'bg-green-900/10 border-green-400/30 text-green-400' 
                : message.type === 'error'
                ? 'bg-red-900/10 border-red-400/30 text-red-400'
                : 'bg-blue-900/10 border-blue-400/30 text-blue-400'
            }`}>
              <span className="text-sm">{message.text}</span>
            </div>
          )}

          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
            <TabsList className="grid w-full grid-cols-5 bg-gray-800 p-1 rounded-lg">
              <TabsTrigger value="dashboard" className="text-gray-300 data-[state=active]:bg-red-600 data-[state=active]:text-white">
                Dashboard
              </TabsTrigger>
              <TabsTrigger value="personal" className="text-gray-300 data-[state=active]:bg-red-600 data-[state=active]:text-white">
                Personal
              </TabsTrigger>
              <TabsTrigger value="professional" className="text-gray-300 data-[state=active]:bg-red-600 data-[state=active]:text-white">
                Profesional
              </TabsTrigger>
              <TabsTrigger value="payment" className="text-gray-300 data-[state=active]:bg-red-600 data-[state=active]:text-white">
                Pagos
              </TabsTrigger>
              <TabsTrigger value="research" className="text-gray-300 data-[state=active]:bg-red-600 data-[state=active]:text-white">
                Investigación
              </TabsTrigger>
            </TabsList>

            {/* Dashboard Tab */}
            <TabsContent value="dashboard" className="space-y-6">
              {/* Welcome Card */}
              <Card className="bg-gray-800 border-gray-700">
                <CardContent className="pt-6">
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-2xl text-white mb-2">
                        Bienvenida de vuelta, {currentMember?.firstName}
                      </CardTitle>
                      <CardDescription className="text-gray-400 text-lg">
                        {getMembershipTypeLabel(currentMember?.membershipType || '')}
                        {currentMember?.memberNumber && (
                          <span className="ml-3 text-sm">Socia #{currentMember.memberNumber}</span>
                        )}
                      </CardDescription>
                    </div>
                    <Badge 
                      variant={currentMember?.membershipStatus === 'active' ? 'default' : 'destructive'}
                      className="text-sm"
                    >
                      {getStatusLabel(currentMember?.membershipStatus || 'expired')}
                    </Badge>
                  </div>
                </CardContent>
              </Card>

              {/* Profile Completion */}
              <Card className="bg-gray-800 border-gray-700">
                <CardHeader>
                  <CardTitle className="text-lg text-white flex items-center justify-between">
                    Completitud del Perfil
                    <span className="text-2xl font-bold text-red-400">
                      {getCompletionPercentage()}%
                    </span>
                  </CardTitle>
                  <div className="w-full bg-gray-700 rounded-full h-3">
                    <div 
                      className="bg-red-600 h-3 rounded-full transition-all duration-300"
                      style={{ width: `${getCompletionPercentage()}%` }}
                    />
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  {Object.entries(completionStatus).map(([key, completed]) => (
                    <div key={key} className="flex items-center justify-between">
                      <span className="text-gray-300 flex items-center">
                        {completed ? (
                          <CheckCircleIcon className="h-5 w-5 text-green-500 mr-2" />
                        ) : (
                          <XCircleIcon className="h-5 w-5 text-red-500 mr-2" />
                        )}
                        {key === 'personalInfo' && 'Información Personal'}
                        {key === 'professionalInfo' && 'Información Profesional'}
                        {key === 'paymentMethod' && 'Método de Pago'}
                        {key === 'profileVisibility' && 'Visibilidad del Perfil'}
                        {key === 'socialMedia' && 'Redes Sociales'}
                      </span>
                      {!completed && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => setActiveTab(
                            key === 'personalInfo' ? 'personal' :
                            key === 'professionalInfo' ? 'professional' :
                            key === 'paymentMethod' ? 'payment' : 
                            'personal'
                          )}
                          className="border-gray-600 text-gray-300 hover:bg-gray-700"
                        >
                          Completar
                        </Button>
                      )}
                    </div>
                  ))}
                </CardContent>
              </Card>

              {/* Quick Stats */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card className="bg-gray-800 border-gray-700">
                  <CardContent className="pt-6">
                    <div className="text-center">
                      <div className="text-3xl font-bold text-white">
                        {currentMember?.joinDate ? 
                          Math.floor((new Date().getTime() - new Date(currentMember.joinDate).getTime()) / (1000 * 60 * 60 * 24 * 365.25))
                          : '0'
                        }
                      </div>
                      <div className="text-sm text-gray-400">Años como socia</div>
                    </div>
                  </CardContent>
                </Card>
                
                <Card className="bg-gray-800 border-gray-700">
                  <CardContent className="pt-6">
                    <div className="text-center">
                      <div className="text-3xl font-bold text-white">
                        {subscriptionData?.current_period_end ? 
                          Math.abs(Math.ceil((new Date(subscriptionData.current_period_end).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)))
                          : '365'
                        }
                      </div>
                      <div className="text-sm text-gray-400">Días hasta renovación</div>
                      <div className="text-xs text-gray-500 mt-1">
                        {subscriptionData?.current_period_end ? 
                          new Date(subscriptionData.current_period_end).toLocaleDateString('es-ES', { 
                            day: 'numeric', 
                            month: 'long', 
                            year: 'numeric' 
                          })
                          : '31 de diciembre de 2024'
                        }
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-gray-800 border-gray-700">
                  <CardContent className="pt-6">
                    <div className="text-center">
                      <div className="text-3xl font-bold text-white">
                        {currentMember?.privacyLevel === 'public' ? 'Público' : 
                         currentMember?.privacyLevel === 'members-only' ? 'Socias' : 'Privado'}
                      </div>
                      <div className="text-sm text-gray-400">Visibilidad del perfil</div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* Personal Info Tab */}
            <TabsContent value="personal" className="space-y-6">
              <Card className="bg-gray-800 border-gray-700">
                <CardHeader>
                  <CardTitle className="text-lg text-white">
                    Información Personal
                  </CardTitle>
                  <CardDescription className="text-gray-400">
                    Gestiona tu información personal y configuración de privacidad.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={personalInfoForm.handleSubmit(onUpdatePersonalInfo as any)} className="space-y-6">
                    {/* Profile Image Upload */}
                    <div className="flex items-center space-x-6">
                      <div className="flex-shrink-0">
                        {currentMember?.profileImageUrl ? (
                          <img className="h-24 w-24 rounded-full object-cover" src={currentMember.profileImageUrl} alt="Profile" />
                        ) : (
                          <div className="h-24 w-24 rounded-full bg-gray-700 flex items-center justify-center">
                            <span className="text-2xl text-gray-400">{currentMember?.firstName?.[0]}{currentMember?.lastName?.[0]}</span>
                          </div>
                        )}
                      </div>
                      <div>
                        <Label htmlFor="profile-image" className="text-gray-300 cursor-pointer">
                          <div className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg text-sm transition-colors">
                            Cambiar foto
                          </div>
                        </Label>
                        <input
                          id="profile-image"
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={(e) => e.target.files?.[0] && handleFileUpload(e.target.files[0], 'profile')}
                          disabled={uploading}
                        />
                        <p className="text-xs text-gray-400 mt-1">JPG, PNG hasta 5MB</p>
                      </div>
                    </div>

                    {/* Basic Info */}
                    <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-2">
                      <div className="space-y-2">
                        <Label htmlFor="firstName" className="text-gray-300">Nombre *</Label>
                        <Input
                          {...personalInfoForm.register('firstName')}
                          className="bg-gray-900 border-gray-700 text-white"
                        />
                        {personalInfoForm.formState.errors.firstName && (
                          <p className="text-sm text-red-400">{personalInfoForm.formState.errors.firstName.message}</p>
                        )}
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="lastName" className="text-gray-300">Apellido *</Label>
                        <Input
                          {...personalInfoForm.register('lastName')}
                          className="bg-gray-900 border-gray-700 text-white"
                        />
                        {personalInfoForm.formState.errors.lastName && (
                          <p className="text-sm text-red-400">{personalInfoForm.formState.errors.lastName.message}</p>
                        )}
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="phone" className="text-gray-300">Teléfono</Label>
                        <Input
                          {...personalInfoForm.register('phone')}
                          className="bg-gray-900 border-gray-700 text-white"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="province" className="text-gray-300">Provincia</Label>
                        <Input
                          {...personalInfoForm.register('province')}
                          className="bg-gray-900 border-gray-700 text-white"
                        />
                      </div>
                    </div>

                    {/* Biography */}
                    <div className="space-y-2">
                      <Label htmlFor="biography" className="text-gray-300">Biografía</Label>
                      <Textarea
                        {...personalInfoForm.register('biography')}
                        rows={4}
                        className="bg-gray-900 border-gray-700 text-white resize-none"
                        placeholder="Cuéntanos sobre tu trayectoria profesional..."
                      />
                    </div>

                    <div className="flex justify-end">
                      <Button
                        type="submit"
                        disabled={isLoading}
                        className="bg-red-600 hover:bg-red-700"
                      >
                        {isLoading ? (
                          <>
                            <Spinner className="h-4 w-4 mr-2" />
                            Guardando...
                          </>
                        ) : (
                          'Guardar Cambios'
                        )}
                      </Button>
                    </div>
                  </form>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Professional Info Tab */}
            <TabsContent value="professional" className="space-y-6">
              <Card className="bg-gray-800 border-gray-700">
                <CardHeader>
                  <CardTitle className="text-lg text-white">
                    Información Profesional
                  </CardTitle>
                  <CardDescription className="text-gray-400">
                    Actualiza tu información profesional y formación académica.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={professionalInfoForm.handleSubmit(onUpdateProfessionalInfo as any)} className="space-y-6">
                    {/* CV Upload */}
                    <div className="space-y-4">
                      <Label className="text-gray-300">CV / Portfolio</Label>
                      <div className="flex items-center space-x-4">
                        <Label htmlFor="cv-upload" className="cursor-pointer">
                          <div className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg text-sm transition-colors text-gray-300">
                            Subir CV
                          </div>
                        </Label>
                        <input
                          id="cv-upload"
                          type="file"
                          accept=".pdf,.doc,.docx"
                          className="hidden"
                          onChange={(e) => e.target.files?.[0] && handleFileUpload(e.target.files[0], 'cv')}
                          disabled={uploading}
                        />
                        {currentMember?.cvDocumentUrl && (
                          <a 
                            href={currentMember.cvDocumentUrl} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="text-blue-400 hover:text-blue-300 text-sm"
                          >
                            Ver CV actual
                          </a>
                        )}
                      </div>
                    </div>

                    {/* Main Profession */}
                    <div className="space-y-2">
                      <Label htmlFor="mainProfession" className="text-gray-300">Profesión Principal *</Label>
                      <Input
                        {...professionalInfoForm.register('mainProfession')}
                        className="bg-gray-900 border-gray-700 text-white"
                        placeholder="ej. Directora de Animación, Animadora 2D..."
                      />
                      {professionalInfoForm.formState.errors.mainProfession && (
                        <p className="text-sm text-red-400">{professionalInfoForm.formState.errors.mainProfession.message}</p>
                      )}
                    </div>

                    <div className="flex justify-end">
                      <Button
                        type="submit"
                        disabled={isLoading}
                        className="bg-red-600 hover:bg-red-700"
                      >
                        {isLoading ? (
                          <>
                            <Spinner className="h-4 w-4 mr-2" />
                            Guardando...
                          </>
                        ) : (
                          'Guardar Cambios'
                        )}
                      </Button>
                    </div>
                  </form>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Payment Tab */}
            <TabsContent value="payment" className="space-y-6">
              <Card className="bg-gray-800 border-gray-700">
                <CardHeader>
                  <CardTitle className="text-lg text-white">
                    Información de Suscripción
                  </CardTitle>
                  <CardDescription className="text-gray-400">
                    Gestiona tu suscripción y métodos de pago.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="text-white font-medium">Portal de Gestión de Pagos</h4>
                      <p className="text-gray-400 text-sm mt-1">
                        Gestiona tu método de pago y ve tu historial de facturas.
                      </p>
                    </div>
                    <Button
                      onClick={openStripePortal}
                      className="bg-purple-600 hover:bg-purple-700"
                    >
                      Abrir Portal
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Research Data Tab */}
            <TabsContent value="research" className="space-y-6">
              <Card className="bg-gray-800 border-gray-700">
                <CardHeader>
                  <CardTitle className="text-lg text-white flex items-center">
                    <ExclamationTriangleIcon className="h-5 w-5 text-yellow-500 mr-2" />
                    Datos para Investigación
                  </CardTitle>
                  <CardDescription className="text-gray-400">
                    <strong>Información anónima y opcional.</strong> Estos datos nos ayudan a entender la situación de las mujeres en la industria.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={researchDataForm.handleSubmit(onUpdateResearchData as any)} className="space-y-6">
                    <div className="flex justify-end">
                      <Button
                        type="submit"
                        disabled={isLoading}
                        className="bg-red-600 hover:bg-red-700"
                      >
                        {isLoading ? (
                          <>
                            <Spinner className="h-4 w-4 mr-2" />
                            Guardando...
                          </>
                        ) : (
                          'Guardar Datos'
                        )}
                      </Button>
                    </div>
                  </form>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </main>
      <Footer />
    </div>
  );
}