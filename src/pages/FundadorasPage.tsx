import { useEffect, useMemo, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { BackgroundImage } from '@/components/ui/background-image';
import { getAvailableLocations, getMemberCounts } from '../hooks/useMembers';
import { useMemberFilters } from '../hooks/useMemberFilters';
import { MemberCard } from './socias/MemberCard';
import { MemberModal } from './socias/MemberModal';
import { MemberFilters } from './socias/MemberFilters';
import type { Member } from '../types/supabase';
import { FUNDADORAS } from '../data/fundadoras';

export function FundadorasPage() {
  const [selectedMember, setSelectedMember] = useState<Member | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isFiltersExpanded, setIsFiltersExpanded] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(20);

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

  // Convert fundadoras data to Member type
  const allMembers: Member[] = useMemo(() => {
    return FUNDADORAS.map(f => ({
      ...f,
      is_active: true,
      created_at: new Date('2019-01-01').toISOString(), // MIA founded in 2019
      updated_at: new Date().toISOString(),
      auth_user_id: null,
      stripe_subscription_status: 'active',
      subscription_current_period_end: null,
      cancel_at_period_end: false,
      is_lifetime: true, // Founders are lifetime members
      last_verified_at: null,
      accepts_newsletter: true,
      accepts_job_offers: false,
      profile_completion: 100,
      cv_document_url: null,
      phone: null,
      postal_code: null,
      professional_role: null,
      years_experience: null,
      employment_status: null,
    }));
  }, []);

  // Client-side filtering
  const filteredMembers = useMemo(() => {
    let filtered = allMembers;

    // Search filter
    if (searchTerm) {
      const search = searchTerm.toLowerCase();
      filtered = filtered.filter(m =>
        m.display_name?.toLowerCase().includes(search) ||
        m.first_name?.toLowerCase().includes(search) ||
        m.last_name?.toLowerCase().includes(search) ||
        m.company?.toLowerCase().includes(search) ||
        m.main_profession?.toLowerCase().includes(search) ||
        m.other_professions?.some(p => p.toLowerCase().includes(search))
      );
    }

    // Membership type filter
    if (filters.membershipTypes.length > 0) {
      filtered = filtered.filter(m =>
        m.membership_type && filters.membershipTypes.includes(m.membership_type)
      );
    }

    // Specialization filter
    if (filters.specializations.length > 0) {
      filtered = filtered.filter(m =>
        (m.main_profession && filters.specializations.includes(m.main_profession)) ||
        m.other_professions?.some(p => filters.specializations.includes(p))
      );
    }

    // Location filter
    if (filters.locations.length > 0) {
      filtered = filtered.filter(m =>
        (m.city && filters.locations.includes(m.city)) ||
        (m.province && filters.locations.includes(m.province)) ||
        (m.autonomous_community && filters.locations.includes(m.autonomous_community))
      );
    }

    // Availability filter
    if (filters.availabilityStatus.length > 0) {
      filtered = filtered.filter(m =>
        m.availability_status && filters.availabilityStatus.includes(m.availability_status)
      );
    }

    return filtered;
  }, [allMembers, searchTerm, filters]);

  const totalMembers = filteredMembers.length;
  const totalPages = Math.ceil(totalMembers / itemsPerPage);
  const offset = (currentPage - 1) * itemsPerPage;
  const startIndex = offset;
  const endIndex = offset + itemsPerPage;
  const currentMembers = filteredMembers.slice(offset, offset + itemsPerPage);

  const availableLocations = useMemo(() => getAvailableLocations(allMembers), [allMembers]);
  const memberCounts = useMemo(() => getMemberCounts(allMembers), [allMembers]);
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


