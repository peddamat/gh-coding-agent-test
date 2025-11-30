import type { Child } from '../types';

/**
 * Calculate when the custody plan expires based on the youngest child.
 * The plan expires when the youngest child reaches their custody end age.
 *
 * @param children - Array of children in the custody arrangement
 * @returns ISO date string (YYYY-MM-DD) when the plan expires, or null if no children
 *
 * @example
 * ```typescript
 * const children = [
 *   { id: '1', name: 'Alice', birthdate: '2015-03-15', custodyEndAge: 18 },
 *   { id: '2', name: 'Bob', birthdate: '2018-07-20', custodyEndAge: 18 },
 * ];
 * calculatePlanExpiration(children); // Returns '2036-07-20' (when Bob turns 18)
 * ```
 */
export function calculatePlanExpiration(children: Child[]): string | null {
  if (children.length === 0) return null;

  // Find the youngest child (latest birthdate)
  const youngest = children.reduce((prev, curr) =>
    prev.birthdate > curr.birthdate ? prev : curr
  );

  // Calculate when they turn custodyEndAge
  // Use T00:00:00 to avoid timezone issues
  const birthDate = new Date(youngest.birthdate + 'T00:00:00');
  birthDate.setFullYear(birthDate.getFullYear() + youngest.custodyEndAge);
  return birthDate.toISOString().split('T')[0];
}
