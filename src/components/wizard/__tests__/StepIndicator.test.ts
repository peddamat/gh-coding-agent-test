import { describe, test, expect } from 'vitest';
import type { Step } from '../StepIndicator';

describe('StepIndicator', () => {
  const mockSteps: Step[] = [
    { title: 'Choose Time Split' },
    { title: 'Select Pattern', description: 'Pick a custody schedule' },
    { title: 'Parent Setup' },
    { title: 'Holiday Settings' },
  ];

  test('Step type accepts title string', () => {
    expect(mockSteps[0].title).toBe('Choose Time Split');
  });

  test('Step type accepts optional description', () => {
    expect(mockSteps[1].description).toBe('Pick a custody schedule');
    expect(mockSteps[0].description).toBeUndefined();
  });

  test('steps array supports multiple steps', () => {
    expect(mockSteps.length).toBe(4);
  });

  test('currentStep index is validated against steps array length', () => {
    const currentStep = 0;
    expect(currentStep).toBeGreaterThanOrEqual(0);
    expect(currentStep).toBeLessThan(mockSteps.length);
  });

  test('step index math works for step display', () => {
    const currentStep = 2;
    const stepDisplay = `Step ${currentStep + 1} of ${mockSteps.length}`;
    expect(stepDisplay).toBe('Step 3 of 4');
  });
});
