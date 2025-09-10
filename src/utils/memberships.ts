import type { MembershipType } from '../types';

export const membershipTypes: MembershipType[] = [
  {
    id: 'pleno-derecho',
    name: 'Socia Pleno Derecho',
    description: 'Acceso completo a todos los beneficios como profesional de la animación.',
    price: 60,
    stripeLinkKey: 'plenoDerecho',
    benefits: [
      'Acceso completo a todos los recursos',
      'Participación en eventos exclusivos',
      'Voto en asambleas',
      'Networking profesional',
      'Descuentos en cursos y talleres',
      'Mentorías especializadas',
      'Directorio profesional',
      'Oportunidades laborales exclusivas'
    ]
  },
  {
    id: 'estudiante',
    name: 'Socia Estudiante',
    description: 'Para estudiantes en formación en el ámbito de la animación.',
    price: 30,
    stripeLinkKey: 'estudiante',
    benefits: [
      'Acceso a recursos educativos',
      'Eventos de networking para estudiantes',
      'Descuentos en cursos y talleres',
      'Mentorías con profesionales',
      'Oportunidades de prácticas',
      'Acceso al directorio profesional'
    ]
  },
  {
    id: 'colaborador',
    name: 'Colaborador',
    description: 'Compañeros que apoyan la asociación.',
    price: 60,
    stripeLinkKey: 'colaborador',
    benefits: [
      'Reconocimiento como colaborador',
      'Invitaciones a eventos especiales',
      'Visibilidad en comunicaciones',
      'Apoyo a la causa de las mujeres en animación',
      'Acceso a eventos de networking',
      'Certificado de colaboración'
    ]
  }
];

export const getMembershipByType = (type: string): MembershipType | undefined => {
  return membershipTypes.find(membership => membership.id === type);
};