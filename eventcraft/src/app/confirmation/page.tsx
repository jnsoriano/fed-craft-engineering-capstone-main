// ABOUTME: Displays a successful EventCraft booking reference and actions to begin again.

'use client';

import { CheckCircle2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { useFocusHeading } from '@/lib/use-focus-heading';
import { useWizardStore } from '@/lib/store';
import { useWizardPersistence } from '@/lib/use-wizard-persistence';

export default function ConfirmationPage() {
    const router = useRouter();
    const referenceCode = useWizardStore((state) => state.submission.referenceCode);
    const reset = useWizardStore((state) => state.reset);
    const headingRef = useFocusHeading();
    useWizardPersistence();

    useEffect(() => {
        if (!referenceCode) {
            router.push('/');
        }
    }, [referenceCode, router]);

    if (!referenceCode) {
        return null;
    }

    function startAgain() {
        reset();
        router.push('/');
    }

    return (
        <main className="flex min-h-screen items-center justify-center bg-background-subtle p-4 md:p-6">
            <section className="flex w-full max-w-md animate-in flex-col items-center space-y-6 rounded-lg border border-outline-variant bg-surface-white p-10 text-center shadow-lg fade-in slide-in-from-bottom-4 duration-500">
                <div className="flex size-20 items-center justify-center rounded-full bg-[var(--secondary-container,#6cf8bb)]">
                    <CheckCircle2 aria-hidden="true" className="size-11 text-secondary" />
                </div>

                <h1 ref={headingRef} tabIndex={-1} className="font-heading text-3xl font-semibold text-on-surface outline-none">Booking Confirmed</h1>
                <p className="mx-auto max-w-[80%] text-on-surface-variant">
                    Your event details have been successfully secured. We&apos;ve sent a confirmation email with next steps.
                </p>

                <div className="rounded-lg border border-outline-variant bg-surface-bright p-4">
                    <p className="mb-1 font-mono text-xs font-medium uppercase text-on-surface-variant">Reference Code</p>
                    <p className="font-mono text-lg font-bold tracking-widest text-primary">{referenceCode}</p>
                </div>

                <div className="flex w-full flex-col gap-4 pt-4">
                    <Button type="button" className="h-12 w-full font-bold" onClick={startAgain}>Return to Dashboard</Button>
                    <Button type="button" variant="outline" className="h-12 w-full font-bold" onClick={startAgain}>Plan Another Event</Button>
                </div>
            </section>
        </main>
    );
}
