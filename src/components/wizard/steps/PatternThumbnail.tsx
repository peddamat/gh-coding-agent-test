import clsx from 'clsx';
import type { PatternParent } from '../../../data/patterns';

interface PatternThumbnailProps {
  /** Array of pattern days to display (A or B markers) */
  pattern: PatternParent[];
  /** Number of days to show (default 14 for 2-week preview) */
  days?: number;
  /** Color class for parent A cells */
  parentAColor?: string;
  /** Color class for parent B cells */
  parentBColor?: string;
}

/**
 * Mini calendar thumbnail showing a 2-week preview of a custody pattern.
 * Displays a 7-column grid (one week per row) with colored cells.
 */
export function PatternThumbnail({
  pattern,
  days = 14,
  parentAColor = 'bg-blue-500',
  parentBColor = 'bg-pink-500',
}: PatternThumbnailProps) {
  // Generate the pattern cells for display
  const cells: PatternParent[] = [];
  
  // Handle empty patterns (custom) with placeholder
  if (pattern.length === 0) {
    // Show a placeholder pattern for custom
    for (let i = 0; i < days; i++) {
      cells.push(i % 2 === 0 ? 'A' : 'B');
    }
  } else {
    // Repeat the pattern to fill the required days
    for (let i = 0; i < days; i++) {
      cells.push(pattern[i % pattern.length]);
    }
  }

  return (
    <div className="grid grid-cols-7 gap-0.5" role="img" aria-label="Pattern preview">
      {cells.map((cell, index) => (
        <div
          key={index}
          className={clsx(
            'aspect-square rounded-sm',
            cell === 'A' ? parentAColor : parentBColor
          )}
          aria-hidden="true"
        />
      ))}
    </div>
  );
}
