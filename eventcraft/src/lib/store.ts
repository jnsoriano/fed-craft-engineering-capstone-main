// ABOUTME: Holds the current EventCraft wizard state and translates it to its persisted storage shape.

import { create } from 'zustand';
import type {
    BookingContactState,
    EquipmentState,
    EventDetailsState,
    WizardState,
} from '@/types/eventcraft';

export interface PersistedWizardState {
    version: 1;
    lastUpdated: string;
    currentStep: 1 | 2;
    eventDetails: Omit<EventDetailsState, 'eventDate'> & { eventDate: string | null };
    equipment: EquipmentState;
    booking: BookingContactState;
}

interface WizardStore extends WizardState {
    setEventDetails: (details: Partial<EventDetailsState>) => void;
    setEquipmentQuantity: (equipmentId: string, quantity: number) => void;
    setBookingContact: (contact: Partial<BookingContactState>) => void;
    setCurrentStep: (step: 1 | 2) => void;
    hydrate: (state: WizardState) => void;
    reset: () => void;
}

export const initialWizardState: WizardState = {
    currentStep: 1,
    eventDetails: {
        eventType: null,
        eventName: '',
        eventDescription: '',
        eventDate: null,
        startTime: '',
        endTime: '',
        expectedGuests: 10,
        budgetRange: 1000,
    },
    equipment: { selectedEquipment: {} },
    booking: {
        contactName: '',
        email: '',
        phone: '',
        companyOrganization: '',
        specialRequests: '',
        termsAccepted: false,
        promoCode: '',
    },
};

export const useWizardStore = create<WizardStore>((set) => ({
    ...initialWizardState,
    setEventDetails: (details) => set((state) => ({
        eventDetails: { ...state.eventDetails, ...details },
    })),
    setEquipmentQuantity: (equipmentId, quantity) => set((state) => {
        const selectedEquipment = { ...state.equipment.selectedEquipment };
        if (quantity <= 0) {
            delete selectedEquipment[equipmentId];
        } else {
            selectedEquipment[equipmentId] = quantity;
        }

        return { equipment: { selectedEquipment } };
    }),
    setBookingContact: (contact) => set((state) => ({
        booking: { ...state.booking, ...contact },
    })),
    setCurrentStep: (currentStep) => set({ currentStep }),
    hydrate: (state) => set(state),
    reset: () => set(initialWizardState),
}));

export function toPersistedWizardState(state: WizardState): PersistedWizardState {
    return {
        version: 1,
        lastUpdated: new Date().toISOString(),
        currentStep: state.currentStep,
        eventDetails: {
            ...state.eventDetails,
            eventDate: state.eventDetails.eventDate?.toISOString() ?? null,
        },
        equipment: state.equipment,
        booking: state.booking,
    };
}

export function fromPersistedWizardState(value: unknown): WizardState | null {
    if (!isPersistedWizardState(value)) {
        return null;
    }

    const eventDate = value.eventDetails.eventDate;
    if (eventDate !== null && Number.isNaN(new Date(eventDate).getTime())) {
        return null;
    }

    return {
        currentStep: value.currentStep,
        eventDetails: {
            ...value.eventDetails,
            eventDate: eventDate ? new Date(eventDate) : null,
        },
        equipment: value.equipment,
        booking: value.booking,
    };
}

function isPersistedWizardState(value: unknown): value is PersistedWizardState {
    if (!value || typeof value !== 'object') {
        return false;
    }

    const state = value as Partial<PersistedWizardState>;
    return state.version === 1
        && (state.currentStep === 1 || state.currentStep === 2)
        && !!state.eventDetails
        && !!state.equipment
        && !!state.booking;
}
