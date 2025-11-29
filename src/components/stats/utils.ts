/**
 * Utility functions for timeshare statistics calculations.
 */

/**
 * Determines which parent is the primary parent (the one with higher or equal percentage).
 * When percentages are equal, Parent A is considered primary.
 */
export function determinePrimaryParent(
  parentAName: string,
  parentAPercent: number,
  parentBName: string,
  parentBPercent: number
): { primaryName: string; primaryPercent: number } {
  const primaryPercent = parentAPercent >= parentBPercent ? parentAPercent : parentBPercent;
  const primaryName = parentAPercent >= parentBPercent ? parentAName : parentBName;
  return { primaryName, primaryPercent };
}
