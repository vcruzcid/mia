import { useState, useEffect } from 'react';
import { useGalleryStore } from '../store/galleryStore';
import { ANIMATION_SPECIALIZATIONS } from '../types';
import { ProfileImage } from '../components/ProfileImage';
import { SocialMediaIcons } from '../components/SocialMediaIcons';
import { Card, CardContent } from '../components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '../components/ui/dialog';
import { Badge } from '../components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Spinner } from '@/components/ui/spinner';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { BackgroundImage } from '@/components/ui/background-image';
import { useScrollAnimation } from '../hooks/useScrollAnimation';

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
    toggleSpecialization,
    toggleLocation,
    toggleAvailabilityStatus,
    openMemberModal,
    closeMemberModal,
    fetchMembers,
  } = useGalleryStore();

  // Animation hooks
  const filtersAnimation = useScrollAnimation({ threshold: 0.2 });

  const [isFiltersExpanded, setIsFiltersExpanded] = useState(false);
  const [activeFilterTab, setActiveFilterTab] = useState<'specialization' | 'location' | 'availability' | 'other'>('specialization');

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(20);

  // Pagination options
  const paginationOptions = [10, 20, 50, 75, 100];

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
      filters.specializations.length +
      filters.locations.length +
      filters.availabilityStatus.length +
      (filters.hasSocialMedia !== null ? 1 : 0)
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <Spinner className="h-12 w-12 text-primary-500" />
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
                onChange={handleSearchChange}
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
              className={`inline-flex items-center px-4 py-2 border-gray-700 text-gray-300 hover:bg-gray-800 transition-all duration-300 ${
                filtersAnimation.isIntersecting ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
              }`}
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
        <div className="bg-gray-800 border-b border-gray-700">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            {/* Filter Tabs */}
            <div className="border-b border-gray-600">
              <nav className="-mb-px flex space-x-8">
                {[
                  { key: 'specialization', label: 'Especializaciones', count: filters.specializations.length },
                  { key: 'location', label: 'Ubicación', count: filters.locations.length },
                  { key: 'availability', label: 'Disponibilidad', count: filters.availabilityStatus.length },
                  { key: 'other', label: 'Otros', count: (filters.hasSocialMedia !== null ? 1 : 0) },
                ].map((tab) => (
                  <Button
                    key={tab.key}
                    onClick={() => setActiveFilterTab(tab.key as 'specialization' | 'location' | 'availability' | 'other')}
                    variant="ghost"
                    className={`py-2 px-1 border-b-2 font-medium text-sm whitespace-nowrap rounded-none ${
                      activeFilterTab === tab.key
                        ? 'border-primary-500 text-primary-400 bg-transparent'
                        : 'border-transparent text-gray-400 hover:text-gray-300 hover:border-gray-500 bg-transparent'
                    }`}
                  >
                    {tab.label}
                    {tab.count > 0 && (
                      <span className="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary-900 text-primary-200">
                        {tab.count}
                      </span>
                    )}
                  </Button>
                ))}
              </nav>
            </div>

            {/* Filter Content */}
            <div className="mt-6">

              {activeFilterTab === 'specialization' && (
                <div>
                  <h3 className="text-sm font-medium text-gray-200 mb-3">Especializaciones</h3>
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2 max-h-80 overflow-y-auto">
                    {ANIMATION_SPECIALIZATIONS.map((specialization) => (
                      <label key={specialization} className="flex items-center space-x-3 p-2 rounded-lg hover:bg-gray-700">
                        <Checkbox
                          checked={filters.specializations.includes(specialization)}
                          onCheckedChange={() => toggleSpecialization(specialization)}
                          className="text-primary-500 focus:ring-primary-500"
                        />
                        <span className="text-sm text-gray-300 truncate">
                          {specialization}
                        </span>
                      </label>
                    ))}
                  </div>
                </div>
              )}

              {activeFilterTab === 'location' && (
                <div>
                  <h3 className="text-sm font-medium text-gray-200 mb-3">Ubicación</h3>
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2 max-h-60 overflow-y-auto">
                    {availableLocations.map((location) => (
                      <label key={location} className="flex items-center space-x-3 p-2 rounded-lg hover:bg-gray-700">
                        <Checkbox
                          checked={filters.locations.includes(location)}
                          onCheckedChange={() => toggleLocation(location)}
                          className="text-primary-500 focus:ring-primary-500"
                        />
                        <span className="text-sm text-gray-300 truncate">
                          {location}
                        </span>
                      </label>
                    ))}
                  </div>
                </div>
              )}

              {activeFilterTab === 'availability' && (
                <div>
                  <h3 className="text-sm font-medium text-gray-200 mb-3">Estado de Disponibilidad</h3>
                  <div className="space-y-2">
                    {(['Disponible', 'Empleada', 'Freelance'] as const).map((status) => (
                      <label key={status} className="flex items-center space-x-3 p-2 rounded-lg hover:bg-gray-700">
                        <Checkbox
                          checked={filters.availabilityStatus.includes(status)}
                          onCheckedChange={() => toggleAvailabilityStatus(status)}
                          className="text-primary-500 focus:ring-primary-500"
                        />
                        <span className="text-sm text-gray-300">
                          {status}
                          <span className="ml-2 text-gray-400">
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
                    <h3 className="text-sm font-medium text-gray-200 mb-3">Presencia en Redes Sociales</h3>
                    <div className="space-y-2">
                      <label className="flex items-center space-x-3 p-2 rounded-lg hover:bg-gray-700">
                        <input
                          type="radio"
                          name="socialMedia"
                          checked={filters.hasSocialMedia === true}
                          onChange={() => setFilters({ hasSocialMedia: true })}
                          className="h-4 w-4 text-primary-500 focus:ring-primary-500 border-gray-600"
                        />
                        <span className="text-sm text-gray-300">Con redes sociales</span>
                      </label>
                      <label className="flex items-center space-x-3 p-2 rounded-lg hover:bg-gray-700">
                        <input
                          type="radio"
                          name="socialMedia"
                          checked={filters.hasSocialMedia === false}
                          onChange={() => setFilters({ hasSocialMedia: false })}
                          className="h-4 w-4 text-primary-500 focus:ring-primary-500 border-gray-600"
                        />
                        <span className="text-sm text-gray-300">Sin redes sociales</span>
                      </label>
                      <label className="flex items-center space-x-3 p-2 rounded-lg hover:bg-gray-700">
                        <input
                          type="radio"
                          name="socialMedia"
                          checked={filters.hasSocialMedia === null}
                          onChange={() => setFilters({ hasSocialMedia: null })}
                          className="h-4 w-4 text-primary-500 focus:ring-primary-500 border-gray-600"
                        />
                        <span className="text-sm text-gray-300">Todos</span>
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
      {!loading && totalMembers > 0 && (
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
                  {paginationOptions.map(option => (
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
                        onClick={() => handlePageChange(pageNumber)}
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
                  onClick={() => handlePageChange(Math.min(totalPages, currentPage + 1))}
                  disabled={currentPage === totalPages}
                  variant="outline"
                  size="sm"
                  className="border-gray-600 text-gray-300 hover:bg-gray-800"
                >
                  Siguiente
                </Button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Members Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {loading ? (
          <div className="text-center py-12">
            <Spinner className="h-12 w-12 text-primary-500 mx-auto mb-4" />
            <p className="text-gray-400">Cargando información de las socias...</p>
          </div>
        ) : totalMembers === 0 ? (
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
        {!loading && totalPages > 1 && (
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
      className="hover:shadow-lg transition-all duration-200 cursor-pointer transform hover:scale-105 bg-gray-800 border-gray-700 hover:bg-gray-750"
    >
      <CardContent className="p-6">
        <div className="flex items-center mb-4">
          <ProfileImage
            src={member.profileImage}
            alt={`${member.firstName} ${member.lastName}`}
            size="md"
          />
          <div className="ml-4 flex-1 min-w-0">
            <p className="text-lg font-medium text-white truncate">
              {member.firstName} {member.lastName}
            </p>
            <p className="text-sm text-gray-300 truncate">
              {member.profession || member.company || 'Profesional'}
            </p>
          </div>
        </div>

        <div className="space-y-3">
          <div className="flex items-center justify-end">
            <Badge variant={member.availabilityStatus === 'Disponible' ? 'default' : member.availabilityStatus === 'Empleada' ? 'destructive' : 'secondary'}>
              <span className="flex items-center space-x-1">
                {member.availabilityStatus === 'Disponible' && (
                  <span title="Disponible - Abierta a nuevas oportunidades laborales">🟢</span>
                )}
                {member.availabilityStatus === 'Empleada' && (
                  <span title="Empleada - Actualmente trabajando, no disponible para nuevas oportunidades">🔴</span>
                )}
                {member.availabilityStatus === 'Freelance' && (
                  <span title="Freelance - Trabajando por cuenta propia, disponible para proyectos">🔵</span>
                )}
                <span>{member.availabilityStatus}</span>
              </span>
            </Badge>
          </div>

          <div>
            <p className="text-sm text-gray-300 font-medium mb-1">Especializaciones:</p>
            <div className="flex flex-wrap gap-1">
              {member.specializations.slice(0, 3).map((spec: string, index: number) => (
                <Badge key={index} variant="outline" className="text-xs border-gray-600 text-gray-300">
                  {spec}
                </Badge>
              ))}
              {member.specializations.length > 3 && (
                <Badge variant="secondary" className="text-xs bg-gray-700 text-gray-300">
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
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto bg-gray-800 border-gray-700">
        <DialogHeader>
          <div className="flex items-start space-x-4">
            <ProfileImage
              src={member.profileImage}
              alt={`${member.firstName} ${member.lastName}`}
              size="xl"
            />
            <div className="flex-1">
              <DialogTitle className="text-xl text-white">
                {member.firstName} {member.lastName}
              </DialogTitle>
              <DialogDescription className="text-base text-gray-300">
                {member.profession && (
                  <span className="block font-medium">{member.profession}</span>
                )}
                {member.company && (
                  <span className="block">{member.company}</span>
                )}
                <span className="block text-sm text-gray-400 mt-1">
                  {member.memberType === 'socia-pleno-derecho' ? 'Socia de Pleno Derecho' : 'Colaborador/a'}
                </span>
              </DialogDescription>
              <div className="flex gap-2 mt-2">
                <Badge variant={member.availabilityStatus === 'Disponible' ? 'default' : member.availabilityStatus === 'Empleada' ? 'destructive' : 'secondary'}>
                  <span className="flex items-center space-x-1">
                    {member.availabilityStatus === 'Disponible' && (
                      <span title="Disponible - Abierta a nuevas oportunidades laborales">🟢</span>
                    )}
                    {member.availabilityStatus === 'Empleada' && (
                      <span title="Empleada - Actualmente trabajando, no disponible para nuevas oportunidades">🔴</span>
                    )}
                    {member.availabilityStatus === 'Freelance' && (
                      <span title="Freelance - Trabajando por cuenta propia, disponible para proyectos">🔵</span>
                    )}
                    <span>{member.availabilityStatus}</span>
                  </span>
                </Badge>
              </div>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-6">
          {/* Biography Section */}
          {(member.biography || member.bio) && (
            <div>
              <h4 className="text-sm font-medium text-gray-200 mb-2">Biografía</h4>
              <p className="text-sm text-gray-300 leading-relaxed">
                {member.biography || member.bio}
              </p>
            </div>
          )}

          {/* Professional Information */}
          <div>
            <h4 className="text-sm font-medium text-gray-200 mb-3">Información Profesional</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              {member.profession && (
                <div>
                  <span className="text-gray-400">Profesión principal:</span>
                  <p className="text-gray-100">{member.profession}</p>
                </div>
              )}
              {member.specializations && member.specializations.length > 0 && (
                <div>
                  <span className="text-gray-400">Profesiones secundarias:</span>
                  <p className="text-gray-100">{member.specializations.join(', ')}</p>
                </div>
              )}
              {member.professional_role && (
                <div>
                  <span className="text-gray-400">Rol profesional:</span>
                  <p className="text-gray-100">{member.professional_role}</p>
                </div>
              )}
              {member.years_experience && (
                <div>
                  <span className="text-gray-400">Años de experiencia:</span>
                  <p className="text-gray-100">{member.years_experience} años</p>
                </div>
              )}
              {member.employment_status && (
                <div>
                  <span className="text-gray-400">Estado laboral:</span>
                  <p className="text-gray-100">{member.employment_status}</p>
                </div>
              )}
            </div>
          </div>

          {/* Education */}
          {(member.education_level || member.studies_completed || member.educational_institution) && (
            <div>
              <h4 className="text-sm font-medium text-gray-200 mb-3">Formación Académica</h4>
              <div className="space-y-2 text-sm">
                {member.education_level && (
                  <div>
                    <span className="text-gray-400">Nivel educativo:</span>
                    <p className="text-gray-100">{member.education_level}</p>
                  </div>
                )}
                {member.studies_completed && (
                  <div>
                    <span className="text-gray-400">Estudios completados:</span>
                    <p className="text-gray-100">{member.studies_completed}</p>
                  </div>
                )}
                {member.educational_institution && (
                  <div>
                    <span className="text-gray-400">Institución educativa:</span>
                    <p className="text-gray-100">{member.educational_institution}</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Location */}
          <div>
            <h4 className="text-sm font-medium text-gray-200 mb-2">Ubicación</h4>
            <div className="text-sm text-gray-300 space-y-1">
              {(member.province || member.location?.region) && (
                <p className="flex items-center">
                  <span className="text-gray-500 mr-2">🌍</span>
                  {member.province || member.location?.region}
                  {member.autonomous_community && `, ${member.autonomous_community}`}
                </p>
              )}
              <p className="flex items-center">
                <span className="text-gray-500 mr-2">🇪🇸</span>
                {member.country || member.location?.country || 'España'}
              </p>
            </div>
          </div>

          {/* CV Download */}
          {member.cv_document_url && (
            <div>
              <Button
                onClick={() => window.open(member.cv_document_url, '_blank')}
                className="w-full sm:w-auto bg-primary-600 hover:bg-primary-700 text-white"
              >
                <svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                Descargar CV
              </Button>
            </div>
          )}

          {/* Contact & Social Media */}
          <div>
            <h4 className="text-sm font-medium text-gray-200 mb-3">Contacto y Redes Sociales</h4>
            <div className="space-y-3">
              {member.phone && (
                <div className="flex items-center text-sm">
                  <span className="text-gray-500 mr-2">📞</span>
                  <span className="text-gray-300">{member.phone}</span>
                </div>
              )}
              <div>
                <SocialMediaIcons
                  socialMedia={member.socialMedia}
                  size="md"
                  variant="full"
                />
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
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