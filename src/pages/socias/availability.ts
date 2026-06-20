// Availability status presentation shared by the member card and modal.
// Colour-coded (not emoji) so the status reads at a glance while the text label
// keeps it accessible — never colour alone. Light 300-level text on the dark
// card/modal clears WCAG AA.

export type AvailabilityStatus = 'Disponible' | 'Empleada' | 'Freelance';

interface AvailabilityStyle {
  /** Outline-badge classes: text + border + faint fill. */
  badgeClass: string;
  /** Tooltip explaining the status. */
  title: string;
}

const STYLES: Record<string, AvailabilityStyle> = {
  Disponible: {
    badgeClass: 'border-emerald-500/60 text-emerald-300 bg-emerald-500/10',
    title: 'Disponible — abierta a nuevas oportunidades laborales',
  },
  Empleada: {
    badgeClass: 'border-slate-500/60 text-slate-300 bg-slate-600/20',
    title: 'Empleada — actualmente trabajando, no busca nuevas oportunidades',
  },
  Freelance: {
    badgeClass: 'border-sky-500/60 text-sky-300 bg-sky-500/10',
    title: 'Freelance — trabaja por cuenta propia, disponible para proyectos',
  },
};

export function getAvailabilityStyle(status: string | undefined): AvailabilityStyle {
  return STYLES[status ?? ''] ?? STYLES.Disponible;
}
