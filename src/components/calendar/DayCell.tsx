import clsx from 'clsx';
import { Star, BookOpen } from 'lucide-react';
import type { CalendarDay } from '../../types';

interface DayCellProps {
  day: CalendarDay;
  parentAColor: string;
  parentBColor: string;
}

export function DayCell({ day, parentAColor, parentBColor }: DayCellProps) {
  const backgroundColor = day.owner === 'parentA' ? parentAColor : parentBColor;

  // Build tooltip text
  const tooltipParts: string[] = [];
  if (day.holidayName) {
    tooltipParts.push(day.holidayName);
  }
  if (day.isInServiceDay) {
    if (day.isInServiceAttached) {
      tooltipParts.push('In-Service Day (attached to adjacent holiday/weekend)');
    } else {
      tooltipParts.push('In-Service Day');
    }
  }
  const tooltipText = tooltipParts.length > 0 ? tooltipParts.join(' • ') : undefined;

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
      title={tooltipText}
    >
      {/* Holiday indicator (top right) */}
      {day.isHolidayOverride && (
        <div className="absolute top-0.5 right-0.5">
          <Star className="h-3 w-3 text-yellow-300 fill-yellow-300" />
        </div>
      )}

      {/* In-Service day indicator (top left) */}
      {day.isInServiceDay && (
        <div className="absolute top-0.5 left-0.5">
          <BookOpen 
            className={clsx(
              'h-3 w-3',
              day.isInServiceAttached 
                ? 'text-green-300 fill-green-300' 
                : 'text-gray-200'
            )} 
          />
        </div>
      )}
      
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
