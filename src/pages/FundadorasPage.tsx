import { useEffect, useMemo, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Spinner } from '@/components/ui/spinner';
import { BackgroundImage } from '@/components/ui/background-image';
import { getAvailableLocations, getMemberCounts, useDirectoryMembers } from '../hooks/useMembers';
import { useMemberFilters } from '../hooks/useMemberFilters';
import { MemberCard } from './socias/MemberCard';
import { MemberModal } from './socias/MemberModal';
import { MemberFilters } from './socias/MemberFilters';
import type { Member } from '../types/supabase';
import { useAuth } from '../hooks/useAuth';

export function FundadorasPage() {
  const [selectedMember, setSelectedMember] = useState<Member | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isFiltersExpanded, setIsFiltersExpanded] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(20);

  const { isAuthenticated } = useAuth();
  const {
    filters,
    searchTerm,
    setSearchTerm,
    setFilters,
    toggleMembershipType,
    toggleSpecialization,
    toggleLocation,
    toggleAvailabilityStatus,
    resetFilters,
    getActiveFiltersCount,
  } = useMemberFilters();

  const offset = (currentPage - 1) * itemsPerPage;
  const directoryQuery = useDirectoryMembers({
    includePrivate: isAuthenticated,
    isFounder: true,
    searchTerm,
    membershipTypes: filters.membershipTypes,
    specializations: filters.specializations,
    locations: filters.locations,
    availabilityStatus: filters.availabilityStatus,
    limit: itemsPerPage,
    offset
  });

  const members = directoryQuery.data?.members ?? [];
  const totalMembers = directoryQuery.data?.total ?? 0;
  const totalPages = Math.ceil(totalMembers / itemsPerPage);
  const startIndex = offset;
  const endIndex = offset + itemsPerPage;
  const currentMembers = members;

  const availableLocations = useMemo(() => getAvailableLocations(members), [members]);
  const memberCounts = useMemo(() => getMemberCounts(members), [members]);
  const activeFiltersCount = getActiveFiltersCount();

  const openModal = (member: Member) => {
    setSelectedMember(member);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedMember(null);
  };

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, filters]);

  if (directoryQuery.isLoading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <Spinner className="h-12 w-12 text-primary-500" />
      </div>
    );
  }

  if (directoryQuery.isError) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center px-6">
        <div className="text-center max-w-lg">
          <h2 className="text-xl font-semibold text-white mb-2">No se pudo cargar Fundadoras</h2>
          <p className="text-gray-300 mb-4">
            Hubo un error consultando la base de datos. Intenta de nuevo.
          </p>
          <Button onClick={() => directoryQuery.refetch()} className="bg-primary-600 hover:bg-primary-700 text-white">
            Reintentar
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900">
      <BackgroundImage
        src="/images/membership-cta.webp"
        alt="Fundadoras MIA"
        className="h-64 md:h-80"
      >
        <div className="absolute inset-0 bg-black/70" />
        <div className="relative h-full flex flex-col items-center justify-center text-center px-4">
          <h1 className="text-3xl md:text-5xl font-bold text-white mb-4">Fundadoras</h1>
          <p className="text-lg text-gray-200 max-w-3xl">
            Mujeres que impulsaron el origen de MIA y su misión.
          </p>
        </div>
      </BackgroundImage>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Search + Controls */}
        <div className="bg-gray-800 rounded-lg p-4 md:p-6 border border-gray-700 mb-6">
          <div className="flex flex-col md:flex-row gap-4 md:items-center md:justify-between">
            <div className="flex-1">
              <Input
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Buscar por nombre, profesión o empresa..."
                className="bg-gray-900 border-gray-700 text-white placeholder:text-gray-500"
              />
            </div>

            <div className="flex items-center gap-3">
              <Button
                variant="outline"
                onClick={() => setIsFiltersExpanded(!isFiltersExpanded)}
                className="border-gray-600 text-gray-200 hover:bg-gray-700"
              >
                Filtros{activeFiltersCount > 0 ? ` (${activeFiltersCount})` : ''}
              </Button>

              <Button
                variant="ghost"
                onClick={resetFilters}
                className="text-gray-200 hover:text-white hover:bg-gray-700"
              >
                Reset
              </Button>
            </div>
          </div>

          {isFiltersExpanded && (
            <div className="mt-6">
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
            </div>
          )}
        </div>

        {/* Results header */}
        <div className="flex items-center justify-between mb-6">
          <span className="text-sm text-gray-300">
            {totalMembers} fundadoras encontradas
            {totalMembers > 0 && (
              <span className="ml-2 text-gray-400">
                (mostrando {startIndex + 1}-{Math.min(endIndex, totalMembers)} de {totalMembers})
              </span>
            )}
          </span>

          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-300">Por página:</span>
            <select
              value={itemsPerPage}
              onChange={(e) => setItemsPerPage(Number(e.target.value))}
              className="bg-gray-900 border border-gray-700 text-white rounded-md px-2 py-1"
            >
              <option value={12}>12</option>
              <option value={20}>20</option>
              <option value={32}>32</option>
            </select>
          </div>
        </div>

        {/* Grid */}
        {currentMembers.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-gray-300 mb-4">No hay resultados con estos filtros.</p>
            <Button onClick={resetFilters} className="bg-primary-600 hover:bg-primary-700 text-white">
              Limpiar filtros
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {currentMembers.map((m) => (
              <MemberCard key={m.id} member={m} onClick={() => openModal(m)} />
            ))}
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-2 mt-10">
            <Button
              variant="outline"
              className="border-gray-700 text-gray-200 hover:bg-gray-800"
              disabled={currentPage === 1}
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            >
              Anterior
            </Button>
            <span className="text-sm text-gray-300 px-3">
              Página {currentPage} de {totalPages}
            </span>
            <Button
              variant="outline"
              className="border-gray-700 text-gray-200 hover:bg-gray-800"
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
            >
              Siguiente
            </Button>
          </div>
        )}
      </div>

      {selectedMember && (
        <MemberModal member={selectedMember} isOpen={isModalOpen} onClose={closeModal} />
      )}
    </div>
  );
}


