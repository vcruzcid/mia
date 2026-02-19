import { useState, useMemo } from 'react';
import { Dialog } from '@/components/ui/dialog';
import { BOARD_TERMS } from '@/data/directiva';
import { DirectivaCard } from './directiva/DirectivaCard';
import { DirectivaModal } from './directiva/DirectivaModal';
import { transformBoardMemberToDirectivaMember } from './directiva/directivaUtils';
import type { DirectivaMember } from '@/types';

// Inject card entrance animation once
if (typeof document !== 'undefined' && !document.getElementById('directiva-styles')) {
  const style = document.createElement('style');
  style.id = 'directiva-styles';
  style.textContent = `
    @keyframes fadeInUp {
      from { opacity: 0; transform: translateY(30px); }
      to   { opacity: 1; transform: translateY(0); }
    }
  `;
  document.head.appendChild(style);
}

export function DirectivaPage() {
  const [selectedMember, setSelectedMember] = useState<DirectivaMember | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedTermIndex, setSelectedTermIndex] = useState(0);

  const currentTerm = BOARD_TERMS[selectedTermIndex];
  const boardMembers = useMemo(() => currentTerm.members, [currentTerm]);
  const hasBoardData = boardMembers.length > 0;
  const isCurrentPeriod = currentTerm.isCurrent;

  const transformedBoardMembers = useMemo(
    () => boardMembers.map(transformBoardMemberToDirectivaMember),
    [boardMembers]
  );

  const openMemberModal = (member: DirectivaMember) => {
    setSelectedMember(member);
    setIsModalOpen(true);
  };

  const closeMemberModal = () => {
    setIsModalOpen(false);
    setSelectedMember(null);
  };

  return (
    <div className="bg-gray-900">
      {/* Hero Section */}
      <div className="max-w-7xl mx-auto py-16 px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <h1 className="text-4xl font-extrabold text-white sm:text-5xl">
            Junta Directiva MIA
          </h1>
          <p className="mt-4 text-xl text-gray-300">
            Conoce a las líderes que guían nuestra asociación hacia el futuro de la animación en España.
          </p>
        </div>

        {/* Period Selector */}
        <div className="mt-10 max-w-2xl mx-auto px-4">
          <div className="flex flex-wrap justify-center gap-2">
            {BOARD_TERMS.map((term, idx) => (
              <button
                key={term.label}
                onClick={() => setSelectedTermIndex(idx)}
                className={`px-5 py-2 rounded-md font-medium text-sm transition-colors ${
                  idx === selectedTermIndex
                    ? 'bg-red-600 text-white'
                    : 'bg-gray-800 text-gray-300 hover:bg-gray-700 hover:text-white'
                }`}
              >
                {term.label}
                {term.isCurrent && (
                  <span className="ml-2 inline-block w-2 h-2 rounded-full bg-green-400 align-middle" />
                )}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Directiva Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
        <div className="mt-8">
          {!hasBoardData ? (
            <div className="text-center py-12">
              <div className="mx-auto h-24 w-24 bg-gray-700 rounded-full flex items-center justify-center mb-4">
                <svg className="h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-white mb-2">
                No hay información disponible
              </h3>
              <p className="text-gray-300">
                No se encontraron miembros de la directiva para el período actual.
              </p>
            </div>
          ) : (
            <div className="grid gap-6 sm:gap-8 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
              {transformedBoardMembers.map((member, index) => (
                <DirectivaCard
                  key={`${member.id}-${member.position}-${index}`}
                  member={member}
                  index={index}
                  onClick={() => openMemberModal(member)}
                  isCurrentPeriod={isCurrentPeriod}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Member Modal */}
      <Dialog open={isModalOpen} onOpenChange={closeMemberModal}>
        {selectedMember && <DirectivaModal member={selectedMember} />}
      </Dialog>
    </div>
  );
}
