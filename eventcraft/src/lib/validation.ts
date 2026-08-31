// ABOUTME: Defines booking form validation schemas and non-blocking budget warnings.

import { z } from 'zod';

const MINIMUM_EVENT_NOTICE_DAYS = 14;
const LARGE_EVENT_NOTICE_DAYS = 21;
const LARGE_EVENT_GUEST_COUNT = 200;
const MINIMUM_EVENT_DURATION_HOURS = 2;
const MAXIMUM_EVENT_DURATION_HOURS = 12;
const PHONE_PATTERN = /^[+]?[(]?[0-9]{1,4}[)]?[0-9\s.-]{6,}$/;

export const eventDetailsSchema = z
    .object({
        eventType: z.string({ error: 'Select an event type.' }).min(1, 'Select an event type.'),
        eventName: z.string().min(3, 'Event name must be at least 3 characters.').max(100, 'Event name must be 100 characters or fewer.'),
        eventDescription: z.string().max(500, 'Event description must be 500 characters or fewer.').optional(),
        eventDate: z.date(),
        startTime: z.string().min(1, 'Select a start time.'),
        endTime: z.string().min(1, 'Select an end time.'),
        expectedGuests: z.number().int().min(10, 'At least 10 guests are required.').max(500, 'At most 500 guests are allowed.'),
        budgetRange: z.number().min(1000, 'Budget must be at least $1,000.').max(100000, 'Budget must be $100,000 or less.'),
    })
    .superRefine((details, context) => {
        const requiredNoticeDays = details.expectedGuests > LARGE_EVENT_GUEST_COUNT
            ? LARGE_EVENT_NOTICE_DAYS
            : MINIMUM_EVENT_NOTICE_DAYS;
        const earliestDate = new Date();
        earliestDate.setHours(0, 0, 0, 0);
        earliestDate.setDate(earliestDate.getDate() + requiredNoticeDays);

        if (details.eventDate < earliestDate) {
            context.addIssue({
                code: 'custom',
                path: ['eventDate'],
                message: `Events require at least ${requiredNoticeDays} days notice.`,
            });
        }

        const durationHours = calculateDurationHours(details.startTime, details.endTime);
        if (durationHours === null || durationHours < MINIMUM_EVENT_DURATION_HOURS || durationHours > MAXIMUM_EVENT_DURATION_HOURS) {
            context.addIssue({
                code: 'custom',
                path: ['endTime'],
                message: 'Event duration must be between 2 and 12 hours, ending after its start time.',
            });
        }
    });

export const bookingContactSchema = z.object({
    contactName: z.string().min(1, 'Enter a contact name.'),
    email: z.string().min(1, 'Enter an email address.').email('Enter a valid email address.'),
    phone: z.string().min(1, 'Enter a phone number.').regex(PHONE_PATTERN, 'Enter a valid phone number.'),
    companyOrganization: z.string().optional(),
    specialRequests: z.string().max(1000, 'Special requests must be 1000 characters or fewer.').optional(),
    termsAccepted: z.literal(true, { error: 'Accept the terms and conditions to continue.' }),
    promoCode: z.string().optional(),
});

export function getBudgetWarning(currentSpend: number, budget: number): string | null {
    if (currentSpend > budget) {
        return 'You are over budget';
    }

    if (currentSpend >= budget * 0.8) {
        return 'You are approaching your budget limit';
    }

    return null;
}

function calculateDurationHours(startTime: string, endTime: string): number | null {
    const startMinutes = toMinutes(startTime);
    const endMinutes = toMinutes(endTime);

    if (startMinutes === null || endMinutes === null || endMinutes <= startMinutes) {
        return null;
    }

    return (endMinutes - startMinutes) / 60;
}

function toMinutes(time: string): number | null {
    const match = /^(\d{2}):(\d{2})$/.exec(time);
    if (!match) {
        return null;
    }

    const hours = Number(match[1]);
    const minutes = Number(match[2]);
    if (hours > 23 || minutes > 59) {
        return null;
    }

    return hours * 60 + minutes;
}
