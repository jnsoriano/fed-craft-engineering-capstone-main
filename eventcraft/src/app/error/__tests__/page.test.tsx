import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import ErrorPage from '../page';
import { initialWizardState, useWizardStore } from '@/lib/store';

const push = vi.fn();

vi.mock('next/navigation', () => ({
    useRouter: () => ({ push }),
}));

function seedFailedBooking() {
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
    });
    useWizardStore.getState().setSubmissionResult({
        referenceCode: null,
        failureReason: 'over_budget',
    });
}

describe('Booking Error page', () => {
    beforeEach(() => {
        localStorage.clear();
        push.mockReset();
        useWizardStore.getState().reset();
        vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
            ok: true,
            json: async () => ({
                success: true,
                referenceCode: 'EVT-20260902-1234',
            }),
        }));
    });

    it('redirects to Event Details without a failed booking', async () => {
        render(<ErrorPage />);

        await waitFor(() => expect(push).toHaveBeenCalledWith('/'));
    });

    it('retries the saved booking and follows a successful response', async () => {
        const user = userEvent.setup();
        seedFailedBooking();
        render(<ErrorPage />);

        expect(screen.getByRole('heading', { name: /oops! something went wrong/i })).toHaveFocus();

        await user.click(screen.getByRole('button', { name: 'Try Again' }));

        await waitFor(() => expect(global.fetch).toHaveBeenCalledWith('/api/booking', expect.objectContaining({ method: 'POST' })));
        expect(push).toHaveBeenCalledWith('/confirmation');
        expect(useWizardStore.getState().submission.referenceCode).toBe('EVT-20260902-1234');
    });

    it('returns to review without clearing the wizard', async () => {
        const user = userEvent.setup();
        seedFailedBooking();
        render(<ErrorPage />);

        await user.click(screen.getByRole('button', { name: 'Return to Review' }));

        expect(push).toHaveBeenCalledWith('/review');
        expect(useWizardStore.getState().eventDetails.eventName).toBe('Jordan and Casey Wedding');
        expect(useWizardStore.getState().submission.failureReason).toBe('over_budget');
    });
});
