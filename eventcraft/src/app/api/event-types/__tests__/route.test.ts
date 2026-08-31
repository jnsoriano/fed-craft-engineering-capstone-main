import { describe, expect, it } from 'vitest';
import eventTypesData from '@/lib/mock-data/event-types.json';
import { GET } from '../route';

describe('GET /api/event-types', () => {
    it('returns the event types mock data', async () => {
        const response = await GET();

        expect(response.status).toBe(200);
        await expect(response.json()).resolves.toEqual(eventTypesData);
    });
});
