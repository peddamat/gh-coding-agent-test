import { ChevronLeft, ChevronRight } from 'lucide-react';

export interface MonthNavigationProps {
  currentMonth: Date;
  onPreviousMonth: () => void;
  onNextMonth: () => void;
}

export function MonthNavigation({
  currentMonth,
  onPreviousMonth,
  onNextMonth,
}: MonthNavigationProps) {
  const monthYear = currentMonth.toLocaleDateString('en-US', {
    month: 'long',
    year: 'numeric',
  });

  return (
    <div className="flex items-center justify-between py-4">
      <button
        onClick={onPreviousMonth}
        className="rounded-md p-2 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
        aria-label="Previous month"
      >
        <ChevronLeft className="h-5 w-5 text-gray-600" />
      </button>
      <h2 className="text-lg font-semibold text-gray-900">{monthYear}</h2>
      <button
        onClick={onNextMonth}
        className="rounded-md p-2 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
        aria-label="Next month"
      >
        <ChevronRight className="h-5 w-5 text-gray-600" />
      </button>
    </div>
  );
}
