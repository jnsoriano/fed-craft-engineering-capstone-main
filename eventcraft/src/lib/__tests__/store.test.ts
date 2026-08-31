import { beforeEach, describe, expect, it } from 'vitest';
import {
    fromPersistedWizardState,
    initialWizardState,
    toPersistedWizardState,
    useWizardStore,
} from '../store';

describe('useWizardStore', () => {
    beforeEach(() => {
        useWizardStore.getState().reset();
    });

    it('updates each wizard data slice', () => {
        const eventDate = new Date('2026-10-01T00:00:00.000Z');

        useWizardStore.getState().setEventDetails({
            eventType: 'wedding-reception',
            eventName: 'Jordan and Casey Wedding',
            eventDate,
            expectedGuests: 120,
        });
        useWizardStore.getState().setEquipmentQuantity('projector-screen', 2);
        useWizardStore.getState().setBookingContact({ contactName: 'Jordan Lee' });
        useWizardStore.getState().setCurrentStep(2);

        const state = useWizardStore.getState();
        expect(state.eventDetails).toMatchObject({
            eventType: 'wedding-reception',
            eventName: 'Jordan and Casey Wedding',
            eventDate,
            expectedGuests: 120,
        });
        expect(state.equipment.selectedEquipment).toEqual({ 'projector-screen': 2 });
        expect(state.booking.contactName).toBe('Jordan Lee');
        expect(state.currentStep).toBe(2);
    });

    it('removes equipment when its quantity is set to zero', () => {
        useWizardStore.getState().setEquipmentQuantity('wireless-mic', 1);
        useWizardStore.getState().setEquipmentQuantity('wireless-mic', 0);

        expect(useWizardStore.getState().equipment.selectedEquipment).toEqual({});
    });

    it('resets all wizard data to its initial state', () => {
        useWizardStore.getState().setEventDetails({ eventName: 'Draft event' });
        useWizardStore.getState().setEquipmentQuantity('wireless-mic', 2);
        useWizardStore.getState().setBookingContact({ contactName: 'Jordan Lee' });
        useWizardStore.getState().setCurrentStep(2);

        useWizardStore.getState().reset();

        expect(useWizardStore.getState()).toMatchObject(initialWizardState);
    });
});

describe('wizard persistence serialization', () => {
    it('serializes a snapshot with the storage schema version and timestamp', () => {
        const snapshot = toPersistedWizardState({
            ...initialWizardState,
            eventDetails: {
                ...initialWizardState.eventDetails,
                eventDate: new Date('2026-10-01T00:00:00.000Z'),
            },
        });

        expect(snapshot).toMatchObject({
            version: 1,
            currentStep: 1,
            eventDetails: { eventDate: '2026-10-01T00:00:00.000Z' },
        });
        expect(new Date(snapshot.lastUpdated).toString()).not.toBe('Invalid Date');
    });

    it('hydrates a valid persisted snapshot and restores event dates', () => {
        const hydrated = fromPersistedWizardState({
            version: 1,
            lastUpdated: '2026-08-31T12:00:00.000Z',
            currentStep: 2,
            eventDetails: {
                ...initialWizardState.eventDetails,
                eventName: 'Saved event',
                eventDate: '2026-10-01T00:00:00.000Z',
            },
            equipment: { selectedEquipment: { 'projector-screen': 1 } },
            booking: { ...initialWizardState.booking, contactName: 'Jordan Lee' },
        });

        expect(hydrated).toMatchObject({
            currentStep: 2,
            eventDetails: { eventName: 'Saved event' },
            equipment: { selectedEquipment: { 'projector-screen': 1 } },
            booking: { contactName: 'Jordan Lee' },
        });
        expect(hydrated?.eventDetails.eventDate).toEqual(new Date('2026-10-01T00:00:00.000Z'));
    });

    it('rejects snapshots with an unsupported schema version', () => {
        expect(fromPersistedWizardState({ version: 2 })).toBeNull();
    });
});
