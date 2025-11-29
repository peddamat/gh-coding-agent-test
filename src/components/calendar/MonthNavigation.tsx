import { ChevronLeft, ChevronRight } from 'lucide-react';

export interface MonthNavigationProps {
  /** The current month being displayed */
  currentMonth: Date;
  /** Callback when user clicks previous month */
  onPreviousMonth: () => void;
  /** Callback when user clicks next month */
  onNextMonth: () => void;
}

/**
 * MonthNavigation component displays the current month/year
 * with left/right arrow buttons to navigate between months.
 */
export function MonthNavigation({
  currentMonth,
  onPreviousMonth,
  onNextMonth,
}: MonthNavigationProps) {
  const monthTitle = currentMonth.toLocaleDateString('en-US', {
    month: 'long',
    year: 'numeric',
  });

  return (
    <div className="flex items-center justify-between px-4 py-2">
      <button
        onClick={onPreviousMonth}
        className="rounded-md p-2 text-gray-600 hover:bg-gray-100 hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
        aria-label="Previous month"
        type="button"
      >
        <ChevronLeft className="h-5 w-5" />
      </button>

      <h2 className="text-lg font-semibold text-gray-900">{monthTitle}</h2>

      <button
        onClick={onNextMonth}
        className="rounded-md p-2 text-gray-600 hover:bg-gray-100 hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
        aria-label="Next month"
        type="button"
      >
        <ChevronRight className="h-5 w-5" />
      </button>
    </div>
  );
}
