import { useState, useRef, useEffect, useCallback } from 'react';
import clsx from 'clsx';
import { Check, ChevronDown, Calendar, Plus, X, AlertTriangle } from 'lucide-react';
import type { PatternType, Child } from '../../../types';
import { RELATIONSHIP_OPTIONS } from '../../../types';
import { getPatternGroups, getPatternByType, type PatternDefinition, type SplitType } from '../../../data/patterns';
import { PatternThumbnail } from './PatternThumbnail';
import { ColorPicker } from '../../shared/ColorPicker';
import { DatePicker } from '../../shared/DatePicker';
import type { ParentSetupData } from './parentSetupUtils';
import { calculatePlanExpiration } from '../../../utils/familyUtils';

interface PatternPickerProps {
  /** Currently selected pattern type */
  selectedPattern: PatternType | null;
  /** Callback when a pattern is selected */
  onPatternSelect: (pattern: PatternType, split: SplitType) => void;
  /** Parent setup data (names, colors) */
  parentSetupData: ParentSetupData;
  /** Callback when parent setup data changes */
  onParentSetupChange: (data: ParentSetupData) => void;
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
 * Includes parent name/color inputs above a grouped dropdown with preview panel.
 * Selecting a pattern implicitly sets both the pattern and split.
 */
export function PatternPicker({
  selectedPattern,
  onPatternSelect,
  parentSetupData,
  onParentSetupChange,
}: PatternPickerProps) {
  const patternGroups = getPatternGroups();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Get the currently selected pattern details
  const selectedPatternDef = selectedPattern ? getPatternByType(selectedPattern) : null;

  // Parent colors for thumbnails
  const parentAColor = parentSetupData.parentAColor || 'bg-blue-500';
  const parentBColor = parentSetupData.parentBColor || 'bg-pink-500';

  // Handle parent data changes
  const handleParentChange = useCallback(
    (field: keyof ParentSetupData, value: string) => {
      onParentSetupChange({
        ...parentSetupData,
        [field]: value,
      });
    },
    [parentSetupData, onParentSetupChange]
  );

  // Add a new child to the list
  const handleAddChild = useCallback(() => {
    const newChild: Child = {
      id: crypto.randomUUID(),
      name: '',
      birthdate: '',
      custodyEndAge: 18,
    };
    onParentSetupChange({
      ...parentSetupData,
      children: [...parentSetupData.children, newChild],
    });
  }, [parentSetupData, onParentSetupChange]);

  // Remove a child from the list
  const handleRemoveChild = useCallback(
    (childId: string) => {
      onParentSetupChange({
        ...parentSetupData,
        children: parentSetupData.children.filter((c) => c.id !== childId),
      });
    },
    [parentSetupData, onParentSetupChange]
  );

  // Update a specific child's data
  const handleChildChange = useCallback(
    (childId: string, field: keyof Child, value: string | number) => {
      onParentSetupChange({
        ...parentSetupData,
        children: parentSetupData.children.map((child) =>
          child.id === childId ? { ...child, [field]: value } : child
        ),
      });
    },
    [parentSetupData, onParentSetupChange]
  );

  // Calculate plan expiration date based on children
  const planExpiration = calculatePlanExpiration(parentSetupData.children);

  // Validate if a birthdate is in the past
  const isBirthdateValid = (birthdate: string): boolean => {
    if (!birthdate) return false;
    const today = new Date().toISOString().split('T')[0];
    return birthdate <= today;
  };

  // Format date for display (e.g., "May 15, 2036")
  const formatDateForDisplay = (dateStr: string | null): string => {
    if (!dateStr) return '';
    const date = new Date(dateStr + 'T00:00:00');
    return date.toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    });
  };

  // Find the youngest child for display (filters out children without valid birthdates)
  const getYoungestChild = (): Child | null => {
    const childrenWithBirthdates = parentSetupData.children.filter(
      (child) => child.birthdate && child.birthdate.match(/^\d{4}-\d{2}-\d{2}$/)
    );
    if (childrenWithBirthdates.length === 0) return null;
    return childrenWithBirthdates.reduce((prev, curr) =>
      prev.birthdate > curr.birthdate ? prev : curr
    );
  };

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
      {/* Section header */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900">Tell us about your family</h3>
        <p className="mt-1 text-sm text-gray-600">
          Enter information about both parents and your children.
        </p>
      </div>

      {/* Parent Information Section */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {/* Parent A */}
        <div className="space-y-3 rounded-xl bg-gray-50 p-4">
          <h4 className="font-medium text-gray-900">Parent A</h4>
          
          {/* Name input */}
          <div className="space-y-1">
            <label
              htmlFor="parentAName"
              className="block text-sm font-medium text-gray-700"
            >
              Name
            </label>
            <input
              type="text"
              id="parentAName"
              value={parentSetupData.parentAName}
              onChange={(e) => handleParentChange('parentAName', e.target.value)}
              placeholder="e.g., John, Sarah"
              className="block w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm shadow-sm transition-colors focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>

          {/* Relationship dropdown */}
          <div className="space-y-1">
            <label
              htmlFor="parentARelationship"
              className="block text-sm font-medium text-gray-700"
            >
              Role
            </label>
            <select
              id="parentARelationship"
              value={parentSetupData.parentARelationship}
              onChange={(e) => handleParentChange('parentARelationship', e.target.value)}
              className="block w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm shadow-sm transition-colors focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            >
              {RELATIONSHIP_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          {/* Color picker */}
          <ColorPicker
            id="parentAColor"
            value={parentSetupData.parentAColor}
            onChange={(value) => handleParentChange('parentAColor', value)}
            label="Color"
          />
        </div>

        {/* Parent B */}
        <div className="space-y-3 rounded-xl bg-gray-50 p-4">
          <h4 className="font-medium text-gray-900">Parent B</h4>
          
          {/* Name input */}
          <div className="space-y-1">
            <label
              htmlFor="parentBName"
              className="block text-sm font-medium text-gray-700"
            >
              Name
            </label>
            <input
              type="text"
              id="parentBName"
              value={parentSetupData.parentBName}
              onChange={(e) => handleParentChange('parentBName', e.target.value)}
              placeholder="e.g., John, Sarah"
              className="block w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm shadow-sm transition-colors focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>

          {/* Relationship dropdown */}
          <div className="space-y-1">
            <label
              htmlFor="parentBRelationship"
              className="block text-sm font-medium text-gray-700"
            >
              Role
            </label>
            <select
              id="parentBRelationship"
              value={parentSetupData.parentBRelationship}
              onChange={(e) => handleParentChange('parentBRelationship', e.target.value)}
              className="block w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm shadow-sm transition-colors focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            >
              {RELATIONSHIP_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          {/* Color picker */}
          <ColorPicker
            id="parentBColor"
            value={parentSetupData.parentBColor}
            onChange={(value) => handleParentChange('parentBColor', value)}
            label="Color"
          />
        </div>
      </div>

      {/* Color conflict warning */}
      {parentSetupData.parentAColor && parentSetupData.parentBColor && 
       parentSetupData.parentAColor === parentSetupData.parentBColor && (
        <div className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3">
          <p className="text-sm text-amber-700">Parents must have different colors for calendar visibility</p>
        </div>
      )}

      {/* Children Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h4 className="font-medium text-gray-900">Children</h4>
            <p className="text-sm text-gray-500">Add information about your children</p>
          </div>
        </div>

        <div className="rounded-xl border border-gray-200 bg-gray-50 p-4 space-y-4">
          {parentSetupData.children.length === 0 ? (
            <div className="text-center py-4">
              <p className="text-sm text-gray-500 mb-3">No children added yet</p>
              <button
                type="button"
                onClick={handleAddChild}
                className="inline-flex items-center gap-2 rounded-lg bg-blue-500 px-4 py-2 text-sm font-medium text-white hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
              >
                <Plus className="h-4 w-4" />
                Add Child
              </button>
            </div>
          ) : (
            <>
              {/* Children list */}
              <div className="space-y-3">
                {parentSetupData.children.map((child, index) => {
                  const birthdateInvalid = child.birthdate && !isBirthdateValid(child.birthdate);
                  return (
                    <div
                      key={child.id}
                      className="flex flex-wrap items-start gap-3 rounded-lg bg-white p-3 border border-gray-200"
                    >
                      {/* Child name */}
                      <div className="flex-1 min-w-[120px]">
                        <label
                          htmlFor={`child-name-${child.id}`}
                          className="block text-xs font-medium text-gray-500 mb-1"
                        >
                          Name
                        </label>
                        <input
                          type="text"
                          id={`child-name-${child.id}`}
                          value={child.name}
                          onChange={(e) => handleChildChange(child.id, 'name', e.target.value)}
                          placeholder={`Child ${index + 1}`}
                          className="block w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm shadow-sm transition-colors focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                        />
                      </div>

                      {/* Child birthdate */}
                      <div className="flex-1 min-w-[150px]">
                        <label
                          htmlFor={`child-birthdate-${child.id}`}
                          className="block text-xs font-medium text-gray-500 mb-1"
                        >
                          Birthdate
                        </label>
                        <input
                          type="date"
                          id={`child-birthdate-${child.id}`}
                          value={child.birthdate}
                          onChange={(e) => handleChildChange(child.id, 'birthdate', e.target.value)}
                          max={new Date().toISOString().split('T')[0]}
                          className={clsx(
                            'block w-full rounded-lg border bg-white px-3 py-2 text-sm shadow-sm transition-colors focus:outline-none focus:ring-1',
                            birthdateInvalid
                              ? 'border-red-300 focus:border-red-500 focus:ring-red-500'
                              : 'border-gray-300 focus:border-blue-500 focus:ring-blue-500'
                          )}
                        />
                        {birthdateInvalid && (
                          <p className="mt-1 text-xs text-red-600">Birthdate must be in the past</p>
                        )}
                      </div>

                      {/* Remove button */}
                      <button
                        type="button"
                        onClick={() => handleRemoveChild(child.id)}
                        className="mt-6 rounded-lg p-2 text-gray-400 hover:bg-gray-100 hover:text-red-500 focus:outline-none focus:ring-2 focus:ring-red-500"
                        aria-label={`Remove ${child.name || 'child'}`}
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  );
                })}
              </div>

              {/* Add another child button */}
              <button
                type="button"
                onClick={handleAddChild}
                className="inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
              >
                <Plus className="h-4 w-4" />
                Add Child
              </button>
            </>
          )}
        </div>

        {/* No children warning */}
        {parentSetupData.children.length === 0 && (
          <div className="flex items-start gap-2 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3">
            <AlertTriangle className="h-5 w-5 text-amber-500 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-amber-700">
              Adding children helps calculate when the custody plan expires and enables birthday automations.
            </p>
          </div>
        )}

        {/* Plan expiration display */}
        {planExpiration && (() => {
          const youngest = getYoungestChild();
          if (!youngest) return null;
          return (
            <div className="rounded-lg border border-green-200 bg-green-50 px-4 py-3">
              <p className="text-sm text-green-700">
                <span className="font-medium">Plan active until:</span>{' '}
                {formatDateForDisplay(planExpiration)}{' '}
                <span className="text-green-600">
                  (when {youngest.name || 'youngest child'} turns {youngest.custodyEndAge || 18})
                </span>
              </p>
            </div>
          );
        })()}
      </div>

      {/* Schedule Settings */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {/* Start date */}
        <DatePicker
          id="startDate"
          value={parentSetupData.startDate}
          onChange={(value) => handleParentChange('startDate', value)}
          label="Schedule Start Date"
        />

        {/* Starting parent */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">
            Who has the child first?
          </label>
          <div className="flex gap-2">
            <label
              className={clsx(
                'flex-1 flex cursor-pointer items-center justify-center gap-2 rounded-lg border p-3 transition-colors',
                {
                  'border-blue-500 bg-blue-50': parentSetupData.startingParent === 'parentA',
                  'border-gray-200 hover:border-gray-300': parentSetupData.startingParent !== 'parentA',
                }
              )}
            >
              <input
                type="radio"
                name="startingParent"
                value="parentA"
                checked={parentSetupData.startingParent === 'parentA'}
                onChange={(e) => handleParentChange('startingParent', e.target.value)}
                className="sr-only"
              />
              <div
                className={clsx(
                  'h-4 w-4 rounded-full',
                  parentSetupData.parentAColor || 'bg-blue-500'
                )}
              />
              <span className="text-sm font-medium text-gray-900">
                {parentSetupData.parentAName || 'Parent A'}
              </span>
            </label>
            <label
              className={clsx(
                'flex-1 flex cursor-pointer items-center justify-center gap-2 rounded-lg border p-3 transition-colors',
                {
                  'border-blue-500 bg-blue-50': parentSetupData.startingParent === 'parentB',
                  'border-gray-200 hover:border-gray-300': parentSetupData.startingParent !== 'parentB',
                }
              )}
            >
              <input
                type="radio"
                name="startingParent"
                value="parentB"
                checked={parentSetupData.startingParent === 'parentB'}
                onChange={(e) => handleParentChange('startingParent', e.target.value)}
                className="sr-only"
              />
              <div
                className={clsx(
                  'h-4 w-4 rounded-full',
                  parentSetupData.parentBColor || 'bg-pink-500'
                )}
              />
              <span className="text-sm font-medium text-gray-900">
                {parentSetupData.parentBName || 'Parent B'}
              </span>
            </label>
          </div>
        </div>
      </div>

      {/* Schedule Dropdown selector */}
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
