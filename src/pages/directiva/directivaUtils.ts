import type { BoardMember } from '@/types/member';
import type { DirectivaMember } from '@/types';

export const getPositionEmail = (position: string): string => {
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

export const getPositionStyle = (position: string): string => {
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

export function transformBoardMemberToDirectivaMember(member: BoardMember): DirectivaMember {
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
