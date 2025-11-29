import { useState } from 'react';
import clsx from 'clsx';
import { Check, ChevronDown, ChevronUp } from 'lucide-react';
import type { PatternType } from '../../../types';
import { getPatternGroups, type PatternDefinition, type SplitType } from '../../../data/patterns';
import { PatternThumbnail } from './PatternThumbnail';

interface PatternPickerProps {
  /** Currently selected pattern type */
  selectedPattern: PatternType | null;
  /** Callback when a pattern is selected */
  onPatternSelect: (pattern: PatternType, split: SplitType) => void;
  /** Color class for parent A in thumbnails */
  parentAColor?: string;
  /** Color class for parent B in thumbnails */
  parentBColor?: string;
}

/**
 * Pattern selection step for the wizard.
 * Displays all schedule patterns grouped by custody split percentage.
 * Selecting a pattern implicitly sets both the pattern and split.
 */
export function PatternPicker({
  selectedPattern,
  onPatternSelect,
  parentAColor = 'bg-blue-500',
  parentBColor = 'bg-pink-500',
}: PatternPickerProps) {
  const patternGroups = getPatternGroups();
  const [expandedPattern, setExpandedPattern] = useState<PatternType | null>(null);

  const handlePatternClick = (pattern: PatternDefinition) => {
    // For MVP, custom pattern just stores the selection (builder placeholder shown in UI)
    onPatternSelect(pattern.type, pattern.split);
  };

  const toggleExpanded = (patternType: PatternType, e: React.MouseEvent) => {
    e.stopPropagation();
    setExpandedPattern((prev) => (prev === patternType ? null : patternType));
  };

  return (
    <div className="space-y-8">
      {patternGroups.map((group) => (
        <div key={group.split}>
          {/* Group header */}
          <h3 className="mb-4 text-lg font-semibold text-gray-900">{group.label}</h3>
          
          {/* Pattern cards grid */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {group.patterns.map((pattern) => {
              const isSelected = selectedPattern === pattern.type;
              const isExpanded = expandedPattern === pattern.type;
              const isCustom = pattern.type === 'custom';

              return (
                <div
                  key={pattern.type}
                  onClick={() => handlePatternClick(pattern)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      handlePatternClick(pattern);
                    }
                  }}
                  role="button"
                  tabIndex={0}
                  aria-pressed={isSelected}
                  className={clsx(
                    'group relative cursor-pointer rounded-xl border-2 p-4 transition-all duration-150',
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

                  <div className="flex gap-4">
                    {/* Mini calendar thumbnail */}
                    <div className="w-20 flex-shrink-0">
                      <PatternThumbnail
                        pattern={pattern.pattern}
                        parentAColor={parentAColor}
                        parentBColor={parentBColor}
                      />
                    </div>

                    {/* Pattern info - min-w-0 prevents flex item from overflowing container */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <h4 className="font-semibold text-gray-900">{pattern.label}</h4>
                          
                          {/* Split badge */}
                          <span
                            className={clsx(
                              'mt-1 inline-block rounded-full px-2 py-0.5 text-xs font-medium',
                              {
                                'bg-green-100 text-green-700': pattern.split === '50/50',
                                'bg-yellow-100 text-yellow-700': pattern.split === '60/40',
                                'bg-orange-100 text-orange-700': pattern.split === '80/20',
                                'bg-red-100 text-red-700': pattern.split === '100/0',
                                'bg-purple-100 text-purple-700': pattern.split === 'Custom',
                              }
                            )}
                          >
                            {pattern.split}
                          </span>
                        </div>
                      </div>

                      {/* Brief description */}
                      <p className="mt-2 text-sm text-gray-600 line-clamp-2">
                        {pattern.description}
                      </p>

                      {/* Expand/collapse button for more details */}
                      {!isCustom && (
                        <button
                          type="button"
                          onClick={(e) => toggleExpanded(pattern.type, e)}
                          className="mt-2 inline-flex items-center gap-1 text-xs text-blue-600 hover:text-blue-700"
                        >
                          {isExpanded ? (
                            <>
                              Less details
                              <ChevronUp className="h-3 w-3" />
                            </>
                          ) : (
                            <>
                              More details
                              <ChevronDown className="h-3 w-3" />
                            </>
                          )}
                        </button>
                      )}

                      {/* Expanded details */}
                      {isExpanded && !isCustom && (
                        <div className="mt-3 rounded-lg bg-gray-50 p-3 text-xs text-gray-600">
                          <p className="mb-2">
                            <span className="font-medium">Cycle length:</span> {pattern.cycleLength} days
                          </p>
                          <p>
                            <span className="font-medium">Pattern:</span>{' '}
                            {pattern.pattern.join(' → ')}
                          </p>
                        </div>
                      )}

                      {/* Custom pattern placeholder */}
                      {isCustom && (
                        <p className="mt-2 text-xs italic text-gray-400">
                          Custom pattern builder coming in MVP
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}
