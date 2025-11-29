import { COLOR_OPTIONS } from '../../shared/colorOptions';
import type { ParentId } from '../../../types';

export interface ParentSetupData {
  parentAName: string;
  parentBName: string;
  parentAColor: string;
  parentBColor: string;
  startDate: string;
  startingParent: ParentId;
}

export interface ValidationErrors {
  parentAName?: string;
  parentBName?: string;
  parentAColor?: string;
  parentBColor?: string;
  startDate?: string;
  colorConflict?: string;
}

/**
 * Validates the parent setup form data.
 * @returns Object with field-specific error messages
 */
export function validateParentSetup(data: ParentSetupData): ValidationErrors {
  const errors: ValidationErrors = {};

  if (!data.parentAName.trim()) {
    errors.parentAName = 'Parent A name is required';
  }

  if (!data.parentBName.trim()) {
    errors.parentBName = 'Parent B name is required';
  }

  if (!data.parentAColor) {
    errors.parentAColor = 'Please select a color for Parent A';
  }

  if (!data.parentBColor) {
    errors.parentBColor = 'Please select a color for Parent B';
  }

  if (!data.startDate) {
    errors.startDate = 'Schedule start date is required';
  }

  // Check for color conflict (same color for both parents)
  if (
    data.parentAColor &&
    data.parentBColor &&
    data.parentAColor === data.parentBColor
  ) {
    errors.colorConflict = 'Parents must have different colors';
  }

  return errors;
}

/**
 * Check if the form data is valid.
 * @param data - The parent setup data to validate
 * @returns True if the data is valid, false otherwise
 */
export function isParentSetupValid(data: ParentSetupData): boolean {
  const errors = validateParentSetup(data);
  return Object.keys(errors).length === 0;
}

/**
 * Get default parent setup data.
 */
export function getDefaultParentSetupData(): ParentSetupData {
  const today = new Date();
  const todayISO = today.toISOString().split('T')[0];

  return {
    parentAName: '',
    parentBName: '',
    parentAColor: COLOR_OPTIONS[0].value, // Blue
    parentBColor: COLOR_OPTIONS[1].value, // Pink
    startDate: todayISO,
    startingParent: 'parentA',
  };
}
