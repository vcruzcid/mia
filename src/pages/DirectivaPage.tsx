import { useState, useMemo } from 'react';
import type { DirectivaMember } from '../types';
import { ProfileImage } from '../components/ProfileImage';
import { SocialMediaIcons } from '../components/SocialMediaIcons';
import { Badge } from '../components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { BOARD_MEMBERS_2025_2027, type BoardMember } from '../data/directiva';

// Shared utility functions
const getPositionEmail = (position: string): string => {
  const emailMap: { [key: string]: string } = {
    'Presidenta': 'presidencia@animacionesmia.com',
    'Vice-Presidenta': 'vicepresidencia@animacionesmia.com',
    'Secretaria': 'secretaria@animacionesmia.com',
    'Tesorera': 'tesoreria@animacionesmia.com',
    'Vocal Formacion': 'formacion@animacionesmia.com',
    'Vocal Comunicacion': 'comunicacion@animacionesmia.com',
    'Vocal Informes MIA': 'informemia@animacionesmia.com',
    'Vocal Financiacion': 'financiacion@animacionesmia.com',
    'Vocal Socias': 'socias@animacionesmia.com',
    'Vocal Festivales': 'festivales@animacionesmia.com',
    'Vocal': 'hola@animacionesmia.com'
  };
  return emailMap[position] || '';
};

const getPositionStyle = (position: string): string => {
  const positionStyles: Record<string, string> = {
    'Presidenta': 'from-red-600 to-red-700',
    'Vice-Presidenta': 'from-red-500 to-red-600',
    'Secretaria': 'from-red-700 to-red-800',
    'Tesorera': 'from-red-600 to-red-700',
    'Vocal Formacion': 'from-red-500 to-red-600',
    'Vocal Comunicacion': 'from-red-600 to-red-700',
    'Vocal Mianima': 'from-red-500 to-red-600',
    'Vocal Financiacion': 'from-red-600 to-red-700',
    'Vocal Socias': 'from-red-500 to-red-600',
    'Vocal Festivales': 'from-red-600 to-red-700',
    'Vocal': 'from-red-500 to-red-600',
  };
  return positionStyles[position] || 'from-red-500 to-red-600';
};

// Helper function to transform static board data to UI format
function transformBoardMemberToDirectivaMember(member: BoardMember): DirectivaMember {
  return {
    id: member.id,
    firstName: member.first_name,
    lastName: member.last_name,
    displayName: member.display_name,
    email: member.email,
    position: member.position,
    responsibilities: member.position_responsibilities,
    profileImage: member.profile_image_url,
    company: member.company,
    memberType: member.membership_type === 'pleno_derecho' ? 'socia-pleno-derecho' : 'colaborador',
    availabilityStatus: 'Disponible' as 'Disponible' | 'Empleada' | 'Freelance',
    location: {
      city: member.city,
      region: member.autonomous_community || member.province || '',
      country: member.country
    },
    bio: member.biography,
    yearServed: getYearsServed(member.board_term_start),
    joinDate: member.board_term_start,
    socialMedia: member.social_media,
    specializations: member.other_professions,
    isCurrentMember: isCurrentlyServing(member.board_term_start, member.board_term_end),
    isActive: true,
    previousPositions: [],
    board_term_start: member.board_term_start,
    board_term_end: member.board_term_end,
    board_personal_commitment: undefined,
    position_history: []
  };
}

// Helper function to calculate years served
function getYearsServed(startDate?: string): number[] {
  if (!startDate) return [new Date().getFullYear()];

  const start = new Date(startDate).getFullYear();

  // Business rule: periods are 2 years except 2017 (single-year)
  if (start === 2017) return [2017];

  // Two-year mandate (elected in start year): service years are start and start+1.
  // The next election is start+2, so the displayed "period" is start-(start+2).
  return [start, start + 1];
}

function isCurrentlyServing(startDate?: string, endDate?: string): boolean {
  if (!startDate) return false;

  const now = new Date();
  const start = new Date(startDate);
  const end = endDate ? new Date(endDate) : new Date('2099-12-31');
  return now >= start && now <= end;
}

export function DirectivaPage() {
  const [selectedMember, setSelectedMember] = useState<DirectivaMember | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Use static board member data
  const boardMembers = useMemo(() => BOARD_MEMBERS_2025_2027, []);
  const availablePeriods = ['2025-2027'];
  const currentPeriod = '2025-2027';
  const currentSelectedPeriod = currentPeriod;
  const hasBoardData = boardMembers.length > 0;

  const openMemberModal = (member: DirectivaMember) => {
    setSelectedMember(member);
    setIsModalOpen(true);
  };

  const closeMemberModal = () => {
    setIsModalOpen(false);
    setSelectedMember(null);
  };

  const transformedBoardMembers = useMemo(
    () => boardMembers.map(transformBoardMemberToDirectivaMember),
    [boardMembers]
  );

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

        {/* Period Display */}
        <div className="mt-10 max-w-2xl mx-auto px-4">
          <div className="text-center">
            <Badge variant="default" className="bg-red-600 text-white text-lg px-6 py-2">
              Período Actual: 2025-2027
            </Badge>
          </div>
        </div>
      </div>

      {/* Directiva Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
        <div className="mt-8">
          {!hasBoardData ? (
            <div className="text-center py-12">
              <div className="mx-auto h-24 w-24 bg-gray-700 rounded-full flex items-center justify-center mb-4">
                <svg className="h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-white mb-2">
                No hay información disponible
              </h3>
              <p className="text-gray-300">
                No se encontraron miembros de la directiva para el período actual.
              </p>
            </div>
          ) : (
            <div className="space-y-8">
              {/* Period Header */}
              <div className="text-center">
                <h2 className="text-2xl font-bold text-white mb-2">
                  Período 2025-2027
                </h2>
                <Badge variant="default" className="bg-green-600 text-white">
                  Período Actual
                </Badge>
              </div>

              {/* Board Members Grid */}
              <div className="grid gap-6 sm:gap-8 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
                {transformedBoardMembers.map((member, index) => {
                  const uniqueKey = `${member.id}-${member.position}-${index}`;
                  return (
                    <DirectivaCard
                      key={uniqueKey}
                      member={member}
                      index={index}
                      onClick={() => openMemberModal(member)}
                      isCurrentPeriod={true}
                    />
                  );
                })}
              </div>
            </div>
          )}
        </div>
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

  return (
    <Card 
      onClick={onClick}
      className="bg-white overflow-hidden transition-all duration-300 cursor-pointer transform hover:scale-105 ring-2 ring-red-200 shadow-lg"
      style={{
        animationDelay: `${index * 100}ms`,
        animation: 'fadeInUp 0.6s ease-out forwards'
      }}
    >
      <div className="relative">
        {/* Header with gradient background */}
        <div className={`bg-gradient-to-r ${getPositionStyle(member.position)} text-white h-16`}>
        </div>
        
        {/* Profile Image */}
        <div className="absolute -bottom-6 left-4">
          <div className="relative">
            <ProfileImage
              src={member.profileImage}
              alt={`${member.firstName} ${member.lastName}`}
              size="lg"
              className="border-3 border-white shadow-lg"
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

      <CardContent className="pt-8 p-3 sm:p-4">
        <div className="mb-4">
          <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-1">
            {member.firstName} {member.lastName}
          </h3>
          <div className={`inline-block px-2 sm:px-3 py-1 rounded-full text-xs sm:text-sm font-semibold bg-gradient-to-r ${getPositionStyle(member.position)} text-white`}>
            {member.position}
          </div>
          {member.company && (
            <p className="text-xs sm:text-sm text-gray-700 mt-2">
              {member.company}
            </p>
          )}
        </div>



        {/* Email - only show for current period */}
        {isCurrentPeriod && getPositionEmail(member.position) && (
          <div className="border-t border-gray-200 pt-4 pb-3">
            <div className="flex items-center text-sm text-gray-600">
              <svg className="h-4 w-4 mr-2 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
              <a 
                href={`mailto:${getPositionEmail(member.position)}`}
                className="text-red-600 hover:text-red-700 transition-colors"
                onClick={(e) => e.stopPropagation()}
              >
                {getPositionEmail(member.position)}
              </a>
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
  
  return (
    <DialogContent className="sm:max-w-4xl max-h-[90vh] overflow-y-auto mx-4 sm:mx-0">
          {/* Header */}
          <div className={`bg-gradient-to-r ${getPositionStyle(member.position)} px-4 sm:px-6 py-2`}>
            <div className="flex items-start gap-6">
              <ProfileImage
                src={member.profileImage}
                alt={`${member.firstName} ${member.lastName}`}
                size="2xl"
                className="border-3 border-white flex-shrink-0"
              />
              <div className="flex-1 pt-2">
                <h3 className="text-2xl font-bold text-white mb-1">
                  {member.firstName} {member.lastName}
                </h3>
                <p className="text-lg text-white/90 mb-1">{member.position}</p>
                {member.isCurrentMember && getPositionEmail(member.position) && (
                  <p className="text-sm text-white/80 mb-2">
                    <a 
                      href={`mailto:${getPositionEmail(member.position)}`}
                      className="hover:text-white transition-colors"
                    >
                      {getPositionEmail(member.position)}
                    </a>
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="px-4 sm:px-6 py-4 sm:py-6 space-y-4 sm:space-y-6">
            {member.bio && (
              <div>
                <h4 className="text-sm font-semibold text-gray-900 mb-2">Biografía</h4>
                <p className="text-sm text-gray-700 leading-relaxed">{member.bio}</p>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
              <div>
                <h4 className="text-sm font-semibold text-gray-900 mb-3">Responsabilidades</h4>
                <div className="space-y-2">
                  {member.responsibilities.map((responsibility, idx) => (
                    <div key={idx} className="flex items-start">
                      <svg className="h-4 w-4 text-red-500 mr-2 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
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
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
              <div>
                <h4 className="text-sm font-semibold text-gray-900 mb-3">Período actual</h4>
                <div className="flex flex-wrap gap-2">
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-700 ring-1 ring-green-200">
                    {member.board_term_start?.split('-')[0]} - {member.board_term_end?.split('-')[0]}
                    <span className="ml-1">✓</span>
                  </span>
                </div>
              </div>

            </div>

            {/* Specializations */}
            <div>
              <h4 className="text-sm font-semibold text-gray-900 mb-3">Especializaciones</h4>
              <div className="flex flex-wrap gap-2">
                {member.specializations.map((spec, idx) => (
                  <span
                    key={idx}
                    className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-red-100 text-red-700"
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