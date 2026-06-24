import { Link, useLocation } from 'react-router-dom';
import { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { HeaderMobileMenu } from '@/components/HeaderMobileMenu';
import { PortalIcon } from '@/components/HeaderPortalIcon';
import { siteConfig } from '@/config/site.config';

export function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const location = useLocation();
  const mobileMenuRef = useRef<HTMLDivElement>(null);
  const menuButtonRef = useRef<HTMLButtonElement>(null);

  const navigation = [
    { name: 'Sobre Nosotras', href: '/sobre-mia' },
    { name: 'Socias', href: '/socias' },
    { name: 'Directiva', href: '/directiva' },
    { name: 'MIANIMA', href: '/mianima' },
    { name: 'Membresía', href: '/membresia' },
    { name: 'Contacto', href: '/contacto' },
  ];

  const aboutMenu = [{ name: 'Fundadoras', href: '/fundadoras' }];

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
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8" role="navigation" aria-label="Navegación principal">
        <div className="flex justify-between items-center h-16 overflow-x-clip">
          {/* Logo */}
          <div className="flex-shrink-0 min-w-0">
            <Link to="/" className="flex items-center">
              <img 
                src="/logo-main.png" 
                alt="MIA - Mujeres en la Industria de la Animación" 
                className="h-10 w-auto hover:opacity-90 transition-opacity duration-200"
              />
            </Link>
          </div>

          {/* Desktop Navigation — from 1100px up */}
          <div className="hidden min-[1100px]:flex min-w-0 flex-1 shrink justify-end overflow-visible">
            <div className="ml-10 flex flex-nowrap items-center gap-4 shrink-0">
              <div className="flex flex-nowrap items-center gap-4 shrink-0">
                {navigation.map((item) => (
                  item.name === 'Sobre Nosotras' ? (
                    <div key={item.name} className="relative group flex-shrink-0">
                      <Link
                        to={item.href}
                        className={`inline-block ${isActive(item.href) || aboutMenu.some((i) => isActive(i.href))
                          ? 'text-white bg-gray-800 px-3 py-2 rounded-md text-sm font-medium border border-red-600 transition-colors duration-200'
                          : 'text-white hover:text-red-400 px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200'
                        }`}
                        onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                      >
                        <span className="whitespace-nowrap">{item.name}</span>
                      </Link>
                      {/* Hover submenu. The outer wrapper is flush with the trigger
                          (top-full, no margin) and uses transparent pt-1 padding as a
                          hoverable bridge — a margin gap here would drop group-hover as
                          the pointer crosses it, making the submenu unreachable. */}
                      <div className="absolute left-0 top-full hidden group-hover:block group-focus-within:block pt-1 min-w-[180px] z-50">
                        <div className="bg-black border border-gray-800 rounded-md shadow-lg overflow-hidden">
                          {aboutMenu.map((sub) => (
                            <Link
                              key={sub.href}
                              to={sub.href}
                              className="block px-3 py-2 text-sm text-white hover:bg-gray-900 hover:text-red-400 transition-colors duration-200"
                              onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                            >
                              {sub.name}
                            </Link>
                          ))}
                        </div>
                      </div>
                    </div>
                  ) : (
                    <Link
                      key={item.name}
                      to={item.href}
                      className={`inline-block flex-shrink-0 ${isActive(item.href)
                        ? 'text-white bg-gray-800 px-3 py-2 rounded-md text-sm font-medium border border-red-600 transition-colors duration-200'
                        : 'text-white hover:text-red-400 px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200'
                      }`}
                      onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                    >
                      <span className="whitespace-nowrap">{item.name}</span>
                    </Link>
                  )
                ))}
                <Button asChild className="shrink-0 bg-red-600 hover:bg-red-700 text-white whitespace-nowrap">
                  <Link to="/membresia" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
                    Únete a MIA
                  </Link>
                </Button>
                <a
                  href={siteConfig.wildApricot.loginUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-md border border-transparent text-white hover:text-red-400 transition-colors duration-200"
                  aria-label="Acceso socias"
                  title="Acceso socias"
                >
                  <PortalIcon className="size-5 shrink-0 text-white" />
                </a>
              </div>
            </div>
          </div>

          {/* Mobile menu button — shown when browser < 1100px */}
          <div className="shrink-0 min-[1100px]:hidden">
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
          <HeaderMobileMenu
            mobileMenuRef={mobileMenuRef}
            navigation={navigation}
            aboutMenu={aboutMenu}
            isActive={isActive}
            onLinkClick={() => setIsMenuOpen(false)}
          />
        )}
      </nav>
    </header>
  );
}