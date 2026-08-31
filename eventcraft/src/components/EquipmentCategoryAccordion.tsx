// ABOUTME: Groups selectable equipment items under a collapsible event equipment category.

'use client';

import { useState } from 'react';
import { AudioLines, ChevronDown, Layers3, Lightbulb, PartyPopper, Armchair } from 'lucide-react';
import { QuantityStepper } from './QuantityStepper';
import type { EquipmentItem } from '@/types/eventcraft';

interface EquipmentCategoryAccordionProps {
    category: string;
    icon: string;
    items: EquipmentItem[];
    quantities: Record<string, number>;
    recommendedEquipmentIds: string[];
    onQuantityChange: (equipmentId: string, quantity: number) => void;
}

const icons = {
    AudioLines,
    celebration: PartyPopper,
    layers: Layers3,
    lightbulb: Lightbulb,
    chair: Armchair,
};

export function EquipmentCategoryAccordion({
    category,
    icon,
    items,
    quantities,
    recommendedEquipmentIds,
    onQuantityChange,
}: EquipmentCategoryAccordionProps) {
    const [isOpen, setIsOpen] = useState(false);
    const Icon = icons[icon as keyof typeof icons] ?? AudioLines;

    return (
        <section className="overflow-hidden rounded-lg border border-outline-variant bg-surface-white">
            <button
                type="button"
                aria-expanded={isOpen}
                onClick={() => setIsOpen((current) => !current)}
                className="flex w-full items-center justify-between p-6 text-left hover:bg-surface-container-low"
            >
                <span className="flex items-center gap-2 font-heading text-xl font-semibold text-primary">
                    <Icon aria-hidden="true" className="size-5" />
                    {category}
                </span>
                <ChevronDown aria-hidden="true" className={`size-5 text-on-surface-variant transition-transform ${isOpen ? 'rotate-180' : ''}`} />
            </button>
            {isOpen && (
                <div className="border-t border-outline-variant px-6 py-4">
                    {items.map((item) => (
                        <div className="flex items-center justify-between gap-4 border-b border-outline-variant py-4 last:border-0" key={item.id}>
                            <div>
                                <p className="font-semibold text-primary">{item.name}</p>
                                <p className="text-xs text-on-surface-variant">{item.unit} · ${item.price}</p>
                                {recommendedEquipmentIds.includes(item.id) && (
                                    <span className="mt-2 inline-flex items-center rounded-sm bg-surface-container-high px-2 py-0.5 text-xs text-on-surface-variant">Recommended</span>
                                )}
                            </div>
                            <QuantityStepper
                                item={item}
                                quantity={quantities[item.id] ?? 0}
                                maximumQuantity={item.maxQuantity}
                                onQuantityChange={(quantity) => onQuantityChange(item.id, quantity)}
                            />
                        </div>
                    ))}
                </div>
            )}
        </section>
    );
}
