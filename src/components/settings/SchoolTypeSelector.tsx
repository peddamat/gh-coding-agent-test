import clsx from 'clsx';
import { School, Calendar } from 'lucide-react';
import type { SchoolType } from '../../types';

export interface SchoolTypeSelectorProps {
  /** Currently selected school type */
  value: SchoolType;
  /** Callback when school type changes */
  onChange: (value: SchoolType) => void;
  /** Whether the selector is disabled */
  disabled?: boolean;
}

interface SchoolTypeOption {
  type: SchoolType;
  label: string;
  description: string;
  icon: typeof School;
}

const SCHOOL_TYPE_OPTIONS: SchoolTypeOption[] = [
  {
    type: 'traditional',
    label: 'Traditional School',
    description: 'Standard school calendar with summer break',
    icon: School,
  },
  {
    type: 'year-round',
    label: 'Year-Round School',
    description: 'Year-round calendar with track breaks',
    icon: Calendar,
  },
];

/**
 * School type selector component.
 * Allows users to select between traditional and year-round school calendars.
 * When year-round is selected, track breaks can be configured separately.
 */
export function SchoolTypeSelector({
  value,
  onChange,
  disabled = false,
}: SchoolTypeSelectorProps) {
  return (
    <div className="space-y-3">
      <label className="block text-sm font-medium text-gray-700">
        School Type
      </label>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        {SCHOOL_TYPE_OPTIONS.map((option) => {
          const Icon = option.icon;
          const isSelected = value === option.type;
          
          return (
            <button
              key={option.type}
              type="button"
              onClick={() => onChange(option.type)}
              disabled={disabled}
              className={clsx(
                'relative flex items-start gap-3 rounded-lg border-2 p-4 text-left transition-all',
                'focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2',
                {
                  'border-blue-500 bg-blue-50': isSelected,
                  'border-gray-200 bg-white hover:border-gray-300 hover:bg-gray-50': !isSelected,
                  'cursor-not-allowed opacity-50': disabled,
                }
              )}
              aria-pressed={isSelected}
            >
              <div
                className={clsx(
                  'flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full',
                  {
                    'bg-blue-100 text-blue-600': isSelected,
                    'bg-gray-100 text-gray-500': !isSelected,
                  }
                )}
              >
                <Icon className="h-5 w-5" aria-hidden="true" />
              </div>
              <div className="flex-1">
                <span
                  className={clsx('block text-sm font-medium', {
                    'text-blue-900': isSelected,
                    'text-gray-900': !isSelected,
                  })}
                >
                  {option.label}
                </span>
                <span
                  className={clsx('mt-1 block text-xs', {
                    'text-blue-700': isSelected,
                    'text-gray-500': !isSelected,
                  })}
                >
                  {option.description}
                </span>
              </div>
              {/* Selected indicator */}
              {isSelected && (
                <div className="absolute top-2 right-2">
                  <div className="h-3 w-3 rounded-full bg-blue-500" />
                </div>
              )}
            </button>
          );
        })}
      </div>
      {value === 'year-round' && (
        <p className="text-xs text-gray-500">
          Track breaks follow your regular timeshare schedule unless vacation is claimed.
          Vacation must be claimed at least 30 days before the track break starts.
        </p>
      )}
    </div>
  );
}
