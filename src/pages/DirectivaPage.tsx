import { useEffect } from 'react';
import { useGalleryStore } from '../store/galleryStore';
import type { DirectivaMember, BoardPosition } from '../types';
import { ProfileImage } from '../components/ProfileImage';
import { SocialMediaIcons } from '../components/SocialMediaIcons';
import { Badge } from '../components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Spinner } from '@/components/ui/spinner';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';

export function DirectivaPage() {
  const {
    loading,
    selectedPeriod,
    availablePeriods,
    selectedMember,
    isModalOpen,
    getCurrentBoardMembers,
    getBoardMembersForPeriod,
    setSelectedPeriod,
    openMemberModal,
    closeMemberModal,
    fetchBoardData,
  } = useGalleryStore();

  useEffect(() => {
    fetchBoardData();
  }, [fetchBoardData]);

  const currentBoardMembers = getCurrentBoardMembers();
  const selectedPeriodMembers = getBoardMembersForPeriod(selectedPeriod);
  const isCurrentPeriod = selectedPeriod === '2025-2026';

  const handlePeriodChange = (period: string) => {
    setSelectedPeriod(period);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary-50 to-primary-100 flex items-center justify-center">
        <Spinner className="h-12 w-12" />
      </div>
    );
  }

  return (
    <div className="bg-gray-900">
      {/* Hero Section */}
      <div className="max-w-7xl mx-auto py-16 px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <h1 className="text-4xl font-extrabold text-white sm:text-5xl">
            Junta Directiva MIA
          </h1>
          <p className="mt-4 text-xl text-gray-300">
            Conoce a las líderes que guían nuestra asociación hacia el futuro de la animación en España.
          </p>
        </div>

        {/* Period Selector */}
        <div className="mt-10 max-w-2xl mx-auto">
          <label className="block text-sm font-medium text-gray-300 mb-3 text-center">
            Seleccionar período de la directiva
          </label>
          <Tabs value={selectedPeriod} onValueChange={handlePeriodChange} className="w-full">
            <TabsList className="grid w-full grid-cols-5 bg-gray-800 border border-gray-700">
              {availablePeriods.map((period) => (
                <TabsTrigger
                  key={period}
                  value={period}
                  className={`text-sm font-medium transition-all duration-200 ${
                    period === '2025-2026' ? 'bg-primary-600 text-white' : 'text-gray-300 hover:text-white'
                  }`}
                >
                  {period}
                  {period === '2025-2026' && (
                    <span className="ml-1 text-xs opacity-75">(Actual)</span>
                  )}
                </TabsTrigger>
              ))}
            </TabsList>
          </Tabs>
        </div>
      </div>

      {/* Directiva Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
        <Tabs value={selectedPeriod} onValueChange={handlePeriodChange}>
          {availablePeriods.map((period) => (
            <TabsContent key={period} value={period} className="mt-8">
              {getBoardMembersForPeriod(period).length === 0 ? (
                <div className="text-center py-12">
                  <div className="mx-auto h-24 w-24 bg-gray-200 rounded-full flex items-center justify-center mb-4">
                    <svg className="h-12 w-12 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-medium text-white mb-2">
                    No hay información disponible
                  </h3>
                  <p className="text-gray-300">
                    No se encontraron miembros de la directiva para el período {period}.
                  </p>
                </div>
              ) : (
                <div className="space-y-8">
                  {/* Period Header */}
                  <div className="text-center">
                    <h2 className="text-2xl font-bold text-white mb-2">
                      Período {period}
                    </h2>
                    {period === '2025-2026' && (
                      <Badge variant="default" className="bg-green-600 text-white">
                        Período Actual
                      </Badge>
                    )}
                  </div>

                  {/* Board Members Grid */}
                  <div className="grid gap-8 lg:grid-cols-2">
                    {getBoardMembersForPeriod(period).map((member, index) => (
                      <DirectivaCard
                        key={member.id}
                        member={member}
                        index={index}
                        onClick={() => openMemberModal(member)}
                        isCurrentPeriod={period === '2025-2026'}
                      />
                    ))}
                  </div>

                  {/* Contact Board Section */}
                  {period === '2025-2026' && (
                    <div className="mt-12 text-center">
                      <Card className="bg-gray-800 border-gray-700">
                        <CardContent className="p-8">
                          <h3 className="text-xl font-bold text-white mb-4">
                            ¿Necesitas contactar con la Junta Directiva?
                          </h3>
                          <p className="text-gray-300 mb-6">
                            Cada posición tiene su propio email para facilitar la comunicación directa.
                          </p>
                          <Button asChild className="bg-primary-600 hover:bg-primary-700">
                            <a href="/contacto">
                              Contactar con la Junta
                            </a>
                          </Button>
                        </CardContent>
                      </Card>
                    </div>
                  )}
                </div>
              )}
            </TabsContent>
          ))}
        </Tabs>
      </div>

      {/* Member Modal */}
      <Dialog open={isModalOpen} onOpenChange={closeMemberModal}>
        {selectedMember && (
          <DirectivaModal
            member={selectedMember as any}
            onClose={closeMemberModal}
          />
        )}
      </Dialog>
    </div>
  );
}

interface DirectivaCardProps {
  member: DirectivaMember;
  index: number;
  onClick: () => void;
  isCurrentPeriod?: boolean;
}

function DirectivaCard({ member, index, onClick, isCurrentPeriod = false }: DirectivaCardProps) {
  const getPositionStyle = (position: string) => {
    const positionStyles: Record<string, string> = {
      'Presidenta': 'from-red-600 to-red-700 text-white',
      'Vice-Presidenta': 'from-orange-600 to-orange-700 text-white',
      'Secretaria': 'from-blue-600 to-blue-700 text-white',
      'Tesorera': 'from-green-600 to-green-700 text-white',
      'Vocal Formacion': 'from-purple-600 to-purple-700 text-white',
      'Vocal Comunicacion': 'from-pink-600 to-pink-700 text-white',
      'Vocal Mianima': 'from-indigo-600 to-indigo-700 text-white',
      'Vocal Financiacion': 'from-yellow-600 to-yellow-700 text-white',
      'Vocal Socias': 'from-teal-600 to-teal-700 text-white',
      'Vocal Festivales': 'from-cyan-600 to-cyan-700 text-white',
      'Vocal': 'from-gray-600 to-gray-700 text-white',
    };
    return positionStyles[position] || 'from-gray-600 to-gray-700 text-white';
  };

  const getCardStyle = (position: string) => {
    const cardStyles: Record<string, string> = {
      'Presidenta': 'ring-2 ring-red-200 shadow-lg',
      'Vice-Presidenta': 'ring-2 ring-orange-200 shadow-lg',
      'Secretaria': 'ring-2 ring-blue-200 shadow-lg',
      'Tesorera': 'ring-2 ring-green-200 shadow-lg',
      'Vocal Formacion': 'ring-2 ring-purple-200 shadow-lg',
      'Vocal Comunicacion': 'ring-2 ring-pink-200 shadow-lg',
      'Vocal Mianima': 'ring-2 ring-indigo-200 shadow-lg',
      'Vocal Financiacion': 'ring-2 ring-yellow-200 shadow-lg',
      'Vocal Socias': 'ring-2 ring-teal-200 shadow-lg',
      'Vocal Festivales': 'ring-2 ring-cyan-200 shadow-lg',
      'Vocal': 'ring-2 ring-gray-200 shadow-lg',
    };
    return cardStyles[position] || 'ring-2 ring-gray-200 shadow-lg';
  };

  return (
    <Card 
      onClick={onClick}
      className={`bg-white overflow-hidden transition-all duration-300 cursor-pointer transform hover:scale-105 ${getCardStyle(member.position)}`}
      style={{
        animationDelay: `${index * 100}ms`,
        animation: 'fadeInUp 0.6s ease-out forwards'
      }}
    >
      <div className="relative">
        {/* Header with gradient background */}
        <div className={`bg-gradient-to-r ${getPositionStyle(member.position)} h-24`}>
        </div>
        
        {/* Profile Image */}
        <div className="absolute -bottom-8 left-6">
          <div className="relative">
            <ProfileImage
              src={member.profileImage}
              alt={`${member.firstName} ${member.lastName}`}
              size="lg"
              className="border-4 border-white shadow-lg"
            />
            {isCurrentPeriod && (
              <div className="absolute -top-1 -right-1 h-5 w-5 bg-green-500 rounded-full border-2 border-white flex items-center justify-center">
                <svg className="h-3 w-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              </div>
            )}
          </div>
        </div>
      </div>

      <CardContent className="pt-10 p-6">
        <div className="mb-4">
          <h3 className="text-xl font-bold text-gray-900 mb-1">
            {member.firstName} {member.lastName}
          </h3>
          <div className={`inline-block px-3 py-1 rounded-full text-sm font-semibold bg-gradient-to-r ${getPositionStyle(member.position)}`}>
            {member.position}
          </div>
          {member.company && (
            <p className="text-sm text-gray-700 mt-2">
              {member.company}
            </p>
          )}
        </div>

        {/* Responsibilities */}
        <div className="mb-4">
          <h4 className="text-sm font-semibold text-gray-900 mb-2">Responsabilidades</h4>
          <div className="space-y-1">
            {member.responsibilities.slice(0, 3).map((responsibility, idx) => (
              <div key={idx} className="flex items-center">
                <svg className="h-4 w-4 text-primary-500 mr-2 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span className="text-sm text-gray-700">{responsibility}</span>
              </div>
            ))}
            {member.responsibilities.length > 3 && (
              <div className="flex items-center">
                <Badge variant="secondary" className="text-xs ml-6">
                  +{member.responsibilities.length - 3} más responsabilidades
                </Badge>
              </div>
            )}
          </div>
        </div>

        {/* Years Served */}
        <div className="mb-4">
          <h4 className="text-sm font-semibold text-gray-900 mb-2">Años de servicio</h4>
          <div className="flex flex-wrap gap-1">
            {member.yearServed.map((year) => (
              <Badge
                key={year}
                variant={year === new Date().getFullYear() ? 'default' : 'outline'}
                className="text-xs"
              >
                {year}
                {year === new Date().getFullYear() && ' (Actual)'}
              </Badge>
            ))}
          </div>
        </div>

        {/* Previous Positions */}
        {member.previousPositions && member.previousPositions.length > 0 && (
          <div className="mb-4">
            <h4 className="text-sm font-semibold text-gray-900 mb-2">Cargos anteriores</h4>
            <div className="space-y-1">
              {member.previousPositions.slice(0, 2).map((prev, idx) => (
                <div key={idx} className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">{prev.position}</span>
                  <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                    {prev.year}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Location and Social Media */}
        <div className="border-t border-gray-200 pt-4">
          <div className="flex items-center justify-between text-sm text-gray-500">
            <div className="flex items-center">
              <svg className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              <span>
                {member.location.city && `${member.location.city}, `}{member.location.country}
              </span>
            </div>
            
            <SocialMediaIcons 
              socialMedia={member.socialMedia}
              size="sm"
              variant="compact"
            />
          </div>
        </div>

        {/* Click to view more indicator */}
        <div className="mt-4 text-center">
          <span className="text-xs text-gray-600">Hacer clic para ver más detalles</span>
        </div>
      </CardContent>
    </Card>
  );
}

interface DirectivaModalProps {
  member: DirectivaMember;
  onClose: () => void;
}

function DirectivaModal({ member, onClose }: DirectivaModalProps) {
  const isPresident = member.position.toLowerCase().includes('president');
  
  const getPositionStyle = (position: string) => {
    const positionStyles: Record<string, string> = {
      'Presidenta': 'from-red-600 to-red-700',
      'Vice-Presidenta': 'from-orange-600 to-orange-700',
      'Secretaria': 'from-blue-600 to-blue-700',
      'Tesorera': 'from-green-600 to-green-700',
      'Vocal Formacion': 'from-purple-600 to-purple-700',
      'Vocal Comunicacion': 'from-pink-600 to-pink-700',
      'Vocal Mianima': 'from-indigo-600 to-indigo-700',
      'Vocal Financiacion': 'from-yellow-600 to-yellow-700',
      'Vocal Socias': 'from-teal-600 to-teal-700',
      'Vocal Festivales': 'from-cyan-600 to-cyan-700',
      'Vocal': 'from-gray-600 to-gray-700',
    };
    return positionStyles[position] || 'from-primary-500 to-primary-700';
  };
  
  return (
    <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
          {/* Header */}
          <div className={`bg-gradient-to-r ${getPositionStyle(member.position)} px-6 py-4`}>
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <ProfileImage
                  src={member.profileImage}
                  alt={`${member.firstName} ${member.lastName}`}
                  size="lg"
                  className="border-3 border-white"
                />
                <div className="ml-4">
                  <h3 className="text-xl font-bold text-white">
                    {member.firstName} {member.lastName}
                  </h3>
                  <p className="text-sm text-white/90">{member.position}</p>
                  {isPresident && (
                    <div className="flex items-center mt-1">
                      <svg className="h-4 w-4 text-red-200 mr-1" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                      <span className="text-xs text-red-200">Presidencia</span>
                    </div>
                  )}
                </div>
              </div>
              <Button
                onClick={onClose}
                className="text-white/80 hover:text-white transition-colors"
              >
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </Button>
            </div>
          </div>

          {/* Content */}
          <div className="px-6 py-6 space-y-6">
            {member.bio && (
              <div>
                <h4 className="text-sm font-semibold text-gray-900 mb-2">Biografía</h4>
                <p className="text-sm text-gray-700 leading-relaxed">{member.bio}</p>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="text-sm font-semibold text-gray-900 mb-3">Responsabilidades</h4>
                <div className="space-y-2">
                  {member.responsibilities.map((responsibility, idx) => (
                    <div key={idx} className="flex items-start">
                      <svg className="h-4 w-4 text-primary-500 mr-2 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <span className="text-sm text-gray-700">{responsibility}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <h4 className="text-sm font-semibold text-gray-900 mb-3">Información Adicional</h4>
                <div className="space-y-3">
                  <div>
                    <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">Empresa</span>
                    <p className="text-sm text-gray-900">{member.company || 'No especificada'}</p>
                  </div>
                  <div>
                    <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">Ubicación</span>
                    <p className="text-sm text-gray-900">
                      {member.location.city && `${member.location.city}, `}
                      {member.location.region && `${member.location.region}, `}
                      {member.location.country}
                    </p>
                  </div>
                  <div>
                    <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">Fecha de ingreso</span>
                    <p className="text-sm text-gray-900">
                      {new Date(member.joinDate).toLocaleDateString('es-ES', { 
                        year: 'numeric', 
                        month: 'long', 
                        day: 'numeric' 
                      })}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Personal Commitment */}
            {member.board_personal_commitment && (
              <div>
                <h4 className="text-sm font-semibold text-gray-900 mb-3">Compromiso personal</h4>
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <p className="text-sm text-gray-700 leading-relaxed italic">
                    "{member.board_personal_commitment}"
                  </p>
                </div>
              </div>
            )}

            {/* Years and Previous Positions */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="text-sm font-semibold text-gray-900 mb-3">Período actual</h4>
                <div className="flex flex-wrap gap-2">
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-700 ring-1 ring-green-200">
                    {member.board_term_start?.split('-')[0]} - {member.board_term_end?.split('-')[0]}
                    <span className="ml-1">✓</span>
                  </span>
                </div>
              </div>

              {member.position_history && member.position_history.length > 0 && (
                <div>
                  <h4 className="text-sm font-semibold text-gray-900 mb-3">Historial de cargos</h4>
                  <div className="space-y-2">
                    {member.position_history.map((prev, idx) => (
                      <div key={idx} className="flex items-center justify-between p-2 bg-gray-50 rounded-md">
                        <span className="text-sm text-gray-700">{prev.position}</span>
                        <span className="text-xs text-gray-500 bg-white px-2 py-1 rounded border">
                          {prev.term_start?.split('-')[0]} - {prev.term_end?.split('-')[0]}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Specializations */}
            <div>
              <h4 className="text-sm font-semibold text-gray-900 mb-3">Especializaciones</h4>
              <div className="flex flex-wrap gap-2">
                {member.specializations.map((spec, idx) => (
                  <span
                    key={idx}
                    className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-primary-100 text-primary-700"
                  >
                    {spec}
                  </span>
                ))}
              </div>
            </div>

            {/* Social Media */}
            {Object.values(member.socialMedia).some(Boolean) && (
              <div>
                <h4 className="text-sm font-semibold text-gray-900 mb-3">Enlaces</h4>
                <div className="flex flex-wrap gap-3">
                  {member.socialMedia.linkedin && (
                    <a
                      href={member.socialMedia.linkedin}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center px-3 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 transition-colors"
                    >
                      💼 LinkedIn
                    </a>
                  )}
                  {member.socialMedia.twitter && (
                    <a
                      href={`https://twitter.com/${member.socialMedia.twitter.replace('@', '')}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center px-3 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 transition-colors"
                    >
                      🐦 Twitter
                    </a>
                  )}
                  {member.socialMedia.instagram && (
                    <a
                      href={member.socialMedia.instagram}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center px-3 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 transition-colors"
                    >
                      📸 Instagram
                    </a>
                  )}
                  {member.socialMedia.website && (
                    <a
                      href={member.socialMedia.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center px-3 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 transition-colors"
                    >
                      🌐 Sitio Web
                    </a>
                  )}
                </div>
              </div>
            )}
          </div>

    </DialogContent>
  );
}

// Add animation styles
const styles = `
@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
`;

// Inject styles
if (typeof document !== 'undefined' && !document.getElementById('directiva-styles')) {
  const style = document.createElement('style');
  style.id = 'directiva-styles';
  style.textContent = styles;
  document.head.appendChild(style);
}