-- Migration: Insert default board position responsibilities
-- Date: 2025-01-26
-- Description: Insert default responsibilities for each board position in Spanish

-- Insert default responsibilities for each board position
INSERT INTO board_position_responsibilities (position, default_responsibilities) VALUES
('Presidenta', ARRAY[
    'Representar legalmente a la asociación',
    'Convocar y presidir las reuniones de la Junta Directiva',
    'Ejecutar los acuerdos adoptados por la Asamblea General',
    'Supervisar el cumplimiento de los estatutos y reglamentos',
    'Mantener relaciones institucionales con otras organizaciones'
]),

('Vice-Presidenta', ARRAY[
    'Sustituir a la Presidenta en caso de ausencia',
    'Colaborar en la representación de la asociación',
    'Apoyar en la coordinación de actividades',
    'Participar en la toma de decisiones estratégicas',
    'Facilitar la comunicación entre miembros de la Junta'
]),

('Secretaria', ARRAY[
    'Redactar y custodiar las actas de las reuniones',
    'Gestionar la correspondencia oficial de la asociación',
    'Mantener actualizado el registro de socias',
    'Organizar la documentación administrativa',
    'Coordinar la comunicación interna y externa'
]),

('Tesorera', ARRAY[
    'Gestionar las finanzas de la asociación',
    'Elaborar presupuestos anuales',
    'Controlar ingresos y gastos',
    'Presentar informes financieros periódicos',
    'Mantener la contabilidad actualizada'
]),

('Vocal Formacion', ARRAY[
    'Organizar cursos y talleres de formación',
    'Coordinar programas educativos',
    'Gestionar colaboraciones con instituciones formativas',
    'Desarrollar contenidos pedagógicos',
    'Evaluar la calidad de las actividades formativas'
]),

('Vocal Comunicacion', ARRAY[
    'Gestionar las redes sociales de la asociación',
    'Coordinar la comunicación digital',
    'Elaborar materiales promocionales',
    'Mantener la página web actualizada',
    'Organizar eventos de difusión'
]),

('Vocal Mianima', ARRAY[
    'Coordinar el festival MIANIMA',
    'Gestionar la programación del evento',
    'Organizar actividades paralelas',
    'Coordinar con patrocinadores del festival',
    'Supervisar la logística del evento'
]),

('Vocal Financiacion', ARRAY[
    'Buscar fuentes de financiación',
    'Elaborar propuestas de subvenciones',
    'Gestionar relaciones con patrocinadores',
    'Coordinar campañas de crowdfunding',
    'Desarrollar estrategias de sostenibilidad económica'
]),

('Vocal Socias', ARRAY[
    'Gestionar el proceso de incorporación de nuevas socias',
    'Organizar actividades de networking',
    'Coordinar programas de mentoría',
    'Facilitar la integración de nuevas miembros',
    'Mantener el contacto directo con las socias'
]),

('Vocal Festivales', ARRAY[
    'Coordinar la participación en festivales externos',
    'Gestionar la presencia de MIA en eventos del sector',
    'Organizar proyecciones y muestras',
    'Coordinar con otros festivales de animación',
    'Desarrollar estrategias de visibilidad'
]),

('Vocal', ARRAY[
    'Participar en las decisiones de la Junta Directiva',
    'Colaborar en proyectos específicos',
    'Apoyar a otros vocales en sus funciones',
    'Representar a la asociación en eventos',
    'Contribuir al desarrollo de nuevas iniciativas'
])
ON CONFLICT (position) DO UPDATE SET
    default_responsibilities = EXCLUDED.default_responsibilities,
    updated_at = NOW();
