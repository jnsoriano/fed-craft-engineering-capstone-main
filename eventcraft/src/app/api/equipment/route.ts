// ABOUTME: Serves the EventCraft equipment reference data from the local mock dataset.

import { NextResponse } from 'next/server';
import equipmentData from '@/lib/mock-data/equipment.json';

export async function GET() {
    return NextResponse.json(equipmentData);
}
