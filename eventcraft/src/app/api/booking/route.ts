// ABOUTME: Validates simulated EventCraft bookings and returns a reference code or failure reason.

import { NextResponse } from 'next/server';
import equipmentData from '@/lib/mock-data/equipment.json';
import pricingRulesData from '@/lib/mock-data/pricing-rules.json';
import { calculatePriceBreakdown } from '@/lib/pricing';
import { getBudgetWarning, bookingContactSchema, eventDetailsSchema } from '@/lib/validation';
import type { EquipmentItem } from '@/types/eventcraft';

const RESPONSE_DELAY_MS = 600;
const DAY_NAMES = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

export async function POST(request: Request) {
    await delay(RESPONSE_DELAY_MS);

    const payload = await request.json().catch(() => null);
    const eventDetails = parseEventDetails(payload?.eventDetails);
    const booking = bookingContactSchema.safeParse(payload?.booking);

    if (!eventDetails.success || !booking.success) {
        return NextResponse.json({
            success: false,
            reason: 'validation_failed',
            errors: {
                eventDetails: eventDetails.success ? undefined : eventDetails.error.flatten(),
                booking: booking.success ? undefined : booking.error.flatten(),
            },
        }, { status: 400 });
    }

    const selectedEquipment = parseSelectedEquipment(payload?.equipment);
    if (!selectedEquipment) {
        return NextResponse.json({
            success: false,
            reason: 'validation_failed',
        }, { status: 400 });
    }

    const promoCode = getEligiblePromoCode(booking.data.promoCode, eventDetails.data.eventDate);
    if (booking.data.promoCode && !promoCode) {
        return NextResponse.json({ success: false, reason: 'invalid_promo_code' }, { status: 400 });
    }

    const priceBreakdown = calculatePriceBreakdown(
        selectedEquipment,
        equipmentData.equipment as Record<string, EquipmentItem[]>,
        eventDetails.data.eventDate,
        promoCode,
    );

    if (getBudgetWarning(priceBreakdown.total, eventDetails.data.budgetRange) === 'You are over budget') {
        return NextResponse.json({ success: false, reason: 'over_budget' }, { status: 400 });
    }

    return NextResponse.json({
        success: true,
        referenceCode: createBookingReference(new Date()),
        total: priceBreakdown.total,
    });
}

function parseEventDetails(value: unknown) {
    if (!value || typeof value !== 'object') {
        return eventDetailsSchema.safeParse(value);
    }

    const details = value as Record<string, unknown>;
    return eventDetailsSchema.safeParse({
        ...details,
        eventDate: typeof details.eventDate === 'string' ? new Date(details.eventDate) : details.eventDate,
    });
}

function parseSelectedEquipment(value: unknown): Record<string, number> | null {
    if (!value || typeof value !== 'object') {
        return null;
    }

    const selectedEquipment = (value as { selectedEquipment?: unknown }).selectedEquipment;
    if (!selectedEquipment || typeof selectedEquipment !== 'object') {
        return null;
    }

    const entries = Object.entries(selectedEquipment);
    if (entries.some(([, quantity]) => typeof quantity !== 'number' || !Number.isInteger(quantity) || quantity < 0)) {
        return null;
    }

    return Object.fromEntries(entries) as Record<string, number>;
}

function getEligiblePromoCode(code: string | undefined, eventDate: Date) {
    if (!code) {
        return undefined;
    }

    const promoCode = pricingRulesData.promoCodes.find((promo) => promo.code === code.toUpperCase());
    if (!promoCode) {
        return undefined;
    }

    if ('validUntil' in promoCode && new Date(`${promoCode.validUntil}T23:59:59.999Z`) < new Date()) {
        return undefined;
    }

    if (Array.isArray(promoCode.validDays) && !promoCode.validDays.includes(DAY_NAMES[eventDate.getDay()])) {
        return undefined;
    }

    return 'discountPercentage' in promoCode
        ? { discountPercentage: promoCode.discountPercentage }
        : { discountAmount: promoCode.discountAmount };
}

function createBookingReference(date: Date): string {
    const datePart = [date.getFullYear(), date.getMonth() + 1, date.getDate()]
        .map((value) => String(value).padStart(2, '0'))
        .join('');
    const randomPart = String(Math.floor(Math.random() * 10000)).padStart(4, '0');

    return `EVT-${datePart}-${randomPart}`;
}

function delay(milliseconds: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, milliseconds));
}
