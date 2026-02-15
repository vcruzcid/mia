// Member directory data
// TODO: This file is prepared for future member data integration
// When ready to display members, populate this array with member data
// and update SociasPage.tsx to use this static data instead of database queries

import type { Member, MemberStats } from '../types/member';

// Member data will be added here when available
// Export format: export const SOCIAS: Member[] = [ ... ];
export const SOCIAS: Member[] = [];

// Member statistics (can be updated manually)
export const MEMBER_STATS: MemberStats = {
  total_members: 0, // TODO: Update with actual count
  active_members: 0, // TODO: Update with actual count
  board_members: 0, // TODO: Update with actual count
  professional_members: 0, // TODO: Update with actual count
  student_members: 0, // TODO: Update with actual count
  collaborator_members: 0, // TODO: Update with actual count
};
