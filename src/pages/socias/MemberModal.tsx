import { ProfileImage } from '../../components/ProfileImage';
import { SocialMediaIcons } from '../../components/SocialMediaIcons';
import { Badge } from '../../components/ui/badge';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '../../components/ui/dialog';
import type { Member } from '../../types/supabase';

interface MemberModalProps {
  member: Member;
  isOpen: boolean;
  onClose: () => void;
}

export function MemberModal({ member, isOpen, onClose }: MemberModalProps) {
  const availabilityStatus = member.availability_status || 'Disponible';

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
                {member.company && (
                  <span className="block">{member.company}</span>
                )}
                <span className="block text-sm text-gray-400 mt-1">
                  {member.membership_type === 'profesional' ? 'Socia Profesional' : 'Colaboradora'}
                  {member.created_at && ` • Socia desde ${new Date(member.created_at).getFullYear()}`}
                </span>
              </DialogDescription>
              <div className="flex gap-2 mt-2">
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
                {member.accepts_job_offers && (
                  <Badge variant="outline" className="border-green-500 text-green-400">
                    <span className="flex items-center space-x-1">
                      <span>💼</span>
                      <span>Acepta ofertas laborales</span>
                    </span>
                  </Badge>
                )}
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
              {member.professional_role && (
                <div>
                  <span className="text-gray-400">Rol profesional:</span>
                  <p className="text-gray-100">{member.professional_role}</p>
                </div>
              )}
              {member.years_experience && (
                <div>
                  <span className="text-gray-400">Años de experiencia:</span>
                  <p className="text-gray-100">{member.years_experience} años</p>
                </div>
              )}
            </div>
          </div>

          {/* Location */}
          <div>
            <h4 className="text-sm font-medium text-gray-200 mb-2">Ubicación</h4>
            <div className="text-sm text-gray-300 space-y-1">
              {member.province && (
                <p className="flex items-center">
                  <span className="text-gray-500 mr-2">🌍</span>
                  {member.province}
                  {member.autonomous_community && `, ${member.autonomous_community}`}
                </p>
              )}
              <p className="flex items-center">
                <span className="text-gray-500 mr-2">🇪🇸</span>
                {member.country || 'España'}
              </p>
            </div>
          </div>

          {/* CV Download */}
          {member.cv_document_url && (
            <div>
              <Button
                onClick={() => window.open(member.cv_document_url!, '_blank')}
                className="w-full sm:w-auto bg-primary-600 hover:bg-primary-700 text-white"
              >
                <svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                Descargar CV
              </Button>
            </div>
          )}

          {/* Contact & Social Media */}
          <div>
            <h4 className="text-sm font-medium text-gray-200 mb-3">Contacto y Redes Sociales</h4>
            <div className="space-y-3">
              {member.phone && (
                <div className="flex items-center text-sm">
                  <span className="text-gray-500 mr-2">📞</span>
                  <span className="text-gray-300">{member.phone}</span>
                </div>
              )}
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

