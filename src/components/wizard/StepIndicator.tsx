import clsx from 'clsx';
import { Check } from 'lucide-react';

export interface Step {
  title: string;
  description?: string;
}

export interface StepIndicatorProps {
  /** Array of step configurations */
  steps: Step[];
  /** Current step index (0-based) */
  currentStep: number;
}

/**
 * Progress indicator showing step dots and current step title.
 * Displays completed, current, and upcoming steps visually.
 */
export function StepIndicator({ steps, currentStep }: StepIndicatorProps) {
  const currentStepData = steps[currentStep];

  return (
    <div className="w-full">
      {/* Step title and number */}
      <div className="mb-6 text-center">
        <p className="text-sm font-medium text-gray-500">
          Step {currentStep + 1} of {steps.length}
        </p>
        <h2 className="mt-1 text-xl font-bold text-gray-900">
          {currentStepData?.title ?? `Step ${currentStep + 1}`}
        </h2>
        {currentStepData?.description && (
          <p className="mt-1 text-sm text-gray-500">{currentStepData.description}</p>
        )}
      </div>

      {/* Progress dots */}
      <div className="flex items-center justify-center gap-2">
        {steps.map((step, index) => {
          const isCompleted = index < currentStep;
          const isCurrent = index === currentStep;

          return (
            <div key={index} className="flex items-center">
              {/* Step dot */}
              <div
                className={clsx(
                  'flex h-8 w-8 items-center justify-center rounded-full transition-all duration-200',
                  {
                    'bg-blue-600 text-white': isCompleted || isCurrent,
                    'bg-gray-200 text-gray-400': !isCompleted && !isCurrent,
                  }
                )}
                title={step.title}
              >
                {isCompleted ? (
                  <Check className="h-4 w-4" />
                ) : (
                  <span className="text-sm font-semibold">{index + 1}</span>
                )}
              </div>

              {/* Connector line (not after last step) */}
              {index < steps.length - 1 && (
                <div
                  className={clsx('mx-1 h-0.5 w-8 transition-colors duration-200', {
                    'bg-blue-600': index < currentStep,
                    'bg-gray-200': index >= currentStep,
                  })}
                />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
