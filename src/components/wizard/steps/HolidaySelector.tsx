import clsx from 'clsx';
import { 
  HOLIDAYS, 
  getConfiguredHolidayCount,
  type HolidayAssignment,
  type HolidaySelection,
} from './holidaySelectorUtils';

/** Props for the HolidaySelector component */
export interface HolidaySelectorProps {
  /** Current holiday selections */
  selections: HolidaySelection[];
  /** Callback when selections change */
  onSelectionsChange: (selections: HolidaySelection[]) => void;
  /** Display name for Parent A (defaults to "Parent A") */
  parentAName?: string;
  /** Display name for Parent B (defaults to "Parent B") */
  parentBName?: string;
}

/**
 * Step 3 wizard component for holiday custody selection.
 * Allows users to select which parent gets custody for major holidays.
 */
export function HolidaySelector({
  selections,
  onSelectionsChange,
  parentAName = 'Parent A',
  parentBName = 'Parent B',
}: HolidaySelectorProps) {
  const configuredCount = getConfiguredHolidayCount(selections);

  const handleAssignmentChange = (holidayId: string, assignment: HolidayAssignment) => {
    const newSelections = selections.map((selection) =>
      selection.holidayId === holidayId ? { ...selection, assignment } : selection
    );
    onSelectionsChange(newSelections);
  };

  const getSelection = (holidayId: string): HolidayAssignment => {
    const selection = selections.find((s) => s.holidayId === holidayId);
    return selection?.assignment ?? 'alternate';
  };

  return (
    <div className="space-y-6">
      {/* Section header */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900">Holiday Custody</h3>
        <p className="mt-1 text-sm text-gray-600">
          Select which parent has custody for major holidays. You can also alternate years.
        </p>
      </div>

      {/* Summary count */}
      <div className="rounded-lg border border-gray-200 bg-gray-50 px-4 py-3">
        <p className="text-sm text-gray-700">
          <span className="font-semibold">{configuredCount}</span>{' '}
          {configuredCount === 1 ? 'holiday' : 'holidays'} configured
        </p>
      </div>

      {/* Holiday list */}
      <div className="space-y-4">
        {HOLIDAYS.map((holiday) => {
          const currentAssignment = getSelection(holiday.id);

          return (
            <fieldset
              key={holiday.id}
              className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm"
            >
              <legend className="mb-3 font-medium text-gray-900">{holiday.name}</legend>

              {/* Radio options */}
              <div className="flex flex-wrap gap-2">
                {/* Parent A option */}
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

                {/* Parent B option */}
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

                {/* Alternate Years option */}
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

      {/* Skip hint */}
      <p className="text-center text-sm text-gray-500">
        This step is optional. Click "Next" to continue without configuring holidays.
      </p>
    </div>
  );
}
