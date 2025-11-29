import { CalendarDay, ParentId } from '../../types';
import { DayCell } from './DayCell';

interface CalendarGridProps {
  weekStartsOnMonday?: boolean;
  parentAColor?: string;
  parentBColor?: string;
}

const DAY_HEADERS_SUNDAY_START = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const DAY_HEADERS_MONDAY_START = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

/**
 * Generate mock calendar data for display.
 * Produces 42 days (6 weeks) centered around the current month.
 * @param weekStartsOnMonday - If true, week starts on Monday; otherwise Sunday
 */
function generateMockDays(weekStartsOnMonday: boolean): CalendarDay[] {
  const today = new Date();
  const year = today.getFullYear();
  const month = today.getMonth();
  
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
 * Get the current month title (e.g., "November 2025")
 */
function getCurrentMonthTitle(): string {
  const today = new Date();
  return today.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
}

export function CalendarGrid({
  weekStartsOnMonday = false,
  parentAColor = 'bg-blue-500',
  parentBColor = 'bg-pink-500',
}: CalendarGridProps) {
  const dayHeaders = weekStartsOnMonday ? DAY_HEADERS_MONDAY_START : DAY_HEADERS_SUNDAY_START;
  const mockDays = generateMockDays(weekStartsOnMonday);
  const monthTitle = getCurrentMonthTitle();

  return (
    <div className="bg-white rounded-lg shadow-md p-4">
      {/* Month Title */}
      <h2 className="text-xl font-bold text-center text-gray-900 mb-4">
        {monthTitle}
      </h2>
      
      {/* Day-of-week headers */}
      <div className="grid grid-cols-7 gap-1 mb-1">
        {dayHeaders.map((day) => (
          <div
            key={day}
            className="text-center text-sm font-semibold text-gray-600 py-2"
          >
            {day}
          </div>
        ))}
      </div>
      
      {/* Calendar grid - 6 weeks × 7 days = 42 cells */}
      <div className="grid grid-cols-7 gap-1">
        {mockDays.map((day) => (
          <DayCell
            key={day.date}
            day={day}
            parentAColor={parentAColor}
            parentBColor={parentBColor}
          />
        ))}
      </div>
    </div>
  );
}
