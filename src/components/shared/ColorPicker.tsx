import clsx from 'clsx';
import { COLOR_OPTIONS, type ColorOption } from './colorOptions';

export type { ColorOption };

export interface ColorPickerProps {
  /** Unique id for the select element */
  id?: string;
  /** Currently selected color value (Tailwind class) */
  value: string;
  /** Callback when color selection changes */
  onChange: (value: string) => void;
  /** Label text for the picker */
  label?: string;
  /** Whether the field is disabled */
  disabled?: boolean;
  /** Error message to display */
  error?: string;
}

/**
 * Color picker dropdown component with color preview.
 * Displays a dropdown of Tailwind color options with color swatches.
 */
export function ColorPicker({
  id,
  value,
  onChange,
  label,
  disabled = false,
  error,
}: ColorPickerProps) {
  const selectedOption = COLOR_OPTIONS.find((opt) => opt.value === value);

  return (
    <div className="space-y-1">
      {label && (
        <label htmlFor={id} className="block text-sm font-medium text-gray-700">
          {label}
        </label>
      )}
      <div className="relative">
        <div className="flex items-center gap-2">
          {/* Color preview swatch */}
          <div
            className={clsx(
              'h-6 w-6 flex-shrink-0 rounded-full border border-gray-200',
              selectedOption?.value || 'bg-gray-200'
            )}
            aria-hidden="true"
          />
          <select
            id={id}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            disabled={disabled}
            className={clsx(
              'block w-full rounded-lg border bg-white px-3 py-2 text-sm shadow-sm transition-colors',
              'focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500',
              {
                'border-red-300 focus:border-red-500 focus:ring-red-500': error,
                'border-gray-300': !error,
                'cursor-not-allowed bg-gray-100 text-gray-500': disabled,
              }
            )}
          >
            <option value="">Select a color</option>
            {COLOR_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
      </div>
      {error && <p className="text-sm text-red-600">{error}</p>}
    </div>
  );
}
