import { ProfileImage } from '@/components/ProfileImage';
import { SocialMediaIcons } from '@/components/SocialMediaIcons';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import type { Member } from '@/types/member';

interface MemberModalProps {
  member: Member;
  isOpen: boolean;
  onClose: () => void;
}

export function MemberModal({ member, isOpen, onClose }: MemberModalProps) {
  const availabilityStatus = member.availability_status || 'Disponible';
  const isFounder = member.is_founder === true;

  const membershipLabel =
    member.membership_type === 'pleno_derecho'
      ? 'Socia de pleno derecho'
      : member.membership_type === 'estudiante'
        ? 'Socia estudiante'
        : member.membership_type === 'colaborador'
          ? 'Socio colaborador'
          : 'Socia';

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto bg-gray-800 border-gray-700">
        <DialogHeader>
          <div className="flex items-start space-x-4">
            <ProfileImage
              src={member.profile_image_url || ''}
              alt={`${member.first_name} ${member.last_name}`}
              size="xl"
            />
            <div className="flex-1">
              <DialogTitle className="text-xl text-white">
                {member.first_name} {member.last_name}
                {member.display_name && member.display_name !== `${member.first_name} ${member.last_name}` && (
                  <span className="text-sm text-gray-400 ml-2">({member.display_name})</span>
                )}
              </DialogTitle>
              <DialogDescription className="text-base text-gray-300">
                {member.main_profession && (
                  <span className="block font-medium">{member.main_profession}</span>
                )}
                <span className="block text-sm text-gray-400 mt-1">
                  {membershipLabel}
                  {member.created_at && ` • Socia desde ${new Date(member.created_at).getFullYear()}`}
                </span>
              </DialogDescription>
              <div className="flex gap-2 mt-2">
                {isFounder && (
                  <Badge variant="outline" className="border-yellow-400 text-yellow-300">
                    ⭐ Fundadora
                  </Badge>
                )}
                <Badge 
                  variant={
                    availabilityStatus === 'Disponible' ? 'default' : 
                    availabilityStatus === 'Empleada' ? 'destructive' : 
                    'secondary'
                  }
                >
                  <span className="flex items-center space-x-1">
                    {availabilityStatus === 'Disponible' && <span>🟢</span>}
                    {availabilityStatus === 'Empleada' && <span>🔴</span>}
                    {availabilityStatus === 'Freelance' && <span>🔵</span>}
                    <span>{availabilityStatus}</span>
                  </span>
                </Badge>
              </div>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-6">
          {/* Biography Section */}
          {member.biography && (
            <div>
              <h4 className="text-sm font-medium text-gray-200 mb-2">Biografía</h4>
              <p className="text-sm text-gray-300 leading-relaxed">
                {member.biography}
              </p>
            </div>
          )}

          {/* Professional Information */}
          <div>
            <h4 className="text-sm font-medium text-gray-200 mb-3">Información Profesional</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              {member.main_profession && (
                <div>
                  <span className="text-gray-400">Profesión principal:</span>
                  <p className="text-gray-100">{member.main_profession}</p>
                </div>
              )}
              {member.other_professions && member.other_professions.length > 0 && (
                <div>
                  <span className="text-gray-400">Profesiones secundarias:</span>
                  <p className="text-gray-100">{member.other_professions.join(', ')}</p>
                </div>
              )}
            </div>
          </div>

          {/* Location */}
          <div>
            <h4 className="text-sm font-medium text-gray-200 mb-2">Ubicación</h4>
            <div className="text-sm text-gray-300 space-y-1">
              <p className="flex items-center">
                <span className="text-gray-500 mr-2">🌍</span>
                {member.country || 'España'}
              </p>
            </div>
          </div>

          {/* Contact & Social Media */}
          <div>
            <h4 className="text-sm font-medium text-gray-200 mb-3">Contacto y Redes Sociales</h4>
            <div className="space-y-3">
              <div>
                <SocialMediaIcons
                  socialMedia={member.social_media || {}}
                  size="md"
                  variant="full"
                />
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

