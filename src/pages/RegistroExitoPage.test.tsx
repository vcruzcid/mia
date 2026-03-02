import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { RegistroExitoPage } from './RegistroExitoPage';

vi.mock('@/components/Header', () => ({ Header: () => null }));
vi.mock('@/components/Footer', () => ({ Footer: () => null }));

function renderPage() {
  return render(
    <MemoryRouter>
      <RegistroExitoPage />
    </MemoryRouter>,
  );
}

describe('RegistroExitoPage', () => {
  it('renders the welcome heading', () => {
    renderPage();
    expect(screen.getByRole('heading', { name: /bienvenida a mia/i })).toBeInTheDocument();
  });

  it('shows subscription confirmation text', () => {
    renderPage();
    expect(screen.getByText(/tu suscripción ha sido procesada/i)).toBeInTheDocument();
  });

  it('has a link to the homepage', () => {
    renderPage();
    const link = screen.getByRole('link', { name: /ir a la página principal/i });
    expect(link).toBeInTheDocument();
    expect(link).toHaveAttribute('href', '/');
  });

  it('has a link to the socias directory', () => {
    renderPage();
    const link = screen.getByRole('link', { name: /directorio de socias/i });
    expect(link).toBeInTheDocument();
    expect(link).toHaveAttribute('href', '/socias');
  });

  it('shows the next steps list', () => {
    renderPage();
    expect(screen.getByText(/qué pasa ahora/i)).toBeInTheDocument();
  });

  it('shows the contact email', () => {
    renderPage();
    expect(screen.getByText(/info@animacionesmia\.com/i)).toBeInTheDocument();
  });
});
