import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { RegistroExitoPage } from './RegistroExitoPage';

vi.mock('@/components/Header', () => ({ Header: () => null }));
vi.mock('@/components/Footer', () => ({ Footer: () => null }));

function renderPage(initialEntry = '/registro/exito') {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return render(
    <QueryClientProvider client={client}>
      <MemoryRouter initialEntries={[initialEntry]}>
        <RegistroExitoPage />
      </MemoryRouter>
    </QueryClientProvider>,
  );
}

describe('RegistroExitoPage', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('renders the default welcome heading when no session_id', () => {
    renderPage();
    expect(screen.getByRole('heading', { name: /bienvenida a mia/i })).toBeInTheDocument();
  });

  it('shows subscription confirmation text', () => {
    renderPage();
    expect(screen.getByText(/tu suscripción ha sido procesada/i)).toBeInTheDocument();
  });

  it('has a link to complete profile', () => {
    renderPage();
    const link = screen.getByRole('link', { name: /completa tu perfil/i });
    expect(link).toBeInTheDocument();
    expect(link).toHaveAttribute('href', '/portal/perfil');
  });

  it('has a link to view invoice', () => {
    renderPage();
    const link = screen.getByRole('link', { name: /ver factura/i });
    expect(link).toBeInTheDocument();
    expect(link).toHaveAttribute('href', '/portal/suscripcion');
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

  it('shows the contact link', () => {
    renderPage();
    const link = screen.getByRole('link', { name: /hola@animacionesmia\.com/i });
    expect(link).toBeInTheDocument();
    expect(link).toHaveAttribute('href', '/contacto');
  });

  it('shows personalized heading when session resolves with paid status', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({
        success: true,
        name: 'Ana García',
        payment_status: 'paid',
      }),
    }));

    renderPage('/registro/exito?session_id=cs_test_abc123');

    await waitFor(() => {
      expect(screen.getByRole('heading', { name: /bienvenida, ana/i })).toBeInTheDocument();
    });
  });

  it('falls back to default heading when payment_status is not paid', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({
        success: true,
        name: 'Ana García',
        payment_status: 'unpaid',
      }),
    }));

    renderPage('/registro/exito?session_id=cs_test_abc123');

    await waitFor(() => {
      expect(screen.getByRole('heading', { name: /bienvenida a mia/i })).toBeInTheDocument();
    });
  });

  it('falls back to default heading on network error', async () => {
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new Error('network error')));

    renderPage('/registro/exito?session_id=cs_test_abc123');

    await waitFor(() => {
      expect(screen.getByRole('heading', { name: /bienvenida a mia/i })).toBeInTheDocument();
    });
  });

  it('falls back to default heading on non-ok HTTP response', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: false, status: 502 }));

    renderPage('/registro/exito?session_id=cs_test_abc123');

    await waitFor(() => {
      expect(screen.getByRole('heading', { name: /bienvenida a mia/i })).toBeInTheDocument();
    });
  });
});
