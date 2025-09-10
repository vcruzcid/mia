// Mock data for development and testing
import type { Member } from '../types';

// Mock members data
export const MOCK_MEMBERS: Member[] = [
  {
    id: '1',
    firstName: 'Ana',
    lastName: 'García',
    email: 'ana.garcia@example.com',
    memberType: 'Full',
    isActive: true,
    location: {
      city: 'Madrid',
      region: 'Madrid',
      country: 'España'
    },
    specializations: ['2D Animation', 'Character Design'],
    company: 'Studio Animation',
    position: 'Senior Animator',
    experience: 'senior',
    availabilityStatus: 'available',
    socialMedia: {
      linkedin: 'https://linkedin.com/in/ana-garcia',
      instagram: '@ana_animation'
    },
    profileImageUrl: '',
    bio: 'Experienced 2D animator with 8 years in the industry.',
    joinDate: '2020-01-15',
    lastActive: '2024-12-15'
  },
  {
    id: '2',
    firstName: 'María',
    lastName: 'López',
    email: 'maria.lopez@example.com',
    memberType: 'Student',
    isActive: true,
    location: {
      city: 'Barcelona',
      region: 'Cataluña',
      country: 'España'
    },
    specializations: ['3D Modeling', 'Texturing'],
    company: 'Universidad de Barcelona',
    position: 'Estudiante',
    experience: 'student',
    availabilityStatus: 'available',
    socialMedia: {
      artstation: 'https://artstation.com/maria-lopez'
    },
    profileImageUrl: '',
    bio: 'Estudiante de animación 3D apasionada por el modelado de personajes.',
    joinDate: '2023-09-01',
    lastActive: '2024-12-14'
  }
];

// Mock directiva data by year
export const MOCK_DIRECTIVA_DATA: Record<number, Member[]> = {
  2024: [
    {
      id: 'dir1',
      firstName: 'Carmen',
      lastName: 'Rodríguez',
      email: 'carmen.rodriguez@mia.com',
      memberType: 'Full',
      isActive: true,
      location: {
        city: 'Valencia',
        region: 'Comunidad Valenciana',
        country: 'España'
      },
      specializations: ['Direction', 'Production'],
      company: 'MIA',
      position: 'Presidenta',
      experience: 'director',
      availabilityStatus: 'available',
      socialMedia: {},
      profileImageUrl: '',
      bio: 'Presidenta de MIA desde 2024.',
      joinDate: '2018-01-01',
      lastActive: '2024-12-15'
    },
    {
      id: 'dir2',
      firstName: 'Laura',
      lastName: 'Martín',
      email: 'laura.martin@mia.com',
      memberType: 'Full',
      isActive: true,
      location: {
        city: 'Sevilla',
        region: 'Andalucía',
        country: 'España'
      },
      specializations: ['Management', 'Events'],
      company: 'MIA',
      position: 'Vicepresidenta',
      experience: 'senior',
      availabilityStatus: 'available',
      socialMedia: {},
      profileImageUrl: '',
      bio: 'Vicepresidenta de MIA desde 2024.',
      joinDate: '2019-03-15',
      lastActive: '2024-12-15'
    }
  ],
  2023: [
    {
      id: 'dir3',
      firstName: 'Elena',
      lastName: 'Fernández',
      email: 'elena.fernandez@mia.com',
      memberType: 'Full',
      isActive: true,
      location: {
        city: 'Bilbao',
        region: 'País Vasco',
        country: 'España'
      },
      specializations: ['Direction', 'Production'],
      company: 'MIA',
      position: 'Presidenta',
      experience: 'director',
      availabilityStatus: 'available',
      socialMedia: {},
      profileImageUrl: '',
      bio: 'Presidenta de MIA en 2023.',
      joinDate: '2017-06-01',
      lastActive: '2024-12-15'
    }
  ]
};

// Available years for directiva
export const AVAILABLE_YEARS = [2024, 2023, 2022, 2021, 2020, 2019, 2018, 2017];

// Function to get directiva members by year
export function getMockDirectivaByYear(year: number): Member[] {
  return MOCK_DIRECTIVA_DATA[year] || [];
}
