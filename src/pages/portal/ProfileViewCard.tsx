import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import type { PortalProfile } from '@/types/api';

const STATUS_LABELS: Record<string, string> = {
  Active: 'Activa',
  Lapsed: 'Caducada',
  PendingNew: 'Pendiente de alta',
  PendingRenewal: 'Renovación pendiente',
  Suspended: 'Suspendida',
};

const LEVEL_LABELS: Record<string, string> = {
  'Active Member': 'Socia de pleno derecho',
  'Student Member': 'Socia estudiante',
  'Collaborator': 'Colaboradora',
};

interface ProfileViewCardProps {
  profile: PortalProfile;
  onEdit: () => void;
}

function SocialLink({ label, value, isHandle }: { label: string; value: string; isHandle?: boolean }) {
  if (!value) return null;

  const href = isHandle
    ? (label === 'Instagram' ? `https://instagram.com/${value.replace('@', '')}` : `https://twitter.com/${value.replace('@', '')}`)
    : value;

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="text-sm text-red-400 hover:text-red-300 transition-colors"
      aria-label={`${label}: ${value}`}
    >
      {label}: {isHandle && !value.startsWith('@') ? `@${value}` : value}
    </a>
  );
}

export function ProfileViewCard({ profile, onEdit }: ProfileViewCardProps) {
  const {
    memberCode,
    firstName,
    lastName,
    email,
    bio,
    city,
    country,
    specializations,
    socialLinks,
    membershipLevel,
    membershipStatus,
  } = profile;

  const hasSocialLinks =
    socialLinks.linkedin || socialLinks.instagram || socialLinks.twitter || socialLinks.website;

  const statusColor =
    membershipStatus === 'Active'
      ? 'bg-green-900/20 border-green-400/30 text-green-400'
      : 'bg-yellow-900/20 border-yellow-400/30 text-yellow-400';

  return (
    <div className="bg-gray-800 border border-gray-700 rounded-lg p-6 space-y-5">
      {/* Header row */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-white">
            {firstName} {lastName}
          </h2>
          <p className="text-gray-400 text-sm mt-1">{email}</p>
          {memberCode && (
            <p className="text-gray-400 text-sm mt-1">Código de socia: {memberCode}</p>
          )}
          {(city || country) && (
            <p className="text-gray-400 text-sm mt-1">
              {[city, country].filter(Boolean).join(', ')}
            </p>
          )}
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={onEdit}
          className="text-gray-300 hover:text-white hover:bg-gray-700 shrink-0"
          aria-label="Editar perfil"
        >
          Editar
        </Button>
      </div>

      {/* Membership badges */}
      <div className="flex flex-wrap gap-2">
        {membershipLevel && (
          <Badge className="bg-red-600/20 border-red-400/30 text-red-400 border text-xs">
            {LEVEL_LABELS[membershipLevel] ?? membershipLevel}
          </Badge>
        )}
        {membershipStatus && (
          <span className={`inline-flex items-center rounded-md border px-2 py-0.5 text-xs font-medium ${statusColor}`}>
            {STATUS_LABELS[membershipStatus] ?? 'Inactiva'}
          </span>
        )}
      </div>

      {/* Bio */}
      {bio && (
        <div>
          <h3 className="text-sm font-medium text-gray-400 uppercase tracking-wide mb-2">Sobre mí</h3>
          <p className="text-gray-300 text-sm leading-relaxed whitespace-pre-wrap">{bio}</p>
        </div>
      )}

      {/* Specializations */}
      {specializations.length > 0 && (
        <div>
          <h3 className="text-sm font-medium text-gray-400 uppercase tracking-wide mb-2">Especialidades</h3>
          <div className="flex flex-wrap gap-2">
            {specializations.map((spec) => (
              <Badge
                key={spec}
                variant="outline"
                className="text-gray-300 border-gray-600 text-xs"
              >
                {spec}
              </Badge>
            ))}
          </div>
        </div>
      )}

      {/* Social links */}
      {hasSocialLinks && (
        <div>
          <h3 className="text-sm font-medium text-gray-400 uppercase tracking-wide mb-2">Redes y web</h3>
          <div className="flex flex-col gap-1">
            <SocialLink label="LinkedIn" value={socialLinks.linkedin} />
            <SocialLink label="Instagram" value={socialLinks.instagram} isHandle />
            <SocialLink label="Twitter / X" value={socialLinks.twitter} isHandle />
            <SocialLink label="Web" value={socialLinks.website} />
          </div>
        </div>
      )}

      {/* Empty state */}
      {!bio && specializations.length === 0 && !hasSocialLinks && (
        <p className="text-gray-500 text-sm italic">
          Completa tu perfil para aparecer en la galería de socias.
        </p>
      )}
    </div>
  );
}
