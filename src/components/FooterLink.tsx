import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';

interface FooterLinkProps {
  to: string;
  children: React.ReactNode;
  onClick?: () => void;
  className?: string;
}

export function FooterLink({ to, children, onClick, className }: FooterLinkProps) {
  return (
    <Button
      variant="link"
      asChild
      className={className || "text-base text-gray-300 p-0 h-auto hover:text-red-400 transition-colors duration-200"}
      onClick={onClick || (() => window.scrollTo({ top: 0, behavior: 'smooth' }))}
    >
      <Link to={to}>
        {children}
      </Link>
    </Button>
  );
}