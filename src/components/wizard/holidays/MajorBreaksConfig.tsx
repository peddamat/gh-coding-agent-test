import { useState, useCallback } from 'react';
import clsx from 'clsx';
import { ChevronDown, ChevronRight } from 'lucide-react';
import type {
  AssignmentType,
  HolidayUserConfig,
  SplitPeriodConfig,
  SelectionPriorityConfig,
} from '../../../types/holidays';
import {
  MAJOR_BREAKS,
  DEFAULT_WINTER_BREAK_SPLIT,
  DEFAULT_SUMMER_VACATION_CONFIG,
  getHolidayDisplayDate,
} from '../../../data/holidays';

/** Props for MajorBreaksConfig */
export interface MajorBreaksConfigProps {
  /** Current holiday configurations */
  configs: HolidayUserConfig[];
  /** Callback when configurations change */
  onConfigsChange: (configs: HolidayUserConfig[]) => void;
  /** Winter break split configuration */
  winterBreakSplit?: SplitPeriodConfig;
  /** Callback when winter break split changes */
  onWinterBreakSplitChange?: (config: SplitPeriodConfig) => void;
  /** Summer vacation configuration */
  summerVacationConfig?: SelectionPriorityConfig;
  /** Callback when summer vacation config changes */
  onSummerVacationConfigChange?: (config: SelectionPriorityConfig) => void;
  /** Display name for Parent A */
  parentAName?: string;
  /** Display name for Parent B */
  parentBName?: string;
  /** Current year for date displays */
  year?: number;
}

/** Assignment dropdown options */
const ASSIGNMENT_OPTIONS: { value: AssignmentType; label: string }[] = [
  { value: 'alternate-odd-even', label: 'Alternate Odd/Even Years' },
  { value: 'always-parent-a', label: 'Always Parent A' },
  { value: 'always-parent-b', label: 'Always Parent B' },
];

/** Assignment dropdown options for split segments */
const SEGMENT_ASSIGNMENT_OPTIONS: { value: AssignmentType; label: string }[] = [
  { value: 'alternate-odd-even', label: 'Alternate (Even Years)' },
  { value: 'always-parent-a', label: 'Always Parent A' },
  { value: 'always-parent-b', label: 'Always Parent B' },
];

/**
 * Collapsible section component for each major break.
 */
function CollapsibleSection({
  title,
  subtitle,
  days,
  isOpen,
  onToggle,
  children,
}: {
  title: string;
  subtitle?: string;
  days: number;
  isOpen: boolean;
  onToggle: () => void;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-lg border border-gray-200 bg-white overflow-hidden">
      <button
        type="button"
        onClick={onToggle}
        className="w-full flex items-center justify-between p-4 text-left hover:bg-gray-50 transition-colors"
        aria-expanded={isOpen}
      >
        <div className="flex items-center gap-3">
          {isOpen ? (
            <ChevronDown className="h-5 w-5 text-gray-500" />
          ) : (
            <ChevronRight className="h-5 w-5 text-gray-500" />
          )}
          <div>
            <span className="font-medium text-gray-900">{title}</span>
            {subtitle && (
              <span className="ml-2 text-sm text-gray-500">{subtitle}</span>
            )}
          </div>
        </div>
        <span className="text-sm text-gray-500">{days} days</span>
      </button>
      {isOpen && (
        <div className="border-t border-gray-200 p-4 bg-gray-50">
          {children}
        </div>
      )}
    </div>
  );
}

/**
 * Assignment dropdown component.
 */
function AssignmentDropdown({
  id,
  value,
  onChange,
  options = ASSIGNMENT_OPTIONS,
  parentAName = 'Parent A',
  parentBName = 'Parent B',
}: {
  id: string;
  value: AssignmentType;
  onChange: (value: AssignmentType) => void;
  options?: { value: AssignmentType; label: string }[];
  parentAName?: string;
  parentBName?: string;
}) {
  const getLabel = (option: { value: AssignmentType; label: string }) => {
    return option.label
      .replace('Parent A', parentAName)
      .replace('Parent B', parentBName);
  };

  return (
    <select
      id={id}
      value={value}
      onChange={(e) => onChange(e.target.value as AssignmentType)}
      className="block w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
    >
      {options.map((option) => (
        <option key={option.value} value={option.value}>
          {getLabel(option)}
        </option>
      ))}
    </select>
  );
}

/**
 * Major Breaks configuration component.
 * Configures the "Big 4": Spring Break, Thanksgiving, Winter Break, Summer Vacation.
 */
export function MajorBreaksConfig({
  configs,
  onConfigsChange,
  winterBreakSplit = DEFAULT_WINTER_BREAK_SPLIT,
  onWinterBreakSplitChange,
  summerVacationConfig = DEFAULT_SUMMER_VACATION_CONFIG,
  onSummerVacationConfigChange,
  parentAName = 'Parent A',
  parentBName = 'Parent B',
  year = new Date().getFullYear(),
}: MajorBreaksConfigProps) {
  // Track which sections are expanded
  const [openSections, setOpenSections] = useState<Set<string>>(
    new Set(['spring-break', 'thanksgiving', 'winter-break', 'summer-vacation'])
  );

  const toggleSection = useCallback((id: string) => {
    setOpenSections((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  }, []);

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

  // Calculate total days
  const totalDays = MAJOR_BREAKS.reduce((sum, h) => sum + h.durationDays, 0);

  return (
    <div className="space-y-4">
      {/* Header with total days */}
      <div className="flex items-center justify-between">
        <h4 className="text-lg font-semibold text-gray-900">Major Breaks</h4>
        <span className="rounded-full bg-blue-100 px-3 py-1 text-sm font-medium text-blue-700">
          {totalDays} days total
        </span>
      </div>

      <div className="space-y-3">
        {/* Spring Break */}
        <CollapsibleSection
          title="Spring Break"
          subtitle={getHolidayDisplayDate(MAJOR_BREAKS[0], year)}
          days={7}
          isOpen={openSections.has('spring-break')}
          onToggle={() => toggleSection('spring-break')}
        >
          <div className="space-y-3">
            <div>
              <label
                htmlFor="spring-break-dates"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Dates
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="date"
                  id="spring-break-start"
                  defaultValue={`${year}-03-17`}
                  className="block rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
                <span className="text-gray-500">to</span>
                <input
                  type="date"
                  id="spring-break-end"
                  defaultValue={`${year}-03-23`}
                  className="block rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>
            </div>
            <div>
              <label
                htmlFor="spring-break-assignment"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Assignment
              </label>
              <AssignmentDropdown
                id="spring-break-assignment"
                value={getConfig('spring-break')?.assignment ?? 'alternate-odd-even'}
                onChange={(value) =>
                  updateConfig('spring-break', { assignment: value })
                }
                parentAName={parentAName}
                parentBName={parentBName}
              />
            </div>
          </div>
        </CollapsibleSection>

        {/* Thanksgiving */}
        <CollapsibleSection
          title="Thanksgiving"
          subtitle={getHolidayDisplayDate(MAJOR_BREAKS[1], year)}
          days={5}
          isOpen={openSections.has('thanksgiving')}
          onToggle={() => toggleSection('thanksgiving')}
        >
          <div className="space-y-3">
            <div className="rounded-lg bg-white border border-gray-200 p-3">
              <p className="text-sm text-gray-600">
                Wednesday 6pm through Sunday 6pm
              </p>
            </div>
            <div>
              <label
                htmlFor="thanksgiving-assignment"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Assignment
              </label>
              <AssignmentDropdown
                id="thanksgiving-assignment"
                value={getConfig('thanksgiving')?.assignment ?? 'alternate-odd-even'}
                onChange={(value) =>
                  updateConfig('thanksgiving', { assignment: value })
                }
                parentAName={parentAName}
                parentBName={parentBName}
              />
            </div>
          </div>
        </CollapsibleSection>

        {/* Winter Break - Split */}
        <CollapsibleSection
          title="Winter Break"
          subtitle="Split"
          days={14}
          isOpen={openSections.has('winter-break')}
          onToggle={() => toggleSection('winter-break')}
        >
          <div className="space-y-4">
            {/* Christmas Segment */}
            <div className="rounded-lg bg-white border border-gray-200 p-3">
              <div className="flex items-center justify-between mb-2">
                <span className="font-medium text-gray-900">
                  {winterBreakSplit.segment1Name}
                </span>
                <span className="text-xs text-gray-500">Dec 23 - Dec 26 noon</span>
              </div>
              <AssignmentDropdown
                id="winter-break-christmas"
                value={winterBreakSplit.segment1Assignment}
                onChange={(value) =>
                  onWinterBreakSplitChange?.({
                    ...winterBreakSplit,
                    segment1Assignment: value,
                  })
                }
                options={SEGMENT_ASSIGNMENT_OPTIONS}
                parentAName={parentAName}
                parentBName={parentBName}
              />
            </div>

            {/* New Year Segment */}
            <div className="rounded-lg bg-white border border-gray-200 p-3">
              <div className="flex items-center justify-between mb-2">
                <span className="font-medium text-gray-900">
                  {winterBreakSplit.segment2Name}
                </span>
                <span className="text-xs text-gray-500">Dec 26 noon - Jan 2</span>
              </div>
              <AssignmentDropdown
                id="winter-break-newyear"
                value={winterBreakSplit.segment2Assignment}
                onChange={(value) =>
                  onWinterBreakSplitChange?.({
                    ...winterBreakSplit,
                    segment2Assignment: value,
                  })
                }
                options={SEGMENT_ASSIGNMENT_OPTIONS}
                parentAName={parentAName}
                parentBName={parentBName}
              />
            </div>
          </div>
        </CollapsibleSection>

        {/* Summer Vacation */}
        <CollapsibleSection
          title="Summer Vacation"
          days={26}
          isOpen={openSections.has('summer-vacation')}
          onToggle={() => toggleSection('summer-vacation')}
        >
          <div className="space-y-4">
            {/* Weeks per parent */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label
                  htmlFor="summer-weeks"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Weeks per parent
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    id="summer-weeks"
                    min={1}
                    max={6}
                    value={summerVacationConfig.weeksPerParent}
                    onChange={(e) =>
                      onSummerVacationConfigChange?.({
                        ...summerVacationConfig,
                        weeksPerParent: parseInt(e.target.value, 10) || 2,
                      })
                    }
                    className="block w-20 rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                  <span className="text-sm text-gray-500">
                    × {summerVacationConfig.blocksPerParent} blocks
                  </span>
                </div>
              </div>

              <div>
                <label
                  htmlFor="summer-deadline"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Selection deadline
                </label>
                <input
                  type="text"
                  id="summer-deadline"
                  value={summerVacationConfig.selectionDeadline}
                  onChange={(e) =>
                    onSummerVacationConfigChange?.({
                      ...summerVacationConfig,
                      selectionDeadline: e.target.value,
                    })
                  }
                  placeholder="e.g., April 1"
                  className="block w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>
            </div>

            {/* First pick */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                First pick in {year} (odd year)
              </label>
              <div className="flex gap-2">
                <label
                  className={clsx(
                    'flex-1 flex cursor-pointer items-center justify-center gap-2 rounded-lg border p-3 transition-colors',
                    {
                      'border-blue-500 bg-blue-50':
                        summerVacationConfig.firstPickOddYears === 'parentA',
                      'border-gray-200 hover:border-gray-300':
                        summerVacationConfig.firstPickOddYears !== 'parentA',
                    }
                  )}
                >
                  <input
                    type="radio"
                    name="firstPick"
                    value="parentA"
                    checked={summerVacationConfig.firstPickOddYears === 'parentA'}
                    onChange={() =>
                      onSummerVacationConfigChange?.({
                        ...summerVacationConfig,
                        firstPickOddYears: 'parentA',
                      })
                    }
                    className="sr-only"
                  />
                  <span className="text-sm font-medium text-gray-900">
                    {parentAName}
                  </span>
                </label>
                <label
                  className={clsx(
                    'flex-1 flex cursor-pointer items-center justify-center gap-2 rounded-lg border p-3 transition-colors',
                    {
                      'border-pink-500 bg-pink-50':
                        summerVacationConfig.firstPickOddYears === 'parentB',
                      'border-gray-200 hover:border-gray-300':
                        summerVacationConfig.firstPickOddYears !== 'parentB',
                    }
                  )}
                >
                  <input
                    type="radio"
                    name="firstPick"
                    value="parentB"
                    checked={summerVacationConfig.firstPickOddYears === 'parentB'}
                    onChange={() =>
                      onSummerVacationConfigChange?.({
                        ...summerVacationConfig,
                        firstPickOddYears: 'parentB',
                      })
                    }
                    className="sr-only"
                  />
                  <span className="text-sm font-medium text-gray-900">
                    {parentBName}
                  </span>
                </label>
              </div>
            </div>
          </div>
        </CollapsibleSection>
      </div>
    </div>
  );
}
