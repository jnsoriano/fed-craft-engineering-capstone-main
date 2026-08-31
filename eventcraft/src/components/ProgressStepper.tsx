// ABOUTME: Displays the EventCraft two-step booking progress with an accessible current-step announcement.

import { Check } from 'lucide-react';

const steps = ['Event Details', 'Review'];

interface ProgressStepperProps {
    currentStep: 1 | 2;
}

export function ProgressStepper({ currentStep }: ProgressStepperProps) {
    return (
        <nav aria-label="Booking progress" className="hidden items-center gap-4 md:flex">
            {steps.map((step, index) => {
                const stepNumber = (index + 1) as 1 | 2;
                const isComplete = stepNumber < currentStep;
                const isCurrent = stepNumber === currentStep;

                return (
                    <div className="flex items-center gap-4" key={step}>
                        {index > 0 && <div aria-hidden="true" className="h-px w-8 bg-outline-variant" />}
                        <div className="flex items-center gap-2">
                            <span
                                aria-current={isCurrent ? 'step' : undefined}
                                aria-label={isComplete ? `${step} completed` : isCurrent ? `Step ${stepNumber} of 2: ${step}` : undefined}
                                className={`flex size-8 items-center justify-center rounded-full border font-bold ${isComplete ? 'border-secondary bg-secondary text-secondary-foreground' : isCurrent ? 'border-2 border-primary text-primary' : 'border-outline-variant text-outline'}`}
                            >
                                {isComplete ? <Check aria-hidden="true" className="size-4" /> : stepNumber}
                            </span>
                            <span className={isCurrent ? 'font-semibold text-primary' : 'text-on-surface-variant'}>{step}</span>
                        </div>
                    </div>
                );
            })}
            <span aria-live="polite" className="sr-only">Step {currentStep} of 2: {steps[currentStep - 1]}</span>
        </nav>
    );
}
