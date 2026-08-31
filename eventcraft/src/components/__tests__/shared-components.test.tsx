import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { BudgetTrackerBar } from '../BudgetTrackerBar';
import { EquipmentCategoryAccordion } from '../EquipmentCategoryAccordion';
import { EventTypeCard } from '../EventTypeCard';
import { ProgressStepper } from '../ProgressStepper';
import { QuantityStepper } from '../QuantityStepper';
import type { EquipmentItem, EventType } from '@/types/eventcraft';

const eventType: EventType = {
    id: 'wedding-reception',
    name: 'Wedding Reception',
    icon: 'Heart',
    minGuests: 30,
    maxGuests: 300,
    typicalDurationHours: { min: 5, max: 6 },
    complexity: 'high',
    description: 'Wedding celebrations and receptions',
    suggestedBudgetPerGuest: { min: 200, max: 500 },
    recommendedEquipment: [],
};

const equipmentItem: EquipmentItem = {
    id: 'projector-screen',
    name: 'Projector + Screen',
    description: 'HD projector with a 10ft screen',
    price: 150,
    unit: 'per event',
    maxQuantity: 2,
};

describe('ProgressStepper', () => {
    it('marks completed and current steps and announces the current step', () => {
        render(<ProgressStepper currentStep={2} />);

        expect(screen.getByText('Event Details')).toBeInTheDocument();
        expect(screen.getByText('Review')).toBeInTheDocument();
        expect(screen.getByLabelText('Event Details completed')).toBeInTheDocument();
        expect(screen.getByLabelText('Step 2 of 2: Review')).toHaveAttribute('aria-current', 'step');
        expect(screen.getByText('Step 2 of 2: Review')).toHaveAttribute('aria-live', 'polite');
    });
});

describe('BudgetTrackerBar', () => {
    it.each([
        [79, 'Under budget', 'bg-secondary'],
        [80, 'Near budget', 'bg-budget-warning'],
        [100, 'Near budget', 'bg-budget-warning'],
        [101, 'Over budget', 'bg-budget-danger'],
    ])('shows the correct status at %d%% spend', (spend, label, colorClass) => {
        render(<BudgetTrackerBar currentSpend={spend} totalBudget={100} />);

        expect(screen.getByText(new RegExp(label))).toBeInTheDocument();
        expect(screen.getByTestId('budget-progress')).toHaveClass(colorClass);
    });
});

describe('EventTypeCard', () => {
    it('calls onSelect when selected', async () => {
        const onSelect = vi.fn();
        const user = userEvent.setup();
        render(<EventTypeCard eventType={eventType} selected={false} onSelect={onSelect} />);

        await user.click(screen.getByRole('button', { name: /wedding reception/i }));

        expect(onSelect).toHaveBeenCalledWith(eventType.id);
    });
});

describe('QuantityStepper', () => {
    it('disables decrement at zero and increment at its maximum quantity', async () => {
        const onQuantityChange = vi.fn();
        const { rerender } = render(
            <QuantityStepper item={equipmentItem} quantity={0} onQuantityChange={onQuantityChange} />,
        );

        expect(screen.getByRole('button', { name: /decrease projector \+ screen quantity/i })).toBeDisabled();
        await userEvent.setup().click(screen.getByRole('button', { name: /increase projector \+ screen quantity/i }));
        expect(onQuantityChange).toHaveBeenCalledWith(1);

        rerender(<QuantityStepper item={equipmentItem} quantity={2} onQuantityChange={onQuantityChange} />);
        expect(screen.getByRole('button', { name: /increase projector \+ screen quantity/i })).toBeDisabled();
    });
});

describe('EquipmentCategoryAccordion', () => {
    it('reveals its quantity controls when expanded', async () => {
        const user = userEvent.setup();
        render(
            <EquipmentCategoryAccordion
                category="Audio/Visual"
                icon="AudioLines"
                items={[equipmentItem]}
                quantities={{}}
                onQuantityChange={vi.fn()}
                recommendedEquipmentIds={[]}
            />,
        );

        const trigger = screen.getByRole('button', { name: /audio\/visual/i });
        expect(trigger).toHaveAttribute('aria-expanded', 'false');
        await user.click(trigger);

        expect(trigger).toHaveAttribute('aria-expanded', 'true');
        expect(screen.getByText('Projector + Screen')).toBeInTheDocument();
    });
});
