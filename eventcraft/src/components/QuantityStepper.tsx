// ABOUTME: Controls the selected quantity for an EventCraft equipment item.

import { Minus, Plus } from 'lucide-react';
import type { EquipmentItem } from '@/types/eventcraft';

interface QuantityStepperProps {
    item: EquipmentItem;
    quantity: number;
    onQuantityChange: (quantity: number) => void;
    maximumQuantity?: number;
}

export function QuantityStepper({ item, quantity, onQuantityChange, maximumQuantity }: QuantityStepperProps) {
    const maxQuantity = maximumQuantity ?? item.maxQuantity;
    const cannotIncrease = maxQuantity !== undefined && quantity >= maxQuantity;

    return (
        <div className="flex items-center gap-2 rounded-sm border border-outline-variant p-1">
            <button
                type="button"
                aria-label={`Decrease ${item.name} quantity`}
                disabled={quantity <= 0}
                onClick={() => onQuantityChange(quantity - 1)}
                className="flex size-8 items-center justify-center rounded-sm text-on-surface-variant hover:bg-surface-container-low disabled:cursor-not-allowed disabled:opacity-40"
            >
                <Minus aria-hidden="true" className="size-4" />
            </button>
            <output aria-label={`${item.name} quantity`} className="w-6 text-center font-mono text-sm">{quantity}</output>
            <button
                type="button"
                aria-label={`Increase ${item.name} quantity`}
                disabled={cannotIncrease}
                onClick={() => onQuantityChange(quantity + 1)}
                className="flex size-8 items-center justify-center rounded-sm text-on-surface-variant hover:bg-surface-container-low disabled:cursor-not-allowed disabled:opacity-40"
            >
                <Plus aria-hidden="true" className="size-4" />
            </button>
        </div>
    );
}
