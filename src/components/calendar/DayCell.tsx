import { CalendarDay } from '../../types';
import clsx from 'clsx';

interface DayCellProps {
  day: CalendarDay;
  parentAColor: string;
  parentBColor: string;
}

export function DayCell({ day, parentAColor, parentBColor }: DayCellProps) {
  const bgColor = day.owner === 'parentA' ? parentAColor : parentBColor;
  
  return (
    <div
      className={clsx(
        'aspect-square p-1 flex items-start justify-end',
        bgColor,
        {
          'ring-2 ring-offset-2 ring-gray-900 font-bold': day.isToday,
          'opacity-40': !day.isCurrentMonth,
        }
      )}
    >
      <span className="text-sm text-white font-medium">
        {day.dayOfMonth}
      </span>
    </div>
  );
}
