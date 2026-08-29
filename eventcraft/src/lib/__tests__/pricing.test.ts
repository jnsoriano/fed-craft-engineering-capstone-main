import { describe, it, expect } from 'vitest';
import { calculatePriceBreakdown } from '../pricing';
import type { EquipmentItem } from '@/types/eventcraft';

const catalog: Record<string, EquipmentItem[]> = {
    audioVisual: [
        { id: 'projector-screen', name: 'Projector + Screen', description: '', price: 150, unit: 'per event' },
        { id: 'wireless-mic', name: 'Wireless Microphone', description: '', price: 75, unit: 'per event' },
    ],
};

const WEEKDAY = new Date('2026-09-02'); // Wednesday
const WEEKEND = new Date('2026-09-05'); // Saturday

describe('calculatePriceBreakdown', () => {
    it('returns all zeros when no equipment is selected', () => {
        const result = calculatePriceBreakdown({}, catalog, WEEKDAY);
        expect(result.equipment.subtotal).toBe(0);
        expect(result.weekendSurcharge).toBe(0);
        expect(result.subtotal).toBe(0);
        expect(result.gst).toBe(0);
        expect(result.total).toBe(0);
    });

    it('sums selected items by quantity on a weekday with no surcharge', () => {
        const result = calculatePriceBreakdown({ 'projector-screen': 2 }, catalog, WEEKDAY);
        expect(result.equipment.subtotal).toBe(300);
        expect(result.weekendSurcharge).toBe(0);
        expect(result.subtotal).toBe(300);
        expect(result.gst).toBe(30);
        expect(result.total).toBe(330);
    });

    it('applies a 15% weekend surcharge before GST', () => {
        const result = calculatePriceBreakdown({ 'projector-screen': 2 }, catalog, WEEKEND);
        expect(result.weekendSurcharge).toBe(45);
        expect(result.subtotal).toBe(345);
        expect(result.gst).toBe(34.5);
        expect(result.total).toBe(379.5);
    });

    it('applies a percentage promo code discount before GST', () => {
        const result = calculatePriceBreakdown(
            { 'projector-screen': 2 },
            catalog,
            WEEKDAY,
            { discountPercentage: 10 },
        );
        // subtotal 300 -> 10% off -> 270 -> gst 27 -> total 297
        expect(result.subtotal).toBe(270);
        expect(result.gst).toBe(27);
        expect(result.total).toBe(297);
    });

    it('applies a flat-amount promo code discount before GST', () => {
        const result = calculatePriceBreakdown(
            { 'projector-screen': 2 },
            catalog,
            WEEKDAY,
            { discountAmount: 50 },
        );
        // subtotal 300 -> -50 -> 250 -> gst 25 -> total 275
        expect(result.subtotal).toBe(250);
        expect(result.gst).toBe(25);
        expect(result.total).toBe(275);
    });

    it('ignores unknown equipment ids without crashing', () => {
        const result = calculatePriceBreakdown({ 'does-not-exist': 3 }, catalog, WEEKDAY);
        expect(result.equipment.subtotal).toBe(0);
        expect(result.total).toBe(0);
    });

    it('combines multiple items in the subtotal', () => {
        const result = calculatePriceBreakdown(
            { 'projector-screen': 1, 'wireless-mic': 2 },
            catalog,
            WEEKDAY,
        );
        expect(result.equipment.subtotal).toBe(300);
    });
});
