import { useEffect, useState } from 'react';
import { useGalleryStore } from '../store/galleryStore';
import type { Member } from '../types';
import { ANIMATION_SPECIALIZATIONS } from '../types';

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

  useEffect(() => {
    fetchMembers();
  }, [fetchMembers]);

  const filteredMembers = getFilteredMembers();
  const availableLocations = getAvailableLocations();
  const memberCounts = getMemberCounts();

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
                {memberCounts.total} socias encontradas
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

      {/* Members Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {filteredMembers.length === 0 ? (
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
            {filteredMembers.map((member) => (
              <MemberCard
                key={member.id}
                member={member}
                onClick={() => openMemberModal(member)}
              />
            ))}
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
  member: Member;
  onClick: () => void;
}

function MemberCard({ member, onClick }: MemberCardProps) {
  const getAvailabilityColor = (status: string) => {
    switch (status) {
      case 'Available': return 'bg-green-100 text-green-800';
      case 'Busy': return 'bg-yellow-100 text-yellow-800';
      case 'Not Available': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getMemberTypeColor = (type: string) => {
    switch (type) {
      case 'Full': return 'bg-primary-100 text-primary-800';
      case 'Student': return 'bg-blue-100 text-blue-800';
      case 'Collaborator': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div 
      onClick={onClick}
      className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-200 cursor-pointer overflow-hidden"
    >
      <div className="p-6">
        <div className="flex items-center mb-4">
          <img
            className="h-12 w-12 rounded-full object-cover"
            src={member.profileImage || 'https://via.placeholder.com/150'}
            alt={`${member.firstName} ${member.lastName}`}
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
            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getMemberTypeColor(member.memberType)}`}>
              {member.memberType === 'Full' ? 'Pleno Derecho' : 
               member.memberType === 'Student' ? 'Estudiante' : 'Colaborador/a'}
            </span>
            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getAvailabilityColor(member.availabilityStatus)}`}>
              {member.availabilityStatus === 'Available' ? 'Disponible' :
               member.availabilityStatus === 'Busy' ? 'Ocupada' : 'No Disponible'}
            </span>
          </div>

          <div>
            <p className="text-sm text-gray-800">
              📍 {member.location.city && `${member.location.city}, `}{member.location.country}
            </p>
          </div>

          <div>
            <p className="text-sm text-gray-700 font-medium mb-1">Especializaciones:</p>
            <div className="flex flex-wrap gap-1">
              {member.specializations.slice(0, 3).map((spec, index) => (
                <span
                  key={index}
                  className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-gray-100 text-gray-700"
                >
                  {spec}
                </span>
              ))}
              {member.specializations.length > 3 && (
                <span className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-gray-200 text-gray-800">
                  +{member.specializations.length - 3} más
                </span>
              )}
            </div>
          </div>

          {Object.values(member.socialMedia).some(Boolean) && (
            <div className="flex items-center space-x-2">
              {member.socialMedia.linkedin && (
                <div className="h-4 w-4 text-blue-600">
                  <span className="text-xs">💼</span>
                </div>
              )}
              {member.socialMedia.twitter && (
                <div className="h-4 w-4 text-blue-400">
                  <span className="text-xs">🐦</span>
                </div>
              )}
              {member.socialMedia.instagram && (
                <div className="h-4 w-4 text-pink-600">
                  <span className="text-xs">📸</span>
                </div>
              )}
              {member.socialMedia.website && (
                <div className="h-4 w-4 text-gray-800">
                  <span className="text-xs">🌐</span>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

interface MemberModalProps {
  member: Member;
  onClose: () => void;
}

function MemberModal({ member, onClose }: MemberModalProps) {
  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        <div className="fixed inset-0 transition-opacity" aria-hidden="true">
          <div className="absolute inset-0 bg-gray-900 bg-opacity-50" onClick={onClose}></div>
        </div>

        {/* This span is used to center the modal contents vertically */}
        <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>

        <div className="relative inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full z-10">
          <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
            <div className="sm:flex sm:items-start">
              <div className="mx-auto flex-shrink-0 flex items-center justify-center h-20 w-20 rounded-full bg-primary-100 sm:mx-0 sm:h-24 sm:w-24">
                <img
                  className="h-20 w-20 sm:h-24 sm:w-24 rounded-full object-cover"
                  src={member.profileImage || 'https://via.placeholder.com/150'}
                  alt={`${member.firstName} ${member.lastName}`}
                />
              </div>
              <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left flex-1">
                <h3 className="text-lg leading-6 font-medium text-gray-900">
                  {member.firstName} {member.lastName}
                </h3>
                <div className="mt-2">
                  <p className="text-sm text-gray-700">
                    {member.company || 'Freelance'}
                  </p>
                  {member.bio && (
                    <p className="mt-2 text-sm text-gray-700">{member.bio}</p>
                  )}
                </div>
              </div>
            </div>

            <div className="mt-6 space-y-4">
              <div>
                <h4 className="text-sm font-medium text-gray-900">Especializaciones</h4>
                <div className="mt-1 flex flex-wrap gap-1">
                  {member.specializations.map((spec, index) => (
                    <span
                      key={index}
                      className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-primary-100 text-primary-700"
                    >
                      {spec}
                    </span>
                  ))}
                </div>
              </div>

              <div>
                <h4 className="text-sm font-medium text-gray-900">Ubicación</h4>
                <p className="mt-1 text-sm text-gray-800">
                  {member.location.city && `${member.location.city}, `}
                  {member.location.region && `${member.location.region}, `}
                  {member.location.country}
                </p>
              </div>

              {Object.values(member.socialMedia).some(Boolean) && (
                <div>
                  <h4 className="text-sm font-medium text-gray-900">Redes Sociales</h4>
                  <div className="mt-1 space-y-1">
                    {member.socialMedia.linkedin && (
                      <a
                        href={member.socialMedia.linkedin}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="block text-sm text-blue-600 hover:text-blue-800"
                      >
                        💼 LinkedIn
                      </a>
                    )}
                    {member.socialMedia.twitter && (
                      <a
                        href={`https://twitter.com/${member.socialMedia.twitter.replace('@', '')}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="block text-sm text-blue-400 hover:text-blue-600"
                      >
                        🐦 Twitter
                      </a>
                    )}
                    {member.socialMedia.instagram && (
                      <a
                        href={member.socialMedia.instagram}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="block text-sm text-pink-600 hover:text-pink-800"
                      >
                        📸 Instagram
                      </a>
                    )}
                    {member.socialMedia.website && (
                      <a
                        href={member.socialMedia.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="block text-sm text-gray-800 hover:text-gray-900"
                      >
                        🌐 Sitio Web
                      </a>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
          <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
            <button
              type="button"
              className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-primary-600 text-base font-medium text-white hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 sm:ml-3 sm:w-auto sm:text-sm"
              onClick={onClose}
            >
              Cerrar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}