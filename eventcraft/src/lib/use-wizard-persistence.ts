// ABOUTME: Synchronizes the EventCraft wizard store with browser localStorage.

'use client';

import { useEffect, useRef, useState } from 'react';
import useLocalStorageState from 'use-local-storage-state';
import { fromPersistedWizardState, toPersistedWizardState, useWizardStore } from './store';
import type { PersistedWizardState } from './store';

export const WIZARD_STORAGE_KEY = 'eventcraft_wizard_state';

export function useWizardPersistence(): boolean {
    const [persistedState, setPersistedState, { removeItem }] = useLocalStorageState<PersistedWizardState>(WIZARD_STORAGE_KEY);
    const hydrated = useRef(false);
    const [isHydrated, setIsHydrated] = useState(false);

    useEffect(() => {
        if (hydrated.current) {
            return;
        }

        const state = fromPersistedWizardState(readPersistedState(persistedState));
        if (state) {
            useWizardStore.getState().hydrate(state);
        }
        hydrated.current = true;
        setIsHydrated(true);
    }, [persistedState]);

    useEffect(() => {
        const unsubscribe = useWizardStore.subscribe((state) => {
            if (!hydrated.current) {
                return;
            }

            if (isInitialWizardState(state)) {
                removeItem();
                return;
            }

            setPersistedState(toPersistedWizardState(state));
        });

        return unsubscribe;
    }, [removeItem, setPersistedState]);

    return isHydrated;
}

function readPersistedState(fallback: PersistedWizardState | undefined): unknown {
    try {
        const storedValue = localStorage.getItem(WIZARD_STORAGE_KEY);
        return storedValue === null ? fallback : JSON.parse(storedValue);
    } catch {
        return fallback;
    }
}

function isInitialWizardState(state: ReturnType<typeof useWizardStore.getState>): boolean {
    return state.currentStep === 1
        && state.eventDetails.eventType === null
        && state.eventDetails.eventName === ''
        && state.eventDetails.eventDescription === ''
        && state.eventDetails.eventDate === null
        && state.eventDetails.startTime === ''
        && state.eventDetails.endTime === ''
        && state.eventDetails.expectedGuests === 10
        && state.eventDetails.budgetRange === 1000
        && Object.keys(state.equipment.selectedEquipment).length === 0
        && state.booking.contactName === ''
        && state.booking.email === ''
        && state.booking.phone === ''
        && state.booking.companyOrganization === ''
        && state.booking.specialRequests === ''
        && !state.booking.termsAccepted
        && state.booking.promoCode === '';
}
