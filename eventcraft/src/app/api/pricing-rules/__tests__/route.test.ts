import { describe, expect, it } from 'vitest';
import pricingRulesData from '@/lib/mock-data/pricing-rules.json';
import { GET } from '../route';

describe('GET /api/pricing-rules', () => {
    it('returns the pricing rules mock data', async () => {
        const response = await GET();

        expect(response.status).toBe(200);
        await expect(response.json()).resolves.toEqual(pricingRulesData);
    });
});
