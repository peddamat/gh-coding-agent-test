import { useState, useCallback } from 'react';
import clsx from 'clsx';
import { Check, ChevronDown, ChevronRight, Plus, X } from 'lucide-react';
import type {
  AssignmentType,
  ReligiousHolidayUserConfig,
  CustomReligiousHoliday,
  ReligionType,
} from '../../../types/holidays';
import {
  RELIGIOUS_HOLIDAYS,
  getReligiousHolidayDisplayDate,
  getReligionDisplayName,
  calculateReligiousHolidayDays,
} from '../../../data/religiousHolidays';

/** Props for ReligiousHolidaysConfig */
export interface ReligiousHolidaysConfigProps {
  /** Current religious holiday configurations */
  configs: ReligiousHolidayUserConfig[];
  /** Callback when configurations change */
  onConfigsChange: (configs: ReligiousHolidayUserConfig[]) => void;
  /** Custom religious holidays defined by user */
  customHolidays?: CustomReligiousHoliday[];
  /** Callback when custom holidays change */
  onCustomHolidaysChange?: (holidays: CustomReligiousHoliday[]) => void;
  /** Display name for Parent A */
  parentAName?: string;
  /** Display name for Parent B */
  parentBName?: string;
  /** Current year for date displays */
  year?: number;
}

/** Assignment options for dropdowns */
const ASSIGNMENT_OPTIONS: { value: AssignmentType; label: string }[] = [
  { value: 'alternate-odd-even', label: 'Alternate Odd/Even' },
  { value: 'always-parent-a', label: 'Always Parent A' },
  { value: 'always-parent-b', label: 'Always Parent B' },
];

/** Religion sections that can be expanded */
const RELIGION_SECTIONS: ReligionType[] = ['jewish', 'christian', 'islamic'];

/**
 * Maximum duration for custom religious holidays in days.
 * Set to 14 days to accommodate the longest major religious observances:
 * - Passover (8 days full observance)
 * - Sukkot (7 days)
 * - Eid al-Adha (4 days)
 * This limit helps prevent user input errors while supporting all major religions.
 */
const MAX_CUSTOM_HOLIDAY_DURATION = 14;

/**
 * Collapsible section for a religion group.
 */
function ReligionSection({
  religion,
  isOpen,
  onToggle,
  children,
  enabledCount,
}: {
  religion: ReligionType;
  isOpen: boolean;
  onToggle: () => void;
  children: React.ReactNode;
  enabledCount: number;
}) {
  return (
    <div className="border-t border-gray-100 first:border-t-0">
      <button
        type="button"
        onClick={onToggle}
        className="w-full flex items-center justify-between px-4 py-3 text-left hover:bg-gray-50 transition-colors"
        aria-expanded={isOpen}
      >
        <div className="flex items-center gap-2">
          {isOpen ? (
            <ChevronDown className="h-4 w-4 text-gray-500" />
          ) : (
            <ChevronRight className="h-4 w-4 text-gray-500" />
          )}
          <span className="font-medium text-gray-700">
            {getReligionDisplayName(religion)}
          </span>
        </div>
        {enabledCount > 0 && (
          <span className="rounded-full bg-purple-100 px-2 py-0.5 text-xs font-medium text-purple-700">
            {enabledCount} selected
          </span>
        )}
      </button>
      {isOpen && <div className="px-4 pb-4 space-y-2">{children}</div>}
    </div>
  );
}

/**
 * Religious Holidays configuration component.
 * Shows an expandable section with religious holidays organized by religion.
 * All holidays are optional and disabled by default.
 */
export function ReligiousHolidaysConfig({
  configs,
  onConfigsChange,
  customHolidays = [],
  onCustomHolidaysChange,
  parentAName = 'Parent A',
  parentBName = 'Parent B',
  year = new Date().getFullYear(),
}: ReligiousHolidaysConfigProps) {
  // Main section expansion state
  const [isExpanded, setIsExpanded] = useState(false);
  
  // Religion section expansion states
  const [expandedReligions, setExpandedReligions] = useState<Set<ReligionType>>(new Set());
  
  // Custom holiday form state
  const [showCustomForm, setShowCustomForm] = useState(false);
  const [customName, setCustomName] = useState('');
  const [customDuration, setCustomDuration] = useState(1);
  const [customDate, setCustomDate] = useState('');
  const [customAssignment, setCustomAssignment] = useState<AssignmentType>('alternate-odd-even');

  // Get config for a specific holiday
  const getConfig = useCallback(
    (holidayId: string): ReligiousHolidayUserConfig | undefined => {
      return configs.find((c) => c.holidayId === holidayId);
    },
    [configs]
  );

  // Update a specific holiday config
  const updateConfig = useCallback(
    (holidayId: string, updates: Partial<ReligiousHolidayUserConfig>) => {
      const newConfigs = configs.map((c) =>
        c.holidayId === holidayId ? { ...c, ...updates } : c
      );
      onConfigsChange(newConfigs);
    },
    [configs, onConfigsChange]
  );

  // Toggle religion section
  const toggleReligion = useCallback((religion: ReligionType) => {
    setExpandedReligions((prev) => {
      const next = new Set(prev);
      if (next.has(religion)) {
        next.delete(religion);
      } else {
        next.add(religion);
      }
      return next;
    });
  }, []);

  // Get enabled count for a religion
  const getEnabledCountForReligion = useCallback(
    (religion: ReligionType): number => {
      const holidayIds = RELIGIOUS_HOLIDAYS[religion]?.map((h) => h.id) || [];
      return configs.filter((c) => holidayIds.includes(c.holidayId) && c.enabled).length;
    },
    [configs]
  );

  // Add custom holiday
  const handleAddCustomHoliday = useCallback(() => {
    if (!customName.trim() || !customDate) return;

    const newHoliday: CustomReligiousHoliday = {
      id: `custom-${Date.now()}`,
      name: customName.trim(),
      duration: customDuration,
      dates: { [year]: customDate },
      assignment: customAssignment,
    };

    onCustomHolidaysChange?.([...customHolidays, newHoliday]);
    
    // Reset form
    setCustomName('');
    setCustomDuration(1);
    setCustomDate('');
    setCustomAssignment('alternate-odd-even');
    setShowCustomForm(false);
  }, [customName, customDate, customDuration, customAssignment, year, customHolidays, onCustomHolidaysChange]);

  // Remove custom holiday
  const handleRemoveCustomHoliday = useCallback(
    (id: string) => {
      onCustomHolidaysChange?.(customHolidays.filter((h) => h.id !== id));
    },
    [customHolidays, onCustomHolidaysChange]
  );

  // Update custom holiday assignment
  const handleUpdateCustomAssignment = useCallback(
    (id: string, assignment: AssignmentType) => {
      onCustomHolidaysChange?.(
        customHolidays.map((h) => (h.id === id ? { ...h, assignment } : h))
      );
    },
    [customHolidays, onCustomHolidaysChange]
  );

  // Get label with parent name substitution
  const getLabel = (option: { value: AssignmentType; label: string }) => {
    return option.label
      .replace('Parent A', parentAName)
      .replace('Parent B', parentBName);
  };

  // Calculate total enabled days
  const totalEnabledDays =
    calculateReligiousHolidayDays(configs) +
    customHolidays.reduce((sum, h) => sum + h.duration, 0);

  // Count total enabled holidays
  const totalEnabled =
    configs.filter((c) => c.enabled).length + customHolidays.length;

  return (
    <div className="space-y-4">
      {/* Expandable header */}
      <div className="rounded-lg border border-gray-200 bg-white overflow-hidden">
        <button
          type="button"
          onClick={() => setIsExpanded(!isExpanded)}
          className="w-full flex items-center justify-between p-4 text-left hover:bg-gray-50 transition-colors"
          aria-expanded={isExpanded}
        >
          <div className="flex items-center gap-3">
            {isExpanded ? (
              <ChevronDown className="h-5 w-5 text-gray-500" />
            ) : (
              <ChevronRight className="h-5 w-5 text-gray-500" />
            )}
            <div>
              <h4 className="text-lg font-semibold text-gray-900">
                Religious Holidays
              </h4>
              <p className="text-sm text-gray-500">
                Optional - For families who celebrate religious observances
              </p>
            </div>
          </div>
          {totalEnabled > 0 && (
            <span className="rounded-full bg-purple-100 px-3 py-1 text-sm font-medium text-purple-700">
              {totalEnabledDays} days ({totalEnabled} holidays)
            </span>
          )}
        </button>

        {isExpanded && (
          <div className="border-t border-gray-200">
            {/* Religion sections */}
            {RELIGION_SECTIONS.map((religion) => {
              const holidays = RELIGIOUS_HOLIDAYS[religion] || [];
              if (holidays.length === 0) return null;

              const enabledCount = getEnabledCountForReligion(religion);
              const isReligionOpen = expandedReligions.has(religion);

              return (
                <ReligionSection
                  key={religion}
                  religion={religion}
                  isOpen={isReligionOpen}
                  onToggle={() => toggleReligion(religion)}
                  enabledCount={enabledCount}
                >
                  {holidays.map((holiday) => {
                    const config = getConfig(holiday.id);
                    const isEnabled = config?.enabled ?? false;
                    const assignment = config?.assignment ?? 'alternate-odd-even';
                    const dateDisplay = getReligiousHolidayDisplayDate(holiday, year);

                    // Note about Easter being covered elsewhere
                    const isEasterNote = holiday.id === 'easter-sunday';

                    return (
                      <div
                        key={holiday.id}
                        className={clsx(
                          'rounded-lg border p-3 transition-all',
                          isEnabled
                            ? 'border-purple-200 bg-purple-50'
                            : 'border-gray-100 bg-gray-50'
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
                                ? 'border-purple-500 bg-purple-500 text-white'
                                : 'border-gray-300 bg-white'
                            )}
                            aria-label={
                              isEnabled
                                ? `Disable ${holiday.name}`
                                : `Enable ${holiday.name}`
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
                              {holiday.duration > 1 && (
                                <span className="text-xs text-gray-500">
                                  ({holiday.duration} days)
                                </span>
                              )}
                            </div>
                            <div className="flex items-center gap-2">
                              <span className="text-sm text-gray-500">
                                {dateDisplay}
                              </span>
                              {isEasterNote && (
                                <span className="text-xs text-amber-600">
                                  (May overlap with Weekend Holidays)
                                </span>
                              )}
                            </div>
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
                              'focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-500',
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
                </ReligionSection>
              );
            })}

            {/* Custom religious holidays section */}
            <div className="border-t border-gray-100 p-4 space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-medium text-gray-700">
                  Custom Religious Holidays
                </span>
                <button
                  type="button"
                  onClick={() => setShowCustomForm(true)}
                  className="flex items-center gap-1 text-sm font-medium text-purple-600 hover:text-purple-700"
                >
                  <Plus className="h-4 w-4" />
                  Add Custom Holiday
                </button>
              </div>

              {/* Custom holidays list */}
              {customHolidays.length > 0 && (
                <div className="space-y-2">
                  {customHolidays.map((holiday) => (
                    <div
                      key={holiday.id}
                      className="flex items-center gap-3 rounded-lg border border-purple-200 bg-purple-50 p-3"
                    >
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-gray-900 truncate">
                            {holiday.name}
                          </span>
                          {holiday.duration > 1 && (
                            <span className="text-xs text-gray-500">
                              ({holiday.duration} days)
                            </span>
                          )}
                        </div>
                        <span className="text-sm text-gray-500">
                          {holiday.dates[year] || 'Date not set'}
                        </span>
                      </div>

                      <select
                        value={holiday.assignment}
                        onChange={(e) =>
                          handleUpdateCustomAssignment(
                            holiday.id,
                            e.target.value as AssignmentType
                          )
                        }
                        className="rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-sm shadow-sm focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-500"
                      >
                        {ASSIGNMENT_OPTIONS.map((option) => (
                          <option key={option.value} value={option.value}>
                            {getLabel(option)}
                          </option>
                        ))}
                      </select>

                      <button
                        type="button"
                        onClick={() => handleRemoveCustomHoliday(holiday.id)}
                        className="p-1 text-gray-400 hover:text-red-500 transition-colors"
                        aria-label={`Remove ${holiday.name}`}
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {/* Custom holiday form */}
              {showCustomForm && (
                <div className="rounded-lg border border-gray-200 bg-white p-4 space-y-3">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label
                        htmlFor="custom-name"
                        className="block text-sm font-medium text-gray-700 mb-1"
                      >
                        Holiday Name
                      </label>
                      <input
                        id="custom-name"
                        type="text"
                        value={customName}
                        onChange={(e) => setCustomName(e.target.value)}
                        placeholder="e.g., Diwali"
                        className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-500"
                      />
                    </div>
                    <div>
                      <label
                        htmlFor="custom-duration"
                        className="block text-sm font-medium text-gray-700 mb-1"
                      >
                        Duration (days)
                      </label>
                      <input
                        id="custom-duration"
                        type="number"
                        min={1}
                        max={MAX_CUSTOM_HOLIDAY_DURATION}
                        value={customDuration}
                        onChange={(e) =>
                          setCustomDuration(Math.max(1, parseInt(e.target.value) || 1))
                        }
                        className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-500"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label
                        htmlFor="custom-date"
                        className="block text-sm font-medium text-gray-700 mb-1"
                      >
                        Date (for {year})
                      </label>
                      <input
                        id="custom-date"
                        type="date"
                        value={customDate}
                        onChange={(e) => setCustomDate(e.target.value)}
                        className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-500"
                      />
                    </div>
                    <div>
                      <label
                        htmlFor="custom-assignment"
                        className="block text-sm font-medium text-gray-700 mb-1"
                      >
                        Assignment
                      </label>
                      <select
                        id="custom-assignment"
                        value={customAssignment}
                        onChange={(e) =>
                          setCustomAssignment(e.target.value as AssignmentType)
                        }
                        className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-500"
                      >
                        {ASSIGNMENT_OPTIONS.map((option) => (
                          <option key={option.value} value={option.value}>
                            {getLabel(option)}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                  <div className="flex justify-end gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        setShowCustomForm(false);
                        setCustomName('');
                        setCustomDuration(1);
                        setCustomDate('');
                        setCustomAssignment('alternate-odd-even');
                      }}
                      className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      onClick={handleAddCustomHoliday}
                      disabled={!customName.trim() || !customDate}
                      className={clsx(
                        'rounded-lg px-4 py-2 text-sm font-medium text-white',
                        customName.trim() && customDate
                          ? 'bg-purple-600 hover:bg-purple-700'
                          : 'bg-gray-300 cursor-not-allowed'
                      )}
                    >
                      Add Holiday
                    </button>
                  </div>
                </div>
              )}

              {customHolidays.length === 0 && !showCustomForm && (
                <p className="text-sm text-gray-500">
                  Add custom religious holidays not listed above.
                </p>
              )}
            </div>

            {/* Note about date variability */}
            <div className="border-t border-gray-100 px-4 py-3">
              <p className="text-sm text-gray-500">
                Note: Religious holiday dates follow lunar calendars and may vary slightly
                from year to year. Islamic holiday dates may vary by 1-2 days based on
                moon sighting.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
