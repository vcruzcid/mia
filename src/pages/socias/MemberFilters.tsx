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
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
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

          <div className="mt-2">
            <TabsContent value="specialization">
              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-x-2 gap-y-0 max-h-40 overflow-y-auto">
                {ANIMATION_SPECIALIZATIONS.map((specialization) => (
                  <label key={specialization} className="flex items-center gap-1.5 py-0.5 px-1 rounded hover:bg-gray-700 cursor-pointer">
                    <Checkbox
                      checked={filters.specializations.includes(specialization)}
                      onCheckedChange={() => toggleSpecialization(specialization)}
                      className="text-primary-500 focus:ring-primary-500 shrink-0"
                    />
                    <span className="text-xs text-gray-300 truncate">{specialization}</span>
                  </label>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="location">
              {availableLocations.length === 0 ? (
                <p className="text-xs text-gray-500 py-1">Las ubicaciones se cargan con los datos de socias.</p>
              ) : (
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-x-2 gap-y-0 max-h-40 overflow-y-auto">
                  {availableLocations.map((location) => (
                    <label key={location} className="flex items-center gap-1.5 py-0.5 px-1 rounded hover:bg-gray-700 cursor-pointer">
                      <Checkbox
                        checked={filters.locations.includes(location)}
                        onCheckedChange={() => toggleLocation(location)}
                        className="text-primary-500 focus:ring-primary-500 shrink-0"
                      />
                      <span className="text-xs text-gray-300 truncate">{location}</span>
                    </label>
                  ))}
                </div>
              )}
            </TabsContent>

            <TabsContent value="availability">
              <div className="flex flex-wrap gap-x-6 gap-y-0">
                {(['Disponible', 'Empleada', 'Freelance'] as const).map((status) => (
                  <label key={status} className="flex items-center gap-1.5 py-0.5 px-1 rounded hover:bg-gray-700 cursor-pointer">
                    <Checkbox
                      checked={filters.availabilityStatus.includes(status)}
                      onCheckedChange={() => toggleAvailabilityStatus(status)}
                      className="text-primary-500 focus:ring-primary-500 shrink-0"
                    />
                    <span className="text-xs text-gray-300">
                      {status}
                      <span className="ml-1 text-gray-500">({memberCounts.byAvailability[status] || 0})</span>
                    </span>
                  </label>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="other">
              <div className="flex flex-wrap gap-x-8 gap-y-2">
                <div>
                  <p className="text-xs text-gray-400 mb-1">Membresía</p>
                  <div className="flex flex-wrap gap-x-4 gap-y-0">
                    {([
                      { value: 'pleno_derecho', label: 'Pleno derecho' },
                      { value: 'estudiante', label: 'Estudiante' },
                      { value: 'colaborador', label: 'Colaborador' },
                    ] as const).map(({ value, label }) => (
                      <label key={value} className="flex items-center gap-1.5 py-0.5 px-1 rounded hover:bg-gray-700 cursor-pointer">
                        <Checkbox
                          checked={filters.membershipTypes.includes(value)}
                          onCheckedChange={() => toggleMembershipType(value)}
                          className="text-primary-500 focus:ring-primary-500 shrink-0"
                        />
                        <span className="text-xs text-gray-300">
                          {label}
                          <span className="ml-1 text-gray-500">({memberCounts.byType[value] || 0})</span>
                        </span>
                      </label>
                    ))}
                  </div>
                </div>
                <div>
                  <p className="text-xs text-gray-400 mb-1">Redes sociales</p>
                  <div className="flex flex-wrap gap-x-4 gap-y-0">
                    {([
                      { value: true, label: 'Con redes' },
                      { value: false, label: 'Sin redes' },
                      { value: null, label: 'Todas' },
                    ] as const).map(({ value, label }) => (
                      <label key={label} className="flex items-center gap-1.5 py-0.5 px-1 rounded hover:bg-gray-700 cursor-pointer">
                        <input
                          type="radio"
                          name="socialMedia"
                          checked={filters.hasSocialMedia === value}
                          onChange={() => setFilters({ hasSocialMedia: value })}
                          className="h-3.5 w-3.5 text-primary-500 focus:ring-primary-500 border-gray-600"
                        />
                        <span className="text-xs text-gray-300">{label}</span>
                      </label>
                    ))}
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

