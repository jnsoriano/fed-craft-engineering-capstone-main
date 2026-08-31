import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import {
    bookingContactSchema,
    eventDetailsSchema,
    getBudgetWarning,
} from '../validation';

const validEventDetails = {
    eventType: 'wedding-reception',
    eventName: 'Jordan and Casey Wedding',
    eventDescription: 'An evening reception.',
    eventDate: new Date('2026-09-14T12:00:00'),
    startTime: '16:00',
    endTime: '20:00',
    expectedGuests: 120,
    budgetRange: 10000,
};

const validBookingContact = {
    contactName: 'Jordan Lee',
    email: 'jordan@example.com',
    phone: '+61 412 345 678',
    companyOrganization: '',
    specialRequests: '',
    termsAccepted: true,
    promoCode: '',
};

describe('eventDetailsSchema', () => {
    beforeEach(() => {
        vi.useFakeTimers();
        vi.setSystemTime(new Date('2026-08-31T12:00:00'));
    });

    afterEach(() => {
        vi.useRealTimers();
    });

    it('accepts event details that meet every rule', () => {
        expect(eventDetailsSchema.safeParse(validEventDetails).success).toBe(true);
    });

    it('rejects an event name shorter than three characters', () => {
        expect(eventDetailsSchema.safeParse({ ...validEventDetails, eventName: 'AB' }).success).toBe(false);
    });

    it('rejects a date fewer than fourteen days away', () => {
        expect(
            eventDetailsSchema.safeParse({
                ...validEventDetails,
                eventDate: new Date('2026-09-13T12:00:00'),
            }).success,
        ).toBe(false);
    });

    it('requires twenty-one days notice for events over 200 guests', () => {
        expect(
            eventDetailsSchema.safeParse({
                ...validEventDetails,
                expectedGuests: 201,
                eventDate: new Date('2026-09-20T12:00:00'),
            }).success,
        ).toBe(false);
    });

    it('allows fourteen days notice for events of 200 guests', () => {
        expect(
            eventDetailsSchema.safeParse({
                ...validEventDetails,
                expectedGuests: 200,
                eventDate: new Date('2026-09-14T12:00:00'),
            }).success,
        ).toBe(true);
    });

    it('rejects an end time that is not after the start time', () => {
        expect(
            eventDetailsSchema.safeParse({ ...validEventDetails, endTime: '16:00' }).success,
        ).toBe(false);
    });

    it('rejects a duration outside the two to twelve hour range', () => {
        expect(
            eventDetailsSchema.safeParse({ ...validEventDetails, endTime: '17:00' }).success,
        ).toBe(false);
        expect(
            eventDetailsSchema.safeParse({ ...validEventDetails, endTime: '05:00' }).success,
        ).toBe(false);
    });

    it('enforces guest and budget boundaries', () => {
        expect(eventDetailsSchema.safeParse({ ...validEventDetails, expectedGuests: 9 }).success).toBe(false);
        expect(eventDetailsSchema.safeParse({ ...validEventDetails, expectedGuests: 501 }).success).toBe(false);
        expect(eventDetailsSchema.safeParse({ ...validEventDetails, budgetRange: 999 }).success).toBe(false);
        expect(eventDetailsSchema.safeParse({ ...validEventDetails, budgetRange: 100001 }).success).toBe(false);
    });
});

describe('bookingContactSchema', () => {
    it('accepts valid booking contact details', () => {
        expect(bookingContactSchema.safeParse(validBookingContact).success).toBe(true);
    });

    it('rejects invalid email, phone, and unaccepted terms', () => {
        expect(bookingContactSchema.safeParse({ ...validBookingContact, email: 'invalid' }).success).toBe(false);
        expect(bookingContactSchema.safeParse({ ...validBookingContact, phone: 'not-a-phone' }).success).toBe(false);
        expect(bookingContactSchema.safeParse({ ...validBookingContact, termsAccepted: false }).success).toBe(false);
    });

    it('rejects special requests longer than 1000 characters', () => {
        expect(
            bookingContactSchema.safeParse({
                ...validBookingContact,
                specialRequests: 'a'.repeat(1001),
            }).success,
        ).toBe(false);
    });
});

describe('getBudgetWarning', () => {
    it('returns no warning below 80% of the budget', () => {
        expect(getBudgetWarning(79, 100)).toBeNull();
    });

    it('warns when spend is 80% to 100% of the budget', () => {
        expect(getBudgetWarning(80, 100)).toBe('You are approaching your budget limit');
        expect(getBudgetWarning(100, 100)).toBe('You are approaching your budget limit');
    });

    it('warns when spend exceeds the budget', () => {
        expect(getBudgetWarning(101, 100)).toBe('You are over budget');
    });
});
