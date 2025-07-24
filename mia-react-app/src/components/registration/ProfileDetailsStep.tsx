import { useState, useCallback, useRef } from 'react';
import { useFormContext } from 'react-hook-form';
import type { RegistrationFormData } from '../../schemas/registrationSchema';

interface ProfileDetailsStepProps {
  membershipType?: string;
  isSubmitting: boolean;
  submitError: string | null;
  onPrevious: () => void;
  onSubmit: () => void;
}

const EXPERIENCE_LEVELS = [
  { value: 'student', label: 'Estudiante', description: 'Actualmente estudiando animación/multimedia' },
  { value: 'junior', label: 'Junior (0-2 años)', description: 'Recién graduada o con poca experiencia' },
  { value: 'mid', label: 'Mid (2-5 años)', description: 'Experiencia intermedia en la industria' },
  { value: 'senior', label: 'Senior (5-10 años)', description: 'Experiencia avanzada y liderazgo' },
  { value: 'lead', label: 'Lead (10+ años)', description: 'Liderazgo de equipos y proyectos' },
  { value: 'director', label: 'Director/Executive', description: 'Roles directivos y ejecutivos' },
  { value: 'freelance', label: 'Freelance', description: 'Trabajo independiente' },
] as const;

const NEWSLETTER_FREQUENCIES = [
  { value: 'weekly', label: 'Semanal', description: 'Recibe las últimas novedades cada semana' },
  { value: 'monthly', label: 'Mensual', description: 'Resumen mensual de actividades y oportunidades' },
  { value: 'quarterly', label: 'Trimestral', description: 'Actualizaciones importantes cada 3 meses' },
] as const;

export function ProfileDetailsStep({ 
  membershipType, 
  isSubmitting, 
  submitError, 
  onPrevious, 
  onSubmit 
}: ProfileDetailsStepProps) {
  const {
    register,
    watch,
    setValue,
    trigger,
    formState: { errors },
  } = useFormContext<RegistrationFormData>();

  const [profileImagePreview, setProfileImagePreview] = useState<string | null>(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const bio = watch('bio');
  const experience = watch('experience');
  // Available if needed for UI logic:
  // const galleryVisibility = watch('galleryVisibility');
  const preferences = watch('preferences');
  // const socialMedia = watch('socialMedia');

  // Handle profile image upload
  const handleImageUpload = useCallback((file: File) => {
    if (file.size > 5 * 1024 * 1024) { // 5MB limit
      alert('La imagen no puede superar los 5MB');
      return;
    }

    if (!file.type.startsWith('image/')) {
      alert('Por favor, selecciona un archivo de imagen válido');
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const preview = e.target?.result as string;
      setProfileImagePreview(preview);
      setValue('profileImage', { file, preview });
      trigger('profileImage');
    };
    reader.readAsDataURL(file);
  }, [setValue, trigger]);

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleImageUpload(file);
    }
  }, [handleImageUpload]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    
    const file = e.dataTransfer.files[0];
    if (file) {
      handleImageUpload(file);
    }
  }, [handleImageUpload]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  }, []);

  const removeProfileImage = useCallback(() => {
    setProfileImagePreview(null);
    setValue('profileImage', undefined);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  }, [setValue]);

  // Handle form submission
  const handleSubmit = async () => {
    const fieldsToValidate: (keyof RegistrationFormData)[] = ['experience'];
    
    const isValid = await trigger(fieldsToValidate);
    
    if (isValid) {
      onSubmit();
    }
  };

  // Social media URL formatters (available if needed)
  // const formatSocialMediaUrl = (platform: string, value: string) => {
  //   if (!value) return '';
  //   
  //   switch (platform) {
  //     case 'linkedin':
  //       if (!value.includes('linkedin.com')) {
  //         return `https://linkedin.com/in/${value.replace('@', '')}`;
  //       }
  //       return value;
  //     case 'behance':
  //       if (!value.includes('behance.net')) {
  //         return `https://behance.net/${value.replace('@', '')}`;
  //       }
  //       return value;
  //     case 'artstation':
  //       if (!value.includes('artstation.com')) {
  //         return `https://artstation.com/${value.replace('@', '')}`;
  //       }
  //       return value;
  //     default:
  //       return value;
  //   }
  // };

  const isPaidMembership = membershipType && !['newsletter'].includes(membershipType);

  return (
    <div className="space-y-8">
      {/* Profile Image Upload */}
      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-4">
          Foto de Perfil (Opcional)
        </h3>
        
        <div className="flex flex-col sm:flex-row gap-6 items-start">
          {/* Upload Area */}
          <div
            className={`relative border-2 border-dashed rounded-lg p-6 w-full sm:w-64 h-64 flex flex-col items-center justify-center cursor-pointer transition-colors duration-200 ${
              isDragOver 
                ? 'border-primary-500 bg-primary-50' 
                : profileImagePreview 
                ? 'border-green-300 bg-green-50'
                : 'border-gray-300 hover:border-gray-400 bg-gray-50'
            }`}
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onClick={() => fileInputRef.current?.click()}
          >
            {profileImagePreview ? (
              <div className="relative w-full h-full">
                <img
                  src={profileImagePreview}
                  alt="Vista previa"
                  className="w-full h-full object-cover rounded-md"
                />
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    removeProfileImage();
                  }}
                  className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-colors duration-200"
                  title="Eliminar imagen"
                >
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                </button>
              </div>
            ) : (
              <div className="text-center">
                <svg className="mx-auto h-12 w-12 text-gray-400" stroke="currentColor" fill="none" viewBox="0 0 48 48">
                  <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                <div className="mt-4">
                  <p className="text-sm text-gray-600">
                    <span className="font-medium text-primary-600">Haz clic para seleccionar</span>
                    <span className="block">o arrastra y suelta una imagen aquí</span>
                  </p>
                  <p className="text-xs text-gray-500 mt-2">
                    PNG, JPG, GIF hasta 5MB
                  </p>
                </div>
              </div>
            )}
            
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileSelect}
              className="hidden"
            />
          </div>

          {/* Upload Instructions */}
          <div className="flex-1 text-sm text-gray-600">
            <h4 className="font-medium text-gray-900 mb-2">Recomendaciones</h4>
            <ul className="space-y-1 list-disc list-inside">
              <li>Foto profesional y actual</li>
              <li>Formato cuadrado preferible</li>
              <li>Buena iluminación y calidad</li>
              <li>Fondo neutro o profesional</li>
              <li>Tamaño máximo: 5MB</li>
            </ul>
            <p className="mt-3 text-xs text-gray-500">
              Esta foto aparecerá en tu perfil público de la galería de socias, 
              siempre que tengas habilitada la visibilidad correspondiente.
            </p>
          </div>
        </div>

        {errors.profileImage && (
          <p className="mt-2 text-sm text-red-600">{errors.profileImage.message}</p>
        )}
      </div>

      {/* Bio */}
      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-4">
          Biografía Profesional (Opcional)
        </h3>
        
        <div>
          <textarea
            {...register('bio')}
            rows={4}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
            placeholder="Cuéntanos sobre tu trayectoria, especialización, proyectos destacados, intereses profesionales..."
            maxLength={1000}
          />
          <div className="mt-1 flex justify-between text-xs text-gray-500">
            <span>Ayuda a otras socias a conocerte mejor</span>
            <span>{bio?.length || 0}/1000 caracteres</span>
          </div>
          {errors.bio && (
            <p className="mt-1 text-sm text-red-600">{errors.bio.message}</p>
          )}
        </div>
      </div>

      {/* Professional Info */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
        {/* Company */}
        <div>
          <label htmlFor="company" className="block text-sm font-medium text-gray-700">
            Empresa/Estudio (Opcional)
          </label>
          <input
            type="text"
            {...register('company')}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
            placeholder="Pixar, Netflix, Freelance..."
          />
          {errors.company && (
            <p className="mt-1 text-sm text-red-600">{errors.company.message}</p>
          )}
        </div>

        {/* Position */}
        <div>
          <label htmlFor="position" className="block text-sm font-medium text-gray-700">
            Cargo/Posición (Opcional)
          </label>
          <input
            type="text"
            {...register('position')}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
            placeholder="Animadora 2D, Directora de Arte..."
          />
          {errors.position && (
            <p className="mt-1 text-sm text-red-600">{errors.position.message}</p>
          )}
        </div>
      </div>

      {/* Experience Level */}
      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-4">
          Nivel de Experiencia *
        </h3>
        
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {EXPERIENCE_LEVELS.map((level) => (
            <label
              key={level.value}
              className={`relative border rounded-lg p-4 cursor-pointer focus:outline-none transition-all duration-200 ${
                experience === level.value
                  ? 'border-primary-500 ring-2 ring-primary-500 bg-primary-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <input
                type="radio"
                {...register('experience')}
                value={level.value}
                className="sr-only"
              />
              <div>
                <div className="text-sm font-medium text-gray-900">
                  {level.label}
                </div>
                <div className="text-xs text-gray-500 mt-1">
                  {level.description}
                </div>
              </div>
            </label>
          ))}
        </div>

        {errors.experience && (
          <p className="mt-2 text-sm text-red-600">{errors.experience.message}</p>
        )}
      </div>

      {/* Social Media */}
      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-4">
          Redes Sociales y Portfolio (Opcional)
        </h3>
        
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {/* Website */}
          <div>
            <label htmlFor="socialMedia.website" className="block text-sm font-medium text-gray-700">
              Sitio Web Personal
            </label>
            <input
              type="url"
              {...register('socialMedia.website')}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
              placeholder="https://tu-portfolio.com"
            />
            {errors.socialMedia?.website && (
              <p className="mt-1 text-sm text-red-600">{errors.socialMedia.website.message}</p>
            )}
          </div>

          {/* LinkedIn */}
          <div>
            <label htmlFor="socialMedia.linkedin" className="block text-sm font-medium text-gray-700">
              LinkedIn
            </label>
            <input
              type="url"
              {...register('socialMedia.linkedin')}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
              placeholder="https://linkedin.com/in/tu-perfil"
            />
            {errors.socialMedia?.linkedin && (
              <p className="mt-1 text-sm text-red-600">{errors.socialMedia.linkedin.message}</p>
            )}
          </div>

          {/* Behance */}
          <div>
            <label htmlFor="socialMedia.behance" className="block text-sm font-medium text-gray-700">
              Behance
            </label>
            <input
              type="url"
              {...register('socialMedia.behance')}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
              placeholder="https://behance.net/tu-perfil"
            />
            {errors.socialMedia?.behance && (
              <p className="mt-1 text-sm text-red-600">{errors.socialMedia.behance.message}</p>
            )}
          </div>

          {/* ArtStation */}
          <div>
            <label htmlFor="socialMedia.artstation" className="block text-sm font-medium text-gray-700">
              ArtStation
            </label>
            <input
              type="url"
              {...register('socialMedia.artstation')}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
              placeholder="https://artstation.com/tu-perfil"
            />
            {errors.socialMedia?.artstation && (
              <p className="mt-1 text-sm text-red-600">{errors.socialMedia.artstation.message}</p>
            )}
          </div>

          {/* Twitter */}
          <div>
            <label htmlFor="socialMedia.twitter" className="block text-sm font-medium text-gray-700">
              Twitter/X
            </label>
            <input
              type="text"
              {...register('socialMedia.twitter')}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
              placeholder="@tu_usuario"
            />
            {errors.socialMedia?.twitter && (
              <p className="mt-1 text-sm text-red-600">{errors.socialMedia.twitter.message}</p>
            )}
          </div>

          {/* Instagram */}
          <div>
            <label htmlFor="socialMedia.instagram" className="block text-sm font-medium text-gray-700">
              Instagram
            </label>
            <input
              type="text"
              {...register('socialMedia.instagram')}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
              placeholder="@tu_usuario"
            />
            {errors.socialMedia?.instagram && (
              <p className="mt-1 text-sm text-red-600">{errors.socialMedia.instagram.message}</p>
            )}
          </div>
        </div>
      </div>

      {/* Gallery Visibility (only for paid memberships) */}
      {isPaidMembership && (
        <div>
          <h3 className="text-lg font-medium text-gray-900 mb-4">
            Visibilidad en la Galería de Socias
          </h3>
          <p className="text-sm text-gray-600 mb-4">
            Controla qué información aparece en tu perfil público de la galería
          </p>
          
          <div className="space-y-4">
            <label className="flex items-start">
              <input
                type="checkbox"
                {...register('galleryVisibility.showProfile')}
                className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded mt-1"
              />
              <div className="ml-3">
                <span className="text-sm font-medium text-gray-900">Mostrar perfil público</span>
                <p className="text-xs text-gray-500">Tu nombre, foto y biografía aparecerán en la galería</p>
              </div>
            </label>

            <label className="flex items-start">
              <input
                type="checkbox"
                {...register('galleryVisibility.showContact')}
                className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded mt-1"
              />
              <div className="ml-3">
                <span className="text-sm font-medium text-gray-900">Mostrar información de contacto</span>
                <p className="text-xs text-gray-500">Email y ubicación visibles para otras socias</p>
              </div>
            </label>

            <label className="flex items-start">
              <input
                type="checkbox"
                {...register('galleryVisibility.showSocialMedia')}
                className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded mt-1"
              />
              <div className="ml-3">
                <span className="text-sm font-medium text-gray-900">Mostrar redes sociales</span>
                <p className="text-xs text-gray-500">Enlaces a portfolio y redes sociales</p>
              </div>
            </label>

            <label className="flex items-start">
              <input
                type="checkbox"
                {...register('galleryVisibility.showProjects')}
                className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded mt-1"
              />
              <div className="ml-3">
                <span className="text-sm font-medium text-gray-900">Mostrar proyectos destacados</span>
                <p className="text-xs text-gray-500">Proyectos y trabajos que quieras destacar (próximamente)</p>
              </div>
            </label>
          </div>
        </div>
      )}

      {/* Communication Preferences */}
      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-4">
          Preferencias de Comunicación
        </h3>
        
        {/* Newsletter Frequency */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-3">
            Frecuencia del Newsletter
          </label>
          <div className="grid gap-3 sm:grid-cols-3">
            {NEWSLETTER_FREQUENCIES.map((freq) => (
              <label
                key={freq.value}
                className={`relative border rounded-lg p-3 cursor-pointer focus:outline-none transition-all duration-200 ${
                  preferences?.newsletterFrequency === freq.value
                    ? 'border-primary-500 ring-2 ring-primary-500 bg-primary-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <input
                  type="radio"
                  {...register('preferences.newsletterFrequency')}
                  value={freq.value}
                  className="sr-only"
                />
                <div>
                  <div className="text-sm font-medium text-gray-900">
                    {freq.label}
                  </div>
                  <div className="text-xs text-gray-500 mt-1">
                    {freq.description}
                  </div>
                </div>
              </label>
            ))}
          </div>
        </div>

        {/* Other Preferences */}
        <div className="space-y-4">
          <label className="flex items-start">
            <input
              type="checkbox"
              {...register('preferences.eventNotifications')}
              className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded mt-1"
            />
            <div className="ml-3">
              <span className="text-sm font-medium text-gray-900">Notificaciones de eventos</span>
              <p className="text-xs text-gray-500">Talleres, webinars, networking y actividades de MIA</p>
            </div>
          </label>

          <label className="flex items-start">
            <input
              type="checkbox"
              {...register('preferences.jobNotifications')}
              className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded mt-1"
            />
            <div className="ml-3">
              <span className="text-sm font-medium text-gray-900">Ofertas de trabajo</span>
              <p className="text-xs text-gray-500">Oportunidades laborales exclusivas para socias</p>
            </div>
          </label>

          <label className="flex items-start">
            <input
              type="checkbox"
              {...register('preferences.whatsappCommunity')}
              className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded mt-1"
            />
            <div className="ml-3">
              <span className="text-sm font-medium text-gray-900">Grupo de WhatsApp</span>
              <p className="text-xs text-gray-500">Únete a nuestro grupo para networking diario (solo socias de pleno derecho)</p>
            </div>
          </label>

          {isPaidMembership && (
            <label className="flex items-start">
              <input
                type="checkbox"
                {...register('preferences.mentorshipProgram')}
                className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded mt-1"
              />
              <div className="ml-3">
                <span className="text-sm font-medium text-gray-900">Programa de Mentorías</span>
                <p className="text-xs text-gray-500">Participar como mentora o mentee en nuestro programa</p>
              </div>
            </label>
          )}
        </div>
      </div>

      {/* Error Display */}
      {submitError && (
        <div className="bg-red-50 border border-red-200 rounded-md p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-400" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">
                Error en el envío del formulario
              </h3>
              <div className="mt-1 text-sm text-red-700">
                <p>{submitError}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Navigation */}
      <div className="flex justify-between pt-6 border-t border-gray-200">
        <button
          type="button"
          onClick={onPrevious}
          disabled={isSubmitting}
          className="inline-flex justify-center py-2 px-4 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <svg className="mr-2 -ml-1 w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
          </svg>
          Anterior
        </button>

        <button
          type="button"
          onClick={handleSubmit}
          disabled={isSubmitting}
          className="ml-3 inline-flex justify-center py-2 px-6 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSubmitting ? (
            <>
              <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Procesando...
            </>
          ) : membershipType === 'newsletter' ? (
            'Suscribirse al Newsletter'
          ) : (
            'Completar Registro'
          )}
        </button>
      </div>

      {/* Final Step Info */}
      <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
        <div className="flex">
          <div className="flex-shrink-0">
            <svg className="h-5 w-5 text-blue-400" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
            </svg>
          </div>
          <div className="ml-3">
            <h3 className="text-sm font-medium text-blue-800">
              {membershipType === 'newsletter' ? '¡Ya casi estás suscrita!' : '¡Último paso!'}
            </h3>
            <div className="mt-1 text-sm text-blue-700">
              <p>
                {membershipType === 'newsletter' 
                  ? 'Al hacer clic en "Suscribirse al Newsletter" recibirás un email de confirmación. Tu información se guardará de forma segura.'
                  : 'Al completar el registro serás redirigida al sistema de pago seguro para finalizar tu membresía.'
                }
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}