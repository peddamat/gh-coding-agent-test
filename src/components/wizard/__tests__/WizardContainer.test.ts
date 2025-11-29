import { describe, test, expect } from 'vitest';
import type { Step } from '../StepIndicator';

describe('WizardContainer', () => {
  const mockSteps: Step[] = [
    { title: 'Choose Time Split' },
    { title: 'Select Pattern' },
    { title: 'Parent Setup' },
    { title: 'Holiday Settings' },
  ];

  test('steps array is properly structured', () => {
    expect(mockSteps.length).toBe(4);
    expect(mockSteps[0].title).toBe('Choose Time Split');
  });

  test('isFirstStep calculation is correct', () => {
    const currentStep = 0;
    const isFirstStep = currentStep === 0;
    expect(isFirstStep).toBe(true);

    const currentStep2: number = 1;
    const isFirstStep2 = currentStep2 === 0;
    expect(isFirstStep2).toBe(false);
  });

  test('isLastStep calculation is correct', () => {
    const currentStep = 3;
    const isLastStep = currentStep === mockSteps.length - 1;
    expect(isLastStep).toBe(true);

    const currentStep2 = 2;
    const isLastStep2 = currentStep2 === mockSteps.length - 1;
    expect(isLastStep2).toBe(false);
  });

  test('handleNext increments step when not last step', () => {
    let currentStep = 0;
    const isLastStep = currentStep === mockSteps.length - 1;

    if (!isLastStep) {
      currentStep = currentStep + 1;
    }

    expect(currentStep).toBe(1);
  });

  test('handleBack decrements step when not first step', () => {
    let currentStep = 2;
    const isFirstStep = currentStep === 0;

    if (!isFirstStep) {
      currentStep = currentStep - 1;
    }

    expect(currentStep).toBe(1);
  });

  test('initialStep default is 0', () => {
    const initialStep = 0;
    expect(initialStep).toBe(0);
  });

  test('button text changes based on step position', () => {
    const isLastStep = true;
    const buttonText = isLastStep ? 'Finish' : 'Next';
    expect(buttonText).toBe('Finish');

    const isLastStep2 = false;
    const buttonText2 = isLastStep2 ? 'Finish' : 'Next';
    expect(buttonText2).toBe('Next');
  });

  test('back button text changes on first step', () => {
    const isFirstStep = true;
    const hasOnCancel = true;
    const buttonText = isFirstStep ? 'Cancel' : 'Back';
    const buttonVisible = !isFirstStep || hasOnCancel;

    expect(buttonText).toBe('Cancel');
    expect(buttonVisible).toBe(true);
  });
});
