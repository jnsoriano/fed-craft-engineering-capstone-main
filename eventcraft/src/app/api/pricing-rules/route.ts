// ABOUTME: Serves EventCraft pricing rules and promotional code data from the local mock dataset.

import { NextResponse } from 'next/server';
import pricingRulesData from '@/lib/mock-data/pricing-rules.json';

export async function GET() {
    return NextResponse.json(pricingRulesData);
}
