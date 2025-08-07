import { useState, useEffect } from 'react';
import { useFormContext } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Spinner } from '@/components/ui/spinner';
import { PROFESSIONAL_CATEGORIES, SPANISH_UNIVERSITIES } from '../../schemas/registrationSchema';
import type { RegistrationFormData } from '../../schemas/registrationSchema';

interface PersonalInfoStepProps {
  membershipType?: string;
  onNext: () => void;
}

// Spanish provinces for address autocomplete
const SPANISH_PROVINCES = [
  'Álava', 'Albacete', 'Alicante', 'Almería', 'Asturias', 'Ávila', 'Badajoz', 'Barcelona', 
  'Burgos', 'Cáceres', 'Cádiz', 'Cantabria', 'Castellón', 'Ciudad Real', 'Córdoba', 'Cuenca',
  'Gerona', 'Granada', 'Guadalajara', 'Guipúzcoa', 'Huelva', 'Huesca', 'Jaén', 'La Coruña',
  'La Rioja', 'Las Palmas', 'León', 'Lleida', 'Lugo', 'Madrid', 'Málaga', 'Murcia', 'Navarra',
  'Ourense', 'Palencia', 'Pontevedra', 'Salamanca', 'Santa Cruz de Tenerife', 'Segovia', 
  'Sevilla', 'Soria', 'Tarragona', 'Teruel', 'Toledo', 'Valencia', 'Valladolid', 'Vizcaya', 'Zamora', 'Zaragoza'
];

export function PersonalInfoStep({ membershipType, onNext }: PersonalInfoStepProps) {
  const {
    register,
    watch,
    setValue,
    formState: { errors },
    trigger,
  } = useFormContext<RegistrationFormData>();

  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [categorySearch, setCategorySearch] = useState('');
  // const [addressSuggestions, setAddressSuggestions] = useState<string[]>([]);
  const [isLoadingAddress, setIsLoadingAddress] = useState(false);

  // const watchedCategories = watch('categories') || [];
  // Available if needed for UI logic:
  // const watchedPostalCode = watch('address.postalCode');
  // const watchedProvince = watch('address.province');

  // Sync selectedCategories with form state
  useEffect(() => {
    const categories = watch('categories') || [];
    setSelectedCategories(categories);
  }, [watch]);

  // Handle category selection
  const toggleCategory = (category: string) => {
    const newCategories = selectedCategories.includes(category)
      ? selectedCategories.filter(c => c !== category)
      : [...selectedCategories, category];
    
    setSelectedCategories(newCategories);
    setValue('categories', newCategories);
    trigger('categories'); // Trigger validation
  };

  // Filter categories based on search
  const filteredCategories = PROFESSIONAL_CATEGORIES.filter(category =>
    category.toLowerCase().includes(categorySearch.toLowerCase())
  );

  // Postal code lookup (mock implementation)
  const handlePostalCodeChange = async (postalCode: string) => {
    if (postalCode.length === 5 && /^\d{5}$/.test(postalCode)) {
      setIsLoadingAddress(true);
      
      // Mock API call to postal code service
      // In production, you'd use a service like:
      // - Spanish postal service API
      // - Google Places API
      // - MapBox Geocoding API
      
      setTimeout(() => {
        const mockCityData: Record<string, { city: string; province: string }> = {
          '28001': { city: 'Madrid', province: 'Madrid' },
          '08001': { city: 'Barcelona', province: 'Barcelona' },
          '41001': { city: 'Sevilla', province: 'Sevilla' },
          '46001': { city: 'Valencia', province: 'Valencia' },
          '50001': { city: 'Zaragoza', province: 'Zaragoza' },
          '29001': { city: 'Málaga', province: 'Málaga' },
          '35001': { city: 'Las Palmas de Gran Canaria', province: 'Las Palmas' },
          '38001': { city: 'Santa Cruz de Tenerife', province: 'Santa Cruz de Tenerife' },
        };

        const cityData = mockCityData[postalCode];
        if (cityData) {
          setValue('address.city', cityData.city);
          setValue('address.province', cityData.province);
          trigger(['address.city', 'address.province']);
        }
        
        setIsLoadingAddress(false);
      }, 500);
    }
  };

  // Handle next step
  const handleNext = async () => {
    const isValid = await trigger([
      'firstName',
      'lastName', 
      'email',
      'phone',
      'address',
      'categories',
      ...(membershipType === 'estudiante' ? ['university' as keyof RegistrationFormData] : [])
    ]);
    
    if (isValid) {
      onNext();
    }
  };

  return (
    <div className="space-y-8">
      {/* Personal Information */}
      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-4">
          Información Personal
        </h3>
        
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
          {/* First Name */}
          <div>
            <label htmlFor="firstName" className="block text-sm font-medium text-gray-700">
              Nombre *
            </label>
            <Input
              type="text"
              {...register('firstName')}
              className="mt-1"
              placeholder="Tu nombre"
            />
            {errors.firstName && (
              <p className="mt-1 text-sm text-red-600">{errors.firstName.message}</p>
            )}
          </div>

          {/* Last Name */}
          <div>
            <label htmlFor="lastName" className="block text-sm font-medium text-gray-700">
              Apellidos *
            </label>
            <Input
              type="text"
              {...register('lastName')}
              className="mt-1"
              placeholder="Tus apellidos"
            />
            {errors.lastName && (
              <p className="mt-1 text-sm text-red-600">{errors.lastName.message}</p>
            )}
          </div>

          {/* Email */}
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700">
              Email *
            </label>
            <Input
              type="email"
              {...register('email')}
              className="mt-1"
              placeholder="tu@email.com"
            />
            {errors.email && (
              <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>
            )}
          </div>

          {/* Phone */}
          <div>
            <label htmlFor="phone" className="block text-sm font-medium text-gray-700">
              Teléfono *
            </label>
            <Input
              type="tel"
              {...register('phone')}
              className="mt-1"
              placeholder="+34 666 123 456"
            />
            {errors.phone && (
              <p className="mt-1 text-sm text-red-600">{errors.phone.message}</p>
            )}
          </div>
        </div>
      </div>

      {/* Address */}
      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-4">
          Dirección
        </h3>

        <div className="space-y-4">
          {/* Street Address */}
          <div>
            <label htmlFor="address.street" className="block text-sm font-medium text-gray-700">
              Dirección *
            </label>
            <Input
              type="text"
              {...register('address.street')}
              className="mt-1"
              placeholder="Calle, número, piso, puerta..."
            />
            {errors.address?.street && (
              <p className="mt-1 text-sm text-red-600">{errors.address.street.message}</p>
            )}
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            {/* Postal Code */}
            <div>
              <label htmlFor="address.postalCode" className="block text-sm font-medium text-gray-700">
                Código Postal *
              </label>
              <div className="relative">
                <Input
                  type="text"
                  {...register('address.postalCode', {
                    onChange: (e) => handlePostalCodeChange(e.target.value)
                  })}
                  maxLength={5}
                  className="mt-1"
                  placeholder="28001"
                />
                {isLoadingAddress && (
                  <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                    <Spinner className="h-4 w-4" />
                  </div>
                )}
              </div>
              {errors.address?.postalCode && (
                <p className="mt-1 text-sm text-red-600">{errors.address.postalCode.message}</p>
              )}
            </div>

            {/* City */}
            <div>
              <label htmlFor="address.city" className="block text-sm font-medium text-gray-700">
                Ciudad *
              </label>
              <Input
                type="text"
                {...register('address.city')}
                className="mt-1"
                placeholder="Madrid"
              />
              {errors.address?.city && (
                <p className="mt-1 text-sm text-red-600">{errors.address.city.message}</p>
              )}
            </div>

            {/* Province */}
            <div>
              <label htmlFor="address.province" className="block text-sm font-medium text-gray-700">
                Provincia *
              </label>
              <select
                {...register('address.province')}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
              >
                <option value="">Selecciona...</option>
                {SPANISH_PROVINCES.map(province => (
                  <option key={province} value={province}>
                    {province}
                  </option>
                ))}
              </select>
              {errors.address?.province && (
                <p className="mt-1 text-sm text-red-600">{errors.address.province.message}</p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Professional Categories */}
      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-4">
          Categorías Profesionales *
        </h3>
        
        {/* Category Search */}
        <div className="mb-4">
          <Input
            type="text"
            value={categorySearch}
            onChange={(e) => setCategorySearch(e.target.value)}
            className="w-full"
            placeholder="Buscar especialización..."
          />
        </div>

        {/* Selected Categories */}
        {selectedCategories.length > 0 && (
          <div className="mb-4">
            <p className="text-sm font-medium text-gray-700 mb-2">
              Seleccionadas ({selectedCategories.length}):
            </p>
            <div className="flex flex-wrap gap-2">
              {selectedCategories.map(category => (
                <span
                  key={category}
                  className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-primary-100 text-primary-800"
                >
                  {category}
                  <Button
                    type="button"
                    onClick={() => toggleCategory(category)}
                    variant="ghost"
                    size="sm"
                    className="ml-2 hover:bg-primary-200 rounded-full p-0.5"
                  >
                    <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                  </Button>
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Category Grid */}
        <div className="max-h-80 overflow-y-auto border border-gray-200 rounded-md p-4">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
            {filteredCategories.map(category => (
              <label key={category} className="flex items-center space-x-3">
                <Checkbox
                  checked={selectedCategories.includes(category)}
                  onCheckedChange={() => toggleCategory(category)}
                />
                <span className="text-sm text-gray-700">
                  {category}
                </span>
              </label>
            ))}
          </div>
        </div>

        {errors.categories && (
          <p className="mt-1 text-sm text-red-600">{errors.categories.message}</p>
        )}
      </div>

      {/* University (conditional for students) */}
      {membershipType === 'estudiante' && (
        <div>
          <h3 className="text-lg font-medium text-gray-900 mb-4">
            Universidad *
          </h3>
          
          <select
            {...register('university')}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
          >
            <option value="">Selecciona tu universidad...</option>
            {SPANISH_UNIVERSITIES.map(university => (
              <option key={university} value={university}>
                {university}
              </option>
            ))}
          </select>
          
          {errors.university && (
            <p className="mt-1 text-sm text-red-600">{errors.university.message}</p>
          )}
        </div>
      )}

      {/* Navigation */}
      <div className="flex justify-end pt-6 border-t border-gray-200">
        <Button
          type="button"
          onClick={handleNext}
          className="ml-3"
        >
          Continuar
          <svg className="ml-2 -mr-1 w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
          </svg>
        </Button>
      </div>
    </div>
  );
}