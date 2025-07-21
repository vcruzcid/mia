import type { MembershipType } from '../types';

export const membershipTypes: MembershipType[] = [
  {
    id: 'pleno-derecho',
    name: 'Socia de Pleno Derecho',
    description: 'Para profesionales activas en la industria de animación',
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
    description: 'Para estudiantes de animación y carreras afines',
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
    description: 'Para hombres y empresas que quieren apoyar nuestra organización',
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
  },
  {
    id: 'newsletter',
    name: 'Suscripción Gratuita',
    description: 'Acceso gratuito a nuestra newsletter y comunicaciones',
    price: 0,
    stripeLinkKey: 'newsletter',
    benefits: [
      'Newsletter mensual con novedades del sector',
      'Información sobre eventos públicos',
      'Recursos gratuitos de formación',
      'Notificaciones de oportunidades laborales',
      'Acceso a webinars públicos'
    ]
  }
];

export const getMembershipByType = (type: string): MembershipType | undefined => {
  return membershipTypes.find(membership => membership.id === type);
};