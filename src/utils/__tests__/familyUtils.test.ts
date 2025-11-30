import { describe, test, expect } from 'vitest';
import { calculatePlanExpiration } from '../familyUtils';
import type { Child } from '../../types';

describe('calculatePlanExpiration', () => {
  test('returns null for empty children array', () => {
    expect(calculatePlanExpiration([])).toBeNull();
  });

  test('calculates expiration for single child with default custodyEndAge', () => {
    const children: Child[] = [
      { id: '1', name: 'Alice', birthdate: '2015-03-15', custodyEndAge: 18 },
    ];
    expect(calculatePlanExpiration(children)).toBe('2033-03-15');
  });

  test('finds youngest child and calculates expiration based on them', () => {
    const children: Child[] = [
      { id: '1', name: 'Alice', birthdate: '2015-03-15', custodyEndAge: 18 },
      { id: '2', name: 'Bob', birthdate: '2018-07-20', custodyEndAge: 18 },
    ];
    // Bob is younger, so plan expires when he turns 18
    expect(calculatePlanExpiration(children)).toBe('2036-07-20');
  });

  test('respects different custodyEndAge values', () => {
    const children: Child[] = [
      { id: '1', name: 'Alice', birthdate: '2015-03-15', custodyEndAge: 19 },
    ];
    expect(calculatePlanExpiration(children)).toBe('2034-03-15');
  });

  test('handles leap year birthdate correctly', () => {
    const children: Child[] = [
      { id: '1', name: 'LeapYear', birthdate: '2016-02-29', custodyEndAge: 18 },
    ];
    // Feb 29, 2016 + 18 years -> should be Feb 28 or Mar 1 2034 (depending on implementation)
    // Since 2034 is not a leap year, JavaScript Date will roll to Mar 1
    expect(calculatePlanExpiration(children)).toBe('2034-03-01');
  });

  test('handles multiple children with different custodyEndAge', () => {
    const children: Child[] = [
      { id: '1', name: 'Older', birthdate: '2015-01-01', custodyEndAge: 21 },
      { id: '2', name: 'Younger', birthdate: '2020-06-15', custodyEndAge: 18 },
    ];
    // Older turns 21 on 2036-01-01
    // Younger turns 18 on 2038-06-15
    // Younger's expiration is later, so that's the plan expiration
    expect(calculatePlanExpiration(children)).toBe('2038-06-15');
  });

  test('handles children born in same year correctly', () => {
    const children: Child[] = [
      { id: '1', name: 'Twin1', birthdate: '2015-03-15', custodyEndAge: 18 },
      { id: '2', name: 'Twin2', birthdate: '2015-03-15', custodyEndAge: 18 },
    ];
    expect(calculatePlanExpiration(children)).toBe('2033-03-15');
  });
});
