import { memo } from 'react';
import type { BoardMember } from '@/types/member';
import { ProfileImage } from '@/components/ProfileImage';
import { SocialMediaIcons } from '@/components/SocialMediaIcons';
import { Card, CardContent } from '@/components/ui/card';
import { getPositionEmail, getPositionStyle } from './directivaUtils';

interface DirectivaCardProps {
  member: BoardMember;
  index: number;
  onClick: () => void;
  isCurrentPeriod?: boolean;
}

function DirectivaCardComponent({ member, index, onClick, isCurrentPeriod = false }: DirectivaCardProps) {
  return (
    <Card
      onClick={onClick}
      className="bg-white overflow-hidden transition-all duration-300 cursor-pointer transform hover:scale-105 ring-2 ring-red-200 shadow-lg"
      style={{
        animationDelay: `${index * 100}ms`,
        animation: 'fadeInUp 0.6s ease-out forwards'
      }}
    >
      <div className="relative">
        {/* Header with gradient background */}
        <div className="bg-gradient-to-r from-red-600 to-red-700 text-white h-20 flex items-center px-4">
          {/* Profile Image */}
          <div className="relative flex-shrink-0">
            <ProfileImage
              src={member.profile_image_url}
              alt={`${member.first_name} ${member.last_name}`}
              size="lg"
              className="border-3 border-white shadow-lg"
            />
            {isCurrentPeriod && (
              <div className="absolute -top-1 -right-1 h-5 w-5 bg-green-500 rounded-full border-2 border-white flex items-center justify-center">
                <svg className="h-3 w-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              </div>
            )}
          </div>
          {/* Name */}
          <h3 className="text-lg sm:text-xl font-bold text-white drop-shadow-md ml-4">
            {member.first_name} {member.last_name}
          </h3>
        </div>
      </div>

      <CardContent className="pt-4 p-3 sm:p-4">
        <div className="mb-4">
          <div className={`inline-block px-2 sm:px-3 py-1 rounded-full text-xs sm:text-sm font-semibold bg-gradient-to-r ${getPositionStyle(member.position)} text-white`}>
            {member.position}
          </div>
          {member.company && (
            <p className="text-xs sm:text-sm text-gray-700 mt-2">
              {member.company}
            </p>
          )}
        </div>

        {/* Biography preview */}
        {member.biography && (
          <div className="mb-4">
            <p className="text-sm text-gray-600 line-clamp-2">
              {member.biography}
            </p>
          </div>
        )}

        {/* Email - only show for current period */}
        {isCurrentPeriod && getPositionEmail(member.position) && (
          <div className="mb-4">
            <div className="flex items-center text-sm text-gray-600">
              <svg className="h-4 w-4 mr-2 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
              <a
                href={`mailto:${getPositionEmail(member.position)}`}
                className="text-red-600 hover:text-red-700 transition-colors"
                onClick={(e) => e.stopPropagation()}
              >
                {getPositionEmail(member.position)}
              </a>
            </div>
          </div>
        )}

        {/* Location and Social Media */}
        <div className="border-t border-gray-200 pt-4">
          <div className="flex items-center justify-between text-sm text-gray-500">
            <div className="flex items-center">
              <svg className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              <span>
                {member.city && `${member.city}, `}{member.country}
              </span>
            </div>

            <SocialMediaIcons
              socialMedia={member.social_media}
              size="sm"
              variant="compact"
            />
          </div>
        </div>

        {/* Click to view more indicator */}
        <div className="mt-4 text-center">
          <span className="text-xs text-gray-600">Hacer clic para ver más detalles</span>
        </div>
      </CardContent>
    </Card>
  );
}

// Memoized to prevent unnecessary re-renders in grids
export const DirectivaCard = memo(DirectivaCardComponent, (prevProps, nextProps) => {
  return (
    prevProps.member.id === nextProps.member.id &&
    prevProps.index === nextProps.index &&
    prevProps.isCurrentPeriod === nextProps.isCurrentPeriod &&
    prevProps.onClick === nextProps.onClick
  );
});
