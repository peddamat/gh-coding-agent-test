import { useCallback } from 'react';
import clsx from 'clsx';
import { Check } from 'lucide-react';
import type { AssignmentType, HolidayUserConfig } from '../../../types/holidays';
import { WEEKEND_HOLIDAYS, getHolidayDisplayDate } from '../../../data/holidays';

/** Props for WeekendHolidaysConfig */
export interface WeekendHolidaysConfigProps {
  /** Current holiday configurations */
  configs: HolidayUserConfig[];
  /** Callback when configurations change */
  onConfigsChange: (configs: HolidayUserConfig[]) => void;
  /** Display name for Parent A */
  parentAName?: string;
  /** Display name for Parent B */
  parentBName?: string;
  /** Current year for date displays */
  year?: number;
}

/** Assignment options for dropdowns */
const ASSIGNMENT_OPTIONS: { value: AssignmentType; label: string }[] = [
  { value: 'alternate-odd-even', label: 'Alternate' },
  { value: 'always-parent-a', label: 'Always Parent A' },
  { value: 'always-parent-b', label: 'Always Parent B' },
];

/** Batch apply options */
const BATCH_OPTIONS: { value: AssignmentType; label: string }[] = [
  { value: 'alternate-odd-even', label: 'Alternate All' },
  { value: 'always-parent-a', label: 'All to Parent A' },
  { value: 'always-parent-b', label: 'All to Parent B' },
];

/**
 * Weekend Holidays configuration component.
 * Shows all 11 weekend holidays with enable/disable toggles and assignment dropdowns.
 */
export function WeekendHolidaysConfig({
  configs,
  onConfigsChange,
  parentAName = 'Parent A',
  parentBName = 'Parent B',
  year = new Date().getFullYear(),
}: WeekendHolidaysConfigProps) {
  // Get config for a specific holiday
  const getConfig = useCallback(
    (holidayId: string): HolidayUserConfig | undefined => {
      return configs.find((c) => c.holidayId === holidayId);
    },
    [configs]
  );

  // Update a specific holiday config
  const updateConfig = useCallback(
    (holidayId: string, updates: Partial<HolidayUserConfig>) => {
      const newConfigs = configs.map((c) =>
        c.holidayId === holidayId ? { ...c, ...updates } : c
      );
      onConfigsChange(newConfigs);
    },
    [configs, onConfigsChange]
  );

  // Apply batch assignment to all weekend holidays
  const applyBatchAssignment = useCallback(
    (assignment: AssignmentType) => {
      const newConfigs = configs.map((c) => {
        // Only update weekend holidays
        const isWeekendHoliday = WEEKEND_HOLIDAYS.some((h) => h.id === c.holidayId);
        if (isWeekendHoliday) {
          // Special case: Mother's Day defaults to Parent B
          if (c.holidayId === 'mothers-day' && assignment === 'always-parent-a') {
            return { ...c, assignment: 'always-parent-b' as AssignmentType };
          }
          // Special case: Father's Day defaults to Parent A
          if (c.holidayId === 'fathers-day' && assignment === 'always-parent-b') {
            return { ...c, assignment: 'always-parent-a' as AssignmentType };
          }
          return { ...c, assignment };
        }
        return c;
      });
      onConfigsChange(newConfigs);
    },
    [configs, onConfigsChange]
  );

  // Count enabled holidays
  const enabledCount = WEEKEND_HOLIDAYS.filter(
    (h) => getConfig(h.id)?.enabled !== false
  ).length;

  // Calculate total potential days (3 days per enabled holiday)
  const totalDays = enabledCount * 3;

  // Get label with parent name substitution
  const getLabel = (option: { value: AssignmentType; label: string }) => {
    return option.label
      .replace('Parent A', parentAName)
      .replace('Parent B', parentBName);
  };

  return (
    <div className="space-y-4">
      {/* Header with total count */}
      <div className="flex items-center justify-between">
        <h4 className="text-lg font-semibold text-gray-900">Weekend Holidays</h4>
        <span className="rounded-full bg-blue-100 px-3 py-1 text-sm font-medium text-blue-700">
          {totalDays} days total ({enabledCount} holidays)
        </span>
      </div>

      {/* Batch apply controls */}
      <div className="rounded-lg border border-gray-200 bg-gray-50 p-3">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-sm font-medium text-gray-700">Apply to All:</span>
          {BATCH_OPTIONS.map((option) => (
            <button
              key={option.value}
              type="button"
              onClick={() => applyBatchAssignment(option.value)}
              className="rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-50 hover:border-gray-400 transition-colors"
            >
              {getLabel(option)}
            </button>
          ))}
        </div>
      </div>

      {/* Holiday list */}
      <div className="space-y-2">
        {WEEKEND_HOLIDAYS.map((holiday) => {
          const config = getConfig(holiday.id);
          const isEnabled = config?.enabled !== false;
          const assignment = config?.assignment ?? holiday.defaultAssignment;
          const dateDisplay = getHolidayDisplayDate(holiday, year);

          // Special styling for Mother's/Father's Day
          const isMotherDay = holiday.id === 'mothers-day';
          const isFatherDay = holiday.id === 'fathers-day';

          return (
            <div
              key={holiday.id}
              className={clsx(
                'rounded-lg border p-3 transition-all',
                isEnabled
                  ? 'border-gray-200 bg-white'
                  : 'border-gray-100 bg-gray-50 opacity-60'
              )}
            >
              <div className="flex items-center gap-3">
                {/* Enable/disable toggle */}
                <button
                  type="button"
                  onClick={() =>
                    updateConfig(holiday.id, { enabled: !isEnabled })
                  }
                  className={clsx(
                    'flex h-6 w-6 items-center justify-center rounded border transition-colors',
                    isEnabled
                      ? 'border-blue-500 bg-blue-500 text-white'
                      : 'border-gray-300 bg-white'
                  )}
                  aria-label={
                    isEnabled ? `Disable ${holiday.name}` : `Enable ${holiday.name}`
                  }
                >
                  {isEnabled && <Check className="h-4 w-4" />}
                </button>

                {/* Holiday info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-gray-900 truncate">
                      {holiday.name}
                    </span>
                    {(isMotherDay || isFatherDay) && (
                      <span
                        className={clsx(
                          'rounded-full px-2 py-0.5 text-xs font-medium',
                          isMotherDay
                            ? 'bg-pink-100 text-pink-700'
                            : 'bg-blue-100 text-blue-700'
                        )}
                      >
                        {isMotherDay ? parentBName : parentAName} default
                      </span>
                    )}
                  </div>
                  <span className="text-sm text-gray-500">{dateDisplay}</span>
                </div>

                {/* Assignment dropdown */}
                <select
                  value={assignment}
                  onChange={(e) =>
                    updateConfig(holiday.id, {
                      assignment: e.target.value as AssignmentType,
                    })
                  }
                  disabled={!isEnabled}
                  className={clsx(
                    'rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-sm shadow-sm',
                    'focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500',
                    !isEnabled && 'cursor-not-allowed opacity-50'
                  )}
                >
                  {ASSIGNMENT_OPTIONS.map((option) => (
                    <option key={option.value} value={option.value}>
                      {getLabel(option)}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          );
        })}
      </div>

      {/* Note about day calculation */}
      <p className="text-sm text-gray-500">
        Note: Weekend holidays typically span 3 days (Friday-Sunday or Saturday-Monday).
        Some holidays like Halloween may be shorter.
      </p>
    </div>
  );
}
