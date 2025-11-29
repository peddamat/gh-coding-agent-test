import { useState, ReactNode, useCallback } from 'react';
import { ArrowLeft, ArrowRight, Check } from 'lucide-react';
import clsx from 'clsx';
import { StepIndicator, Step } from './StepIndicator';

export interface WizardContainerProps {
  /** Array of step configurations */
  steps: Step[];
  /** Render function for step content, receives current step index */
  children: (currentStep: number) => ReactNode;
  /** Called when wizard is completed (Finish clicked on final step) */
  onFinish?: () => void;
  /** Called when Back is clicked on first step (optional close/cancel) */
  onCancel?: () => void;
  /** Initial step index (default 0) */
  initialStep?: number;
}

/**
 * Wizard shell component with step indicators and navigation buttons.
 * Manages internal step state and provides Back/Next/Finish navigation.
 */
export function WizardContainer({
  steps,
  children,
  onFinish,
  onCancel,
  initialStep = 0,
}: WizardContainerProps) {
  const [currentStep, setCurrentStep] = useState(initialStep);

  const isFirstStep = currentStep === 0;
  const isLastStep = currentStep === steps.length - 1;

  const handleBack = useCallback(() => {
    if (isFirstStep) {
      onCancel?.();
    } else {
      setCurrentStep((prev) => prev - 1);
    }
  }, [isFirstStep, onCancel]);

  const handleNext = useCallback(() => {
    if (isLastStep) {
      onFinish?.();
    } else {
      setCurrentStep((prev) => prev + 1);
    }
  }, [isLastStep, onFinish]);

  return (
    <div className="flex min-h-[400px] flex-col rounded-2xl bg-white shadow-xl">
      {/* Header with step indicator */}
      <div className="border-b border-gray-100 bg-gradient-to-r from-gray-50 to-white px-6 py-6">
        <StepIndicator steps={steps} currentStep={currentStep} />
      </div>

      {/* Step content area */}
      <div className="flex-1 overflow-auto p-6">{children(currentStep)}</div>

      {/* Navigation footer */}
      <div className="border-t border-gray-100 bg-gray-50 px-6 py-4">
        <div className="flex items-center justify-between">
          {/* Back button */}
          <button
            type="button"
            onClick={handleBack}
            className={clsx(
              'inline-flex items-center gap-2 rounded-lg px-4 py-2.5 text-sm font-semibold transition-all duration-150',
              {
                'text-gray-600 hover:bg-gray-100 hover:text-gray-900': !isFirstStep,
                'text-gray-400 hover:bg-gray-100 hover:text-gray-600': isFirstStep && onCancel,
                'invisible': isFirstStep && !onCancel,
              }
            )}
          >
            <ArrowLeft className="h-4 w-4" />
            {isFirstStep ? 'Cancel' : 'Back'}
          </button>

          {/* Progress indicator (e.g., "1 / 4") */}
          <span className="text-sm text-gray-500">
            {currentStep + 1} / {steps.length}
          </span>

          {/* Next/Finish button */}
          <button
            type="button"
            onClick={handleNext}
            className="inline-flex items-center gap-2 rounded-lg bg-gradient-to-r from-blue-600 to-blue-700 px-5 py-2.5 text-sm font-semibold text-white shadow-md transition-all duration-150 hover:from-blue-500 hover:to-blue-600 hover:shadow-lg focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
          >
            {isLastStep ? (
              <>
                Finish
                <Check className="h-4 w-4" />
              </>
            ) : (
              <>
                Next
                <ArrowRight className="h-4 w-4" />
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
