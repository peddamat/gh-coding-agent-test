import { useState, useCallback } from 'react';
import clsx from 'clsx';
import { ColorPicker } from '../../shared/ColorPicker';
import { DatePicker } from '../../shared/DatePicker';
import { validateParentSetup, type ParentSetupData } from './parentSetupUtils';

export type { ParentSetupData };

export interface ParentSetupProps {
  /** Current form data */
  data: ParentSetupData;
  /** Callback when form data changes */
  onChange: (data: ParentSetupData) => void;
  /** Whether to show validation errors */
  showErrors?: boolean;
}

/**
 * Step 2 wizard component for parent setup.
 * Collects parent names, colors, schedule start date, and starting parent.
 */
export function ParentSetup({
  data,
  onChange,
  showErrors = false,
}: ParentSetupProps) {
  const [touched, setTouched] = useState<Record<string, boolean>>({});

  const errors = validateParentSetup(data);

  const handleChange = useCallback(
    (field: keyof ParentSetupData, value: string) => {
      onChange({
        ...data,
        [field]: value,
      });
    },
    [data, onChange]
  );

  const handleBlur = useCallback((field: string) => {
    setTouched((prev) => ({ ...prev, [field]: true }));
  }, []);

  const shouldShowError = (field: string) => {
    return showErrors || touched[field];
  };

  return (
    <div className="space-y-8">
      {/* Section header */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900">Parent Information</h3>
        <p className="mt-1 text-sm text-gray-600">
          Enter the names and display colors for each parent.
        </p>
      </div>

      {/* Parent names and colors */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
        {/* Parent A */}
        <div className="space-y-4 rounded-xl bg-gray-50 p-4">
          <h4 className="font-medium text-gray-900">Parent A</h4>
          
          {/* Name input */}
          <div className="space-y-1">
            <label
              htmlFor="parentAName"
              className="block text-sm font-medium text-gray-700"
            >
              Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              id="parentAName"
              value={data.parentAName}
              onChange={(e) => handleChange('parentAName', e.target.value)}
              onBlur={() => handleBlur('parentAName')}
              placeholder="e.g., Mom, Dad, Sarah"
              className={clsx(
                'block w-full rounded-lg border bg-white px-3 py-2 text-sm shadow-sm transition-colors',
                'focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500',
                {
                  'border-red-300 focus:border-red-500 focus:ring-red-500':
                    shouldShowError('parentAName') && errors.parentAName,
                  'border-gray-300':
                    !shouldShowError('parentAName') || !errors.parentAName,
                }
              )}
            />
            {shouldShowError('parentAName') && errors.parentAName && (
              <p className="text-sm text-red-600">{errors.parentAName}</p>
            )}
          </div>

          {/* Color picker */}
          <ColorPicker
            id="parentAColor"
            value={data.parentAColor}
            onChange={(value) => handleChange('parentAColor', value)}
            label="Display Color"
            error={
              shouldShowError('parentAColor') && errors.parentAColor
                ? errors.parentAColor
                : undefined
            }
          />
        </div>

        {/* Parent B */}
        <div className="space-y-4 rounded-xl bg-gray-50 p-4">
          <h4 className="font-medium text-gray-900">Parent B</h4>
          
          {/* Name input */}
          <div className="space-y-1">
            <label
              htmlFor="parentBName"
              className="block text-sm font-medium text-gray-700"
            >
              Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              id="parentBName"
              value={data.parentBName}
              onChange={(e) => handleChange('parentBName', e.target.value)}
              onBlur={() => handleBlur('parentBName')}
              placeholder="e.g., Mom, Dad, John"
              className={clsx(
                'block w-full rounded-lg border bg-white px-3 py-2 text-sm shadow-sm transition-colors',
                'focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500',
                {
                  'border-red-300 focus:border-red-500 focus:ring-red-500':
                    shouldShowError('parentBName') && errors.parentBName,
                  'border-gray-300':
                    !shouldShowError('parentBName') || !errors.parentBName,
                }
              )}
            />
            {shouldShowError('parentBName') && errors.parentBName && (
              <p className="text-sm text-red-600">{errors.parentBName}</p>
            )}
          </div>

          {/* Color picker */}
          <ColorPicker
            id="parentBColor"
            value={data.parentBColor}
            onChange={(value) => handleChange('parentBColor', value)}
            label="Display Color"
            error={
              shouldShowError('parentBColor') && errors.parentBColor
                ? errors.parentBColor
                : undefined
            }
          />
        </div>
      </div>

      {/* Color conflict warning */}
      {errors.colorConflict && (
        <div className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3">
          <p className="text-sm text-amber-700">{errors.colorConflict}</p>
        </div>
      )}

      {/* Schedule settings section */}
      <div className="border-t border-gray-200 pt-6">
        <h3 className="text-lg font-semibold text-gray-900">Schedule Settings</h3>
        <p className="mt-1 text-sm text-gray-600">
          Configure when the custody schedule begins and who has the child first.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
        {/* Start date */}
        <DatePicker
          id="startDate"
          value={data.startDate}
          onChange={(value) => handleChange('startDate', value)}
          label="Schedule Start Date"
          required
          error={
            shouldShowError('startDate') && errors.startDate
              ? errors.startDate
              : undefined
          }
        />

        {/* Starting parent */}
        <div className="space-y-3">
          <label className="block text-sm font-medium text-gray-700">
            Who has the child first? <span className="text-red-500">*</span>
          </label>
          <div className="space-y-2">
            <label
              className={clsx(
                'flex cursor-pointer items-center gap-3 rounded-lg border p-3 transition-colors',
                {
                  'border-blue-500 bg-blue-50': data.startingParent === 'parentA',
                  'border-gray-200 hover:border-gray-300':
                    data.startingParent !== 'parentA',
                }
              )}
            >
              <input
                type="radio"
                name="startingParent"
                value="parentA"
                checked={data.startingParent === 'parentA'}
                onChange={(e) => handleChange('startingParent', e.target.value)}
                className="h-4 w-4 border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <div className="flex items-center gap-2">
                <div
                  className={clsx(
                    'h-4 w-4 rounded-full',
                    data.parentAColor || 'bg-blue-500'
                  )}
                />
                <span className="text-sm font-medium text-gray-900">
                  {data.parentAName || 'Parent A'}
                </span>
              </div>
            </label>
            <label
              className={clsx(
                'flex cursor-pointer items-center gap-3 rounded-lg border p-3 transition-colors',
                {
                  'border-blue-500 bg-blue-50': data.startingParent === 'parentB',
                  'border-gray-200 hover:border-gray-300':
                    data.startingParent !== 'parentB',
                }
              )}
            >
              <input
                type="radio"
                name="startingParent"
                value="parentB"
                checked={data.startingParent === 'parentB'}
                onChange={(e) => handleChange('startingParent', e.target.value)}
                className="h-4 w-4 border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <div className="flex items-center gap-2">
                <div
                  className={clsx(
                    'h-4 w-4 rounded-full',
                    data.parentBColor || 'bg-pink-500'
                  )}
                />
                <span className="text-sm font-medium text-gray-900">
                  {data.parentBName || 'Parent B'}
                </span>
              </div>
            </label>
          </div>
        </div>
      </div>
    </div>
  );
}
