import type { Member, DirectivaMember } from '../types';

// Spanish names for realistic data
const SPANISH_NAMES = {
  female: [
    'María', 'Carmen', 'Ana', 'Pilar', 'Laura', 'Isabel', 'Cristina', 'Marta', 'Beatriz', 'Sara',
    'Elena', 'Patricia', 'Raquel', 'Sonia', 'Silvia', 'Rosa', 'Montserrat', 'Nuria', 'Teresa', 'Inmaculada',
    'Amparo', 'Dolores', 'Esperanza', 'Consuelo', 'Yolanda', 'Concepción', 'Mercedes', 'Josefa', 'Francisca', 'Antonia'
  ],
  male: [
    'Antonio', 'José', 'Manuel', 'Francisco', 'David', 'Juan', 'Javier', 'Daniel', 'Carlos', 'Miguel',
    'Jesús', 'Pedro', 'Alejandro', 'Luis', 'Pablo', 'Rafael', 'Sergio', 'Fernando', 'Jorge', 'Roberto'
  ]
};

const SPANISH_SURNAMES = [
  'García', 'Rodríguez', 'González', 'Fernández', 'López', 'Martínez', 'Sánchez', 'Pérez', 'Gómez', 'Martín',
  'Jiménez', 'Ruiz', 'Hernández', 'Díaz', 'Moreno', 'Muñoz', 'Álvarez', 'Romero', 'Alonso', 'Gutiérrez',
  'Navarro', 'Torres', 'Domínguez', 'Vázquez', 'Ramos', 'Gil', 'Ramírez', 'Serrano', 'Blanco', 'Suárez',
  'Molina', 'Morales', 'Ortega', 'Delgado', 'Castro', 'Ortiz', 'Rubio', 'Marín', 'Sanz', 'Iglesias'
];

const SPANISH_CITIES = [
  'Madrid', 'Barcelona', 'Valencia', 'Sevilla', 'Zaragoza', 'Málaga', 'Murcia', 'Palma', 'Las Palmas', 'Bilbao',
  'Alicante', 'Córdoba', 'Valladolid', 'Vigo', 'Gijón', 'Hospitalet', 'Vitoria', 'Granada', 'Elche', 'Oviedo',
  'Badalona', 'Cartagena', 'Terrassa', 'Jerez', 'Sabadell', 'Móstoles', 'Santa Cruz', 'Pamplona', 'Almería', 'Fuenlabrada'
];

const SPANISH_REGIONS = [
  'Madrid', 'Cataluña', 'Valencia', 'Andalucía', 'País Vasco', 'Galicia', 'Castilla y León', 'Murcia',
  'Aragón', 'Castilla-La Mancha', 'Canarias', 'Extremadura', 'Baleares', 'Asturias', 'Navarra', 'Cantabria', 'La Rioja'
];

const ANIMATION_COMPANIES = [
  'Kandor Graphics', 'Ilion Animation Studios', 'LightBox Animation Studios', 'Zinkia Entertainment', 'Animalia Producciones',
  'Big Bang Animation', 'Neptuno Films', 'Green Moon Productions', 'Apolo Films', 'Dibulitoon Studio',
  'Wise Blue Studios', 'Studio Extraordinario', 'Triacom Productions', 'Fictorama Studios', 'Motion Pictures',
  'BRB Internacional', 'Ánima Estudios', 'Ikiru Films', 'Vodka Capital', 'El Ranchito', 'Double Dare You'
];

// Helper functions
function getRandomItem<T>(array: T[]): T {
  return array[Math.floor(Math.random() * array.length)];
}

function getRandomItems<T>(array: T[], count: number): T[] {
  const shuffled = [...array].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, count);
}

function generateId(): string {
  return Math.random().toString(36).substr(2, 9);
}

function generateEmail(firstName: string, lastName: string): string {
  const domains = ['gmail.com', 'outlook.com', 'yahoo.es', 'hotmail.es', 'mia-animation.es'];
  const cleanFirst = firstName.toLowerCase().replace(/[áéíóú]/g, (m) => 'aeiou'['áéíóú'.indexOf(m)]);
  const cleanLast = lastName.toLowerCase().replace(/[áéíóú]/g, (m) => 'aeiou'['áéíóú'.indexOf(m)]);
  return `${cleanFirst}.${cleanLast}@${getRandomItem(domains)}`;
}

function generateBio(firstName: string, specializations: string[]): string {
  const experiences = [
    `${firstName} es una profesional de la animación con más de 8 años de experiencia en la industria.`,
    `Con formación en Bellas Artes, ${firstName} se especializa en crear contenido visual innovador.`,
    `${firstName} ha trabajado en múltiples proyectos de animación para televisión y cine.`,
    `Apasionada por la narrativa visual, ${firstName} combina técnica y creatividad en cada proyecto.`
  ];
  
  const skills = specializations.slice(0, 2).join(' y ').toLowerCase();
  const bio = `${getRandomItem(experiences)} Especializada en ${skills}, ha colaborado con varios estudios reconocidos y siempre busca nuevos desafíos creativos en el mundo de la animación.`;
  
  return bio;
}

function generateJoinDate(): string {
  const start = new Date(2017, 0, 1);
  const end = new Date();
  const date = new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
  return date.toISOString().split('T')[0];
}

// Generate mock members
export const MOCK_MEMBERS: Member[] = Array.from({ length: 75 }, (_, index) => {
  const isMainlyFemale = Math.random() < 0.85; // 85% female as per MIA focus
  const firstName = getRandomItem(isMainlyFemale ? SPANISH_NAMES.female : SPANISH_NAMES.male);
  const lastName = getRandomItem(SPANISH_SURNAMES);
  const city = getRandomItem(SPANISH_CITIES);
  const region = SPANISH_REGIONS.find(r => 
    (city === 'Madrid' && r === 'Madrid') ||
    (city === 'Barcelona' && r === 'Cataluña') ||
    (city === 'Valencia' && r === 'Valencia') ||
    (city === 'Sevilla' && r === 'Andalucía')
  ) || getRandomItem(SPANISH_REGIONS);

  const specializations = getRandomItems([
    '2D Animation', '3D Animation', 'Character Design', 'Storyboarding', 'Concept Art',
    'Visual Development', 'Background Art', 'Motion Graphics', 'VFX', 'Cleanup',
    'Coloring', 'Layout', 'Direction', 'Production', 'Rigging', 'Modeling'
  ], Math.floor(Math.random() * 4) + 2);

  const hasSocialMedia = Math.random() > 0.3;
  const socialMedia: Member['socialMedia'] = {};
  
  if (hasSocialMedia) {
    if (Math.random() > 0.4) socialMedia.linkedin = `https://linkedin.com/in/${firstName.toLowerCase()}-${lastName.toLowerCase()}`;
    if (Math.random() > 0.6) socialMedia.instagram = `https://instagram.com/${firstName.toLowerCase()}_${lastName.toLowerCase()}`;
    if (Math.random() > 0.7) socialMedia.twitter = `https://twitter.com/${firstName.toLowerCase()}_anim`;
    if (Math.random() > 0.8) socialMedia.website = `https://${firstName.toLowerCase()}-animation.com`;
  }

  return {
    id: generateId(),
    firstName,
    lastName,
    email: generateEmail(firstName, lastName),
    company: Math.random() > 0.3 ? getRandomItem(ANIMATION_COMPANIES) : undefined,
    location: {
      city,
      region,
      country: 'España'
    },
    memberType: getRandomItem(['Full', 'Student', 'Collaborator'] as const),
    specializations,
    availabilityStatus: getRandomItem(['Available', 'Busy', 'Not Available'] as const),
    socialMedia,
    profileImage: `https://picsum.photos/400/400?random=${index + 100}`,
    bio: generateBio(firstName, specializations),
    joinDate: generateJoinDate(),
    isActive: Math.random() > 0.1 // 90% active members
  };
});

// Generate directiva members for different years
const DIRECTIVA_POSITIONS = [
  { position: 'Presidenta', responsibilities: ['Representación institucional', 'Coordinación general', 'Relaciones externas'] },
  { position: 'Vicepresidenta', responsibilities: ['Apoyo a presidencia', 'Coordinación de programas', 'Sustitución presidenta'] },
  { position: 'Secretaria', responsibilities: ['Actas de reuniones', 'Comunicaciones oficiales', 'Archivo documental'] },
  { position: 'Tesorera', responsibilities: ['Gestión financiera', 'Presupuestos', 'Control económico'] },
  { position: 'Vocal de Formación', responsibilities: ['Programas formativos', 'Talleres', 'Cursos especializados'] },
  { position: 'Vocal de Comunicación', responsibilities: ['Redes sociales', 'Newsletter', 'Relaciones públicas'] },
  { position: 'Vocal de Eventos', responsibilities: ['Organización eventos', 'Networking', 'Colaboraciones'] },
  { position: 'Vocal de Mentorías', responsibilities: ['Programa mentorías', 'Conexiones profesionales', 'Desarrollo talento'] }
];

function generateDirectivaMember(position: typeof DIRECTIVA_POSITIONS[0], years: number[]): DirectivaMember {
  const baseMember = getRandomItem(MOCK_MEMBERS);
  const currentYear = new Date().getFullYear();
  
  return {
    ...baseMember,
    id: generateId(),
    position: position.position,
    responsibilities: position.responsibilities,
    yearServed: years,
    isCurrentMember: years.includes(currentYear),
    memberType: 'Full',
    previousPositions: years.length > 1 ? [
      { position: 'Vocal', year: Math.min(...years) }
    ] : undefined
  };
}

export const MOCK_DIRECTIVA_2025: DirectivaMember[] = DIRECTIVA_POSITIONS.map(pos => 
  generateDirectivaMember(pos, [2025])
);

export const MOCK_DIRECTIVA_2024: DirectivaMember[] = DIRECTIVA_POSITIONS.map(pos => 
  generateDirectivaMember(pos, [2024])
);

export const MOCK_DIRECTIVA_2023: DirectivaMember[] = DIRECTIVA_POSITIONS.map(pos => 
  generateDirectivaMember(pos, [2023])
);

export const AVAILABLE_YEARS = [2025, 2024, 2023, 2022, 2021, 2020, 2019, 2018, 2017];

export function getMockDirectivaByYear(year: number): DirectivaMember[] {
  switch (year) {
    case 2025: return MOCK_DIRECTIVA_2025;
    case 2024: return MOCK_DIRECTIVA_2024;
    case 2023: return MOCK_DIRECTIVA_2023;
    default: 
      // Generate directiva for other years
      return DIRECTIVA_POSITIONS.map(pos => generateDirectivaMember(pos, [year]));
  }
}