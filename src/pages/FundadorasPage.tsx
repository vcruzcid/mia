import { useState } from 'react';
import { ProfileImage } from '../components/ProfileImage';
import { SocialMediaIcons } from '../components/SocialMediaIcons';
import { Card, CardContent } from '@/components/ui/card';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { FUNDADORAS } from '../data/fundadoras';
import type { Fundadora } from '../types/member';

interface FundadorasCardProps {
  member: Fundadora;
  index: number;
  onClick: () => void;
}

function FundadorasCard({ member, index, onClick }: FundadorasCardProps) {
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
        <div className="bg-gradient-to-r from-red-600 to-red-700 text-white h-16">
        </div>

        {/* Profile Image */}
        <div className="absolute -bottom-6 left-4">
          <div className="relative">
            <ProfileImage
              src={member.profile_image_url}
              alt={member.display_name}
              size="lg"
              className="border-3 border-white shadow-lg"
            />
            {/* Founder badge */}
            <div className="absolute -top-1 -right-1 h-5 w-5 bg-yellow-500 rounded-full border-2 border-white flex items-center justify-center">
              <svg className="h-3 w-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
            </div>
          </div>
        </div>
      </div>

      <CardContent className="pt-8 p-3 sm:p-4">
        <div className="mb-4">
          <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-1">
            {member.display_name}
          </h3>
          {member.main_profession && (
            <p className="text-sm font-medium text-gray-900 mt-1">{member.main_profession}</p>
          )}
          {member.company && (
            <p className="text-xs sm:text-sm text-gray-700 mt-2">
              {member.company}
            </p>
          )}
        </div>

        {/* Location and Social Media */}
        <div className="border-t border-gray-200 pt-4">
          <div className="flex items-center justify-between text-sm text-gray-500">
            <div className="flex items-center">
              <svg className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              <span>{member.country}</span>
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

interface FundadorasModalProps {
  member: Fundadora;
  onClose: () => void;
}

function FundadorasModal({ member, onClose }: FundadorasModalProps) {
  return (
    <DialogContent className="sm:max-w-4xl max-h-[90vh] overflow-y-auto mx-4 sm:mx-0">
      {/* Header */}
      <div className="bg-gradient-to-r from-red-600 to-red-700 px-4 sm:px-6 py-2">
        <div className="flex items-start gap-6">
          <ProfileImage
            src={member.profile_image_url}
            alt={member.display_name}
            size="2xl"
            className="border-3 border-white flex-shrink-0"
          />
          <div className="flex-1 pt-2">
            <h3 className="text-2xl font-bold text-white mb-1">
              {member.display_name}
            </h3>
            <div className="flex items-center gap-2 mb-2">
              <span className="inline-block px-3 py-1 rounded-full text-sm font-semibold bg-yellow-500 text-white">
                Fundadora MIA
              </span>
            </div>
            <p className="text-lg text-white/90">{member.main_profession}</p>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="px-4 sm:px-6 py-4 sm:py-6 space-y-4 sm:space-y-6">
        {member.biography && (
          <div>
            <h4 className="text-sm font-semibold text-gray-900 mb-2">Biografía</h4>
            <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-line">{member.biography}</p>
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
          <div>
            <h4 className="text-sm font-semibold text-gray-900 mb-3">Información Adicional</h4>
            <div className="space-y-3">
              {member.company && (
                <div>
                  <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">Empresa</span>
                  <p className="text-sm text-gray-900">{member.company}</p>
                </div>
              )}
              <div>
                <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">Ubicación</span>
                <p className="text-sm text-gray-900">
                  {member.city && `${member.city}, `}
                  {member.country}
                </p>
              </div>
              <div>
                <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">Profesión Principal</span>
                <p className="text-sm text-gray-900">{member.main_profession}</p>
              </div>
            </div>
          </div>

          {/* Other Professions */}
          {member.other_professions && member.other_professions.length > 0 && (
            <div>
              <h4 className="text-sm font-semibold text-gray-900 mb-3">Especializaciones</h4>
              <div className="flex flex-wrap gap-2">
                {member.other_professions.map((spec, idx) => (
                  <span
                    key={idx}
                    className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-red-100 text-red-700"
                  >
                    {spec}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Social Media */}
        {Object.values(member.social_media).some(Boolean) && (
          <div>
            <h4 className="text-sm font-semibold text-gray-900 mb-3">Redes Sociales</h4>
            <SocialMediaIcons
              socialMedia={member.social_media}
              size="sm"
              variant="compact"
            />
          </div>
        )}
      </div>
    </DialogContent>
  );
}

export function FundadorasPage() {
  const [selectedMember, setSelectedMember] = useState<Fundadora | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const openMemberModal = (member: Fundadora) => {
    setSelectedMember(member);
    setIsModalOpen(true);
  };

  const closeMemberModal = () => {
    setIsModalOpen(false);
    setSelectedMember(null);
  };

  return (
    <div className="min-h-screen bg-gray-900">
      {/* Hero Section */}
      <div className="max-w-7xl mx-auto py-16 px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <h1 className="text-4xl font-extrabold text-white sm:text-5xl">
            Fundadoras MIA
          </h1>
          <p className="mt-4 text-xl text-gray-300">
            Mujeres que impulsaron el origen de MIA y su misión.
          </p>
        </div>
      </div>

      {/* Members Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {FUNDADORAS.map((member, index) => (
            <FundadorasCard
              key={member.id}
              member={member}
              index={index}
              onClick={() => openMemberModal(member)}
            />
          ))}
        </div>
      </div>

      {/* Member Modal */}
      <Dialog open={isModalOpen} onOpenChange={closeMemberModal}>
        {selectedMember && (
          <FundadorasModal
            member={selectedMember}
            onClose={closeMemberModal}
          />
        )}
      </Dialog>
    </div>
  );
}
