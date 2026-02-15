import { ProfileImage } from '../../components/ProfileImage';
import { SocialMediaIcons } from '../../components/SocialMediaIcons';
import { Badge } from '../../components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import type { Member } from '../../types/member';

interface MemberCardProps {
  member: Member;
  onClick: () => void;
}

export function MemberCard({ member, onClick }: MemberCardProps) {
  const displayProfession = member.main_profession || member.company || 'Profesional';
  const rawSpecializations = member.other_professions || [];
  const specializationChips =
    rawSpecializations.length > 0
      ? rawSpecializations
      : member.main_profession
        ? [member.main_profession]
        : [];
  const availabilityStatus = member.availability_status || 'Disponible';
  const isFounder = (member as any).is_founder === true;

  return (
    <Card
      onClick={onClick}
      className="hover:shadow-lg transition-all duration-200 cursor-pointer transform hover:scale-105 bg-gray-800 border-gray-700 hover:bg-gray-750"
    >
      <CardContent className="p-6">
        <div className="flex items-center mb-4">
          <ProfileImage
            src={member.profile_image_url || ''}
            alt={`${member.first_name} ${member.last_name}`}
            size="md"
          />
          <div className="ml-4 flex-1 min-w-0">
            <p className="text-lg font-medium text-white truncate">
              {member.first_name} {member.last_name}
            </p>
            <p className="text-sm text-gray-300 truncate">
              {displayProfession}
            </p>
          </div>
        </div>

        <div className="space-y-3">
          <div className="flex items-center justify-between gap-2">
            {isFounder ? (
              <Badge variant="outline" className="border-yellow-400 text-yellow-300">
                ⭐ Fundadora
              </Badge>
            ) : (
              <span />
            )}
            <Badge 
              variant={
                availabilityStatus === 'Disponible' ? 'default' : 
                availabilityStatus === 'Empleada' ? 'destructive' : 
                'secondary'
              }
            >
              <span className="flex items-center space-x-1">
                {availabilityStatus === 'Disponible' && (
                  <span title="Disponible - Abierta a nuevas oportunidades laborales">🟢</span>
                )}
                {availabilityStatus === 'Empleada' && (
                  <span title="Empleada - Actualmente trabajando, no disponible para nuevas oportunidades">🔴</span>
                )}
                {availabilityStatus === 'Freelance' && (
                  <span title="Freelance - Trabajando por cuenta propia, disponible para proyectos">🔵</span>
                )}
                <span>{availabilityStatus}</span>
              </span>
            </Badge>
          </div>

          <div>
            <p className="text-sm text-gray-300 font-medium mb-1">Especializaciones:</p>
            <div className="flex flex-wrap gap-1">
              {specializationChips.length === 0 && (
                <Badge
                  variant="outline"
                  className="text-xs border-gray-500/70 text-gray-200 bg-gray-900/40"
                >
                  Sin especificar
                </Badge>
              )}
              {specializationChips.slice(0, 3).map((spec: string, index: number) => (
                <Badge
                  key={index}
                  variant="outline"
                  className="text-xs border-gray-500/70 text-gray-100 bg-gray-900/40"
                >
                  {spec}
                </Badge>
              ))}
              {specializationChips.length > 3 && (
                <Badge variant="secondary" className="text-xs bg-gray-700 text-gray-100">
                  +{specializationChips.length - 3} más
                </Badge>
              )}
            </div>
          </div>

          <SocialMediaIcons
            socialMedia={member.social_media || {}}
            size="sm"
            variant="compact"
          />
        </div>
      </CardContent>
    </Card>
  );
}

