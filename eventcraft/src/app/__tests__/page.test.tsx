import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import Home from '../page';
import { initialWizardState, useWizardStore } from '@/lib/store';
import eventTypesData from '@/lib/mock-data/event-types.json';

const push = vi.fn();

vi.mock('next/navigation', () => ({
    useRouter: () => ({ push }),
}));

function renderPage() {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
        ok: true,
        json: async () => eventTypesData,
    }));

    return render(<Home />);
}

describe('Event Details page', () => {
    beforeEach(() => {
        push.mockReset();
        useWizardStore.getState().reset();
    });

    it('fetches and renders event type cards', async () => {
        renderPage();

        expect(await screen.findByRole('button', { name: /select corporate conference/i })).toBeInTheDocument();
        expect(screen.getByRole('heading', { name: /let's craft your event/i })).toBeInTheDocument();
        expect(global.fetch).toHaveBeenCalledWith('/api/event-types');
    });

    it('shows inline validation errors after an invalid continue attempt', async () => {
        const user = userEvent.setup();
        renderPage();

        await screen.findByRole('button', { name: /select corporate conference/i });
        await user.click(screen.getByRole('button', { name: /continue to review/i }));

        expect(await screen.findByText('Select an event type.')).toBeInTheDocument();
        expect(screen.getByText('Event name must be at least 3 characters.')).toBeInTheDocument();
    });

    it('persists valid details and navigates to review', async () => {
        const user = userEvent.setup();
        renderPage();

        await user.click(await screen.findByRole('button', { name: /select wedding reception/i }));
        await user.type(screen.getByLabelText(/event name/i), 'Jordan and Casey Wedding');
        fireEvent.change(screen.getByLabelText(/^date/i), { target: { value: '2026-10-01' } });
        fireEvent.change(screen.getByLabelText(/^start/i), { target: { value: '16:00' } });
        fireEvent.change(screen.getByLabelText(/^end/i), { target: { value: '20:00' } });
        await user.click(screen.getByRole('button', { name: /continue to review/i }));

        await waitFor(() => expect(push).toHaveBeenCalledWith('/review'));
        expect(useWizardStore.getState().eventDetails).toMatchObject({
            eventType: 'wedding-reception',
            eventName: 'Jordan and Casey Wedding',
            expectedGuests: initialWizardState.eventDetails.expectedGuests,
        });
    });
});
