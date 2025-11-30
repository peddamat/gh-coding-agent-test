import { useState, useCallback, useMemo } from 'react';
import clsx from 'clsx';
import { Settings, Calendar, Gift, Zap } from 'lucide-react';
import type {
  HolidayUserConfig,
  BirthdayConfig,
  HolidayPresetType,
  SplitPeriodConfig,
  SelectionPriorityConfig,
  HolidayImpactBreakdown,
} from '../../../types/holidays';
import {
  MajorBreaksConfig,
  WeekendHolidaysConfig,
  BirthdaysConfig,
  QuickSetupPresets,
  HolidayImpactPreview,
} from '../holidays';
import {
  createDefaultHolidayConfigs,
  DEFAULT_WINTER_BREAK_SPLIT,
  DEFAULT_SUMMER_VACATION_CONFIG,
  MAJOR_BREAKS,
  WEEKEND_HOLIDAYS,
  applyPreset,
} from '../../../data/holidays';
import {
  HOLIDAYS,
  getConfiguredHolidayCount,
  type HolidayAssignment,
  type HolidaySelection,
} from './holidaySelectorUtils';

/** Legacy props for backward compatibility with existing wizard */
export interface LegacyHolidaySelectorProps {
  /** Current holiday selections (legacy format) */
  selections: HolidaySelection[];
  /** Callback when selections change (legacy format) */
  onSelectionsChange: (selections: HolidaySelection[]) => void;
  /** Display name for Parent A (defaults to "Parent A") */
  parentAName?: string;
  /** Display name for Parent B (defaults to "Parent B") */
  parentBName?: string;
}

/** Enhanced props for new holiday configuration */
export interface EnhancedHolidaySelectorProps {
  /** Current holiday configurations */
  holidayConfigs: HolidayUserConfig[];
  /** Callback when holiday configurations change */
  onHolidayConfigsChange: (configs: HolidayUserConfig[]) => void;
  /** Current birthday configurations */
  birthdays: BirthdayConfig[];
  /** Callback when birthdays change */
  onBirthdaysChange: (birthdays: BirthdayConfig[]) => void;
  /** Currently selected preset */
  selectedPreset?: HolidayPresetType;
  /** Callback when preset is selected */
  onPresetSelect: (preset: HolidayPresetType) => void;
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
  /** Parent A color class */
  parentAColor?: string;
  /** Parent B color class */
  parentBColor?: string;
  /** Base schedule percentage for Parent A */
  basePercentageA?: number;
  /** Base schedule percentage for Parent B */
  basePercentageB?: number;
}

/** Combined props - supports both legacy and enhanced interfaces */
export type HolidaySelectorProps = LegacyHolidaySelectorProps | EnhancedHolidaySelectorProps;

/** Type guard to check if props are legacy format */
function isLegacyProps(props: HolidaySelectorProps): props is LegacyHolidaySelectorProps {
  return 'selections' in props && 'onSelectionsChange' in props;
}

/** Tab configuration */
type TabId = 'quick-setup' | 'major-breaks' | 'weekend-holidays' | 'birthdays';

interface TabConfig {
  id: TabId;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
}

const TABS: TabConfig[] = [
  { id: 'quick-setup', label: 'Quick Setup', icon: Zap },
  { id: 'major-breaks', label: 'Major Breaks', icon: Calendar },
  { id: 'weekend-holidays', label: 'Weekend Holidays', icon: Settings },
  { id: 'birthdays', label: 'Birthdays', icon: Gift },
];

/**
 * Calculate holiday impact breakdown for preview.
 */
function calculateImpactBreakdown(
  configs: HolidayUserConfig[],
  birthdays: BirthdayConfig[]
): HolidayImpactBreakdown {
  // Simplified calculation - counts days assigned to each parent
  let majorBreaksA = 0;
  let majorBreaksB = 0;
  let weekendHolidaysA = 0;
  let weekendHolidaysB = 0;
  let birthdaysA = 0;
  let birthdaysB = 0;

  const majorBreakIds = MAJOR_BREAKS.map((h) => h.id);
  const weekendHolidayIds = WEEKEND_HOLIDAYS.map((h) => h.id);

  configs.forEach((config) => {
    if (!config.enabled) return;

    const holiday = [...MAJOR_BREAKS, ...WEEKEND_HOLIDAYS].find(
      (h) => h.id === config.holidayId
    );
    if (!holiday) return;

    const days = holiday.durationDays;
    const isMajorBreak = majorBreakIds.includes(config.holidayId);
    const isWeekendHoliday = weekendHolidayIds.includes(config.holidayId);

    if (config.assignment === 'always-parent-a') {
      if (isMajorBreak) majorBreaksA += days;
      else if (isWeekendHoliday) weekendHolidaysA += days;
    } else if (config.assignment === 'always-parent-b') {
      if (isMajorBreak) majorBreaksB += days;
      else if (isWeekendHoliday) weekendHolidaysB += days;
    } else {
      const halfDays = Math.floor(days / 2);
      if (isMajorBreak) {
        majorBreaksA += halfDays;
        majorBreaksB += days - halfDays;
      } else if (isWeekendHoliday) {
        weekendHolidaysA += halfDays;
        weekendHolidaysB += days - halfDays;
      }
    }
  });

  birthdays.forEach((birthday) => {
    if (birthday.defaultAssignment === 'always-parent-a') {
      birthdaysA += 1;
    } else if (birthday.defaultAssignment === 'always-parent-b') {
      birthdaysB += 1;
    } else {
      birthdaysA += 0.5;
      birthdaysB += 0.5;
    }
  });

  return {
    majorBreaks: { parentADays: majorBreaksA, parentBDays: majorBreaksB },
    weekendHolidays: { parentADays: weekendHolidaysA, parentBDays: weekendHolidaysB },
    birthdays: { parentADays: Math.round(birthdaysA), parentBDays: Math.round(birthdaysB) },
    total: {
      parentADays: majorBreaksA + weekendHolidaysA + Math.round(birthdaysA),
      parentBDays: majorBreaksB + weekendHolidaysB + Math.round(birthdaysB),
    },
  };
}

/**
 * Legacy Holiday Selector component (original simple interface).
 * Used for backward compatibility with existing wizard.
 */
function LegacyHolidaySelector({
  selections,
  onSelectionsChange,
  parentAName = 'Parent A',
  parentBName = 'Parent B',
}: LegacyHolidaySelectorProps) {
  const configuredCount = getConfiguredHolidayCount(selections);

  const handleAssignmentChange = (holidayId: string, assignment: HolidayAssignment) => {
    const newSelections = selections.map((selection) =>
      selection.holidayId === holidayId ? { ...selection, assignment } : selection
    );
    onSelectionsChange(newSelections);
  };

  const getSelection = useCallback((holidayId: string): HolidayAssignment => {
    const selection = selections.find((s) => s.holidayId === holidayId);
    return selection?.assignment ?? 'alternate';
  }, [selections]);

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-gray-900">Holiday Custody</h3>
        <p className="mt-1 text-sm text-gray-600">
          Select which parent has custody for major holidays. You can also alternate years.
        </p>
      </div>

      <div className="rounded-lg border border-gray-200 bg-gray-50 px-4 py-3">
        <p className="text-sm text-gray-700">
          <span className="font-semibold">{configuredCount}</span>{' '}
          {configuredCount === 1 ? 'holiday' : 'holidays'} configured
        </p>
      </div>

      <div className="space-y-4">
        {HOLIDAYS.map((holiday) => {
          const currentAssignment = getSelection(holiday.id);

          return (
            <fieldset
              key={holiday.id}
              className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm"
            >
              <legend className="mb-3 font-medium text-gray-900">{holiday.name}</legend>

              <div className="flex flex-wrap gap-2">
                <label
                  className={clsx(
                    'flex cursor-pointer items-center gap-2 rounded-lg border px-3 py-2 text-sm transition-colors',
                    {
                      'border-blue-500 bg-blue-50 text-blue-700':
                        currentAssignment === 'parentA',
                      'border-gray-200 hover:border-gray-300 hover:bg-gray-50':
                        currentAssignment !== 'parentA',
                    }
                  )}
                >
                  <input
                    type="radio"
                    name={`holiday-${holiday.id}`}
                    value="parentA"
                    checked={currentAssignment === 'parentA'}
                    onChange={() => handleAssignmentChange(holiday.id, 'parentA')}
                    className="h-4 w-4 border-gray-300 text-blue-600 focus:ring-blue-500"
                    aria-label={`Assign ${holiday.name} to ${parentAName}`}
                  />
                  <span>{parentAName}</span>
                </label>

                <label
                  className={clsx(
                    'flex cursor-pointer items-center gap-2 rounded-lg border px-3 py-2 text-sm transition-colors',
                    {
                      'border-pink-500 bg-pink-50 text-pink-700':
                        currentAssignment === 'parentB',
                      'border-gray-200 hover:border-gray-300 hover:bg-gray-50':
                        currentAssignment !== 'parentB',
                    }
                  )}
                >
                  <input
                    type="radio"
                    name={`holiday-${holiday.id}`}
                    value="parentB"
                    checked={currentAssignment === 'parentB'}
                    onChange={() => handleAssignmentChange(holiday.id, 'parentB')}
                    className="h-4 w-4 border-gray-300 text-pink-600 focus:ring-pink-500"
                    aria-label={`Assign ${holiday.name} to ${parentBName}`}
                  />
                  <span>{parentBName}</span>
                </label>

                <label
                  className={clsx(
                    'flex cursor-pointer items-center gap-2 rounded-lg border px-3 py-2 text-sm transition-colors',
                    {
                      'border-purple-500 bg-purple-50 text-purple-700':
                        currentAssignment === 'alternate',
                      'border-gray-200 hover:border-gray-300 hover:bg-gray-50':
                        currentAssignment !== 'alternate',
                    }
                  )}
                >
                  <input
                    type="radio"
                    name={`holiday-${holiday.id}`}
                    value="alternate"
                    checked={currentAssignment === 'alternate'}
                    onChange={() => handleAssignmentChange(holiday.id, 'alternate')}
                    className="h-4 w-4 border-gray-300 text-purple-600 focus:ring-purple-500"
                    aria-label={`Alternate ${holiday.name} between parents each year`}
                  />
                  <span>Alternate Years</span>
                </label>
              </div>
            </fieldset>
          );
        })}
      </div>

      <p className="text-center text-sm text-gray-500">
        This step is optional. Click "Next" to continue without configuring holidays.
      </p>
    </div>
  );
}

/**
 * Enhanced Holiday Selector with tabbed interface.
 * Full-featured component for comprehensive holiday custody configuration.
 */
function EnhancedHolidaySelector({
  holidayConfigs,
  onHolidayConfigsChange,
  birthdays,
  onBirthdaysChange,
  selectedPreset,
  onPresetSelect,
  winterBreakSplit = DEFAULT_WINTER_BREAK_SPLIT,
  onWinterBreakSplitChange,
  summerVacationConfig = DEFAULT_SUMMER_VACATION_CONFIG,
  onSummerVacationConfigChange,
  parentAName = 'Parent A',
  parentBName = 'Parent B',
  basePercentageA = 50,
  basePercentageB = 50,
}: EnhancedHolidaySelectorProps) {
  const [activeTab, setActiveTab] = useState<TabId>('quick-setup');
  const [hasCustomizations, setHasCustomizations] = useState(false);

  const impactBreakdown = useMemo(
    () => calculateImpactBreakdown(holidayConfigs, birthdays),
    [holidayConfigs, birthdays]
  );

  const handleConfigsChange = useCallback(
    (configs: HolidayUserConfig[]) => {
      onHolidayConfigsChange(configs);
      if (selectedPreset) {
        setHasCustomizations(true);
      }
    },
    [onHolidayConfigsChange, selectedPreset]
  );

  const handlePresetSelect = useCallback(
    (preset: HolidayPresetType) => {
      onPresetSelect(preset);
      setHasCustomizations(false);
    },
    [onPresetSelect]
  );

  const handleResetToPreset = useCallback(() => {
    if (selectedPreset) {
      const resetConfigs = applyPreset(createDefaultHolidayConfigs(), selectedPreset);
      onHolidayConfigsChange(resetConfigs);
      setHasCustomizations(false);
    }
  }, [selectedPreset, onHolidayConfigsChange]);

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-gray-900">Holiday Configuration</h3>
        <p className="mt-1 text-sm text-gray-600">
          Configure custody arrangements for holidays, breaks, and birthdays.
        </p>
      </div>

      <div className="border-b border-gray-200">
        <nav className="flex -mb-px" aria-label="Holiday configuration tabs">
          {TABS.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;

            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={clsx(
                  'flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors',
                  isActive
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                )}
                aria-selected={isActive}
                role="tab"
              >
                <Icon className="h-4 w-4" />
                <span className="hidden sm:inline">{tab.label}</span>
              </button>
            );
          })}
        </nav>
      </div>

      <div className="min-h-[400px]">
        {activeTab === 'quick-setup' && (
          <QuickSetupPresets
            selectedPreset={selectedPreset}
            onPresetSelect={handlePresetSelect}
            configs={holidayConfigs}
            onConfigsChange={handleConfigsChange}
            onResetToPreset={handleResetToPreset}
            hasCustomizations={hasCustomizations}
            parentAName={parentAName}
            parentBName={parentBName}
          />
        )}

        {activeTab === 'major-breaks' && (
          <MajorBreaksConfig
            configs={holidayConfigs}
            onConfigsChange={handleConfigsChange}
            winterBreakSplit={winterBreakSplit}
            onWinterBreakSplitChange={onWinterBreakSplitChange}
            summerVacationConfig={summerVacationConfig}
            onSummerVacationConfigChange={onSummerVacationConfigChange}
            parentAName={parentAName}
            parentBName={parentBName}
          />
        )}

        {activeTab === 'weekend-holidays' && (
          <WeekendHolidaysConfig
            configs={holidayConfigs}
            onConfigsChange={handleConfigsChange}
            parentAName={parentAName}
            parentBName={parentBName}
          />
        )}

        {activeTab === 'birthdays' && (
          <BirthdaysConfig
            birthdays={birthdays}
            onBirthdaysChange={onBirthdaysChange}
            parentAName={parentAName}
            parentBName={parentBName}
          />
        )}
      </div>

      <HolidayImpactPreview
        basePercentageA={basePercentageA}
        basePercentageB={basePercentageB}
        impactBreakdown={impactBreakdown}
        parentAName={parentAName}
        parentBName={parentBName}
      />

      <p className="text-center text-sm text-gray-500">
        This step is optional. Click "Next" to continue without configuring holidays.
      </p>
    </div>
  );
}

/**
 * Holiday Selector component.
 * Supports both legacy (simple) and enhanced (tabbed) interfaces.
 * 
 * Legacy mode: Pass `selections` and `onSelectionsChange` for simple 6-holiday configuration.
 * Enhanced mode: Pass `holidayConfigs`, `onHolidayConfigsChange`, etc. for full configuration.
 */
export function HolidaySelector(props: HolidaySelectorProps) {
  if (isLegacyProps(props)) {
    return <LegacyHolidaySelector {...props} />;
  }
  return <EnhancedHolidaySelector {...props} />;
}
