// WildApricot custom field system codes and option IDs for the MIA account (511043).
// Discovered via GET /accounts/511043/contactfields on 2026-02-27.

export const FIELD_CODES = {
  bio: 'custom-17708434',               // Biografía (text)
  profesionPrincipal: 'custom-17708342', // Profesión Principal (Dropdown — single select)
  profesionAdicional: 'custom-17708340', // Profesión Adicional (MultipleChoice — multi select)
  ciudad: 'custom-17708331',             // Ciudad (custom text)
  pais: 'custom-17708479',               // País (Choice dropdown — English country names)
  instagram: 'custom-17708437',          // Instagram
  linkedin: 'custom-17708438',           // LinkedIn
  twitter: 'custom-17774035',            // X/Twitter
  website: 'custom-17708442',            // Website
  statusEmpleo: 'custom-17708435',       // Status de Empleo
} as const;

// Label→Id mapping for Profesión Principal (Dropdown — single select)
export const PROFESION_PRINCIPAL_IDS: Record<string, number> = {
  'Guión': 23050045, 'Dirección': 23050046, 'Storyboard': 23050047,
  'Dirección de arte': 23050048, 'Concept Art': 23050049, 'Diseño de personajes': 23050050,
  'Diseño de sets': 23050051, 'Visual Development': 23050052, 'Modelado 3D': 23050053,
  'Motion Graphics': 23050054, 'Layout 2D': 23050055, 'Layout 3D': 23050056,
  'Color BG': 23050057, 'Rigging 2D': 23050058, 'Rigging 3D': 23050059,
  'Animación 2D': 23050060, '2D FX': 23050061, 'Clean Up': 23050062,
  'Ink and Paint': 23050063, 'Animación 3D': 23050064, 'Animación StopMotion': 23050065,
  'Artista para Stopmotion': 23050066, 'Composición Digital': 23050067,
  'Sonido/ Música/ SFX': 23050068, 'Montaje': 23050069, 'Pipeline': 23050070,
  'Producción': 23050071, 'Asistente de producción': 23050072,
  'Directora de producción': 23050073, 'Coordinadora de producción': 23050074,
  'Line producer': 23050075, 'Producción ejecutiva': 23050076, 'Matte painting': 23050077,
  'Render wrangler': 23050078, 'Lighting': 23050079, 'Shading': 23050080,
  'Marketing': 23050081, 'Groom artist': 23050082, 'Compositora musical': 23050083,
};

// Label→Id mapping for Profesión Adicional (MultipleChoice — multi select)
export const PROFESION_ADICIONAL_IDS: Record<string, number> = {
  'Guión': 23050006, 'Dirección': 23050007, 'Storyboard': 23050008,
  'Dirección de arte': 23050009, 'Concept Art': 23050010, 'Diseño de personajes': 23050011,
  'Diseño de sets': 23050012, 'Visual Development': 23050013, 'Modelado 3D': 23050014,
  'Motion Graphics': 23050015, 'Layout 2D': 23050016, 'Layout 3D': 23050017,
  'Color BG': 23050018, 'Rigging 2D': 23050019, 'Rigging 3D': 23050020,
  'Animación 2D': 23050021, '2D FX': 23050022, 'Clean Up': 23050023,
  'Ink and Paint': 23050024, 'Animación 3D': 23050025, 'Animación StopMotion': 23050026,
  'Artista para Stopmotion': 23050027, 'Composición Digital': 23050028,
  'Sonido/ Música/ SFX': 23050029, 'Montaje': 23050030, 'Pipeline': 23050031,
  'Producción': 23050032, 'Asistente de producción': 23050033,
  'Directora de producción': 23050034, 'Coordinadora de producción': 23050035,
  'Line producer': 23050036, 'Producción ejecutiva': 23050037, 'Matte painting': 23050038,
  'Render wrangler': 23050039, 'Lighting': 23050040, 'Shading': 23050041,
  'Marketing': 23050042, 'Groom artist': 23050043, 'Compositora musical': 23050044,
};
