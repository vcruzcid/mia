import { Link } from 'react-router-dom';
import { siteConfig } from '../config/site.config';

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-gray-900 text-white">
      <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:py-16 lg:px-8">
        <div className="xl:grid xl:grid-cols-3 xl:gap-8">
          <div className="space-y-8 xl:col-span-1">
            <div>
              <img 
                src="/logo_footer-264x300.png" 
                alt="MIA - Mujeres en la Industria de la Animación" 
                className="h-24 w-auto"
              />
              <p className="text-gray-300 text-sm mt-4 max-w-xs">
                {siteConfig.description}
              </p>
            </div>
            <div className="flex space-x-6">
              {/* Social media links can be added here */}
            </div>
          </div>
          <div className="mt-12 grid grid-cols-2 gap-8 xl:mt-0 xl:col-span-2">
            <div className="md:grid md:grid-cols-2 md:gap-8">
              <div>
                <h3 className="text-sm font-semibold text-gray-200 tracking-wider uppercase">
                  Navegación
                </h3>
                <ul className="mt-4 space-y-4">
                  <li>
                    <Link 
                      to="/" 
                      className="text-base text-gray-300 hover:text-white transition-colors duration-200"
                      onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                    >
                      Inicio
                    </Link>
                  </li>
                  <li>
                    <Link 
                      to="/sobre-mia" 
                      className="text-base text-gray-300 hover:text-white transition-colors duration-200"
                      onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                    >
                      Sobre MIA
                    </Link>
                  </li>
                  <li>
                    <Link 
                      to="/membresia" 
                      className="text-base text-gray-300 hover:text-white transition-colors duration-200"
                      onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                    >
                      Membresía
                    </Link>
                  </li>
                  <li>
                    <Link 
                      to="/contacto" 
                      className="text-base text-gray-300 hover:text-white transition-colors duration-200"
                      onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                    >
                      Contacto
                    </Link>
                  </li>
                </ul>
              </div>
              <div className="mt-12 md:mt-0">
                <h3 className="text-sm font-semibold text-gray-200 tracking-wider uppercase">
                  Legal
                </h3>
                <ul className="mt-4 space-y-4">
                  <li>
                    <Link to="/politica-privacidad" className="text-base text-gray-300 hover:text-white transition-colors duration-200">
                      Política de Privacidad
                    </Link>
                  </li>
                  <li>
                    <Link to="/terminos-condiciones" className="text-base text-gray-300 hover:text-white transition-colors duration-200">
                      Términos y Condiciones
                    </Link>
                  </li>
                  <li>
                    <Link to="/politica-cookies" className="text-base text-gray-300 hover:text-white transition-colors duration-200">
                      Política de Cookies
                    </Link>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
        <div className="mt-12 border-t border-gray-700 pt-8">
          <p className="text-base text-gray-400 xl:text-center">
            &copy; {currentYear} {siteConfig.name}. Todos los derechos reservados.
          </p>
        </div>
      </div>
    </footer>
  );
}