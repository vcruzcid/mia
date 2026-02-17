import { Checkbox } from '@/components/ui/checkbox';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ANIMATION_SPECIALIZATIONS } from '@/types';
import type { MemberFilters as FilterType } from '@/hooks/useMemberFilters';

interface MemberFiltersProps {
  filters: FilterType;
  availableLocations: string[];
  memberCounts: {
    byType: Record<string, number>;
    byAvailability: Record<string, number>;
  };
  toggleMembershipType: (type: string) => void;
  toggleSpecialization: (spec: string) => void;
  toggleLocation: (location: string) => void;
  toggleAvailabilityStatus: (status: string) => void;
  setFilters: (updates: Partial<FilterType>) => void;
}

export function MemberFilters({
  filters,
  availableLocations,
  memberCounts,
  toggleMembershipType,
  toggleSpecialization,
  toggleLocation,
  toggleAvailabilityStatus,
  setFilters,
}: MemberFiltersProps) {
  return (
    <div className="bg-gray-800 border-b border-gray-700">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Filter Tabs */}
        <Tabs defaultValue="specialization" className="w-full">
          <TabsList className="w-full grid grid-cols-4 bg-gray-700 p-1 rounded-lg">
            <TabsTrigger value="specialization" className="text-xs sm:text-sm">
              Especializaciones
              {filters.specializations.length > 0 && (
                <span className="ml-1 px-1.5 py-0.5 rounded-full text-xs bg-primary-600 text-white">
                  {filters.specializations.length}
                </span>
              )}
            </TabsTrigger>
            <TabsTrigger value="location" className="text-xs sm:text-sm">
              Ubicación
              {filters.locations.length > 0 && (
                <span className="ml-1 px-1.5 py-0.5 rounded-full text-xs bg-primary-600 text-white">
                  {filters.locations.length}
                </span>
              )}
            </TabsTrigger>
            <TabsTrigger value="availability" className="text-xs sm:text-sm">
              Disponibilidad
              {filters.availabilityStatus.length > 0 && (
                <span className="ml-1 px-1.5 py-0.5 rounded-full text-xs bg-primary-600 text-white">
                  {filters.availabilityStatus.length}
                </span>
              )}
            </TabsTrigger>
            <TabsTrigger value="other" className="text-xs sm:text-sm">
              Otros
              {filters.hasSocialMedia !== null && (
                <span className="ml-1 px-1.5 py-0.5 rounded-full text-xs bg-primary-600 text-white">
                  1
                </span>
              )}
            </TabsTrigger>
          </TabsList>

          {/* Filter Content */}
          <div className="mt-6">
            <TabsContent value="specialization">
              <div>
                <h3 className="text-sm font-medium text-gray-200 mb-3">Especializaciones</h3>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2 max-h-80 overflow-y-auto">
                  {ANIMATION_SPECIALIZATIONS.map((specialization) => (
                    <label key={specialization} className="flex items-center space-x-3 p-2 rounded-lg hover:bg-gray-700 cursor-pointer">
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
            </TabsContent>

            <TabsContent value="location">
              <div>
                <h3 className="text-sm font-medium text-gray-200 mb-3">Ubicación</h3>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2 max-h-60 overflow-y-auto">
                  {availableLocations.map((location) => (
                    <label key={location} className="flex items-center space-x-3 p-2 rounded-lg hover:bg-gray-700 cursor-pointer">
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
            </TabsContent>

            <TabsContent value="availability">
              <div>
                <h3 className="text-sm font-medium text-gray-200 mb-3">Estado de Disponibilidad</h3>
                <div className="space-y-2">
                  {(['Disponible', 'Empleada', 'Freelance'] as const).map((status) => (
                    <label key={status} className="flex items-center space-x-3 p-2 rounded-lg hover:bg-gray-700 cursor-pointer">
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
            </TabsContent>

            <TabsContent value="other">
              <div className="space-y-4">
                <div>
                  <h3 className="text-sm font-medium text-gray-200 mb-3">Tipo de membresía</h3>
                  <div className="space-y-2">
                    {([
                      { value: 'pleno_derecho', label: 'Socia pleno derecho' },
                      { value: 'estudiante', label: 'Socia estudiante' },
                      { value: 'colaborador', label: 'Socio colaborador' }
                    ] as const).map(({ value, label }) => (
                      <label key={value} className="flex items-center space-x-3 p-2 rounded-lg hover:bg-gray-700 cursor-pointer">
                        <Checkbox
                          checked={filters.membershipTypes.includes(value)}
                          onCheckedChange={() => toggleMembershipType(value)}
                          className="text-primary-500 focus:ring-primary-500"
                        />
                        <span className="text-sm text-gray-300">
                          {label}
                          <span className="ml-2 text-gray-400">
                            ({memberCounts.byType[value] || 0})
                          </span>
                        </span>
                      </label>
                    ))}
                  </div>
                </div>

                <div>
                  <h3 className="text-sm font-medium text-gray-200 mb-3">Presencia en Redes Sociales</h3>
                  <div className="space-y-2">
                    <label className="flex items-center space-x-3 p-2 rounded-lg hover:bg-gray-700 cursor-pointer">
                      <input
                        type="radio"
                        name="socialMedia"
                        checked={filters.hasSocialMedia === true}
                        onChange={() => setFilters({ hasSocialMedia: true })}
                        className="h-4 w-4 text-primary-500 focus:ring-primary-500 border-gray-600"
                      />
                      <span className="text-sm text-gray-300">Con redes sociales</span>
                    </label>
                    <label className="flex items-center space-x-3 p-2 rounded-lg hover:bg-gray-700 cursor-pointer">
                      <input
                        type="radio"
                        name="socialMedia"
                        checked={filters.hasSocialMedia === false}
                        onChange={() => setFilters({ hasSocialMedia: false })}
                        className="h-4 w-4 text-primary-500 focus:ring-primary-500 border-gray-600"
                      />
                      <span className="text-sm text-gray-300">Sin redes sociales</span>
                    </label>
                    <label className="flex items-center space-x-3 p-2 rounded-lg hover:bg-gray-700 cursor-pointer">
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
            </TabsContent>
          </div>
        </Tabs>
      </div>
    </div>
  );
}

