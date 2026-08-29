// Core Types for EventCraft (2-Step Flow)

export interface EventType {
    id: string;
    name: string;
    icon: string;
    minGuests: number;
    maxGuests: number;
    typicalDurationHours: { min: number; max: number };
    complexity: 'low' | 'medium' | 'high';
    description: string;
    suggestedBudgetPerGuest: { min: number; max: number };
    recommendedEquipment: string[];
}

export interface EquipmentItem {
    id: string;
    name: string;
    description: string;
    price: number;
    unit: string;
    maxQuantity?: number;
    maxQuantityRule?: 'tables' | 'guests';
}

// Form State Types (2-Step Flow)
export interface EventDetailsState {
    eventType: string | null;
    eventName: string;
    eventDescription: string;
    eventDate: Date | null;
    startTime: string;
    endTime: string;
    expectedGuests: number;
    budgetRange: number;
}

export interface EquipmentState {
    selectedEquipment: Record<string, number>; // equipmentId -> quantity
}

export interface BookingContactState {
    contactName: string;
    email: string;
    phone: string;
    companyOrganization: string;
    specialRequests: string;
    termsAccepted: boolean;
    promoCode: string;
}

export interface WizardState {
    currentStep: 1 | 2;
    eventDetails: EventDetailsState;
    equipment: EquipmentState;
    booking: BookingContactState;
}

// Pricing calculation types
export interface PriceBreakdown {
    equipment: {
        items: Record<string, number>;
        subtotal: number;
    };
    weekendSurcharge: number;
    subtotal: number;
    gst: number;
    total: number;
}