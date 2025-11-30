import clsx from 'clsx';
import { Check, RotateCcw } from 'lucide-react';
import type { HolidayPresetType, HolidayUserConfig } from '../../../types/holidays';
import { HOLIDAY_PRESETS, applyPreset } from '../../../data/holidays';

/** Props for QuickSetupPresets */
export interface QuickSetupPresetsProps {
  /** Currently selected preset (if any) */
  selectedPreset?: HolidayPresetType;
  /** Callback when a preset is selected */
  onPresetSelect: (preset: HolidayPresetType) => void;
  /** Current holiday configurations */
  configs: HolidayUserConfig[];
  /** Callback when configurations should be updated from preset */
  onConfigsChange: (configs: HolidayUserConfig[]) => void;
  /** Callback to reset to selected preset */
  onResetToPreset?: () => void;
  /** Whether customizations have been made after selecting a preset */
  hasCustomizations?: boolean;
  /** Display name for Parent A */
  parentAName?: string;
  /** Display name for Parent B */
  parentBName?: string;
}

/**
 * Quick Setup Presets component.
 * Allows users to quickly configure all holidays using common presets.
 */
export function QuickSetupPresets({
  selectedPreset,
  onPresetSelect,
  configs,
  onConfigsChange,
  onResetToPreset,
  hasCustomizations = false,
  parentAName = 'Parent A',
  parentBName = 'Parent B',
}: QuickSetupPresetsProps) {
  // Handle preset selection
  const handlePresetSelect = (presetType: HolidayPresetType) => {
    onPresetSelect(presetType);
    const updatedConfigs = applyPreset(configs, presetType);
    onConfigsChange(updatedConfigs);
  };

  // Get description with parent name substitution
  const getDescription = (description: string) => {
    return description
      .replace(/Parent A/g, parentAName)
      .replace(/Parent B/g, parentBName);
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h4 className="text-lg font-semibold text-gray-900">Quick Setup</h4>
          <p className="text-sm text-gray-600">
            Choose a preset to configure all holidays at once
          </p>
        </div>
        {selectedPreset && hasCustomizations && onResetToPreset && (
          <button
            type="button"
            onClick={onResetToPreset}
            className="flex items-center gap-1.5 rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
          >
            <RotateCcw className="h-4 w-4" />
            Reset to Preset
          </button>
        )}
      </div>

      {/* Preset cards */}
      <div className="grid gap-3">
        {HOLIDAY_PRESETS.map((preset) => {
          const isSelected = selectedPreset === preset.type;

          return (
            <button
              key={preset.type}
              type="button"
              onClick={() => handlePresetSelect(preset.type)}
              className={clsx(
                'relative flex items-start gap-4 rounded-xl border-2 p-4 text-left transition-all',
                isSelected
                  ? 'border-blue-500 bg-blue-50 ring-2 ring-blue-200'
                  : 'border-gray-200 bg-white hover:border-gray-300 hover:shadow-sm'
              )}
            >
              {/* Selection indicator */}
              <div
                className={clsx(
                  'flex h-6 w-6 items-center justify-center rounded-full border-2 transition-colors',
                  isSelected
                    ? 'border-blue-500 bg-blue-500 text-white'
                    : 'border-gray-300 bg-white'
                )}
              >
                {isSelected && <Check className="h-4 w-4" />}
              </div>

              {/* Preset info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="font-medium text-gray-900">{preset.name}</span>
                  {isSelected && hasCustomizations && (
                    <span className="rounded-full bg-amber-100 px-2 py-0.5 text-xs font-medium text-amber-700">
                      Modified
                    </span>
                  )}
                </div>
                <p className="mt-1 text-sm text-gray-600">
                  {getDescription(preset.description)}
                </p>
              </div>
            </button>
          );
        })}
      </div>

      {/* Customization hint */}
      <p className="text-sm text-gray-500">
        After selecting a preset, you can customize individual holiday assignments in the tabs below.
      </p>
    </div>
  );
}
