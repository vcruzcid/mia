import { useState, useRef, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';

export function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const location = useLocation();
  const mobileMenuRef = useRef<HTMLDivElement>(null);
  const menuButtonRef = useRef<HTMLButtonElement>(null);

  const navigation = [
    { name: 'Inicio', href: '/' },
    { name: 'Sobre MIA', href: '/sobre-mia' },
    { name: 'Socias', href: '/socias' },
    { name: 'Directiva', href: '/directiva' },
    { name: 'Membresía', href: '/membresia' },
    { name: 'Contacto', href: '/contacto' },
  ];

  const isActive = (href: string) => location.pathname === href;

  // Handle escape key and outside clicks
  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && isMenuOpen) {
        setIsMenuOpen(false);
        menuButtonRef.current?.focus();
      }
    };

    const handleClickOutside = (event: MouseEvent) => {
      if (
        isMenuOpen &&
        mobileMenuRef.current &&
        menuButtonRef.current &&
        !mobileMenuRef.current.contains(event.target as Node) &&
        !menuButtonRef.current.contains(event.target as Node)
      ) {
        setIsMenuOpen(false);
      }
    };

    if (isMenuOpen) {
      document.addEventListener('keydown', handleEscape);
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isMenuOpen]);

  return (
    <header className="bg-black border-b border-gray-800 sticky top-0 z-50 backdrop-blur-sm">
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8" role="navigation" aria-label="Main navigation">
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
                    className={isActive(item.href) 
                      ? 'text-red-400 bg-red-900/20 px-3 py-2 rounded-md text-sm font-medium border border-red-500/30 transition-colors duration-200' 
                      : 'text-white hover:text-red-400 px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200'
                    }
                    onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                  >
                    {item.name}
                  </Link>
                ))}
              </div>
              
              {/* Login & Registration */}
              <Button variant="ghost" asChild className="mr-2 text-white hover:text-red-400 hover:bg-transparent">
                <Link to="/login">
                  Iniciar Sesión
                </Link>
              </Button>
              <Button asChild className="bg-red-600 hover:bg-red-700 text-white">
                <Link to="/registro">
                  Únete a MIA
                </Link>
              </Button>
            </div>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <Button
              ref={menuButtonRef}
              variant="ghost"
              size="sm"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="p-2 text-white hover:text-red-400 hover:bg-gray-900"
              aria-expanded={isMenuOpen}
              aria-controls="mobile-menu"
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
            </Button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div id="mobile-menu" ref={mobileMenuRef} className="md:hidden border-t border-gray-800">
            <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 bg-black">
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  to={item.href}
                  className={`block px-3 py-2 rounded-md text-base font-medium transition-colors duration-200 ${
                    isActive(item.href)
                      ? 'text-red-400 bg-red-900/20 border border-red-500/30'
                      : 'text-white hover:bg-gray-900 hover:text-red-400'
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
                <Button variant="ghost" asChild className="w-full text-white hover:text-red-400 hover:bg-transparent">
                  <Link
                    to="/login"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Iniciar Sesión
                  </Link>
                </Button>
                <Button asChild className="w-full bg-red-600 hover:bg-red-700 text-white">
                  <Link
                    to="/registro"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Únete a MIA
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        )}
      </nav>
    </header>
  );
}