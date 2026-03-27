'use client';

interface StepIndicatorProps {
  steps: readonly string[];
  activeStep: number;
}

/**
 * 3-step progress indicator for the game flow (UX-001).
 * Shows Build Team → Arrange Order → Battle with visual state.
 *
 * Accessibility: uses aria-current="step" for the active step.
 */
export default function StepIndicator({
  steps,
  activeStep,
}: StepIndicatorProps) {
  return (
    <nav
      className="flex items-center justify-center gap-2 sm:gap-4 py-3 px-4"
      aria-label="Game progress"
    >
      {steps.map((label, index) => {
        const isActive = index === activeStep;
        const isCompleted = index < activeStep;

        return (
          <div key={label} className="flex items-center gap-2 sm:gap-4">
            {/* Step circle + label */}
            <div
              className="flex items-center gap-1.5 sm:gap-2"
              aria-current={isActive ? 'step' : undefined}
            >
              <div
                className={`
                  w-6 h-6 sm:w-7 sm:h-7 rounded-full flex items-center justify-center
                  text-[10px] sm:text-xs font-bold transition-colors
                  ${
                    isActive
                      ? 'bg-[var(--color-player1)] text-white'
                      : isCompleted
                        ? 'bg-green-600 text-white'
                        : 'bg-[var(--color-bg-secondary)] text-[var(--color-text-dim)] border border-[var(--color-border)]'
                  }
                `}
                aria-hidden="true"
              >
                {isCompleted ? '✓' : index + 1}
              </div>
              <span
                className={`
                  text-[10px] sm:text-xs font-semibold tracking-wide hidden sm:inline
                  ${
                    isActive
                      ? 'text-white'
                      : isCompleted
                        ? 'text-green-400'
                        : 'text-[var(--color-text-dim)]'
                  }
                `}
              >
                {label}
              </span>
            </div>

            {/* Connector line (not after last step) */}
            {index < steps.length - 1 && (
              <div
                className={`
                  w-8 sm:w-12 h-0.5 rounded
                  ${
                    index < activeStep
                      ? 'bg-green-600'
                      : 'bg-[var(--color-border)]'
                  }
                `}
                aria-hidden="true"
              />
            )}
          </div>
        );
      })}
    </nav>
  );
}
