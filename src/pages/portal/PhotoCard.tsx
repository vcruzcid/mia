import type { PortalProfile } from '@/types/api';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

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
  Collaborator: 'Colaboradora',
};

interface PhotoCardProps {
  profile: PortalProfile;
}

export function PhotoCard({ profile }: PhotoCardProps) {
  const { firstName, lastName, email, memberCode, membershipLevel, membershipStatus } = profile;
  const initials = `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();

  const statusColor =
    membershipStatus === 'Active'
      ? 'bg-green-900/20 border-green-400/30 text-green-400'
      : 'bg-yellow-900/20 border-yellow-400/30 text-yellow-400';

  return (
    <div className="bg-gray-800 border border-gray-700 rounded-lg p-6 flex items-start gap-5">
      <div className="flex flex-col items-center gap-2 shrink-0">
        <div className="w-16 h-16 rounded-full bg-gray-700 flex items-center justify-center text-xl font-bold text-white select-none">
          {initials}
        </div>
        <Button
          variant="ghost"
          size="sm"
          disabled
          title="Próximamente"
          className="text-xs text-gray-500 cursor-not-allowed opacity-60 px-2 py-1"
        >
          Cambiar foto
        </Button>
      </div>

      <div className="flex-1 min-w-0">
        <h2 className="text-xl font-bold text-white">
          {firstName} {lastName}
        </h2>
        <p className="text-gray-400 text-sm mt-0.5">{email}</p>
        {memberCode && (
          <p className="text-gray-500 text-xs mt-0.5">Código: {memberCode}</p>
        )}
        <div className="flex flex-wrap gap-2 mt-3">
          {membershipLevel && (
            <Badge className="bg-red-600/20 border-red-400/30 text-red-400 border text-xs">
              {LEVEL_LABELS[membershipLevel] ?? membershipLevel}
            </Badge>
          )}
          {membershipStatus && (
            <span
              className={`inline-flex items-center rounded-md border px-2 py-0.5 text-xs font-medium ${statusColor}`}
            >
              {STATUS_LABELS[membershipStatus] ?? 'Inactiva'}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
