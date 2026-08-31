// ABOUTME: Provides undo and redo controls for equipment selections in client components.

'use client';

import useUndo from 'use-undo';

export function useEquipmentHistory(initialEquipment: Record<string, number> = {}) {
    return useUndo(initialEquipment);
}