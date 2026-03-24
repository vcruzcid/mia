import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { BackgroundImage } from '@/components/ui/background-image';
import type { Member } from '@/types/member';
import { useMemberFilters } from '@/hooks/useMemberFilters';
import { MemberCard } from './socias/MemberCard';
import { MemberFilters } from './socias/MemberFilters';
import { MemberModal } from './socias/MemberModal';

async function fetchMembers(): Promise<Member[]> {
  const res = await fetch('/api/members');
  if (!res.ok) throw new Error(`Error ${res.status}`);
  const data = await res.json() as { members: Member[] };
  return data.members ?? [];
}

export function SociasPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedMember, setSelectedMember] = useState<Member | null>(null);

  const { data: members = [], isLoading, isError, refetch } = useQuery({
    queryKey: ['gallery-members'],
    queryFn: fetchMembers,
    staleTime: 60 * 60 * 1000, // 1h — mirrors KV TTL
  });

  const {
    filters,
    setFilters,
    resetFilters,
    filteredMembers,
    activeFilterCount,
    availableLocations,
    memberCounts,
    toggleSpecialization,
    toggleLocation,
    toggleAvailabilityStatus,
    toggleMembershipType,
  } = useMemberFilters(members, searchTerm);

  return (
    <div className="min-h-screen bg-gray-900">
      {/* Hero */}
      <BackgroundImage
        imageUrl="/images/home-cta.webp"
        className="w-full py-16 px-4 sm:px-6 lg:px-8"
      >
        <div className="max-w-7xl mx-auto text-center">
          <h1 className="text-4xl md:text-5xl font-extrabold text-white mb-6">
            Socias MIA
          </h1>
          <p className="text-lg md:text-xl text-gray-200 mb-8 max-w-3xl mx-auto">
            Directorio de socias profesionales de la animación en España.
          </p>
          <div className="max-w-xl mx-auto">
            <input
              type="search"
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              placeholder="Buscar por nombre o profesión..."
              className="w-full px-4 py-3 rounded-lg bg-gray-800/80 text-white placeholder-gray-400 border border-gray-600 focus:outline-none focus:border-red-500"
            />
          </div>
        </div>
      </BackgroundImage>

      {/* Filters */}
      <MemberFilters
        filters={filters}
        availableLocations={availableLocations}
        memberCounts={memberCounts}
        toggleMembershipType={toggleMembershipType}
        toggleSpecialization={toggleSpecialization}
        toggleLocation={toggleLocation}
        toggleAvailabilityStatus={toggleAvailabilityStatus}
        setFilters={setFilters}
      />

      {/* Gallery */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {!isLoading && !isError && (
          <div className="flex items-center justify-between mb-6">
            <p className="text-gray-400 text-sm">
              {filteredMembers.length === members.length
                ? `${members.length} socias`
                : `${filteredMembers.length} de ${members.length} socias`}
            </p>
            {activeFilterCount > 0 && (
              <button
                onClick={resetFilters}
                className="text-sm text-red-400 hover:text-red-300 transition-colors"
              >
                Limpiar filtros ({activeFilterCount})
              </button>
            )}
          </div>
        )}

        {isLoading && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 12 }).map((_, i) => (
              <div key={i} className="bg-gray-800 rounded-lg h-48 animate-pulse" />
            ))}
          </div>
        )}

        {isError && (
          <div className="text-center py-16">
            <p className="text-gray-300 mb-4">No se ha podido cargar el directorio.</p>
            <button
              onClick={() => void refetch()}
              className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-md text-sm transition-colors"
            >
              Reintentar
            </button>
          </div>
        )}

        {!isLoading && !isError && filteredMembers.length === 0 && (
          <div className="text-center py-16">
            <p className="text-gray-400">No se han encontrado socias con esos filtros.</p>
          </div>
        )}

        {!isLoading && !isError && filteredMembers.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredMembers.map(member => (
              <MemberCard
                key={member.id}
                member={member}
                onClick={() => setSelectedMember(member)}
              />
            ))}
          </div>
        )}
      </div>

      {selectedMember && (
        <MemberModal
          member={selectedMember}
          isOpen
          onClose={() => setSelectedMember(null)}
        />
      )}
    </div>
  );
}
