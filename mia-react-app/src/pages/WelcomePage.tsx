import { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';

interface UserInfo {
  name: string;
  email: string;
  phone: string;
  address: {
    line1?: string;
    line2?: string;
    city?: string;
    postal_code?: string;
    state?: string;
    country?: string;
  };
  customFields: {
    professional_categories?: string;
    experience_level?: string;
    company_or_institution?: string;
  };
  membershipInfo: {
    type: string;
    originalAmount: number;
    finalAmount: number;
    discountCode: string | null;
    discountPercentage: number;
    registrationDate: string;
  };
  paymentInfo: {
    status: string;
    amount: number;
    currency: string;
  } | null;
  stripeCustomerId: string;
  stripeSessionId: string;
}

interface WelcomeState {
  userInfo: UserInfo | null;
  loading: boolean;
  error: string | null;
}

export function WelcomePage() {
  const [searchParams] = useSearchParams();
  const sessionId = searchParams.get('session_id');
  const membershipType = searchParams.get('membership');
  
  const [state, setState] = useState<WelcomeState>({
    userInfo: null,
    loading: true,
    error: null,
  });

  useEffect(() => {
    const fetchUserInfo = async () => {
      if (!sessionId) {
        setState(prev => ({
          ...prev,
          loading: false,
          error: 'No se encontró información de la sesión de pago',
        }));
        return;
      }

      try {
        // In production, call your backend API
        const response = await fetch(`/api/get-customer-details/${sessionId}`);
        
        if (!response.ok) {
          throw new Error('Error retrieving customer information');
        }

        const { userInfo } = await response.json();
        
        setState({
          userInfo,
          loading: false,
          error: null,
        });

        // Clear any saved registration draft since payment is complete
        localStorage.removeItem('mia-registration-draft');

      } catch (error) {
        console.error('Error fetching user info:', error);
        setState(prev => ({
          ...prev,
          loading: false,
          error: 'No se pudo recuperar la información del usuario',
        }));
      }
    };

    fetchUserInfo();
  }, [sessionId]);

  const getMembershipName = (type: string) => {
    const names: Record<string, string> = {
      'pleno-derecho': 'Socia de Pleno Derecho',
      'colaborador': 'Colaborador',
      'estudiante': 'Estudiante',
      'newsletter': 'Newsletter Gratuito',
    };
    return names[type] || type;
  };

  const getExperienceLevelText = (level: string) => {
    const levels: Record<string, string> = {
      'student': 'Estudiante',
      'junior': 'Junior (0-2 años)',
      'mid': 'Mid (2-5 años)',
      'senior': 'Senior (5-10 años)',
      'lead': 'Lead (10+ años)',
      'director': 'Director/Executive',
      'freelance': 'Freelance',
    };
    return levels[level] || level;
  };

  if (state.loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary-600 mx-auto"></div>
          <h2 className="mt-6 text-2xl font-semibold text-gray-900">
            Verificando tu registro...
          </h2>
          <p className="mt-2 text-gray-600">
            Estamos obteniendo tu información de pago y activando tu membresía.
          </p>
        </div>
      </div>
    );
  }

  if (state.error || !state.userInfo) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="max-w-md mx-auto text-center">
          <div className="bg-red-50 border border-red-200 rounded-lg p-6">
            <svg className="mx-auto h-12 w-12 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
            <h2 className="mt-4 text-xl font-semibold text-red-800">
              Error en el Registro
            </h2>
            <p className="mt-2 text-red-700">
              {state.error}
            </p>
            <div className="mt-6 space-y-2">
              <Link
                to="/registro"
                className="inline-block px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 transition-colors"
              >
                Intentar de Nuevo
              </Link>
              <div>
                <Link
                  to="/contacto"
                  className="text-primary-600 hover:text-primary-700 text-sm underline"
                >
                  Contactar Soporte
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const { userInfo } = state;
  const isFreeMembership = userInfo.membershipInfo.type === 'newsletter';

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-blue-50">
      <div className="max-w-4xl mx-auto px-4 py-12">
        {/* Success Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-green-500 text-white rounded-full mb-4">
            <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            ¡Bienvenida a MIA, {userInfo.name?.split(' ')[0]}!
          </h1>
          <p className="text-xl text-gray-600">
            {isFreeMembership 
              ? 'Te has suscrito exitosamente a nuestro newsletter'
              : 'Tu membresía ha sido activada exitosamente'
            }
          </p>
        </div>

        {/* Main Content */}
        <div className="grid lg:grid-cols-2 gap-8">
          {/* Membership Information */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">
              Tu Membresía
            </h2>
            
            <div className="space-y-4">
              <div className="flex justify-between">
                <span className="text-gray-600">Tipo de membresía:</span>
                <span className="font-medium text-primary-600">
                  {getMembershipName(userInfo.membershipInfo.type)}
                </span>
              </div>
              
              {!isFreeMembership && (
                <>
                  {userInfo.membershipInfo.originalAmount !== userInfo.membershipInfo.finalAmount && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Precio original:</span>
                      <span className="text-gray-500 line-through">
                        €{userInfo.membershipInfo.originalAmount}
                      </span>
                    </div>
                  )}
                  
                  {userInfo.membershipInfo.discountCode && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Descuento aplicado:</span>
                      <span className="text-green-600 font-medium">
                        {userInfo.membershipInfo.discountCode} (-{userInfo.membershipInfo.discountPercentage}%)
                      </span>
                    </div>
                  )}
                  
                  <div className="flex justify-between border-t pt-4">
                    <span className="text-lg font-semibold text-gray-900">Total pagado:</span>
                    <span className="text-lg font-bold text-primary-600">
                      €{userInfo.membershipInfo.finalAmount}
                    </span>
                  </div>
                </>
              )}
              
              <div className="flex justify-between">
                <span className="text-gray-600">Fecha de registro:</span>
                <span className="font-medium">
                  {new Date(userInfo.membershipInfo.registrationDate).toLocaleDateString('es-ES')}
                </span>
              </div>
              
              <div className="flex justify-between">
                <span className="text-gray-600">Estado:</span>
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                  Activa
                </span>
              </div>
            </div>
          </div>

          {/* User Information from Stripe */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">
              Tu Información
            </h2>
            
            <div className="space-y-4">
              <div>
                <span className="text-gray-600 block">Nombre:</span>
                <span className="font-medium">{userInfo.name}</span>
              </div>
              
              <div>
                <span className="text-gray-600 block">Email:</span>
                <span className="font-medium">{userInfo.email}</span>
              </div>
              
              {userInfo.phone && (
                <div>
                  <span className="text-gray-600 block">Teléfono:</span>
                  <span className="font-medium">{userInfo.phone}</span>
                </div>
              )}
              
              {userInfo.address && (userInfo.address.line1 || userInfo.address.city) && (
                <div>
                  <span className="text-gray-600 block">Dirección:</span>
                  <div className="font-medium">
                    {userInfo.address.line1 && <div>{userInfo.address.line1}</div>}
                    {userInfo.address.line2 && <div>{userInfo.address.line2}</div>}
                    <div>
                      {userInfo.address.postal_code} {userInfo.address.city}
                      {userInfo.address.state && `, ${userInfo.address.state}`}
                    </div>
                    {userInfo.address.country && <div>{userInfo.address.country}</div>}
                  </div>
                </div>
              )}
              
              {userInfo.customFields.experience_level && (
                <div>
                  <span className="text-gray-600 block">Nivel de experiencia:</span>
                  <span className="font-medium">
                    {getExperienceLevelText(userInfo.customFields.experience_level)}
                  </span>
                </div>
              )}
              
              {userInfo.customFields.professional_categories && (
                <div>
                  <span className="text-gray-600 block">Especialización:</span>
                  <span className="font-medium">{userInfo.customFields.professional_categories}</span>
                </div>
              )}
              
              {userInfo.customFields.company_or_institution && (
                <div>
                  <span className="text-gray-600 block">Empresa/Institución:</span>
                  <span className="font-medium">{userInfo.customFields.company_or_institution}</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Next Steps */}
        <div className="mt-8 bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">
            Próximos Pasos
          </h2>
          
          <div className="grid md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="w-12 h-12 bg-primary-500 text-white rounded-full flex items-center justify-center mx-auto mb-3">
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-6-3a2 2 0 11-4 0 2 2 0 014 0zm-2 4a5 5 0 00-4.546 2.916A5.986 5.986 0 0010 16a5.986 5.986 0 004.546-2.084A5 5 0 0010 11z" clipRule="evenodd" />
                </svg>
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Completa tu Perfil</h3>
              <p className="text-sm text-gray-600 mb-3">
                Añade tu foto, biografía y portfolio para aparecer en la galería de socias
              </p>
              <Link
                to={`/perfil/completar?session=${sessionId}`}
                className="inline-block px-4 py-2 bg-primary-600 text-white text-sm rounded-md hover:bg-primary-700 transition-colors"
              >
                Completar Perfil
              </Link>
            </div>

            <div className="text-center">
              <div className="w-12 h-12 bg-green-500 text-white rounded-full flex items-center justify-center mx-auto mb-3">
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                  <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
                </svg>
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Revisa tu Email</h3>
              <p className="text-sm text-gray-600 mb-3">
                Te hemos enviado un email de bienvenida con información importante
              </p>
              <a
                href={`mailto:${userInfo.email}`}
                className="inline-block px-4 py-2 bg-green-600 text-white text-sm rounded-md hover:bg-green-700 transition-colors"
              >
                Abrir Email
              </a>
            </div>

            <div className="text-center">
              <div className="w-12 h-12 bg-blue-500 text-white rounded-full flex items-center justify-center mx-auto mb-3">
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M12.395 2.553a1 1 0 00-1.45-.385c-.345.23-.614.558-.822.88-.214.33-.403.713-.57 1.116-.334.804-.614 1.768-.84 2.734a31.365 31.365 0 00-.613 3.58 2.64 2.64 0 01-.945-1.067c-.328-.68-.398-1.534-.398-2.654A1 1 0 005.05 6.05 6.981 6.981 0 003 11a7 7 0 1011.95-4.95c-.592-.591-.98-.985-1.348-1.467-.363-.476-.724-1.063-1.207-2.03zM12.12 15.12A3 3 0 017 13s.879.5 2.5.5c0-1 .5-4 1.25-4.5.5 1 .786 1.293 1.371 1.879A2.99 2.99 0 0113 13a2.99 2.99 0 01-.879 2.121z" clipRule="evenodd" />
                </svg>
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Explora la Comunidad</h3>
              <p className="text-sm text-gray-600 mb-3">
                Descubre otras socias, eventos y oportunidades en nuestra plataforma
              </p>
              <Link
                to="/socias"
                className="inline-block px-4 py-2 bg-blue-600 text-white text-sm rounded-md hover:bg-blue-700 transition-colors"
              >
                Ver Comunidad
              </Link>
            </div>
          </div>
        </div>

        {/* Support */}
        <div className="mt-8 text-center">
          <p className="text-gray-600 mb-4">
            ¿Tienes alguna pregunta o necesitas ayuda?
          </p>
          <div className="space-x-4">
            <Link
              to="/contacto"
              className="inline-block px-6 py-2 border border-primary-600 text-primary-600 rounded-md hover:bg-primary-600 hover:text-white transition-colors"
            >
              Contactar Soporte
            </Link>
            <Link
              to="/"
              className="inline-block px-6 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 transition-colors"
            >
              Ir al Inicio
            </Link>
          </div>
        </div>

        {/* Technical Details (for development) */}
        {import.meta.env.DEV && (
          <div className="mt-8 bg-gray-100 rounded-lg p-4">
            <details>
              <summary className="cursor-pointer font-medium text-gray-700">
                Información Técnica (Solo Desarrollo)
              </summary>
              <pre className="mt-2 text-xs text-gray-600 overflow-auto">
                {JSON.stringify({ userInfo, sessionId, membershipType }, null, 2)}
              </pre>
            </details>
          </div>
        )}
      </div>
    </div>
  );
}