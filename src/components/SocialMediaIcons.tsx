import { 
  Linkedin, 
  Twitter, 
  Instagram, 
  Globe, 
  ExternalLink 
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

interface SocialMediaIconsProps {
  socialMedia: {
    linkedin?: string | null;
    twitter?: string | null;
    instagram?: string | null;
    website?: string | null;
  };
  size?: 'sm' | 'md' | 'lg';
  variant?: 'compact' | 'full';
  className?: string;
}

const sizeClasses = {
  sm: 'h-4 w-4',
  md: 'h-5 w-5',
  lg: 'h-6 w-6'
};

export function SocialMediaIcons({ 
  socialMedia, 
  size = 'md', 
  variant = 'compact',
  className = '' 
}: SocialMediaIconsProps) {
  const iconSize = sizeClasses[size];
  
  const socialLinks = [
    {
      url: socialMedia.linkedin,
      icon: Linkedin,
      label: 'LinkedIn',
      color: 'text-blue-600 hover:text-blue-800'
    },
    {
      url: socialMedia.twitter,
      icon: Twitter,
      label: 'Twitter',
      color: 'text-blue-400 hover:text-blue-600'
    },
    {
      url: socialMedia.instagram,
      icon: Instagram,
      label: 'Instagram',
      color: 'text-pink-600 hover:text-pink-800'
    },
    {
      url: socialMedia.website,
      icon: Globe,
      label: 'Sitio Web',
      color: 'text-gray-600 hover:text-gray-800'
    }
  ].filter((link): link is { url: string; icon: LucideIcon; label: string; color: string } => !!link.url && typeof link.url === 'string');

  if (socialLinks.length === 0) {
    return null;
  }

  if (variant === 'compact') {
    return (
      <div className={`flex items-center space-x-2 ${className}`}>
        {socialLinks.map(({ url, icon: Icon }) => (
          <a
            key={url}
            href={url.includes('twitter.com') ? url : url.startsWith('http') ? url : `https://${url}`}
            target="_blank"
            rel="noopener noreferrer"
            className="w-10 h-10 rounded-full border-2 border-red-500 flex items-center justify-center text-red-500 hover:bg-red-500 hover:text-white transition-colors duration-200"
          >
            <Icon className={iconSize} />
          </a>
        ))}
      </div>
    );
  }

  return (
    <div className={`space-y-2 ${className}`}>
      {socialLinks.map(({ url, icon: Icon, label, color }) => (
        <a
          key={url}
          href={url.includes('twitter.com') ? url : url.startsWith('http') ? url : `https://${url}`}
          target="_blank"
          rel="noopener noreferrer"
          className={`inline-flex items-center text-sm ${color} transition-colors`}
        >
          <Icon className={`${iconSize} mr-2`} />
          {label}
          <ExternalLink className="h-3 w-3 ml-1 opacity-60" />
        </a>
      ))}
    </div>
  );
}