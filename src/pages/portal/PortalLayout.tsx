import { Link, useLocation, Outlet, Navigate } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { usePortalAuth } from '@/hooks/usePortalAuth';

const navItems = [
  { label: 'Mi Perfil', href: '/portal/perfil' },
  { label: 'Suscripción', href: '/portal/suscripcion' },
];

export function PortalLayout() {
  const location = useLocation();
  const { member, logout, isLoggingOut, isLoading, isAuthenticated } = usePortalAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-500" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/portal/login" replace />;
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-900">
      <header className="bg-black border-b border-gray-800 sticky top-0 z-50">
        <nav className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 flex justify-between items-center h-16">
          <div className="flex items-center gap-6">
            <Link to="/">
              <img src="/logo-main.png" alt="MIA" className="h-8 w-auto" />
            </Link>
            <div className="flex items-center gap-1">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  to={item.href}
                  className={cn(
                    'px-3 py-2 rounded-md text-sm font-medium transition-colors',
                    location.pathname === item.href
                      ? 'bg-gray-800 text-white'
                      : 'text-gray-300 hover:text-white hover:bg-gray-800',
                  )}
                >
                  {item.label}
                </Link>
              ))}
            </div>
          </div>
          <div className="flex items-center gap-3">
            {member && (
              <span className="text-gray-400 text-sm hidden sm:block truncate max-w-[200px]">
                {member.nombre}
              </span>
            )}
            <Button
              variant="ghost"
              size="sm"
              onClick={logout}
              disabled={isLoggingOut}
              className="text-gray-300 hover:text-white"
            >
              {isLoggingOut ? 'Saliendo...' : 'Cerrar sesión'}
            </Button>
          </div>
        </nav>
      </header>
      <main className="flex-1 max-w-5xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8">
        <Outlet />
      </main>
    </div>
  );
}
