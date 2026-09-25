// ABOUTME: Renders equipment selection, booking review, and contact submission for EventCraft.

'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { BriefcaseBusiness, Pencil, Save } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import type { Resolver } from 'react-hook-form';
import { BudgetTrackerBar } from '@/components/BudgetTrackerBar';
import { EquipmentCategoryAccordion } from '@/components/EquipmentCategoryAccordion';
import { ProgressStepper } from '@/components/ProgressStepper';
import { Button } from '@/components/ui/button';
import { calculatePriceBreakdown } from '@/lib/pricing';
import { useFocusHeading } from '@/lib/use-focus-heading';
import { useEquipmentHistory } from '@/lib/use-equipment-history';
import { useSubmitBooking } from '@/lib/use-submit-booking';
import { useWizardPersistence } from '@/lib/use-wizard-persistence';
import { useWizardStore } from '@/lib/store';
import { bookingContactSchema } from '@/lib/validation';
import type { BookingContactState, EquipmentItem } from '@/types/eventcraft';

interface EquipmentResponse {
    equipment: Record<string, EquipmentItem[]>;
    eventTypeRecommendations: Record<string, string[]>;
}

interface PromoCode {
    code: string;
    discountPercentage?: number;
    discountAmount?: number;
    validUntil?: string;
    validDays?: string[];
}

interface PricingRulesResponse {
    promoCodes: PromoCode[];
}

const categories = {
    audioVisual: { label: 'Audio/Visual', icon: 'AudioLines' },
    decor: { label: 'Decor', icon: 'celebration' },
    staging: { label: 'Staging', icon: 'layers' },
    lighting: { label: 'Lighting', icon: 'lightbulb' },
    furniture: { label: 'Furniture', icon: 'chair' },
};

export default function ReviewPage() {
    const router = useRouter();
    const eventDetails = useWizardStore((state) => state.eventDetails);
    const booking = useWizardStore((state) => state.booking);
    const setEquipmentQuantity = useWizardStore((state) => state.setEquipmentQuantity);
    const headingRef = useFocusHeading();
    const [equipmentData, setEquipmentData] = useState<EquipmentResponse | null>(null);
    const [promoCodes, setPromoCodes] = useState<PromoCode[]>([]);
    const [promoMessage, setPromoMessage] = useState<string | null>(null);
    const [appliedPromo, setAppliedPromo] = useState<PromoCode | undefined>();
    const [equipmentHistory, equipmentActions] = useEquipmentHistory(useWizardStore.getState().equipment.selectedEquipment);
    const { submitBooking, isSubmitting } = useSubmitBooking();
    useWizardPersistence();

    const form = useForm<BookingContactState>({
        resolver: zodResolver(bookingContactSchema) as Resolver<BookingContactState>,
        mode: 'onChange',
        defaultValues: booking,
    });

    useEffect(() => {
        if (!eventDetails.eventType || !eventDetails.eventDate) {
            router.push('/');
            return;
        }

        Promise.all([
            fetch('/api/equipment').then((response) => response.json()),
            fetch('/api/pricing-rules').then((response) => response.json()),
        ]).then(([equipment, pricing]: [EquipmentResponse, PricingRulesResponse]) => {
            setEquipmentData(equipment);
            setPromoCodes(pricing.promoCodes);
        });
    }, [eventDetails.eventDate, eventDetails.eventType, router]);

    if (!eventDetails.eventType || !eventDetails.eventDate) {
        return null;
    }

    const catalog = equipmentData?.equipment ?? {};
    const priceBreakdown = calculatePriceBreakdown(
        equipmentHistory.present,
        catalog,
        eventDetails.eventDate,
        appliedPromo,
    );
    const recommendations = equipmentData?.eventTypeRecommendations[eventDetails.eventType] ?? [];

    function changeEquipment(equipmentId: string, quantity: number) {
        const nextSelection = { ...equipmentHistory.present };
        if (quantity <= 0) delete nextSelection[equipmentId];
        else nextSelection[equipmentId] = quantity;
        equipmentActions.set(nextSelection);
        setEquipmentQuantity(equipmentId, quantity);
    }

    function applyPromoCode() {
        const code = form.getValues('promoCode').trim().toUpperCase();
        const promo = promoCodes.find((candidate) => candidate.code === code);
        if (!promo || !isPromoEligible(promo, eventDetails.eventDate!)) {
            setAppliedPromo(undefined);
            setPromoMessage('Promo code is invalid or unavailable for this event date.');
            return;
        }

        setAppliedPromo(promo);
        form.setValue('promoCode', promo.code);
        setPromoMessage(`${promo.code} applied.`);
    }

    return (
        <div className="min-h-screen bg-surface-white pb-36 text-on-surface">
            <header className="sticky top-0 z-40 border-b border-outline-variant bg-surface-white">
                <div className="mx-auto flex h-20 max-w-[1200px] items-center justify-between px-4 md:px-6">
                    <div className="flex items-center gap-2 text-primary"><BriefcaseBusiness aria-hidden="true" className="size-7" /><span className="font-heading text-2xl font-semibold">EventCraft</span></div>
                    <ProgressStepper currentStep={2} />
                    <Button type="button" variant="ghost" aria-label="Save and exit" className="text-on-surface-variant"><Save aria-hidden="true" /><span className="hidden sm:inline">Save &amp; Exit</span></Button>
                </div>
            </header>

            <main className="mx-auto max-w-[1200px] px-4 py-10 md:px-10">
                <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
                    <section className="space-y-6 lg:col-span-7">
                        <h1 ref={headingRef} tabIndex={-1} className="font-heading text-3xl font-semibold text-primary outline-none md:text-4xl">Equipment &amp; Services</h1>
                        {equipmentData && Object.entries(categories).map(([key, category]) => (
                            <EquipmentCategoryAccordion
                                category={category.label}
                                icon={category.icon}
                                items={equipmentData.equipment[key] ?? []}
                                key={key}
                                quantities={equipmentHistory.present}
                                recommendedEquipmentIds={recommendations}
                                onQuantityChange={changeEquipment}
                            />
                        ))}
                    </section>

                    <aside className="lg:col-span-5">
                        <div className="sticky top-24 rounded-lg border border-outline-variant bg-surface-white p-6">
                            <div className="mb-4 flex items-center justify-between"><h2 className="font-heading text-2xl font-semibold text-primary">Booking Summary</h2><Link href="/" className="flex items-center gap-1 text-sm font-bold text-secondary"><Pencil aria-hidden="true" className="size-4" />Edit</Link></div>
                            <dl className="mb-6 space-y-2 border-b border-outline-variant pb-6 text-sm">
                                <SummaryRow label="Event" value={eventDetails.eventName} />
                                <SummaryRow label="Date" value={eventDetails.eventDate.toLocaleDateString()} />
                                <SummaryRow label="Guests" value={String(eventDetails.expectedGuests)} />
                                <SummaryRow label="Equipment & Services" value={formatCurrency(priceBreakdown.equipment.subtotal)} />
                                {priceBreakdown.weekendSurcharge > 0 && <SummaryRow label="Weekend Surcharge" value={formatCurrency(priceBreakdown.weekendSurcharge)} />}
                                <SummaryRow label="Subtotal" value={formatCurrency(priceBreakdown.subtotal)} bold />
                                <SummaryRow label="GST (10%)" value={formatCurrency(priceBreakdown.gst)} />
                                <SummaryRow label="Total" value={formatCurrency(priceBreakdown.total)} bold />
                            </dl>

                            <form className="space-y-4" onSubmit={form.handleSubmit(submitBooking)} noValidate>
                                <FormField htmlFor="contactName" label="Contact Name" error={form.formState.errors.contactName?.message}><input id="contactName" className="field" {...form.register('contactName')} /></FormField>
                                <FormField htmlFor="email" label="Email" error={form.formState.errors.email?.message}><input id="email" type="email" className="field" {...form.register('email')} /></FormField>
                                <FormField htmlFor="phone" label="Phone" error={form.formState.errors.phone?.message}><input id="phone" type="tel" className="field" {...form.register('phone')} /></FormField>
                                <FormField htmlFor="companyOrganization" label="Company/Organization (Optional)"><input id="companyOrganization" className="field" {...form.register('companyOrganization')} /></FormField>
                                <FormField htmlFor="specialRequests" label="Special Requests (Optional)" error={form.formState.errors.specialRequests?.message}><textarea id="specialRequests" className="field min-h-20" {...form.register('specialRequests')} /></FormField>
                                <div><label htmlFor="promoCode" className="field-label">Promo Code</label><div className="mt-1 flex gap-2"><input id="promoCode" className="field" {...form.register('promoCode')} /><Button type="button" variant="outline" onClick={applyPromoCode}>Apply</Button></div>{promoMessage && <p className="mt-1 text-sm text-on-surface-variant">{promoMessage}</p>}</div>
                                <div><label className="flex items-start gap-2 text-sm text-on-surface-variant"><input type="checkbox" className="mt-1" {...form.register('termsAccepted')} />I agree to the Terms &amp; Conditions.</label>{form.formState.errors.termsAccepted && <p className="mt-1 text-sm text-destructive">{form.formState.errors.termsAccepted.message}</p>}</div>
                                <Button type="submit" className="h-12 w-full" disabled={isSubmitting}>{isSubmitting ? 'Processing...' : 'Book Event'}</Button>
                            </form>
                        </div>
                    </aside>
                </div>
            </main>
            <div className="fixed inset-x-0 bottom-0 z-50"><BudgetTrackerBar currentSpend={priceBreakdown.total} totalBudget={eventDetails.budgetRange} /></div>
        </div>
    );
}

function FormField({ htmlFor, label, error, children }: { htmlFor: string; label: string; error?: string; children: React.ReactNode }) {
    return <div><label htmlFor={htmlFor} className="field-label">{label}</label><div className="mt-1">{children}</div>{error && <p className="mt-1 text-sm text-destructive">{error}</p>}</div>;
}

function SummaryRow({ label, value, bold = false }: { label: string; value: string; bold?: boolean }) {
    return <div className={`flex justify-between gap-4 ${bold ? 'font-bold text-primary' : 'text-on-surface-variant'}`}><dt>{label}</dt><dd className="font-mono text-primary">{value}</dd></div>;
}

function formatCurrency(value: number) {
    return new Intl.NumberFormat('en-AU', { style: 'currency', currency: 'AUD' }).format(value);
}

function isPromoEligible(promo: PromoCode, eventDate: Date): boolean {
    if (promo.validUntil && new Date(`${promo.validUntil}T23:59:59.999Z`) < new Date()) return false;
    if (promo.validDays) {
        const day = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'][eventDate.getDay()];
        return promo.validDays.includes(day);
    }
    return true;
}
