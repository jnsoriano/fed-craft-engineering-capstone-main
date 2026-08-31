import { beforeEach, describe, expect, it, vi } from 'vitest';
import { POST } from '../route';

const validPayload = {
    eventDetails: {
        eventType: 'wedding-reception',
        eventName: 'Jordan and Casey Wedding',
        eventDescription: '',
        eventDate: '2026-09-14T00:00:00.000Z',
        startTime: '16:00',
        endTime: '20:00',
        expectedGuests: 120,
        budgetRange: 1000,
    },
    equipment: {
        selectedEquipment: { 'projector-screen': 1 },
    },
    booking: {
        contactName: 'Jordan Lee',
        email: 'jordan@example.com',
        phone: '+61 412 345 678',
        companyOrganization: '',
        specialRequests: '',
        termsAccepted: true,
        promoCode: '',
    },
};

function postBooking(payload: unknown): Promise<Response> {
    return POST(new Request('http://localhost/api/booking', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify(payload),
    }));
}

describe('POST /api/booking', () => {
    beforeEach(() => {
        vi.useFakeTimers();
        vi.setSystemTime(new Date('2026-08-31T12:00:00.000Z'));
    });

    it('accepts a valid booking and returns a formatted reference code', async () => {
        const responsePromise = postBooking(validPayload);
        await vi.advanceTimersByTimeAsync(600);
        const response = await responsePromise;
        const body = await response.json();

        expect(response.status).toBe(200);
        expect(body).toMatchObject({ success: true });
        expect(body.referenceCode).toMatch(/^EVT-20260831-\d{4}$/);
    });

    it('rejects a payload that fails field validation', async () => {
        const responsePromise = postBooking({
            ...validPayload,
            booking: { ...validPayload.booking, email: 'invalid-email' },
        });
        await vi.advanceTimersByTimeAsync(600);
        const response = await responsePromise;

        expect(response.status).toBe(400);
        await expect(response.json()).resolves.toMatchObject({
            success: false,
            reason: 'validation_failed',
        });
    });

    it('rejects a booking whose recomputed total exceeds its budget', async () => {
        const responsePromise = postBooking({
            ...validPayload,
            equipment: { selectedEquipment: { 'projector-screen': 10 } },
        });
        await vi.advanceTimersByTimeAsync(600);
        const response = await responsePromise;

        expect(response.status).toBe(400);
        await expect(response.json()).resolves.toMatchObject({
            success: false,
            reason: 'over_budget',
        });
    });

    it('rejects an unknown promo code', async () => {
        const responsePromise = postBooking({
            ...validPayload,
            booking: { ...validPayload.booking, promoCode: 'NOTREAL' },
        });
        await vi.advanceTimersByTimeAsync(600);
        const response = await responsePromise;

        expect(response.status).toBe(400);
        await expect(response.json()).resolves.toMatchObject({
            success: false,
            reason: 'invalid_promo_code',
        });
    });

    it('accepts a valid promo code and returns the server-computed total', async () => {
        const responsePromise = postBooking({
            ...validPayload,
            booking: { ...validPayload.booking, promoCode: 'EARLYBIRD' },
        });
        await vi.advanceTimersByTimeAsync(600);
        const response = await responsePromise;
        const body = await response.json();

        expect(response.status).toBe(200);
        expect(body).toMatchObject({ success: true, total: 148.5 });
    });
});
