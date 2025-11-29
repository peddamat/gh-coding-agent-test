import { CalendarDay, ParentId } from '../../types';
import { DayCell } from './DayCell';

interface CalendarGridProps {
  /** The month to display. If not provided, uses the current month. */
  currentMonth?: Date;
  /** Whether to hide the internal month title. Set to true when using MonthNavigation externally. */
  hideTitle?: boolean;
  weekStartsOnMonday?: boolean;
  parentAColor?: string;
  parentBColor?: string;
}

const DAY_HEADERS_SUNDAY_START = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const DAY_HEADERS_MONDAY_START = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

/**
 * Generate mock calendar data for display.
 * Produces 42 days (6 weeks) centered around the specified month.
 * @param displayMonth - The month to display
 * @param weekStartsOnMonday - If true, week starts on Monday; otherwise Sunday
 */
function generateMockDays(displayMonth: Date, weekStartsOnMonday: boolean): CalendarDay[] {
  const today = new Date();
  const year = displayMonth.getFullYear();
  const month = displayMonth.getMonth();
  
  // Get the first day of the current month
  const firstDayOfMonth = new Date(year, month, 1);
  
  // Get the day of week for the first day (0 = Sunday, 6 = Saturday)
  let startDayOfWeek = firstDayOfMonth.getDay();
  
  // Adjust for Monday start: convert Sunday (0) to 6, and shift others by -1
  if (weekStartsOnMonday) {
    startDayOfWeek = startDayOfWeek === 0 ? 6 : startDayOfWeek - 1;
  }
  
  // Calculate the starting date (go back to fill the first row)
  const startDate = new Date(year, month, 1 - startDayOfWeek);
  
  const days: CalendarDay[] = [];
  
  for (let i = 0; i < 42; i++) {
    const currentDate = new Date(startDate);
    currentDate.setDate(startDate.getDate() + i);
    
    const dateStr = currentDate.toISOString().split('T')[0];
    const isCurrentMonth = currentDate.getMonth() === month;
    const isToday = dateStr === today.toISOString().split('T')[0];
    
    // Alternating pattern: every 2 days switch parents (simple 2-2 pattern for mock)
    const owner: ParentId = Math.floor(i / 2) % 2 === 0 ? 'parentA' : 'parentB';
    
    days.push({
      date: dateStr,
      dayOfMonth: currentDate.getDate(),
      owner,
      isToday,
      isCurrentMonth,
    });
  }
  
  return days;
}

/**
 * Get the month title for the given date (e.g., "November 2025")
 */
function getMonthTitle(date: Date): string {
  return date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
}

export function CalendarGrid({
  currentMonth,
  hideTitle = false,
  weekStartsOnMonday = false,
  parentAColor = 'bg-blue-500',
  parentBColor = 'bg-pink-500',
}: CalendarGridProps) {
  const displayMonth = currentMonth ?? new Date();
  const dayHeaders = weekStartsOnMonday ? DAY_HEADERS_MONDAY_START : DAY_HEADERS_SUNDAY_START;
  const mockDays = generateMockDays(displayMonth, weekStartsOnMonday);
  const monthTitle = getMonthTitle(displayMonth);

  return (
    <div className="rounded-xl bg-white p-6 shadow-lg">
      {/* Month Title - shown when hideTitle is false */}
      {!hideTitle && (
        <h2 className="mb-6 text-center text-2xl font-bold text-gray-900">
          {monthTitle}
        </h2>
      )}

      {/* Day-of-week headers */}
      <div className="mb-3 grid grid-cols-7 gap-2">
        {dayHeaders.map((day) => (
          <div
            key={day}
            className="py-2 text-center text-sm font-bold uppercase tracking-wide text-gray-500"
          >
            {day}
          </div>
        ))}
      </div>

      {/* Calendar grid - 6 weeks × 7 days = 42 cells */}
      <div className="grid grid-cols-7 gap-2">
        {mockDays.map((day) => (
          <DayCell
            key={day.date}
            day={day}
            parentAColor={parentAColor}
            parentBColor={parentBColor}
          />
        ))}
      </div>

      {/* Legend */}
      <div className="mt-6 flex items-center justify-center gap-6 border-t border-gray-100 pt-4">
        <div className="flex items-center gap-2">
          <div className={`h-4 w-4 rounded ${parentAColor}`} />
          <span className="text-sm font-medium text-gray-600">Parent A</span>
        </div>
        <div className="flex items-center gap-2">
          <div className={`h-4 w-4 rounded ${parentBColor}`} />
          <span className="text-sm font-medium text-gray-600">Parent B</span>
        </div>
      </div>
    </div>
  );
}
