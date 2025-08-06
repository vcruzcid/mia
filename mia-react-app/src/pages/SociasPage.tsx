import { useEffect, useState } from 'react';
import { useGalleryStore } from '../store/galleryStore';
// import type { Member } from '../types';
import { ANIMATION_SPECIALIZATIONS } from '../types';
import { ProfileImage } from '../components/ProfileImage';
import { SocialMediaIcons } from '../components/SocialMediaIcons';
import { Card, CardContent } from '../components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '../components/ui/dialog';
import { Badge } from '../components/ui/badge';

export function SociasPage() {
  const {
    loading,
    filters,
    searchTerm,
    selectedMember,
    isModalOpen,
    getFilteredMembers,
    getAvailableLocations,
    getMemberCounts,
    setFilters,
    resetFilters,
    setSearchTerm,
    toggleMemberType,
    toggleSpecialization,
    toggleLocation,
    toggleAvailabilityStatus,
    openMemberModal,
    closeMemberModal,
    fetchMembers,
  } = useGalleryStore();

  const [isFiltersExpanded, setIsFiltersExpanded] = useState(false);
  const [activeFilterTab, setActiveFilterTab] = useState<'type' | 'specialization' | 'location' | 'availability' | 'other'>('type');
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(20);
  
  // Pagination options
  const paginationOptions = [20, 50, 75, 100];

  useEffect(() => {
    fetchMembers();
  }, [fetchMembers]);

  const allFilteredMembers = getFilteredMembers();
  const availableLocations = getAvailableLocations();
  const memberCounts = getMemberCounts();
  
  // Pagination calculations
  const totalMembers = allFilteredMembers.length;
  const totalPages = Math.ceil(totalMembers / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentMembers = allFilteredMembers.slice(startIndex, endIndex);
  
  // Reset to first page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, filters]);
  
  // Handle pagination
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };
  
  const handleItemsPerPageChange = (newItemsPerPage: number) => {
    setItemsPerPage(newItemsPerPage);
    setCurrentPage(1);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  const getActiveFiltersCount = () => {
    return (
      filters.memberTypes.length +
      filters.specializations.length +
      filters.locations.length +
      filters.availabilityStatus.length +
      (filters.hasSocialMedia !== null ? 1 : 0) +
      (filters.isActive !== null ? 1 : 0)
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              Socias MIA
              <span className="ml-2 text-xs bg-green-500 text-white px-2 py-1 rounded">UPDATED</span>
            </h1>
            <p className="text-xl text-gray-800 max-w-3xl mx-auto">
              Conoce a las profesionales que forman parte de nuestra comunidad de mujeres en la industria de animación.
            </p>
          </div>

          {/* Search Bar */}
          <div className="mt-8 max-w-lg mx-auto">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg className="h-5 w-5 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <input
                type="text"
                value={searchTerm}
                onChange={handleSearchChange}
                className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg leading-5 bg-white placeholder-gray-600 focus:outline-none focus:placeholder-gray-500 focus:ring-1 focus:ring-primary-500 focus:border-primary-500 text-base"
                placeholder="Buscar por nombre, empresa, especialización o ubicación..."
              />
            </div>
          </div>

          {/* Results Summary */}
          <div className="mt-6 flex flex-wrap items-center justify-between">
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-700">
                {totalMembers} socias encontradas
                {totalMembers > 0 && (
                  <span className="ml-2 text-gray-500">
                    (mostrando {startIndex + 1}-{Math.min(endIndex, totalMembers)} de {totalMembers})
                  </span>
                )}
              </span>
              {getActiveFiltersCount() > 0 && (
                <button
                  onClick={resetFilters}
                  className="text-sm text-primary-600 hover:text-primary-800 underline"
                >
                  Limpiar filtros ({getActiveFiltersCount()})
                </button>
              )}
            </div>
            <button
              onClick={() => setIsFiltersExpanded(!isFiltersExpanded)}
              className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
            >
              <svg className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4" />
              </svg>
              Filtros avanzados
            </button>
          </div>
        </div>
      </div>

      {/* Advanced Filters Panel */}
      {isFiltersExpanded && (
        <div className="bg-white border-b shadow-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            {/* Filter Tabs */}
            <div className="border-b border-gray-200">
              <nav className="-mb-px flex space-x-8">
                {[
                  { key: 'type', label: 'Tipo de Socia', count: filters.memberTypes.length },
                  { key: 'specialization', label: 'Especializaciones', count: filters.specializations.length },
                  { key: 'location', label: 'Ubicación', count: filters.locations.length },
                  { key: 'availability', label: 'Disponibilidad', count: filters.availabilityStatus.length },
                  { key: 'other', label: 'Otros', count: (filters.hasSocialMedia !== null ? 1 : 0) + (filters.isActive !== null ? 1 : 0) },
                ].map((tab) => (
                  <button
                    key={tab.key}
                    onClick={() => setActiveFilterTab(tab.key as 'type' | 'specialization' | 'location' | 'availability' | 'other')}
                    className={`py-2 px-1 border-b-2 font-medium text-sm whitespace-nowrap ${
                      activeFilterTab === tab.key
                        ? 'border-primary-500 text-primary-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    {tab.label}
                    {tab.count > 0 && (
                      <span className="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary-100 text-primary-800">
                        {tab.count}
                      </span>
                    )}
                  </button>
                ))}
              </nav>
            </div>

            {/* Filter Content */}
            <div className="mt-6">
              {activeFilterTab === 'type' && (
                <div>
                  <h3 className="text-sm font-medium text-gray-900 mb-3">Tipo de Socia</h3>
                  <div className="space-y-2">
                    {(['Full', 'Student', 'Collaborator'] as const).map((type) => (
                      <label key={type} className="flex items-center">
                        <input
                          type="checkbox"
                          checked={filters.memberTypes.includes(type)}
                          onChange={() => toggleMemberType(type)}
                          className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                        />
                        <span className="ml-3 text-sm text-gray-700">
                          {type === 'Full' ? 'Socia de Pleno Derecho' : 
                           type === 'Student' ? 'Socia Estudiante' : 'Colaborador/a'}
                          <span className="ml-2 text-gray-600">
                            ({memberCounts.byType[type] || 0})
                          </span>
                        </span>
                      </label>
                    ))}
                  </div>
                </div>
              )}

              {activeFilterTab === 'specialization' && (
                <div>
                  <h3 className="text-sm font-medium text-gray-900 mb-3">Especializaciones</h3>
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2 max-h-80 overflow-y-auto">
                    {ANIMATION_SPECIALIZATIONS.map((specialization) => (
                      <label key={specialization} className="flex items-center">
                        <input
                          type="checkbox"
                          checked={filters.specializations.includes(specialization)}
                          onChange={() => toggleSpecialization(specialization)}
                          className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                        />
                        <span className="ml-2 text-sm text-gray-700 truncate">
                          {specialization}
                        </span>
                      </label>
                    ))}
                  </div>
                </div>
              )}

              {activeFilterTab === 'location' && (
                <div>
                  <h3 className="text-sm font-medium text-gray-900 mb-3">Ubicación</h3>
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2 max-h-60 overflow-y-auto">
                    {availableLocations.map((location) => (
                      <label key={location} className="flex items-center">
                        <input
                          type="checkbox"
                          checked={filters.locations.includes(location)}
                          onChange={() => toggleLocation(location)}
                          className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                        />
                        <span className="ml-2 text-sm text-gray-700 truncate">
                          {location}
                        </span>
                      </label>
                    ))}
                  </div>
                </div>
              )}

              {activeFilterTab === 'availability' && (
                <div>
                  <h3 className="text-sm font-medium text-gray-900 mb-3">Estado de Disponibilidad</h3>
                  <div className="space-y-2">
                    {(['Available', 'Busy', 'Not Available'] as const).map((status) => (
                      <label key={status} className="flex items-center">
                        <input
                          type="checkbox"
                          checked={filters.availabilityStatus.includes(status)}
                          onChange={() => toggleAvailabilityStatus(status)}
                          className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                        />
                        <span className="ml-3 text-sm text-gray-700">
                          {status === 'Available' ? 'Disponible' : 
                           status === 'Busy' ? 'Ocupada' : 'No Disponible'}
                          <span className="ml-2 text-gray-600">
                            ({memberCounts.byAvailability[status] || 0})
                          </span>
                        </span>
                      </label>
                    ))}
                  </div>
                </div>
              )}

              {activeFilterTab === 'other' && (
                <div className="space-y-4">
                  <div>
                    <h3 className="text-sm font-medium text-gray-900 mb-3">Presencia en Redes Sociales</h3>
                    <div className="space-y-2">
                      <label className="flex items-center">
                        <input
                          type="radio"
                          name="socialMedia"
                          checked={filters.hasSocialMedia === true}
                          onChange={() => setFilters({ hasSocialMedia: true })}
                          className="h-4 w-4 text-primary-600 focus:ring-primary-500"
                        />
                        <span className="ml-3 text-sm text-gray-700">Con redes sociales</span>
                      </label>
                      <label className="flex items-center">
                        <input
                          type="radio"
                          name="socialMedia"
                          checked={filters.hasSocialMedia === false}
                          onChange={() => setFilters({ hasSocialMedia: false })}
                          className="h-4 w-4 text-primary-600 focus:ring-primary-500"
                        />
                        <span className="ml-3 text-sm text-gray-700">Sin redes sociales</span>
                      </label>
                      <label className="flex items-center">
                        <input
                          type="radio"
                          name="socialMedia"
                          checked={filters.hasSocialMedia === null}
                          onChange={() => setFilters({ hasSocialMedia: null })}
                          className="h-4 w-4 text-primary-600 focus:ring-primary-500"
                        />
                        <span className="ml-3 text-sm text-gray-700">Todos</span>
                      </label>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-sm font-medium text-gray-900 mb-3">Estado de Membresía</h3>
                    <div className="space-y-2">
                      <label className="flex items-center">
                        <input
                          type="radio"
                          name="isActive"
                          checked={filters.isActive === true}
                          onChange={() => setFilters({ isActive: true })}
                          className="h-4 w-4 text-primary-600 focus:ring-primary-500"
                        />
                        <span className="ml-3 text-sm text-gray-700">Membresía activa</span>
                      </label>
                      <label className="flex items-center">
                        <input
                          type="radio"
                          name="isActive"
                          checked={filters.isActive === false}
                          onChange={() => setFilters({ isActive: false })}
                          className="h-4 w-4 text-primary-600 focus:ring-primary-500"
                        />
                        <span className="ml-3 text-sm text-gray-700">Membresía inactiva</span>
                      </label>
                      <label className="flex items-center">
                        <input
                          type="radio"
                          name="isActive"
                          checked={filters.isActive === null}
                          onChange={() => setFilters({ isActive: null })}
                          className="h-4 w-4 text-primary-600 focus:ring-primary-500"
                        />
                        <span className="ml-3 text-sm text-gray-700">Todos</span>
                      </label>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Pagination Controls - Top */}
      {totalMembers > 0 && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 py-4 border-t border-gray-200">
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-700">Mostrar:</span>
              <select
                value={itemsPerPage}
                onChange={(e) => handleItemsPerPageChange(Number(e.target.value))}
                className="text-sm border border-gray-300 rounded-md px-3 py-1 focus:outline-none focus:ring-1 focus:ring-primary-500 focus:border-primary-500"
              >
                {paginationOptions.map(option => (
                  <option key={option} value={option}>{option} por página</option>
                ))}
              </select>
            </div>
            
            {totalPages > 1 && (
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => handlePageChange(Math.max(1, currentPage - 1))}
                  disabled={currentPage === 1}
                  className="px-3 py-1 text-sm border border-gray-300 rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                >
                  Anterior
                </button>
                
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
                      <button
                        key={pageNumber}
                        onClick={() => handlePageChange(pageNumber)}
                        className={`px-3 py-1 text-sm border rounded-md ${
                          currentPage === pageNumber
                            ? 'bg-primary-600 text-white border-primary-600'
                            : 'border-gray-300 hover:bg-gray-50'
                        }`}
                      >
                        {pageNumber}
                      </button>
                    );
                  })}
                </div>
                
                <button
                  onClick={() => handlePageChange(Math.min(totalPages, currentPage + 1))}
                  disabled={currentPage === totalPages}
                  className="px-3 py-1 text-sm border border-gray-300 rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                >
                  Siguiente
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Members Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {totalMembers === 0 ? (
          <div className="text-center py-12">
            <svg className="mx-auto h-12 w-12 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
            <h3 className="mt-2 text-sm font-medium text-gray-900">No se encontraron socias</h3>
            <p className="mt-1 text-sm text-gray-700">
              Prueba a ajustar los filtros de búsqueda para encontrar más resultados.
            </p>
          </div>
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
        {totalPages > 1 && (
          <div className="flex justify-center mt-8">
            <div className="flex items-center space-x-2">
              <button
                onClick={() => handlePageChange(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
                className="px-4 py-2 text-sm border border-gray-300 rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
              >
                Anterior
              </button>
              
              <span className="px-4 py-2 text-sm text-gray-700">
                Página {currentPage} de {totalPages}
              </span>
              
              <button
                onClick={() => handlePageChange(Math.min(totalPages, currentPage + 1))}
                disabled={currentPage === totalPages}
                className="px-4 py-2 text-sm border border-gray-300 rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
              >
                Siguiente
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Member Modal */}
      {isModalOpen && selectedMember && (
        <MemberModal
          member={selectedMember}
          onClose={closeMemberModal}
        />
      )}
    </div>
  );
}

interface MemberCardProps {
  member: any;
  onClick: () => void;
}

function MemberCard({ member, onClick }: MemberCardProps) {

  return (
    <Card 
      onClick={onClick}
      className="hover:shadow-lg transition-shadow duration-200 cursor-pointer transform hover:scale-105"
    >
      <CardContent className="p-6">
        <div className="flex items-center mb-4">
          <ProfileImage
            src={member.profileImage}
            alt={`${member.firstName} ${member.lastName}`}
            size="md"
          />
          <div className="ml-4 flex-1 min-w-0">
            <p className="text-lg font-medium text-gray-900 truncate">
              {member.firstName} {member.lastName}
            </p>
            <p className="text-sm text-gray-700 truncate">
              {member.company || 'Freelance'}
            </p>
          </div>
        </div>

        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <Badge variant={member.memberType === 'Full' ? 'default' : member.memberType === 'Student' ? 'secondary' : 'outline'}>
              {member.memberType === 'Full' ? 'Pleno Derecho' : 
               member.memberType === 'Student' ? 'Estudiante' : 'Colaborador/a'}
            </Badge>
            <Badge variant={member.availabilityStatus === 'Available' ? 'default' : member.availabilityStatus === 'Busy' ? 'secondary' : 'destructive'}>
              {member.availabilityStatus === 'Available' ? 'Disponible' :
               member.availabilityStatus === 'Busy' ? 'Ocupada' : 'No Disponible'}
            </Badge>
          </div>

          <div>
            <p className="text-sm text-gray-800">
              📍 {member.location.city && `${member.location.city}, `}{member.location.country}
            </p>
          </div>

          <div>
            <p className="text-sm text-gray-700 font-medium mb-1">Especializaciones:</p>
            <div className="flex flex-wrap gap-1">
              {member.specializations.slice(0, 3).map((spec: string, index: number) => (
                <Badge key={index} variant="outline" className="text-xs">
                  {spec}
                </Badge>
              ))}
              {member.specializations.length > 3 && (
                <Badge variant="secondary" className="text-xs">
                  +{member.specializations.length - 3} más
                </Badge>
              )}
            </div>
          </div>

          <SocialMediaIcons 
            socialMedia={member.socialMedia}
            size="sm"
            variant="compact"
          />
        </div>
      </CardContent>
    </Card>
  );
}

interface MemberModalProps {
  member: any;
  onClose: () => void;
}

function MemberModal({ member, onClose }: MemberModalProps) {
  return (
    <Dialog open={true} onOpenChange={() => onClose()}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <div className="flex items-center space-x-4">
            <ProfileImage
              src={member.profileImage}
              alt={`${member.firstName} ${member.lastName}`}
              size="xl"
            />
            <div>
              <DialogTitle className="text-xl">
                {member.firstName} {member.lastName}
              </DialogTitle>
              <DialogDescription className="text-base">
                {member.company || 'Freelance'}
              </DialogDescription>
              {member.bio && (
                <p className="mt-2 text-sm text-gray-600">{member.bio}</p>
              )}
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <h4 className="text-sm font-medium text-gray-900 mb-2">Especializaciones</h4>
            <div className="flex flex-wrap gap-1">
              {member.specializations.map((spec: string, index: number) => (
                <Badge key={index} variant="default" className="text-xs">
                  {spec}
                </Badge>
              ))}
            </div>
          </div>

          <div>
            <h4 className="text-sm font-medium text-gray-900 mb-2">Ubicación</h4>
            <p className="text-sm text-gray-800">
              {member.location.city && `${member.location.city}, `}
              {member.location.region && `${member.location.region}, `}
              {member.location.country}
            </p>
          </div>

          <div>
            <h4 className="text-sm font-medium text-gray-900 mb-2">Redes Sociales</h4>
            <SocialMediaIcons 
              socialMedia={member.socialMedia}
              size="md"
              variant="full"
            />
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}