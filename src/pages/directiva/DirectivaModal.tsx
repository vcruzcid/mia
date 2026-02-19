import type { DirectivaMember } from '@/types';
import { ProfileImage } from '@/components/ProfileImage';
import { SocialMediaIcons } from '@/components/SocialMediaIcons';
import { DialogContent } from '@/components/ui/dialog';
import { getPositionEmail, getPositionStyle } from './directivaUtils';

interface DirectivaModalProps {
  member: DirectivaMember;
}

export function DirectivaModal({ member }: DirectivaModalProps) {
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
            <div className="flex items-center gap-2 mb-2">
              <span className={`inline-block px-3 py-1 rounded-full text-sm font-semibold bg-gradient-to-r ${getPositionStyle(member.position)} text-white border border-white/30`}>
                {member.position}
              </span>
            </div>
            {member.isCurrentMember && getPositionEmail(member.position) && (
              <p className="text-sm text-white/90">
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

        {/* Years served */}
        <div>
          <h4 className="text-sm font-semibold text-gray-900 mb-3">Período actual</h4>
          <div className="flex flex-wrap gap-2">
            <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-700 ring-1 ring-green-200">
              {member.board_term_start?.split('-')[0]} - {member.board_term_end?.split('-')[0]}
              <span className="ml-1">✓</span>
            </span>
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
            <h4 className="text-sm font-semibold text-gray-900 mb-3">Redes Sociales</h4>
            <SocialMediaIcons
              socialMedia={member.socialMedia}
              size="sm"
              variant="compact"
            />
          </div>
        )}
      </div>
    </DialogContent>
  );
}
