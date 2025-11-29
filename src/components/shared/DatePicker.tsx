import clsx from 'clsx';

export interface DatePickerProps {
  /** Unique id for the input element */
  id?: string;
  /** Currently selected date in ISO format (YYYY-MM-DD) */
  value: string;
  /** Callback when date changes */
  onChange: (value: string) => void;
  /** Label text for the picker */
  label?: string;
  /** Whether the field is required */
  required?: boolean;
  /** Whether the field is disabled */
  disabled?: boolean;
  /** Error message to display */
  error?: string;
  /** Minimum selectable date (YYYY-MM-DD) */
  min?: string;
  /** Maximum selectable date (YYYY-MM-DD) */
  max?: string;
}

/**
 * Date picker input component.
 * Uses the native HTML5 date input for best cross-browser compatibility.
 */
export function DatePicker({
  id,
  value,
  onChange,
  label,
  required = false,
  disabled = false,
  error,
  min,
  max,
}: DatePickerProps) {
  return (
    <div className="space-y-1">
      {label && (
        <label htmlFor={id} className="block text-sm font-medium text-gray-700">
          {label}
          {required && <span className="ml-1 text-red-500">*</span>}
        </label>
      )}
      <input
        type="date"
        id={id}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        required={required}
        disabled={disabled}
        min={min}
        max={max}
        className={clsx(
          'block w-full rounded-lg border bg-white px-3 py-2 text-sm shadow-sm transition-colors',
          'focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500',
          {
            'border-red-300 focus:border-red-500 focus:ring-red-500': error,
            'border-gray-300': !error,
            'cursor-not-allowed bg-gray-100 text-gray-500': disabled,
          }
        )}
      />
      {error && <p className="text-sm text-red-600">{error}</p>}
    </div>
  );
}
