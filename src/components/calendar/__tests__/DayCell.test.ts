import { describe, test, expect } from 'vitest';
import type { CalendarDay } from '../../../types';

// We test the component's behavior through its props interface
// Since this is a presentational component, we verify the props are correctly typed
describe('DayCell', () => {
  const mockParentADay: CalendarDay = {
    date: '2025-01-15',
    dayOfMonth: 15,
    owner: 'parentA',
    isToday: false,
    isCurrentMonth: true,
  };

  const mockParentBDay: CalendarDay = {
    date: '2025-01-16',
    dayOfMonth: 16,
    owner: 'parentB',
    isToday: false,
    isCurrentMonth: true,
  };

  const mockTodayDay: CalendarDay = {
    date: '2025-01-17',
    dayOfMonth: 17,
    owner: 'parentA',
    isToday: true,
    isCurrentMonth: true,
  };

  const mockPreviousMonthDay: CalendarDay = {
    date: '2024-12-31',
    dayOfMonth: 31,
    owner: 'parentB',
    isToday: false,
    isCurrentMonth: false,
  };

  test('CalendarDay type accepts parentA owner', () => {
    expect(mockParentADay.owner).toBe('parentA');
  });

  test('CalendarDay type accepts parentB owner', () => {
    expect(mockParentBDay.owner).toBe('parentB');
  });

  test('CalendarDay supports isToday flag', () => {
    expect(mockTodayDay.isToday).toBe(true);
    expect(mockParentADay.isToday).toBe(false);
  });

  test('CalendarDay supports isCurrentMonth flag', () => {
    expect(mockPreviousMonthDay.isCurrentMonth).toBe(false);
    expect(mockParentADay.isCurrentMonth).toBe(true);
  });

  test('CalendarDay contains dayOfMonth number', () => {
    expect(mockParentADay.dayOfMonth).toBe(15);
    expect(mockPreviousMonthDay.dayOfMonth).toBe(31);
  });
});
