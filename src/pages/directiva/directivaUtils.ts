export const getPositionStyle = (position: string): string => {
  const positionStyles: Record<string, string> = {
    'Presidenta': 'from-red-600 to-red-700',
    'Vice-Presidenta': 'from-red-500 to-red-600',
    'Secretaria': 'from-red-700 to-red-800',
    'Tesorera': 'from-red-600 to-red-700',
    'Vocal Formacion': 'from-red-500 to-red-600',
    'Vocal Comunicacion': 'from-red-600 to-red-700',
    'Vocal Mianima': 'from-red-500 to-red-600',
    'Vocal Financiacion': 'from-red-600 to-red-700',
    'Vocal Socias': 'from-red-500 to-red-600',
    'Vocal Asociaciones': 'from-red-600 to-red-700',
    'Vocal Festivales': 'from-red-500 to-red-600',
    'Vocal': 'from-red-600 to-red-700',
  };
  return positionStyles[position] || 'from-red-500 to-red-600';
};
