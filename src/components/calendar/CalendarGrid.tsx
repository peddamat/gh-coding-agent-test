import { DayCell } from './DayCell';
import { generateMockDays } from '../../utils/calendarUtils';
import type { CalendarDay } from '../../types';

export interface CalendarGridProps {
  days: CalendarDay[];
  parentAColor?: string;
  parentBColor?: string;
  weekStartsOn?: 'sunday' | 'monday';
}

const DAYS_OF_WEEK_SUNDAY = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const DAYS_OF_WEEK_MONDAY = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

export function CalendarGrid({
  days,
  parentAColor = 'bg-blue-500',
  parentBColor = 'bg-pink-500',
  weekStartsOn = 'sunday',
}: CalendarGridProps) {
  const daysOfWeek = weekStartsOn === 'sunday' ? DAYS_OF_WEEK_SUNDAY : DAYS_OF_WEEK_MONDAY;
  
  const displayDays = days.length === 42 ? days : generateMockDays(
    new Date().getMonth(),
    new Date().getFullYear()
  );

  return (
    <div className="overflow-hidden rounded-lg bg-white shadow">
      <div className="grid grid-cols-7 border-b border-gray-200 bg-gray-50">
        {daysOfWeek.map((day) => (
          <div
            key={day}
            className="py-2 text-center text-xs font-semibold uppercase text-gray-500"
          >
            {day}
          </div>
        ))}
      </div>
      <div className="grid grid-cols-7">
        {displayDays.map((day, index) => (
          <DayCell
            key={`${day.date}-${index}`}
            day={day}
            parentAColor={parentAColor}
            parentBColor={parentBColor}
          />
        ))}
      </div>
    </div>
  );
}
