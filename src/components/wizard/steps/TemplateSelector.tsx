import clsx from 'clsx';
import { Check, Building2, PencilLine } from 'lucide-react';
import type { CourtTemplate } from '../../../types';
import { ALL_TEMPLATES } from '../../../data/templates';

/**
 * Option for template selection - either a court template or "Build Your Own".
 */
export type TemplateOption = 
  | { type: 'template'; template: CourtTemplate }
  | { type: 'build-your-own' };

export interface TemplateSelectorProps {
  /** Currently selected option */
  selectedOption: TemplateOption | null;
  /** Callback when an option is selected */
  onOptionSelect: (option: TemplateOption) => void;
}

/**
 * Get descriptive label for the custody split.
 */
function getPatternLabel(pattern: CourtTemplate['defaultPattern']): string {
  const labels: Record<string, string> = {
    'alt-weeks': 'Every Other Week (50/50)',
    '2-2-3': '2-2-3 Rotation (50/50)',
    '2-2-5-5': '2-2-5-5 Rotation (50/50)',
    '3-4-4-3': '3-4-4-3 Rotation (50/50)',
    'every-weekend': 'Every Weekend (60/40)',
    'every-other-weekend': 'Every Other Weekend (80/20)',
    'same-weekends-monthly': 'Same Weekends Monthly (80/20)',
    'all-to-one': 'All to One Parent (100/0)',
    'custom': 'Custom Pattern',
  };
  return labels[pattern] || pattern;
}

/**
 * Template card component for displaying a court template option.
 */
function TemplateCard({
  template,
  isSelected,
  onSelect,
}: {
  template: CourtTemplate;
  isSelected: boolean;
  onSelect: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onSelect}
      className={clsx(
        'relative flex flex-col items-start gap-3 rounded-xl border-2 p-5 text-left transition-all',
        'hover:shadow-md focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2',
        {
          'border-blue-500 bg-blue-50 shadow-md': isSelected,
          'border-gray-200 bg-white hover:border-gray-300': !isSelected,
        }
      )}
    >
      {/* Selection indicator */}
      {isSelected && (
        <div className="absolute right-3 top-3 flex h-6 w-6 items-center justify-center rounded-full bg-blue-500">
          <Check className="h-4 w-4 text-white" />
        </div>
      )}

      {/* Icon and jurisdiction */}
      <div className="flex items-center gap-3">
        <div
          className={clsx(
            'flex h-10 w-10 items-center justify-center rounded-lg',
            isSelected ? 'bg-blue-500 text-white' : 'bg-gray-100 text-gray-600'
          )}
        >
          <Building2 className="h-5 w-5" />
        </div>
        <div>
          <h3 className="font-semibold text-gray-900">{template.name}</h3>
          <p className="text-sm text-gray-500">{template.jurisdiction}</p>
        </div>
      </div>

      {/* Description */}
      <p className="text-sm text-gray-600 line-clamp-2">{template.description}</p>

      {/* Template details */}
      <div className="flex flex-wrap gap-2">
        <span className="inline-flex items-center rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-medium text-gray-700">
          {getPatternLabel(template.defaultPattern)}
        </span>
        <span className="inline-flex items-center rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-medium text-gray-700">
          {template.holidays.length} holidays
        </span>
        <span className="inline-flex items-center rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-medium text-gray-700">
          {template.defaultExchangeTime.replace(':', ':')} exchange
        </span>
      </div>

      {/* Select button */}
      <div
        className={clsx(
          'mt-auto w-full rounded-lg py-2 text-center text-sm font-medium transition-colors',
          {
            'bg-blue-500 text-white': isSelected,
            'bg-gray-100 text-gray-700 hover:bg-gray-200': !isSelected,
          }
        )}
      >
        {isSelected ? 'Selected' : 'Select'}
      </div>
    </button>
  );
}

/**
 * "Build Your Own" card component.
 */
function BuildYourOwnCard({
  isSelected,
  onSelect,
}: {
  isSelected: boolean;
  onSelect: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onSelect}
      className={clsx(
        'relative flex flex-col items-start gap-3 rounded-xl border-2 p-5 text-left transition-all',
        'hover:shadow-md focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2',
        {
          'border-blue-500 bg-blue-50 shadow-md': isSelected,
          'border-gray-200 bg-white hover:border-gray-300': !isSelected,
        }
      )}
    >
      {/* Selection indicator */}
      {isSelected && (
        <div className="absolute right-3 top-3 flex h-6 w-6 items-center justify-center rounded-full bg-blue-500">
          <Check className="h-4 w-4 text-white" />
        </div>
      )}

      {/* Icon and title */}
      <div className="flex items-center gap-3">
        <div
          className={clsx(
            'flex h-10 w-10 items-center justify-center rounded-lg',
            isSelected ? 'bg-blue-500 text-white' : 'bg-purple-100 text-purple-600'
          )}
        >
          <PencilLine className="h-5 w-5" />
        </div>
        <div>
          <h3 className="font-semibold text-gray-900">Build Your Own</h3>
          <p className="text-sm text-gray-500">Custom Schedule</p>
        </div>
      </div>

      {/* Description */}
      <p className="text-sm text-gray-600">
        Start from scratch with full control over all settings. Choose your own custody pattern,
        exchange times, and holiday assignments.
      </p>

      {/* Features list */}
      <div className="flex flex-wrap gap-2">
        <span className="inline-flex items-center rounded-full bg-purple-100 px-2.5 py-0.5 text-xs font-medium text-purple-700">
          Choose any pattern
        </span>
        <span className="inline-flex items-center rounded-full bg-purple-100 px-2.5 py-0.5 text-xs font-medium text-purple-700">
          Custom holidays
        </span>
        <span className="inline-flex items-center rounded-full bg-purple-100 px-2.5 py-0.5 text-xs font-medium text-purple-700">
          Flexible times
        </span>
      </div>

      {/* Select button */}
      <div
        className={clsx(
          'mt-auto w-full rounded-lg py-2 text-center text-sm font-medium transition-colors',
          {
            'bg-blue-500 text-white': isSelected,
            'bg-gray-100 text-gray-700 hover:bg-gray-200': !isSelected,
          }
        )}
      >
        {isSelected ? 'Selected' : 'Select'}
      </div>
    </button>
  );
}

/**
 * Template selector step for the wizard.
 * Allows users to choose from pre-configured court templates or start from scratch.
 */
export function TemplateSelector({
  selectedOption,
  onOptionSelect,
}: TemplateSelectorProps) {
  const isTemplateSelected = (template: CourtTemplate): boolean => {
    return (
      selectedOption?.type === 'template' &&
      selectedOption.template.id === template.id
    );
  };

  const isBuildYourOwnSelected = selectedOption?.type === 'build-your-own';

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-xl font-semibold text-gray-900">Quick Start</h2>
        <p className="mt-1 text-sm text-gray-500">
          Start from a court template for quick setup, or build your own custom schedule.
        </p>
      </div>

      {/* Template cards grid */}
      <div className="grid gap-4 sm:grid-cols-2">
        {/* Court templates */}
        {ALL_TEMPLATES.map((template) => (
          <TemplateCard
            key={template.id}
            template={template}
            isSelected={isTemplateSelected(template)}
            onSelect={() => onOptionSelect({ type: 'template', template })}
          />
        ))}

        {/* Build Your Own option */}
        <BuildYourOwnCard
          isSelected={isBuildYourOwnSelected}
          onSelect={() => onOptionSelect({ type: 'build-your-own' })}
        />
      </div>

      {/* Coming soon note */}
      <p className="text-center text-sm text-gray-400">
        More templates coming soon...
      </p>

      {/* Selected option summary */}
      {selectedOption && (
        <div className="rounded-lg bg-gray-50 p-4">
          <h3 className="text-sm font-medium text-gray-700">Selected Option</h3>
          {selectedOption.type === 'template' ? (
            <div className="mt-2">
              <p className="font-medium text-gray-900">
                {selectedOption.template.name}
              </p>
              <p className="text-sm text-gray-500">
                Default pattern: {getPatternLabel(selectedOption.template.defaultPattern)}
                {' · '}
                Exchange time: {selectedOption.template.defaultExchangeTime}
              </p>
              {selectedOption.template.notes && (
                <p className="mt-2 text-xs text-gray-500 italic">
                  {selectedOption.template.notes}
                </p>
              )}
            </div>
          ) : (
            <div className="mt-2">
              <p className="font-medium text-gray-900">Build Your Own</p>
              <p className="text-sm text-gray-500">
                You&apos;ll configure all settings manually in the following steps.
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
