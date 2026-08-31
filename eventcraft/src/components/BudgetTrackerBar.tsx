// ABOUTME: Displays current booking spend against the selected budget with accessible status feedback.

import { AlertTriangle, CheckCircle2, CircleAlert } from 'lucide-react';

interface BudgetTrackerBarProps {
    currentSpend: number;
    totalBudget: number;
}

export function BudgetTrackerBar({ currentSpend, totalBudget }: BudgetTrackerBarProps) {
    const percentage = totalBudget > 0 ? (currentSpend / totalBudget) * 100 : 0;
    const status = getBudgetStatus(percentage);
    const remaining = totalBudget - currentSpend;

    return (
        <section aria-label="Budget tracker" className="border-t border-outline-variant bg-surface-white p-4 shadow-[0_-4px_20px_rgba(0,0,0,0.05)]">
            <div className="mx-auto flex max-w-[1200px] flex-col items-center gap-4 md:flex-row">
                <div className="flex w-full justify-between md:block md:w-auto">
                    <span className="text-sm font-medium text-on-surface">Budget:</span>
                    <span className="ml-2 font-mono text-lg font-bold text-primary">${totalBudget.toLocaleString()}</span>
                </div>
                <div className="w-full flex-1">
                    <div className="h-2 overflow-hidden rounded-full bg-surface-container-high">
                        <div
                            data-testid="budget-progress"
                            className={`h-full ${status.colorClass}`}
                            style={{ width: `${Math.min(percentage, 100)}%` }}
                        />
                    </div>
                    <div className="mt-1 flex justify-between text-xs font-mono">
                        <span className="text-on-surface">Spend: ${currentSpend.toLocaleString()}</span>
                        <span aria-live="polite" className={`flex items-center gap-1 font-bold ${status.textClass}`}>
                            <status.Icon aria-hidden="true" className="size-3.5" />
                            {status.label} ({Math.round(percentage)}%)
                        </span>
                    </div>
                </div>
                <div className="hidden md:block">
                    <span className="text-sm font-medium text-on-surface">Remaining:</span>
                    <span className="ml-2 font-mono text-lg font-bold text-primary">${remaining.toLocaleString()}</span>
                </div>
            </div>
        </section>
    );
}

function getBudgetStatus(percentage: number) {
    if (percentage > 100) {
        return { label: 'Over budget', colorClass: 'bg-budget-danger', textClass: 'text-budget-danger', Icon: CircleAlert };
    }

    if (percentage >= 80) {
        return { label: 'Near budget', colorClass: 'bg-budget-warning', textClass: 'text-budget-warning', Icon: AlertTriangle };
    }

    return { label: 'Under budget', colorClass: 'bg-secondary', textClass: 'text-secondary', Icon: CheckCircle2 };
}
