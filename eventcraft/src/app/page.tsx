// ABOUTME: Renders the EventCraft Event Details step and saves valid details before review.

'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { ArrowRight, BriefcaseBusiness, CalendarDays, Info, Minus, Plus, Save } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { DayPicker } from 'react-day-picker';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import type { Resolver } from 'react-hook-form';
import { BudgetTrackerBar } from '@/components/BudgetTrackerBar';
import { EventTypeCard } from '@/components/EventTypeCard';
import { ProgressStepper } from '@/components/ProgressStepper';
import { Button } from '@/components/ui/button';
import { useWizardStore } from '@/lib/store';
import { useWizardPersistence } from '@/lib/use-wizard-persistence';
import { eventDetailsSchema } from '@/lib/validation';
import type { EventDetailsState, EventType } from '@/types/eventcraft';

interface EventTypesResponse {
    eventTypes: EventType[];
}

export default function Home() {
    const router = useRouter();
    const [eventTypes, setEventTypes] = useState<EventType[]>([]);
    const details = useWizardStore((state) => state.eventDetails);
    const setEventDetails = useWizardStore((state) => state.setEventDetails);
    useWizardPersistence();

    const form = useForm<EventDetailsState>({
        resolver: zodResolver(eventDetailsSchema) as Resolver<EventDetailsState>,
        mode: 'onChange',
        defaultValues: details,
    });
    const selectedEventType = form.watch('eventType');
    const selectedDate = form.watch('eventDate');
    const guests = form.watch('expectedGuests');
    const budget = form.watch('budgetRange');
    const selectedType = eventTypes.find((eventType) => eventType.id === selectedEventType);

    useEffect(() => {
        fetch('/api/event-types')
            .then((response) => response.json())
            .then((data: EventTypesResponse) => setEventTypes(data.eventTypes));
    }, []);

    function submit(values: EventDetailsState) {
        setEventDetails(values);
        useWizardStore.getState().setCurrentStep(2);
        router.push('/review');
    }

    const minimumDate = new Date();
    minimumDate.setHours(0, 0, 0, 0);
    minimumDate.setDate(minimumDate.getDate() + (guests > 200 ? 21 : 14));
    const typicalMinimum = selectedType ? selectedType.suggestedBudgetPerGuest.min * guests : 0;
    const typicalMaximum = selectedType ? selectedType.suggestedBudgetPerGuest.max * guests : 0;

    return (
        <div className="min-h-screen bg-surface-white pb-36 font-sans text-on-surface">
            <header className="sticky top-0 z-40 border-b border-outline-variant bg-surface-white">
                <div className="mx-auto flex h-20 max-w-[1200px] items-center justify-between px-4 md:px-6">
                    <div className="flex items-center gap-2 text-primary">
                        <BriefcaseBusiness aria-hidden="true" className="size-7" />
                        <span className="font-heading text-2xl font-semibold">EventCraft</span>
                    </div>
                    <ProgressStepper currentStep={1} />
                    <Button type="button" variant="ghost" className="text-on-surface-variant">
                        <Save aria-hidden="true" />
                        <span className="hidden sm:inline">Save &amp; Exit</span>
                    </Button>
                </div>
            </header>

            <main className="mx-auto max-w-[1200px] px-4 py-16 md:px-10">
                <div className="mb-10">
                    <h1 className="font-heading text-3xl font-semibold text-primary md:text-4xl">Let&apos;s craft your event</h1>
                    <p className="mt-2 text-lg text-on-surface-variant">Start by defining the core details and budget for your upcoming experience.</p>
                </div>

                <form className="space-y-16" onSubmit={form.handleSubmit(submit)} noValidate>
                    <section>
                        <div className="mb-4 flex items-center gap-2">
                            <BriefcaseBusiness aria-hidden="true" className="size-5 text-outline" />
                            <h2 className="font-heading text-2xl font-semibold text-primary">Event Type</h2>
                        </div>
                        <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-6">
                            {eventTypes.map((eventType) => (
                                <EventTypeCard
                                    eventType={eventType}
                                    key={eventType.id}
                                    selected={selectedEventType === eventType.id}
                                    onSelect={(eventTypeId) => form.setValue('eventType', eventTypeId, { shouldValidate: true })}
                                />
                            ))}
                        </div>
                        {form.formState.errors.eventType && <p className="mt-2 text-sm text-destructive">{form.formState.errors.eventType.message}</p>}
                    </section>

                    <section className="rounded-lg border border-outline-variant bg-surface-white p-6 md:p-10">
                        <div className="mb-6 flex items-center gap-2">
                            <Info aria-hidden="true" className="size-5 text-outline" />
                            <h2 className="font-heading text-2xl font-semibold text-primary">Logistics</h2>
                        </div>
                        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                            <FieldError error={form.formState.errors.eventName?.message}>
                                <label htmlFor="eventName">Event Name <Required /></label>
                                <input id="eventName" className="field" {...form.register('eventName')} placeholder="e.g., Annual Tech Summit" />
                            </FieldError>
                            <FieldError error={form.formState.errors.eventDescription?.message} className="md:col-span-2">
                                <label htmlFor="eventDescription">Event Description <span className="font-normal text-on-surface-variant">(Optional)</span></label>
                                <textarea id="eventDescription" className="field min-h-28" {...form.register('eventDescription')} placeholder="Tell us more about your event goals and vision..." />
                            </FieldError>
                            <FieldError error={form.formState.errors.eventDate?.message}>
                                <label htmlFor="eventDate">Date <Required /></label>
                                <div className="relative">
                                    <CalendarDays aria-hidden="true" className="pointer-events-none absolute left-3 top-3 size-5 text-outline" />
                                    <input id="eventDate" type="date" min={formatDate(minimumDate)} className="field pl-10" value={selectedDate ? formatDate(selectedDate) : ''} onChange={(event) => form.setValue('eventDate', event.target.value ? new Date(`${event.target.value}T00:00:00`) : null, { shouldValidate: true })} />
                                </div>
                            </FieldError>
                            <div className="grid grid-cols-2 gap-4">
                                <FieldError error={form.formState.errors.startTime?.message}>
                                    <label htmlFor="startTime">Start <Required /></label>
                                    <input id="startTime" type="time" className="field" {...form.register('startTime')} />
                                </FieldError>
                                <FieldError error={form.formState.errors.endTime?.message}>
                                    <label htmlFor="endTime">End <Required /></label>
                                    <input id="endTime" type="time" className="field" {...form.register('endTime')} />
                                </FieldError>
                            </div>
                        </div>
                        <div className="mt-6 rounded-lg border border-outline-variant bg-surface-container-low p-4">
                            <p className="mb-3 font-mono text-xs font-medium uppercase text-on-surface-variant">Choose a date</p>
                            <DayPicker mode="single" selected={selectedDate ?? undefined} onSelect={(date) => form.setValue('eventDate', date ?? null, { shouldValidate: true })} disabled={{ before: minimumDate }} />
                        </div>
                    </section>

                    <section className="rounded-lg border border-outline-variant bg-surface-white p-6 md:p-10">
                        <div className="mb-6 flex items-center gap-2">
                            <Info aria-hidden="true" className="size-5 text-outline" />
                            <h2 className="font-heading text-2xl font-semibold text-primary">Scale &amp; Budget</h2>
                        </div>
                        <div className="grid gap-10 md:grid-cols-2">
                            <div>
                                <span className="field-label">Expected Guests</span>
                                <div className="mt-2 flex items-center justify-between rounded-lg border border-outline-variant bg-surface p-2">
                                    <Button type="button" size="icon-lg" variant="ghost" aria-label="Decrease expected guests" disabled={guests <= 10} onClick={() => form.setValue('expectedGuests', guests - 1, { shouldValidate: true })}><Minus aria-hidden="true" /></Button>
                                    <output className="text-center"><span className="block font-heading text-3xl font-semibold text-primary">{guests}</span><span className="font-mono text-xs text-on-surface-variant">Attendees</span></output>
                                    <Button type="button" size="icon-lg" variant="ghost" aria-label="Increase expected guests" disabled={guests >= 500} onClick={() => form.setValue('expectedGuests', guests + 1, { shouldValidate: true })}><Plus aria-hidden="true" /></Button>
                                </div>
                                {selectedType && <p className="mt-2 text-sm text-on-surface-variant">Min {selectedType.minGuests} for {selectedType.name}</p>}
                            </div>
                            <div>
                                <div className="flex items-end justify-between"><label htmlFor="budgetRange" className="field-label">Total Budget Range</label><output className="font-heading text-2xl font-semibold text-primary">${budget.toLocaleString()}</output></div>
                                <input id="budgetRange" type="range" min="1000" max="100000" step="1000" className="mt-6 w-full accent-primary" value={budget} onChange={(event) => form.setValue('budgetRange', Number(event.target.value), { shouldValidate: true })} />
                                <div className="mt-2 flex justify-between font-mono text-xs text-on-surface-variant"><span>$1k</span><span className="rounded-sm bg-surface-container-high px-2 py-1 font-bold text-primary">Typical: ${typicalMinimum.toLocaleString()} - ${typicalMaximum.toLocaleString()}</span><span>$100k</span></div>
                            </div>
                        </div>
                    </section>

                    <div className="flex justify-end gap-4">
                        <Button type="button" variant="outline" className="h-12 px-6">Save Draft</Button>
                        <Button type="submit" className="h-12 px-8">Continue to Review <ArrowRight aria-hidden="true" /></Button>
                    </div>
                </form>
            </main>
            <div className="fixed inset-x-0 bottom-0 z-50"><BudgetTrackerBar currentSpend={0} totalBudget={budget} /></div>
        </div>
    );
}

function FieldError({ children, error, className = '' }: { children: React.ReactNode; error?: string; className?: string }) {
    return <div className={`space-y-2 ${className}`}><div className="field-label">{children}</div>{error && <p className="text-sm text-destructive">{error}</p>}</div>;
}

function Required() {
    return <span aria-hidden="true" className="text-budget-danger">*</span>;
}

function formatDate(date: Date): string {
    return date.toISOString().slice(0, 10);
}
