import { describe, test, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { MonthNavigation } from '../MonthNavigation';

describe('MonthNavigation', () => {
  test('displays the current month and year', () => {
    const currentMonth = new Date(2025, 10, 1); // November 2025
    
    render(
      <MonthNavigation
        currentMonth={currentMonth}
        onPreviousMonth={() => {}}
        onNextMonth={() => {}}
      />
    );
    
    expect(screen.getByText('November 2025')).toBeDefined();
  });

  test('calls onPreviousMonth when left arrow is clicked', () => {
    const onPreviousMonth = vi.fn();
    const currentMonth = new Date(2025, 10, 1);
    
    render(
      <MonthNavigation
        currentMonth={currentMonth}
        onPreviousMonth={onPreviousMonth}
        onNextMonth={() => {}}
      />
    );
    
    fireEvent.click(screen.getByLabelText('Previous month'));
    expect(onPreviousMonth).toHaveBeenCalledTimes(1);
  });

  test('calls onNextMonth when right arrow is clicked', () => {
    const onNextMonth = vi.fn();
    const currentMonth = new Date(2025, 10, 1);
    
    render(
      <MonthNavigation
        currentMonth={currentMonth}
        onPreviousMonth={() => {}}
        onNextMonth={onNextMonth}
      />
    );
    
    fireEvent.click(screen.getByLabelText('Next month'));
    expect(onNextMonth).toHaveBeenCalledTimes(1);
  });

  test('displays different months correctly', () => {
    const { rerender } = render(
      <MonthNavigation
        currentMonth={new Date(2025, 0, 1)} // January 2025
        onPreviousMonth={() => {}}
        onNextMonth={() => {}}
      />
    );
    
    expect(screen.getByText('January 2025')).toBeDefined();
    
    rerender(
      <MonthNavigation
        currentMonth={new Date(2024, 11, 1)} // December 2024
        onPreviousMonth={() => {}}
        onNextMonth={() => {}}
      />
    );
    
    expect(screen.getByText('December 2024')).toBeDefined();
  });
});
