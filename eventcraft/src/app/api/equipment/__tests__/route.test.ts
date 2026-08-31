import { describe, expect, it } from 'vitest';
import equipmentData from '@/lib/mock-data/equipment.json';
import { GET } from '../route';

describe('GET /api/equipment', () => {
    it('returns the equipment mock data', async () => {
        const response = await GET();

        expect(response.status).toBe(200);
        await expect(response.json()).resolves.toEqual(equipmentData);
    });
});
