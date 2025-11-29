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
    <div className="flex items-center justify-between px-6 py-4">
      <button
        onClick={onPreviousMonth}
        className="rounded-full p-3 text-gray-500 transition-all duration-150 hover:bg-blue-50 hover:text-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
        aria-label="Previous month"
        type="button"
      >
        <ChevronLeft className="h-6 w-6" />
      </button>

      <h2 className="text-xl font-bold tracking-tight text-gray-900">
        {monthTitle}
      </h2>

      <button
        onClick={onNextMonth}
        className="rounded-full p-3 text-gray-500 transition-all duration-150 hover:bg-blue-50 hover:text-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
        aria-label="Next month"
        type="button"
      >
        <ChevronRight className="h-6 w-6" />
      </button>
    </div>
  );
}
