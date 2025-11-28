import clsx from 'clsx';
import type { CalendarDay } from '../../types';

export interface DayCellProps {
  day: CalendarDay;
  parentAColor: string;
  parentBColor: string;
}

export function DayCell({ day, parentAColor, parentBColor }: DayCellProps) {
  const bgColor = day.owner === 'parentA' ? parentAColor : parentBColor;

  return (
    <div
      className={clsx(
        'relative flex h-12 items-start justify-end p-1 text-sm font-medium',
        bgColor,
        {
          'ring-2 ring-inset ring-gray-900': day.isToday,
          'opacity-50': !day.isCurrentMonth,
        }
      )}
    >
      <span className="text-white drop-shadow">{day.dayOfMonth}</span>
    </div>
  );
}
