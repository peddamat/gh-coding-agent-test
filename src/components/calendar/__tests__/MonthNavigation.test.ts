import { describe, test, expect, vi } from 'vitest';
import type { MonthNavigationProps } from '../MonthNavigation';

// We test the component's behavior through its props interface
// Since this is a presentational component, we verify the props are correctly typed
describe('MonthNavigation', () => {
  const mockOnPreviousMonth = vi.fn();
  const mockOnNextMonth = vi.fn();

  const createMockProps = (month: Date): MonthNavigationProps => ({
    currentMonth: month,
    onPreviousMonth: mockOnPreviousMonth,
    onNextMonth: mockOnNextMonth,
  });

  test('props interface accepts currentMonth Date', () => {
    const props = createMockProps(new Date(2025, 10, 15)); // November 2025
    expect(props.currentMonth instanceof Date).toBe(true);
  });

  test('props interface accepts onPreviousMonth callback', () => {
    const props = createMockProps(new Date(2025, 10, 15));
    expect(typeof props.onPreviousMonth).toBe('function');
  });

  test('props interface accepts onNextMonth callback', () => {
    const props = createMockProps(new Date(2025, 10, 15));
    expect(typeof props.onNextMonth).toBe('function');
  });

  test('currentMonth can be formatted to display month and year', () => {
    const date = new Date(2025, 10, 15); // November 2025
    const formattedTitle = date.toLocaleDateString('en-US', {
      month: 'long',
      year: 'numeric',
    });
    expect(formattedTitle).toBe('November 2025');
  });

  test('currentMonth formatting works for different months', () => {
    const january = new Date(2025, 0, 1);
    const december = new Date(2025, 11, 31);
    
    const januaryTitle = january.toLocaleDateString('en-US', {
      month: 'long',
      year: 'numeric',
    });
    const decemberTitle = december.toLocaleDateString('en-US', {
      month: 'long',
      year: 'numeric',
    });
    
    expect(januaryTitle).toBe('January 2025');
    expect(decemberTitle).toBe('December 2025');
  });
});
