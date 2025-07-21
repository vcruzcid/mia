import type { MembershipType } from '../types';

export const membershipTypes: MembershipType[] = [
  {
    id: 'pleno-derecho',
    name: 'Socia de Pleno Derecho',
    description: 'Para profesionales activas en la industria de animación',
    price: 30,
    stripeLinkKey: 'plenoDerecho',
    benefits: [
      'Acceso completo a todos los recursos',
      'Participación en eventos exclusivos',
      'Voto en asambleas',
      'Networking profesional',
      'Descuentos en cursos y talleres',
      'Mentorías especializadas'
    ]
  },
  {
    id: 'estudiante',
    name: 'Socia Estudiante',
    description: 'Para estudiantes de animación y carreras afines',
    price: 15,
    stripeLinkKey: 'estudiante',
    benefits: [
      'Acceso a recursos educativos',
      'Eventos de networking para estudiantes',
      'Descuentos en cursos',
      'Mentorías con profesionales',
      'Oportunidades de prácticas'
    ]
  },
  {
    id: 'colaborador',
    name: 'Colaborador/a',
    description: 'Para personas y empresas que apoyan nuestra misión',
    price: 50,
    stripeLinkKey: 'colaborador',
    benefits: [
      'Reconocimiento como colaborador',
      'Invitaciones a eventos especiales',
      'Visibilidad en comunicaciones',
      'Apoyo a la causa de las mujeres en animación'
    ]
  }
];

export const getMembershipByType = (type: string): MembershipType | undefined => {
  return membershipTypes.find(membership => membership.id === type);
};