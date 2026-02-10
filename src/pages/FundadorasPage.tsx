import { useMemo, useState } from 'react';
import { Input } from '@/components/ui/input';
import { BackgroundImage } from '@/components/ui/background-image';
import { MemberCard } from './socias/MemberCard';
import { MemberModal } from './socias/MemberModal';
import type { Member } from '../types/member';
import { FUNDADORAS } from '../data/fundadoras';

export function FundadorasPage() {
  const [selectedMember, setSelectedMember] = useState<Member | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  // Convert fundadoras data to Member type
  const allMembers: Member[] = useMemo(() => {
    return FUNDADORAS.map(f => ({
      ...f,
      created_at: new Date('2019-01-01').toISOString(), // MIA founded in 2019
      updated_at: new Date().toISOString(),
    }));
  }, []);

  // Simple search filter
  const filteredMembers = useMemo(() => {
    if (!searchTerm) return allMembers;

    const search = searchTerm.toLowerCase();
    return allMembers.filter(m =>
      m.display_name?.toLowerCase().includes(search) ||
      m.first_name?.toLowerCase().includes(search) ||
      m.last_name?.toLowerCase().includes(search) ||
      m.company?.toLowerCase().includes(search) ||
      m.main_profession?.toLowerCase().includes(search) ||
      m.other_professions?.some(p => p.toLowerCase().includes(search))
    );
  }, [allMembers, searchTerm]);

  const openModal = (member: Member) => {
    setSelectedMember(member);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedMember(null);
  };

  return (
    <div className="min-h-screen bg-gray-900">
      <BackgroundImage
        src="/images/membership-cta.webp"
        alt="Fundadoras MIA"
        className="h-64 md:h-80"
      >
        <div className="absolute inset-0 bg-black/70" />
        <div className="relative h-full flex flex-col items-center justify-center text-center px-4">
          <h1 className="text-3xl md:text-5xl font-bold text-white mb-4">Fundadoras</h1>
          <p className="text-lg text-gray-200 max-w-3xl">
            Mujeres que impulsaron el origen de MIA y su misión.
          </p>
        </div>
      </BackgroundImage>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Simple Search Bar */}
        <div className="mb-8">
          <div className="max-w-lg mx-auto">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <Input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 h-12 text-base bg-gray-800 border-gray-700 text-white placeholder-gray-400 focus:border-primary-500 focus:ring-primary-500"
                placeholder="Buscar por nombre o especialización..."
              />
            </div>
          </div>

          {/* Results count */}
          <div className="text-center mt-4">
            <span className="text-sm text-gray-300">
              {filteredMembers.length === allMembers.length
                ? `${allMembers.length} fundadoras`
                : `${filteredMembers.length} de ${allMembers.length} fundadoras`}
            </span>
          </div>
        </div>

        {/* Members Grid */}
        {filteredMembers.length === 0 ? (
          <div className="text-center py-12">
            <svg className="mx-auto h-12 w-12 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
            <h3 className="mt-2 text-sm font-medium text-gray-200">No se encontraron fundadoras</h3>
            <p className="mt-1 text-sm text-gray-400">
              Prueba a ajustar tu búsqueda.
            </p>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {filteredMembers.map((member) => (
              <MemberCard
                key={member.id}
                member={member}
                onClick={() => openModal(member)}
              />
            ))}
          </div>
        )}
      </div>

      {/* Member Modal */}
      {selectedMember && (
        <MemberModal
          member={selectedMember}
          isOpen={isModalOpen}
          onClose={closeModal}
        />
      )}
    </div>
  );
}
