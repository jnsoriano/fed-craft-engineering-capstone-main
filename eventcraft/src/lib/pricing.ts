// ABOUTME: Computes the equipment price breakdown (subtotal, weekend surcharge, promo discount, GST, total).

import type { EquipmentItem, PriceBreakdown } from '@/types/eventcraft';
import { pricingRules } from './mock-data/pricing-rules.json';

const WEEKEND_DAYS = new Set(['Friday', 'Saturday', 'Sunday']);
const DAY_NAMES = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

interface PromoDiscount {
    discountPercentage?: number;
    discountAmount?: number;
}

export function calculatePriceBreakdown(
    selectedEquipment: Record<string, number>,
    catalog: Record<string, EquipmentItem[]>,
    eventDate: Date,
    promoDiscount?: PromoDiscount,
): PriceBreakdown {
    const itemsById = new Map<string, EquipmentItem>();
    for (const category of Object.values(catalog)) {
        for (const item of category) {
            itemsById.set(item.id, item);
        }
    }

    const items: Record<string, number> = {};
    let equipmentSubtotal = 0;
    for (const [id, quantity] of Object.entries(selectedEquipment)) {
        const item = itemsById.get(id);
        if (!item) continue;
        items[id] = quantity;
        equipmentSubtotal += item.price * quantity;
    }

    const dayName = DAY_NAMES[eventDate.getDay()];
    const isWeekend = WEEKEND_DAYS.has(dayName);
    const weekendSurcharge = isWeekend
        ? round(equipmentSubtotal * (pricingRules.weekendSurcharge.percentage / 100))
        : 0;

    let subtotal = equipmentSubtotal + weekendSurcharge;

    if (promoDiscount?.discountPercentage) {
        subtotal = round(subtotal * (1 - promoDiscount.discountPercentage / 100));
    } else if (promoDiscount?.discountAmount) {
        subtotal = round(Math.max(0, subtotal - promoDiscount.discountAmount));
    }

    const gst = round(subtotal * (pricingRules.gst.percentage / 100));
    const total = round(subtotal + gst);

    return {
        equipment: { items, subtotal: equipmentSubtotal },
        weekendSurcharge,
        subtotal,
        gst,
        total,
    };
}

function round(value: number): number {
    return Math.round(value * 100) / 100;
}
