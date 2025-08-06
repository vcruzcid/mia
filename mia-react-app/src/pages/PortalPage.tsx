import { useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Header } from '../components/Header';
import { Footer } from '../components/Footer';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

const profileUpdateSchema = z.object({
  firstName: z.string().min(2, 'El nombre debe tener al menos 2 caracteres'),
  lastName: z.string().min(2, 'El apellido debe tener al menos 2 caracteres'),
  phoneNumber: z.string().optional(),
  bio: z.string().max(500, 'La biografía no puede exceder 500 caracteres').optional(),
  interests: z.array(z.string()).optional(),
});

type ProfileUpdateData = z.infer<typeof profileUpdateSchema>;

export function PortalPage() {
  const { member, logout, updateProfile, isLoading } = useAuth();
  const [activeTab, setActiveTab] = useState<'dashboard' | 'profile'>('dashboard');
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  
  // Check for demo authentication
  const isDemoAuth = localStorage.getItem('demo_auth') === 'true';
  
  // Create demo member data if using demo auth
  const demoMember = {
    id: 'demo-123',
    email: 'demo@test.com',
    firstName: 'Demo',
    lastName: 'User',
    phoneNumber: '+34 600 123 456',
    bio: 'Esta es una cuenta de demostración para probar el portal de MIA.',
    interests: ['Animación 2D', 'Storyboard', 'Character Design'],
    membershipType: 'pleno-derecho',
    membershipStatus: 'active',
    joinDate: '2024-01-15',
  };
  
  // Create normalized member object
  const normalizedMember = member ? {
    ...member,
    firstName: member.first_name,
    lastName: member.last_name,
    phoneNumber: member.phone,
    bio: member.biography,
    interests: member.other_professions || [],
    membershipType: member.membership_type,
    membershipStatus: member.is_active ? 'active' : 'inactive',
    joinDate: member.created_at
  } : null;

  const currentMember = isDemoAuth ? demoMember : normalizedMember;

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<ProfileUpdateData>({
    resolver: zodResolver(profileUpdateSchema),
    defaultValues: {
      firstName: currentMember?.firstName || '',
      lastName: currentMember?.lastName || '',
      phoneNumber: currentMember?.phoneNumber || '',
      bio: currentMember?.bio || '',
      interests: currentMember?.interests || [],
    },
  });

  const handleLogout = async () => {
    if (isDemoAuth) {
      localStorage.removeItem('demo_auth');
      window.location.href = '/';
    } else {
      await logout();
    }
  };

  const onUpdateProfile = async (data: ProfileUpdateData) => {
    setMessage(null);
    
    if (isDemoAuth) {
      // Simulate successful update for demo
      setMessage({ type: 'success', text: 'Perfil actualizado correctamente (modo demo)' });
      reset(data);
      return;
    }
    
    try {
      // Map form data to Supabase format
      const updateData = {
        first_name: data.firstName,
        last_name: data.lastName,
        phone: data.phoneNumber,
        biography: data.bio,
        other_professions: data.interests
      };
      
      await updateProfile(updateData);
      setMessage({ type: 'success', text: 'Perfil actualizado correctamente' });
      reset(data);
    } catch (error) {
      setMessage({ type: 'error', text: error instanceof Error ? error.message : 'Error al actualizar el perfil' });
    }
  };

  const getMembershipTypeLabel = (type: string) => {
    switch (type) {
      case 'standard': return 'Estándar';
      case 'premium': return 'Premium';
      case 'directiva': return 'Directiva';
      case 'pleno-derecho': return 'Pleno Derecho';
      default: return type;
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'active': return 'Activa';
      case 'pending': return 'Pendiente';
      case 'suspended': return 'Suspendida';
      default: return status;
    }
  };

  if (!currentMember && !isDemoAuth) {
    return (
      <div className="min-h-screen flex flex-col bg-gray-900 dark">
        <Header />
        <main className="flex-1 flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-500"></div>
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
              <img className="h-8 w-auto" src="/mia_logo_web-ok-177x77.png" alt="MIA Logo" />
              <h1 className="ml-3 text-xl font-semibold text-white">Portal de Socias</h1>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-300">
                Hola, {currentMember?.firstName}
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

      {/* Navigation */}
      <nav className="bg-gray-800 border-b border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex space-x-8">
            <Button
              variant="ghost"
              onClick={() => setActiveTab('dashboard')}
              className={`py-4 px-1 border-b-2 font-medium text-sm rounded-none h-auto ${
                activeTab === 'dashboard'
                  ? 'border-red-500 text-red-400 hover:text-red-300'
                  : 'border-transparent text-gray-400 hover:text-gray-300 hover:border-gray-300'
              }`}
            >
              Dashboard
            </Button>
            <Button
              variant="ghost"
              onClick={() => setActiveTab('profile')}
              className={`py-4 px-1 border-b-2 font-medium text-sm rounded-none h-auto ${
                activeTab === 'profile'
                  ? 'border-red-500 text-red-400 hover:text-red-300'
                  : 'border-transparent text-gray-400 hover:text-gray-300 hover:border-gray-300'
              }`}
            >
              Mi Perfil
            </Button>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="flex-1 max-w-7xl mx-auto py-6 sm:px-6 lg:px-8 w-full">
        <div className="px-4 py-6 sm:px-0">
          {message && (
            <div className={`p-4 rounded-lg border flex items-start gap-3 mb-6 ${
              message.type === 'success' 
                ? 'bg-green-900/10 border-green-400/30 text-green-400' 
                : 'bg-red-900/10 border-red-400/30 text-red-400'
            }`}>
              <span className="text-sm">{message.text}</span>
            </div>
          )}

          {activeTab === 'dashboard' && (
            <div className="space-y-6">
              {/* Welcome Card */}
              <Card className="bg-gray-800 border-gray-700">
                <CardContent className="pt-6">
                  <CardTitle className="text-lg text-white mb-2">
                    Bienvenida de vuelta, {currentMember?.firstName}
                  </CardTitle>
                  <CardDescription className="text-gray-400">
                    Aquí encontrarás toda la información importante sobre tu membresía.
                  </CardDescription>
                </CardContent>
              </Card>

              {/* Membership Info */}
              <Card className="bg-gray-800 border-gray-700">
                <CardHeader>
                  <CardTitle className="text-lg text-white">
                    Información de Membresía
                  </CardTitle>
                </CardHeader>
                <CardContent className="border-t border-gray-700 pt-6">
                  <dl className="grid grid-cols-1 gap-x-4 gap-y-6 sm:grid-cols-2">
                    <div>
                      <dt className="text-sm font-medium text-gray-400">Tipo de Membresía</dt>
                      <dd className="mt-1 text-sm text-white">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          currentMember?.membershipType === 'directiva'
                            ? 'bg-purple-100 text-purple-800'
                            : currentMember?.membershipType === 'premium'
                            ? 'bg-yellow-100 text-yellow-800'
                            : 'bg-green-100 text-green-800'
                        }`}>
                          {getMembershipTypeLabel(currentMember?.membershipType || '')}
                        </span>
                      </dd>
                    </div>
                    <div>
                      <dt className="text-sm font-medium text-gray-400">Estado</dt>
                      <dd className="mt-1 text-sm text-white">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          (currentMember && 'status' in currentMember ? currentMember.status : (currentMember && 'membershipStatus' in currentMember ? currentMember.membershipStatus : 'expired')) === 'active'
                            ? 'bg-green-100 text-green-800'
                            : (currentMember && 'status' in currentMember ? currentMember.status : (currentMember && 'membershipStatus' in currentMember ? currentMember.membershipStatus : 'expired')) === 'pending'
                            ? 'bg-yellow-100 text-yellow-800'
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {getStatusLabel((currentMember && 'status' in currentMember ? currentMember.status : (currentMember && 'membershipStatus' in currentMember ? currentMember.membershipStatus : 'expired')) as 'active' | 'pending' | 'expired')}
                        </span>
                      </dd>
                    </div>
                    <div>
                      <dt className="text-sm font-medium text-gray-400">Fecha de Ingreso</dt>
                      <dd className="mt-1 text-sm text-white">
                        {currentMember?.joinDate ? new Date(currentMember.joinDate).toLocaleDateString('es-ES', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        }) : 'N/A'}
                      </dd>
                    </div>
                    <div>
                      <dt className="text-sm font-medium text-gray-400">Correo Electrónico</dt>
                      <dd className="mt-1 text-sm text-white">{currentMember?.email}</dd>
                    </div>
                  </dl>
                </CardContent>
              </Card>
            </div>
          )}

          {activeTab === 'profile' && (
            <div className="space-y-6">
              <Card className="bg-gray-800 border-gray-700">
                <CardHeader>
                  <CardTitle className="text-lg text-white">
                    Mi Perfil
                  </CardTitle>
                  <CardDescription className="text-gray-400">
                    Actualiza tu información personal y preferencias.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  
                  <form onSubmit={handleSubmit(onUpdateProfile)} className="space-y-6">
                    <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-2">
                      <div className="space-y-2">
                        <Label htmlFor="firstName" className="text-gray-300">
                          Nombre
                        </Label>
                        <Input
                          id="firstName"
                          type="text"
                          {...register('firstName')}
                          className="bg-gray-900 border-gray-700 text-white placeholder-gray-500"
                        />
                        {errors.firstName && (
                          <p className="text-sm text-red-400">{errors.firstName.message}</p>
                        )}
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="lastName" className="text-gray-300">
                          Apellido
                        </Label>
                        <Input
                          id="lastName"
                          type="text"
                          {...register('lastName')}
                          className="bg-gray-900 border-gray-700 text-white placeholder-gray-500"
                        />
                        {errors.lastName && (
                          <p className="text-sm text-red-400">{errors.lastName.message}</p>
                        )}
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="phoneNumber" className="text-gray-300">
                        Teléfono (opcional)
                      </Label>
                      <Input
                        id="phoneNumber"
                        type="tel"
                        {...register('phoneNumber')}
                        className="bg-gray-900 border-gray-700 text-white placeholder-gray-500"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="bio" className="text-gray-300">
                        Biografía (opcional)
                      </Label>
                      <textarea
                        id="bio"
                        {...register('bio')}
                        rows={4}
                        className="w-full px-3 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent resize-none"
                        placeholder="Cuéntanos un poco sobre ti..."
                      />
                      {errors.bio && (
                        <p className="text-sm text-red-400">{errors.bio.message}</p>
                      )}
                    </div>

                    <div className="flex justify-end">
                      <Button
                        type="submit"
                        disabled={isLoading}
                        className="bg-red-600 hover:bg-red-700 disabled:opacity-50"
                      >
                        {isLoading ? (
                          <>
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
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
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
}