import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { siteConfig } from '../config/site.config';

export function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const location = useLocation();

  const navigation = [
    { name: 'Inicio', href: '/' },
    { name: 'Sobre MIA', href: '/sobre-mia' },
    { name: 'Socias', href: '/socias' },
    { name: 'Directiva', href: '/directiva' },
    { name: 'Membresía', href: '/membresia' },
    { name: 'Contacto', href: '/contacto' },
  ];

  const isActive = (href: string) => location.pathname === href;

  return (
    <header className="bg-gray-800 border-b border-gray-700 sticky top-0 z-50 backdrop-blur-sm">
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex-shrink-0">
            <Link to="/" className="flex items-center">
              <img 
                src="/mia_logo_web-ok-177x77.png" 
                alt="MIA - Mujeres en la Industria de la Animación" 
                className="h-10 w-auto hover:opacity-90 transition-opacity duration-200"
              />
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:block">
            <div className="ml-10 flex items-center space-x-4">
              <div className="flex items-baseline space-x-4">
                {navigation.map((item) => (
                  <Link
                    key={item.name}
                    to={item.href}
                    className={isActive(item.href) ? 'nav-link-active' : 'nav-link'}
                    onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                  >
                    {item.name}
                  </Link>
                ))}
              </div>
              
              {/* Login & Registration */}
              <Link
                to="/login"
                className="btn-ghost mr-2"
              >
                Iniciar Sesión
              </Link>
              <Link
                to="/registro"
                className="btn-primary"
              >
                Únete a MIA
              </Link>
            </div>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-white hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-red-500 transition-colors duration-200"
              aria-expanded="false"
            >
              <span className="sr-only">Abrir menú principal</span>
              {!isMenuOpen ? (
                <svg className="block h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              ) : (
                <svg className="block h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              )}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden border-t border-gray-700">
            <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 bg-gray-900">
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  to={item.href}
                  className={`block px-3 py-2 rounded-md text-base font-medium transition-colors duration-200 ${
                    isActive(item.href)
                      ? 'text-red-400 bg-red-900/20 border border-red-500/30'
                      : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                  }`}
                  onClick={() => {
                    setIsMenuOpen(false);
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                >
                  {item.name}
                </Link>
              ))}
              
              {/* Mobile Login & Registration */}
              <div className="pt-4 pb-2 space-y-2">
                <Link
                  to="/login"
                  className="btn-ghost block w-full text-center"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Iniciar Sesión
                </Link>
                <Link
                  to="/registro"
                  className="btn-primary block w-full text-center"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Únete a MIA
                </Link>
              </div>
            </div>
          </div>
        )}
      </nav>
    </header>
  );
}