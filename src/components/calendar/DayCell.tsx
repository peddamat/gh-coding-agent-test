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
        'relative aspect-square w-full rounded-lg p-2 transition-all duration-150',
        'flex items-center justify-center',
        'hover:scale-105 hover:shadow-md cursor-pointer',
        backgroundColor,
        {
          'ring-2 ring-offset-2 ring-gray-900 shadow-lg scale-105': day.isToday,
          'opacity-40': !day.isCurrentMonth,
        }
      )}
    >
      <span
        className={clsx(
          'text-base font-semibold text-white drop-shadow-sm',
          {
            'text-lg font-bold': day.isToday,
          }
        )}
      >
        {day.dayOfMonth}
      </span>
    </div>
  );
}
