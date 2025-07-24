import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';

const profileUpdateSchema = z.object({
  firstName: z.string().min(2, 'El nombre debe tener al menos 2 caracteres'),
  lastName: z.string().min(2, 'El apellido debe tener al menos 2 caracteres'),
  phoneNumber: z.string().optional(),
  bio: z.string().max(500, 'La biografía no puede exceder 500 caracteres').optional(),
  interests: z.array(z.string()).optional(),
});

type ProfileUpdateData = z.infer<typeof profileUpdateSchema>;

export function PortalPage() {
  const { member, logout, updateProfile, isLoading } = useAuth();
  const [activeTab, setActiveTab] = useState<'dashboard' | 'profile'>('dashboard');
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  
  // Check for demo authentication
  const isDemoAuth = localStorage.getItem('demo_auth') === 'true';
  
  // Create demo member data if using demo auth
  const demoMember = {
    id: 'demo-123',
    email: 'demo@test.com',
    firstName: 'Demo',
    lastName: 'User',
    phoneNumber: '+34 600 123 456',
    bio: 'Esta es una cuenta de demostración para probar el portal de MIA.',
    interests: ['Animación 2D', 'Storyboard', 'Character Design'],
    membershipType: 'pleno-derecho',
    membershipStatus: 'active',
    joinDate: '2024-01-15',
  };
  
  const currentMember = isDemoAuth ? demoMember : member;

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<ProfileUpdateData>({
    resolver: zodResolver(profileUpdateSchema),
    defaultValues: {
      firstName: currentMember?.firstName || '',
      lastName: currentMember?.lastName || '',
      phoneNumber: currentMember?.phoneNumber || '',
      bio: currentMember?.bio || '',
      interests: currentMember?.interests || [],
    },
  });

  const handleLogout = async () => {
    if (isDemoAuth) {
      localStorage.removeItem('demo_auth');
      window.location.href = '/';
    } else {
      await logout();
    }
  };

  const onUpdateProfile = async (data: ProfileUpdateData) => {
    setMessage(null);
    
    if (isDemoAuth) {
      // Simulate successful update for demo
      setMessage({ type: 'success', text: 'Perfil actualizado correctamente (modo demo)' });
      reset(data);
      return;
    }
    
    const result = await updateProfile(data);
    
    if (result.success) {
      setMessage({ type: 'success', text: result.message });
      reset(data);
    } else {
      setMessage({ type: 'error', text: result.message });
    }
  };

  const getMembershipTypeLabel = (type: string) => {
    switch (type) {
      case 'standard': return 'Estándar';
      case 'premium': return 'Premium';
      case 'directiva': return 'Directiva';
      case 'pleno-derecho': return 'Pleno Derecho';
      default: return type;
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'active': return 'Activa';
      case 'pending': return 'Pendiente';
      case 'suspended': return 'Suspendida';
      default: return status;
    }
  };

  if (!currentMember && !isDemoAuth) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900">
      {/* Header */}
      <header className="bg-gray-800 shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <img className="h-8 w-auto" src="/logo-mia.svg" alt="MIA Logo" />
              <h1 className="ml-3 text-xl font-semibold text-white">Portal de Socias</h1>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-300">
                Hola, {currentMember.firstName}
              </span>
              <button
                onClick={handleLogout}
                className="bg-gray-700 hover:bg-gray-600 px-3 py-2 rounded-md text-sm font-medium text-gray-300 transition-colors"
              >
                Salir
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Navigation */}
      <nav className="bg-gray-800 border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex space-x-8">
            <button
              onClick={() => setActiveTab('dashboard')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'dashboard'
                  ? 'border-primary text-primary'
                  : 'border-transparent text-gray-400 hover:text-gray-300 hover:border-gray-300'
              }`}
            >
              Dashboard
            </button>
            <button
              onClick={() => setActiveTab('profile')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'profile'
                  ? 'border-primary text-primary'
                  : 'border-transparent text-gray-400 hover:text-gray-300 hover:border-gray-300'
              }`}
            >
              Mi Perfil
            </button>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          {message && (
            <div className={`rounded-md p-4 mb-6 ${
              message.type === 'success' 
                ? 'bg-green-50 text-green-800 border border-green-200' 
                : 'bg-red-50 text-red-800 border border-red-200'
            }`}>
              <p className="text-sm">{message.text}</p>
            </div>
          )}

          {activeTab === 'dashboard' && (
            <div className="space-y-6">
              {/* Welcome Card */}
              <div className="bg-gray-800 overflow-hidden shadow rounded-lg">
                <div className="px-4 py-5 sm:p-6">
                  <h3 className="text-lg leading-6 font-medium text-white">
                    Bienvenida de vuelta, {currentMember.firstName}
                  </h3>
                  <div className="mt-2 max-w-xl text-sm text-gray-400">
                    <p>Aquí encontrarás toda la información importante sobre tu membresía.</p>
                  </div>
                </div>
              </div>

              {/* Membership Info */}
              <div className="bg-gray-800 shadow overflow-hidden sm:rounded-lg">
                <div className="px-4 py-5 sm:px-6">
                  <h3 className="text-lg leading-6 font-medium text-white">
                    Información de Membresía
                  </h3>
                </div>
                <div className="border-t border-gray-200 px-4 py-5 sm:px-6">
                  <dl className="grid grid-cols-1 gap-x-4 gap-y-6 sm:grid-cols-2">
                    <div>
                      <dt className="text-sm font-medium text-gray-400">Tipo de Membresía</dt>
                      <dd className="mt-1 text-sm text-white">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          currentMember.membershipType === 'directiva'
                            ? 'bg-purple-100 text-purple-800'
                            : currentMember.membershipType === 'premium'
                            ? 'bg-yellow-100 text-yellow-800'
                            : 'bg-green-100 text-green-800'
                        }`}>
                          {getMembershipTypeLabel(currentMember.membershipType)}
                        </span>
                      </dd>
                    </div>
                    <div>
                      <dt className="text-sm font-medium text-gray-400">Estado</dt>
                      <dd className="mt-1 text-sm text-white">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          currentMember.status === 'active'
                            ? 'bg-green-100 text-green-800'
                            : currentMember.status === 'pending'
                            ? 'bg-yellow-100 text-yellow-800'
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {getStatusLabel(currentMember.status)}
                        </span>
                      </dd>
                    </div>
                    <div>
                      <dt className="text-sm font-medium text-gray-400">Fecha de Ingreso</dt>
                      <dd className="mt-1 text-sm text-white">
                        {new Date(currentMember.joinDate).toLocaleDateString('es-ES', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        })}
                      </dd>
                    </div>
                    <div>
                      <dt className="text-sm font-medium text-gray-400">Correo Electrónico</dt>
                      <dd className="mt-1 text-sm text-white">{currentMember.email}</dd>
                    </div>
                  </dl>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'profile' && (
            <div className="space-y-6">
              <div className="bg-gray-800 shadow sm:rounded-lg">
                <div className="px-4 py-5 sm:p-6">
                  <h3 className="text-lg leading-6 font-medium text-white">
                    Mi Perfil
                  </h3>
                  <div className="mt-2 max-w-xl text-sm text-gray-400">
                    <p>Actualiza tu información personal y preferencias.</p>
                  </div>
                  
                  <form onSubmit={handleSubmit(onUpdateProfile)} className="mt-6 space-y-6">
                    <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-2">
                      <div>
                        <label htmlFor="firstName" className="block text-sm font-medium text-gray-300">
                          Nombre
                        </label>
                        <input
                          type="text"
                          {...register('firstName')}
                          className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary focus:border-primary sm:text-sm"
                        />
                        {errors.firstName && (
                          <p className="mt-1 text-sm text-red-600">{errors.firstName.message}</p>
                        )}
                      </div>

                      <div>
                        <label htmlFor="lastName" className="block text-sm font-medium text-gray-300">
                          Apellido
                        </label>
                        <input
                          type="text"
                          {...register('lastName')}
                          className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary focus:border-primary sm:text-sm"
                        />
                        {errors.lastName && (
                          <p className="mt-1 text-sm text-red-600">{errors.lastName.message}</p>
                        )}
                      </div>
                    </div>

                    <div>
                      <label htmlFor="phoneNumber" className="block text-sm font-medium text-gray-300">
                        Teléfono (opcional)
                      </label>
                      <input
                        type="tel"
                        {...register('phoneNumber')}
                        className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary focus:border-primary sm:text-sm"
                      />
                    </div>

                    <div>
                      <label htmlFor="bio" className="block text-sm font-medium text-gray-300">
                        Biografía (opcional)
                      </label>
                      <textarea
                        {...register('bio')}
                        rows={4}
                        className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary focus:border-primary sm:text-sm"
                        placeholder="Cuéntanos un poco sobre ti..."
                      />
                      {errors.bio && (
                        <p className="mt-1 text-sm text-red-600">{errors.bio.message}</p>
                      )}
                    </div>

                    <div className="flex justify-end">
                      <button
                        type="submit"
                        disabled={isLoading}
                        className="bg-primary border border-transparent rounded-md shadow-sm py-2 px-4 inline-flex justify-center text-sm font-medium text-white hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary disabled:opacity-50"
                      >
                        {isLoading ? (
                          <>
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                            Guardando...
                          </>
                        ) : (
                          'Guardar Cambios'
                        )}
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}