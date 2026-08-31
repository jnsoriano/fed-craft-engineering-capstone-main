// ABOUTME: Renders an event type as a selectable card in the Event Details step.

import { CheckCircle2, Heart, PartyPopper, Rocket, School, BriefcaseBusiness } from 'lucide-react';
import type { EventType } from '@/types/eventcraft';

interface EventTypeCardProps {
    eventType: EventType;
    selected: boolean;
    onSelect: (eventTypeId: string) => void;
}

const icons = {
    work: BriefcaseBusiness,
    favorite: Heart,
    cake: PartyPopper,
    rocket_launch: Rocket,
    local_activity: PartyPopper,
    school: School,
    Heart,
};

export function EventTypeCard({ eventType, selected, onSelect }: EventTypeCardProps) {
    const Icon = icons[eventType.icon as keyof typeof icons] ?? PartyPopper;

    return (
        <button
            type="button"
            aria-pressed={selected}
            aria-label={`Select ${eventType.name}`}
            onClick={() => onSelect(eventType.id)}
            className={`relative flex min-h-36 flex-col items-center justify-center gap-4 rounded-lg border bg-surface-white p-6 text-center transition-colors hover:border-primary/50 hover:bg-surface-container-low ${selected ? 'border-2 border-primary text-primary' : 'border-outline-variant text-on-surface-variant'}`}
        >
            {selected && <CheckCircle2 aria-hidden="true" className="absolute right-2 top-2 size-5 text-primary" />}
            <Icon aria-hidden="true" className="size-8" />
            <span className="text-sm font-semibold">{eventType.name}</span>
        </button>
    );
}
