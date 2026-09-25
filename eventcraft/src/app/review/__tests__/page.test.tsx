import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import ReviewPage from '../page';
import equipmentData from '@/lib/mock-data/equipment.json';
import pricingRulesData from '@/lib/mock-data/pricing-rules.json';
import { initialWizardState, useWizardStore } from '@/lib/store';

const push = vi.fn();

vi.mock('next/navigation', () => ({
    useRouter: () => ({ push }),
}));

function seedValidEvent() {
    useWizardStore.getState().hydrate({
        ...initialWizardState,
        currentStep: 2,
        eventDetails: {
            ...initialWizardState.eventDetails,
            eventType: 'wedding-reception',
            eventName: 'Jordan and Casey Wedding',
            eventDate: new Date('2026-10-01T00:00:00.000Z'),
            startTime: '16:00',
            endTime: '20:00',
            expectedGuests: 120,
            budgetRange: 1000,
        },
        equipment: { selectedEquipment: { 'projector-screen': 1 } },
    });
}

function mockFetch(bookingResult = { success: true, referenceCode: 'EVT-20260902-1234', total: 165 }) {
    vi.stubGlobal('fetch', vi.fn(async (input: string | URL | Request) => {
        const url = typeof input === 'string' ? input : input.toString();
        if (url === '/api/equipment') return { ok: true, json: async () => equipmentData };
        if (url === '/api/pricing-rules') return { ok: true, json: async () => pricingRulesData };
        if (url === '/api/booking') return { ok: bookingResult.success, json: async () => bookingResult };
        throw new Error(`Unexpected fetch: ${url}`);
    }));
}

async function completeContactForm() {
    const user = userEvent.setup();
    await user.type(screen.getByLabelText(/contact name/i), 'Jordan Lee');
    await user.type(screen.getByLabelText(/^email/i), 'jordan@example.com');
    await user.type(screen.getByLabelText(/phone/i), '+61 412 345 678');
    await user.click(screen.getByRole('checkbox', { name: /terms & conditions/i }));
    await user.click(screen.getByRole('button', { name: /book event/i }));
}

describe('Equipment and Review page', () => {
    beforeEach(() => {
        localStorage.clear();
        push.mockReset();
        useWizardStore.getState().reset();
        mockFetch();
    });

    it('redirects to Event Details when no event has been configured', async () => {
        render(<ReviewPage />);
        await waitFor(() => expect(push).toHaveBeenCalledWith('/'));
    });

    it('renders fetched equipment and the live selected-equipment total', async () => {
        seedValidEvent();
        render(<ReviewPage />);

        const category = await screen.findByRole('button', { name: /audio\/visual/i });
        expect(screen.getByRole('heading', { name: /equipment & services/i })).toHaveFocus();
        expect(screen.getByRole('checkbox', { name: /terms & conditions/i })).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /book event/i })).toBeInTheDocument();
        expect(screen.getByText('Spend: $165')).toBeInTheDocument();
        await userEvent.setup().click(category);
        expect(screen.getByText('Projector + Screen')).toBeInTheDocument();
    });

    it('stores a successful booking result and navigates to confirmation', async () => {
        seedValidEvent();
        render(<ReviewPage />);
        await screen.findByRole('button', { name: /audio\/visual/i });

        await completeContactForm();

        await waitFor(() => expect(push).toHaveBeenCalledWith('/confirmation'));
        expect(useWizardStore.getState().submission.referenceCode).toBe('EVT-20260902-1234');
        expect(global.fetch).toHaveBeenCalledWith('/api/booking', expect.objectContaining({ method: 'POST' }));
    });

    it('stores a failed booking result and navigates to the error screen', async () => {
        seedValidEvent();
        mockFetch({ success: false, reason: 'over_budget' } as never);
        render(<ReviewPage />);
        await screen.findByRole('button', { name: /audio\/visual/i });

        await completeContactForm();

        await waitFor(() => expect(push).toHaveBeenCalledWith('/error'));
        expect(useWizardStore.getState().submission.failureReason).toBe('over_budget');
    });

    it('validates promo codes when Apply is selected', async () => {
        seedValidEvent();
        render(<ReviewPage />);
        await screen.findByRole('button', { name: /audio\/visual/i });

        fireEvent.change(screen.getByLabelText(/promo code/i), { target: { value: 'NOTREAL' } });
        await userEvent.setup().click(screen.getByRole('button', { name: /^apply$/i }));

        expect(screen.getByText('Promo code is invalid or unavailable for this event date.')).toBeInTheDocument();
    });
});
