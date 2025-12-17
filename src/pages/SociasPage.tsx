import { useEffect, useMemo, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Spinner } from '@/components/ui/spinner';
import { BackgroundImage } from '@/components/ui/background-image';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { getAvailableLocations, getMemberCounts, useDirectoryMembers } from '../hooks/useMembers';
import { useMemberFilters } from '../hooks/useMemberFilters';
import { MemberCard } from './socias/MemberCard';
import { MemberModal } from './socias/MemberModal';
import { MemberFilters } from './socias/MemberFilters';
import type { Member } from '../types/supabase';
import { useAuth } from '../hooks/useAuth';

export function SociasPage() {
  // State
  const [selectedMember, setSelectedMember] = useState<Member | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isFiltersExpanded, setIsFiltersExpanded] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(20);

  // Hooks
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
    searchTerm,
    membershipTypes: filters.membershipTypes,
    specializations: filters.specializations,
    locations: filters.locations,
    availabilityStatus: filters.availabilityStatus,
    limit: itemsPerPage,
    offset
  });

  const members = directoryQuery.data?.members ?? [];

  // Pagination
  const totalMembers = directoryQuery.data?.total ?? 0;
  const totalPages = Math.ceil(totalMembers / itemsPerPage);
  const startIndex = offset;
  const endIndex = offset + itemsPerPage;
  const currentMembers = members;

  // Derived data
  const availableLocations = useMemo(() => getAvailableLocations(members), [members]);
  const memberCounts = useMemo(() => getMemberCounts(members), [members]);

  // Handlers
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleItemsPerPageChange = (newItemsPerPage: number) => {
    setItemsPerPage(newItemsPerPage);
    setCurrentPage(1);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const openMemberModal = (member: Member) => {
    setSelectedMember(member);
    setIsModalOpen(true);
  };

  const closeMemberModal = () => {
    setIsModalOpen(false);
    setSelectedMember(null);
  };

  // Reset pagination when filters change
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
          <h2 className="text-xl font-semibold text-white mb-2">No se pudo cargar la galería</h2>
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
      {/* Hero Section */}
      <BackgroundImage
        imageUrl="/images/home-cta.webp"
        className="w-full py-16 px-4 sm:px-6 lg:px-8"
      >
        <div className="max-w-7xl mx-auto text-center">
          <h1 className="text-4xl md:text-5xl font-extrabold text-white mb-6">
            Socias MIA
          </h1>
          <p className="text-lg md:text-xl text-gray-200 mb-8 max-w-3xl mx-auto">
            Conoce a nuestras socias, busca y filtra entre las profesionales de la animación en España.
            Encuentra el talento que necesitas para tus proyectos.
          </p>
        </div>
      </BackgroundImage>

      {/* Search and Filters Section */}
      <div className="bg-gray-900 border-t border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Search Bar */}
          <div className="max-w-lg mx-auto mb-8">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <Input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 h-12 text-base bg-gray-800 border-gray-700 text-white placeholder-gray-400 focus:border-primary-500 focus:ring-primary-500"
                placeholder="Buscar por nombre, empresa, especialización o ubicación..."
              />
            </div>
          </div>

          {/* Results Summary */}
          <div className="flex flex-wrap items-center justify-between mb-6">
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-300">
                {totalMembers} socias encontradas
                {totalMembers > 0 && (
                  <span className="ml-2 text-gray-400">
                    (mostrando {startIndex + 1}-{Math.min(endIndex, totalMembers)} de {totalMembers})
                  </span>
                )}
              </span>
              {getActiveFiltersCount() > 0 && (
                <Button
                  onClick={resetFilters}
                  variant="ghost"
                  className="text-sm text-primary-400 hover:text-primary-300 underline"
                >
                  Limpiar filtros ({getActiveFiltersCount()})
                </Button>
              )}
            </div>
            <Button
              onClick={() => setIsFiltersExpanded(!isFiltersExpanded)}
              variant="outline"
              className="inline-flex items-center px-4 py-2 border-gray-700 text-gray-300 hover:bg-gray-800"
            >
              <svg className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4" />
              </svg>
              Filtros avanzados
            </Button>
          </div>
        </div>
      </div>

      {/* Advanced Filters Panel */}
      {isFiltersExpanded && (
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
      )}

      {/* Pagination Controls - Top */}
      {!directoryQuery.isLoading && totalMembers > 0 && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 py-4 border-t border-gray-700">
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-300">Mostrar:</span>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm" className="text-sm border-gray-600 text-gray-300 hover:bg-gray-800">
                    {itemsPerPage} por página
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="bg-gray-800 border-gray-700">
                  {[10, 20, 50, 75, 100].map(option => (
                    <DropdownMenuItem
                      key={option}
                      onClick={() => handleItemsPerPageChange(option)}
                      className={`text-gray-300 hover:bg-gray-700 ${itemsPerPage === option ? "bg-primary-900" : ""}`}
                    >
                      {option} por página
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>

            {totalPages > 1 && (
              <PaginationControls
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={handlePageChange}
              />
            )}
          </div>
        </div>
      )}

      {/* Members Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {totalMembers === 0 ? (
          <EmptyState />
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {currentMembers.map((member) => (
              <MemberCard
                key={member.id}
                member={member}
                onClick={() => openMemberModal(member)}
              />
            ))}
          </div>
        )}

        {/* Pagination Controls - Bottom */}
        {!directoryQuery.isLoading && totalPages > 1 && (
          <div className="flex justify-center mt-8">
            <div className="flex items-center space-x-2">
              <Button
                onClick={() => handlePageChange(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
                variant="outline"
                size="sm"
                className="border-gray-600 text-gray-300 hover:bg-gray-800"
              >
                Anterior
              </Button>

              <span className="px-4 py-2 text-sm text-gray-400">
                Página {currentPage} de {totalPages}
              </span>

              <Button
                onClick={() => handlePageChange(Math.min(totalPages, currentPage + 1))}
                disabled={currentPage === totalPages}
                variant="outline"
                size="sm"
                className="border-gray-600 text-gray-300 hover:bg-gray-800"
              >
                Siguiente
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Member Modal */}
      {selectedMember && (
        <MemberModal
          member={selectedMember}
          isOpen={isModalOpen}
          onClose={closeMemberModal}
        />
      )}
    </div>
  );
}

// Pagination Controls Component
function PaginationControls({
  currentPage,
  totalPages,
  onPageChange
}: {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}) {
  return (
    <div className="flex items-center space-x-2">
      <Button
        onClick={() => onPageChange(Math.max(1, currentPage - 1))}
        disabled={currentPage === 1}
        variant="outline"
        size="sm"
        className="border-gray-600 text-gray-300 hover:bg-gray-800"
      >
        Anterior
      </Button>

      <div className="flex space-x-1">
        {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
          let pageNumber;
          if (totalPages <= 5) {
            pageNumber = i + 1;
          } else if (currentPage <= 3) {
            pageNumber = i + 1;
          } else if (currentPage >= totalPages - 2) {
            pageNumber = totalPages - 4 + i;
          } else {
            pageNumber = currentPage - 2 + i;
          }

          return (
            <Button
              key={pageNumber}
              onClick={() => onPageChange(pageNumber)}
              variant={currentPage === pageNumber ? "default" : "outline"}
              size="sm"
              className={currentPage === pageNumber
                ? "bg-primary-600 text-white"
                : "border-gray-600 text-gray-300 hover:bg-gray-800"
              }
            >
              {pageNumber}
            </Button>
          );
        })}
      </div>

      <Button
        onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
        disabled={currentPage === totalPages}
        variant="outline"
        size="sm"
        className="border-gray-600 text-gray-300 hover:bg-gray-800"
      >
        Siguiente
      </Button>
    </div>
  );
}

// Empty State Component
function EmptyState() {
  return (
    <div className="text-center py-12">
      <svg className="mx-auto h-12 w-12 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
      </svg>
      <h3 className="mt-2 text-sm font-medium text-gray-200">No se encontraron socias</h3>
      <p className="mt-1 text-sm text-gray-400">
        Prueba a ajustar los filtros de búsqueda para encontrar más resultados.
      </p>
    </div>
  );
}
