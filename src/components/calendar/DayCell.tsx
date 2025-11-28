import clsx from 'clsx';
import type { CalendarDay } from '../../types';

interface DayCellProps {
  day: CalendarDay;
  parentAColor: string;
  parentBColor: string;
}

export function DayCell({ day, parentAColor, parentBColor }: DayCellProps) {
  const backgroundColor = day.owner === 'parentA' ? parentAColor : parentBColor;

  return (
    <div
      className={clsx(
        'relative flex h-12 w-12 items-start justify-end rounded-md p-1',
        backgroundColor,
        {
          'ring-2 ring-offset-1 ring-gray-900': day.isToday,
          'opacity-50': !day.isCurrentMonth,
        }
      )}
    >
      <span
        className={clsx('text-sm font-medium text-white', {
          'font-bold': day.isToday,
        })}
      >
        {day.dayOfMonth}
      </span>
    </div>
  );
}
