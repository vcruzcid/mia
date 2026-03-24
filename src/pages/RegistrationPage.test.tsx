import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { RegistrationPage } from './RegistrationPage';
import { membershipTypes } from '@/utils/memberships';

vi.mock('@/components/Header', () => ({ Header: () => null }));
vi.mock('@/components/Footer', () => ({ Footer: () => null }));

function renderPage() {
  return render(
    <MemoryRouter>
      <RegistrationPage />
    </MemoryRouter>,
  );
}

describe('RegistrationPage', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('renders a card for each membership type', () => {
    renderPage();
    for (const membership of membershipTypes) {
      expect(screen.getByText(membership.name)).toBeInTheDocument();
    }
  });

  it('shows the price for each membership', () => {
    renderPage();
    // Prices may repeat across cards (€60 appears for pleno-derecho and colaborador)
    const uniquePrices = [...new Set(membershipTypes.map(m => m.price))];
    for (const price of uniquePrices) {
      expect(screen.getAllByText(`€${price}`).length).toBeGreaterThan(0);
    }
  });

  it('renders the TOS and GDPR checkboxes', () => {
    renderPage();
    // "términos y condiciones" text lives inside an <a> within the label
    expect(screen.getByRole('link', { name: /términos y condiciones/i })).toBeInTheDocument();
    // GDPR consent is a link-styled <button> inside the checkbox label
    expect(screen.getByRole('button', { name: /tratamiento de mis datos personales/i })).toBeInTheDocument();
  });

  it('pay button is disabled when nothing is selected', () => {
    renderPage();
    const button = screen.getByRole('button', { name: /proceder al pago/i });
    expect(button).toBeDisabled();
  });

  it('pay button is disabled when only a membership is selected (no terms)', async () => {
    renderPage();
    const user = userEvent.setup();

    // Click the first membership card
    const card = screen.getByText(membershipTypes[0].name).closest('[class]')!;
    await user.click(card);

    const button = screen.getByRole('button', { name: /proceder al pago/i });
    expect(button).toBeDisabled();
  });

  it('calls fetch when the form is complete and the button is clicked', async () => {
    const fetchSpy = vi.spyOn(global, 'fetch').mockResolvedValue({
      json: async () => ({ success: true, url: 'https://checkout.stripe.com/test' }),
    } as Response);

    renderPage();
    const user = userEvent.setup();

    // Select a membership by clicking the card content area
    await user.click(screen.getByText(membershipTypes[0].name));

    // Accept both checkboxes
    const checkboxes = screen.getAllByRole('checkbox');
    for (const checkbox of checkboxes) {
      await user.click(checkbox);
    }

    const button = screen.getByRole('button', { name: /proceder al pago/i });
    await user.click(button);

    expect(fetchSpy).toHaveBeenCalledWith(
      '/api/create-checkout-session',
      expect.objectContaining({
        method: 'POST',
        body: expect.stringContaining(membershipTypes[0].id),
      }),
    );
  });
});
