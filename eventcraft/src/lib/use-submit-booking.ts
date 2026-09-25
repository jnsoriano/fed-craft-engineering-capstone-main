// ABOUTME: Submits the current wizard data and routes to the matching booking result screen.

'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { useWizardStore } from './store';
import type { BookingContactState } from '@/types/eventcraft';

interface BookingResponse {
    success: boolean;
    referenceCode?: string;
    reason?: string;
}

export function useSubmitBooking() {
    const router = useRouter();
    const [isSubmitting, setIsSubmitting] = useState(false);

    async function submitBooking(bookingContact?: BookingContactState) {
        setIsSubmitting(true);
        const state = useWizardStore.getState();
        const booking = bookingContact ?? state.booking;
        state.setBookingContact(booking);

        try {
            const response = await fetch('/api/booking', {
                method: 'POST',
                headers: { 'content-type': 'application/json' },
                body: JSON.stringify({
                    eventDetails: state.eventDetails,
                    equipment: state.equipment,
                    booking,
                }),
            });
            const result = await response.json() as BookingResponse;

            if (result.success && result.referenceCode) {
                state.setSubmissionResult({ referenceCode: result.referenceCode, failureReason: null });
                router.push('/confirmation');
                return;
            }

            state.setSubmissionResult({ referenceCode: null, failureReason: result.reason ?? 'unknown_error' });
            router.push('/error');
        } finally {
            setIsSubmitting(false);
        }
    }

    return { submitBooking, isSubmitting };
}
