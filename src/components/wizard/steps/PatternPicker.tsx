import { useState, useRef, useEffect } from 'react';
import clsx from 'clsx';
import { Check, ChevronDown, Calendar } from 'lucide-react';
import type { PatternType } from '../../../types';
import { PATTERNS, getPatternGroups, getPatternByType, type PatternDefinition, type SplitType } from '../../../data/patterns';
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
 * Get the split badge color classes based on split type.
 */
function getSplitBadgeClasses(split: SplitType): string {
  switch (split) {
    case '50/50':
      return 'bg-green-100 text-green-700';
    case '60/40':
      return 'bg-yellow-100 text-yellow-700';
    case '80/20':
      return 'bg-orange-100 text-orange-700';
    case '100/0':
      return 'bg-red-100 text-red-700';
    case 'Custom':
      return 'bg-purple-100 text-purple-700';
    default:
      return 'bg-gray-100 text-gray-700';
  }
}

/**
 * Pattern selection step for the wizard.
 * Displays a grouped dropdown with a preview panel showing the selected pattern details.
 * Selecting a pattern implicitly sets both the pattern and split.
 */
export function PatternPicker({
  selectedPattern,
  onPatternSelect,
  parentAColor = 'bg-blue-500',
  parentBColor = 'bg-pink-500',
}: PatternPickerProps) {
  const patternGroups = getPatternGroups();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Get the currently selected pattern details
  const selectedPatternDef = selectedPattern ? getPatternByType(selectedPattern) : null;

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Close dropdown on Escape key
  useEffect(() => {
    function handleEscape(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        setIsDropdownOpen(false);
      }
    }
    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, []);

  const handlePatternSelect = (pattern: PatternDefinition) => {
    onPatternSelect(pattern.type, pattern.split);
    setIsDropdownOpen(false);
  };

  return (
    <div className="space-y-6">
      {/* Dropdown selector */}
      <div ref={dropdownRef} className="relative">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Select a Schedule Pattern
        </label>
        
        {/* Dropdown trigger button */}
        <button
          type="button"
          onClick={() => setIsDropdownOpen(!isDropdownOpen)}
          className={clsx(
            'w-full flex items-center justify-between gap-3 px-4 py-3 rounded-xl border-2 bg-white transition-all',
            'hover:border-gray-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2',
            {
              'border-blue-500': isDropdownOpen,
              'border-gray-200': !isDropdownOpen,
            }
          )}
          aria-haspopup="listbox"
          aria-expanded={isDropdownOpen}
        >
          {selectedPatternDef ? (
            <div className="flex items-center gap-3 min-w-0">
              <span
                className={clsx(
                  'flex-shrink-0 rounded-full px-2 py-0.5 text-xs font-medium',
                  getSplitBadgeClasses(selectedPatternDef.split)
                )}
              >
                {selectedPatternDef.split}
              </span>
              <span className="font-medium text-gray-900 truncate">
                {selectedPatternDef.label}
              </span>
            </div>
          ) : (
            <span className="text-gray-500">Choose a custody schedule...</span>
          )}
          <ChevronDown
            className={clsx('h-5 w-5 text-gray-400 flex-shrink-0 transition-transform', {
              'rotate-180': isDropdownOpen,
            })}
          />
        </button>

        {/* Dropdown menu */}
        {isDropdownOpen && (
          <div className="absolute z-10 mt-2 w-full rounded-xl border border-gray-200 bg-white shadow-lg max-h-80 overflow-auto">
            {patternGroups.map((group) => (
              <div key={group.split}>
                {/* Group header */}
                <div className="sticky top-0 bg-gray-50 px-4 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wider border-b border-gray-100">
                  {group.label}
                </div>
                
                {/* Group patterns */}
                {group.patterns.map((pattern) => {
                  const isSelected = selectedPattern === pattern.type;
                  
                  return (
                    <button
                      key={pattern.type}
                      type="button"
                      onClick={() => handlePatternSelect(pattern)}
                      className={clsx(
                        'w-full flex items-center gap-3 px-4 py-3 text-left transition-colors',
                        'hover:bg-blue-50 focus:outline-none focus:bg-blue-50',
                        {
                          'bg-blue-50': isSelected,
                        }
                      )}
                      role="option"
                      aria-selected={isSelected}
                    >
                      {/* Selection indicator */}
                      <div className="w-5 flex-shrink-0">
                        {isSelected && (
                          <Check className="h-5 w-5 text-blue-600" />
                        )}
                      </div>
                      
                      {/* Pattern info */}
                      <div className="flex-1 min-w-0">
                        <div className="font-medium text-gray-900">{pattern.label}</div>
                        <div className="text-sm text-gray-500 truncate">{pattern.description}</div>
                      </div>
                      
                      {/* Split badge */}
                      <span
                        className={clsx(
                          'flex-shrink-0 rounded-full px-2 py-0.5 text-xs font-medium',
                          getSplitBadgeClasses(pattern.split)
                        )}
                      >
                        {pattern.split}
                      </span>
                    </button>
                  );
                })}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Preview panel - shows when a pattern is selected */}
      {selectedPatternDef ? (
        <div className="rounded-xl border-2 border-blue-200 bg-blue-50 p-5">
          {/* Header with name and badge */}
          <div className="flex items-start justify-between gap-4 mb-4">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">
                {selectedPatternDef.label}
              </h3>
              <span
                className={clsx(
                  'mt-1 inline-block rounded-full px-2.5 py-0.5 text-sm font-medium',
                  getSplitBadgeClasses(selectedPatternDef.split)
                )}
              >
                {selectedPatternDef.split} Custody Split
              </span>
            </div>
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-500">
              <Check className="h-6 w-6 text-white" />
            </div>
          </div>

          {/* Description */}
          <p className="text-gray-700 mb-4">
            {selectedPatternDef.description}
          </p>

          {/* Thumbnail and details */}
          {selectedPatternDef.type !== 'custom' ? (
            <div className="flex flex-col sm:flex-row gap-4">
              {/* Mini calendar thumbnail - larger preview */}
              <div className="w-full sm:w-40 flex-shrink-0">
                <div className="text-xs font-medium text-gray-500 mb-2">2-Week Preview</div>
                <div className="bg-white rounded-lg p-3 border border-blue-200">
                  <PatternThumbnail
                    pattern={selectedPatternDef.pattern}
                    parentAColor={parentAColor}
                    parentBColor={parentBColor}
                  />
                </div>
              </div>

              {/* Pattern details */}
              <div className="flex-1 space-y-3">
                <div className="bg-white rounded-lg p-3 border border-blue-200">
                  <div className="text-xs font-medium text-gray-500 mb-1">Cycle Length</div>
                  <div className="text-sm text-gray-900">{selectedPatternDef.cycleLength} days</div>
                </div>
                
                <div className="bg-white rounded-lg p-3 border border-blue-200">
                  <div className="text-xs font-medium text-gray-500 mb-1">Pattern Sequence</div>
                  <div className="flex flex-wrap gap-1">
                    {selectedPatternDef.pattern.map((p, i) => (
                      <span
                        key={i}
                        className={clsx(
                          'w-6 h-6 rounded text-xs font-medium flex items-center justify-center text-white',
                          p === 'A' ? parentAColor : parentBColor
                        )}
                      >
                        {p}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-lg p-4 border border-blue-200 text-center">
              <Calendar className="h-10 w-10 text-purple-400 mx-auto mb-2" />
              <p className="text-sm text-gray-500 italic">
                Custom pattern builder coming soon
              </p>
            </div>
          )}
        </div>
      ) : (
        /* Empty state when no pattern selected */
        <div className="rounded-xl border-2 border-dashed border-gray-300 bg-gray-50 p-8 text-center">
          <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-3" />
          <p className="text-gray-500">
            Select a schedule pattern above to see a preview
          </p>
        </div>
      )}
    </div>
  );
}
