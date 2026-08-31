// ABOUTME: Serves the EventCraft event type reference data from the local mock dataset.

import { NextResponse } from 'next/server';
import eventTypesData from '@/lib/mock-data/event-types.json';

export async function GET() {
    return NextResponse.json(eventTypesData);
}
