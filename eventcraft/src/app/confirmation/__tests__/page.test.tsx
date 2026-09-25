import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import ConfirmationPage from '../page';
import { useWizardStore } from '@/lib/store';

const push = vi.fn();

vi.mock('next/navigation', () => ({
    useRouter: () => ({ push }),
}));

function seedConfirmation() {
    useWizardStore.getState().setEventDetails({
        eventType: 'wedding-reception',
        eventName: 'Jordan and Casey Wedding',
    });
    useWizardStore.getState().setSubmissionResult({
        referenceCode: 'EVT-20260902-1234',
        failureReason: null,
    });
}

describe('Booking Confirmation page', () => {
    beforeEach(() => {
        localStorage.clear();
        push.mockReset();
        useWizardStore.getState().reset();
    });

    it('redirects to Event Details when there is no booking reference', async () => {
        render(<ConfirmationPage />);

        await waitFor(() => expect(push).toHaveBeenCalledWith('/'));
    });

    it('renders the successful booking reference', () => {
        seedConfirmation();
        render(<ConfirmationPage />);

        expect(screen.getByRole('heading', { name: 'Booking Confirmed' })).toHaveFocus();
        expect(screen.getByText('EVT-20260902-1234')).toBeInTheDocument();
    });

    it('clears the wizard and returns home from Return to Dashboard', async () => {
        const user = userEvent.setup();
        seedConfirmation();
        render(<ConfirmationPage />);
        localStorage.setItem('eventcraft_wizard_state', 'draft');

        await user.click(screen.getByRole('button', { name: 'Return to Dashboard' }));

        expect(useWizardStore.getState().eventDetails.eventType).toBeNull();
        expect(useWizardStore.getState().submission.referenceCode).toBeNull();
        expect(localStorage.getItem('eventcraft_wizard_state')).toBeNull();
        expect(push).toHaveBeenCalledWith('/');
    });

    it('clears the wizard and returns home from Plan Another Event', async () => {
        const user = userEvent.setup();
        seedConfirmation();
        render(<ConfirmationPage />);

        await user.click(screen.getByRole('button', { name: 'Plan Another Event' }));

        expect(useWizardStore.getState().eventDetails.eventType).toBeNull();
        expect(useWizardStore.getState().submission.referenceCode).toBeNull();
        expect(push).toHaveBeenCalledWith('/');
    });
});
