// ABOUTME: Displays a failed EventCraft booking and lets the user retry or return to review.

'use client';

import { CircleAlert } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { useFocusHeading } from '@/lib/use-focus-heading';
import { useSubmitBooking } from '@/lib/use-submit-booking';
import { useWizardPersistence } from '@/lib/use-wizard-persistence';
import { useWizardStore } from '@/lib/store';

export default function ErrorPage() {
    const router = useRouter();
    const eventType = useWizardStore((state) => state.eventDetails.eventType);
    const failureReason = useWizardStore((state) => state.submission.failureReason);
    const headingRef = useFocusHeading();
    const { submitBooking, isSubmitting } = useSubmitBooking();
    useWizardPersistence();

    useEffect(() => {
        if (!eventType || !failureReason) {
            router.push('/');
        }
    }, [eventType, failureReason, router]);

    if (!eventType || !failureReason) {
        return null;
    }

    return (
        <main className="flex min-h-screen items-center justify-center bg-background-subtle p-4 md:p-6">
            <section className="flex w-full max-w-md animate-in flex-col items-center space-y-6 rounded-lg border border-outline-variant bg-surface-white p-10 text-center shadow-lg fade-in slide-in-from-bottom-4 duration-500">
                <div className="flex size-20 items-center justify-center rounded-full bg-[var(--error-container,#ffdad6)]">
                    <CircleAlert aria-hidden="true" className="size-11 text-destructive" />
                </div>

                <h1 ref={headingRef} tabIndex={-1} className="font-heading text-3xl font-semibold text-on-surface outline-none">Oops! Something went wrong</h1>
                <p className="mx-auto max-w-[80%] text-on-surface-variant">
                    We couldn&apos;t process your booking at this time. Please check your details and try again.
                </p>

                <div className="flex w-full flex-col gap-4 pt-4">
                    <Button
                        type="button"
                        className="h-12 w-full font-bold"
                        disabled={isSubmitting}
                        onClick={() => submitBooking()}
                    >
                        {isSubmitting ? 'Processing...' : 'Try Again'}
                    </Button>
                    <Button
                        type="button"
                        variant="outline"
                        className="h-12 w-full font-bold"
                        onClick={() => router.push('/review')}
                    >
                        Return to Review
                    </Button>
                </div>
            </section>
        </main>
    );
}
