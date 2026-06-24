import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { PortalIcon } from '@/components/HeaderPortalIcon';
import { siteConfig } from '@/config/site.config';

interface NavItem {
  name: string;
  href: string;
  id?: string;
}

interface Props {
  mobileMenuRef: React.RefObject<HTMLDivElement | null>;
  navigation: NavItem[];
  aboutMenu: NavItem[];
  isActive: (href: string) => boolean;
  onLinkClick: () => void;
}

export function HeaderMobileMenu({ mobileMenuRef, navigation, aboutMenu, isActive, onLinkClick }: Props) {
  const handleClick = () => {
    onLinkClick();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div id="mobile-menu" ref={mobileMenuRef} className="min-[1100px]:hidden border-t border-gray-800">
      <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 bg-black">
        {navigation.map((item) => (
          <Link
            key={item.name}
            to={item.href}
            className={`block px-3 py-2 rounded-md text-base font-medium transition-colors duration-200 whitespace-nowrap ${
              isActive(item.href)
                ? 'text-white bg-gray-800 border border-red-600'
                : 'text-white hover:bg-gray-900 hover:text-red-400'
            }`}
            onClick={handleClick}
          >
            {item.name}
          </Link>
        ))}

        <div className="pt-4 pb-2">
          <Button asChild className="w-full bg-red-600 hover:bg-red-700 text-white">
            <Link to="/membresia" onClick={handleClick}>
              Únete a MIA
            </Link>
          </Button>
        </div>

        <a
          href={siteConfig.wildApricot.loginUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-2 px-3 py-2 rounded-md text-base font-medium text-white hover:bg-gray-900 hover:text-red-400 transition-colors duration-200"
          onClick={handleClick}
          aria-label="Acceso socias"
          title="Acceso socias"
        >
          <PortalIcon className="size-6 shrink-0 text-white" />
          <span>Acceso socias</span>
        </a>

        <div className="px-3 pt-3">
          <p className="text-xs font-semibold text-gray-400 mb-2">SOBRE NOSOTRAS</p>
          {aboutMenu.map((item) => (
            <Link
              key={item.href}
              to={item.href}
              className={`block px-3 py-2 rounded-md text-base font-medium transition-colors duration-200 whitespace-nowrap ${
                isActive(item.href)
                  ? 'text-white bg-gray-800 border border-red-600'
                  : 'text-white hover:bg-gray-900 hover:text-red-400'
              }`}
              onClick={handleClick}
            >
              {item.name}
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
