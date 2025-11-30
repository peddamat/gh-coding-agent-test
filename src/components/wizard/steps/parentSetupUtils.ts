import { COLOR_OPTIONS } from '../../shared/colorOptions';
import type { ParentId, AppState, ParentRelationship, Child } from '../../../types';

export interface ParentSetupData {
  parentAName: string;
  parentBName: string;
  parentAColor: string;
  parentBColor: string;
  parentARelationship: ParentRelationship;
  parentBRelationship: ParentRelationship;
  startDate: string;
  startingParent: ParentId;
  children: Child[];
}

export interface ValidationErrors {
  parentAName?: string;
  parentBName?: string;
  parentAColor?: string;
  parentBColor?: string;
  parentARelationship?: string;
  parentBRelationship?: string;
  startDate?: string;
  colorConflict?: string;
  children?: string;
}

/**
 * Validates the parent setup form data.
 * @param data - The parent setup data to validate
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
 * @returns {ParentSetupData} Default parent setup data with today's date and default colors
 */
export function getDefaultParentSetupData(): ParentSetupData {
  const today = new Date();
  const todayISO = today.toISOString().split('T')[0];

  return {
    parentAName: '',
    parentBName: '',
    parentAColor: COLOR_OPTIONS[0].value, // Blue
    parentBColor: COLOR_OPTIONS[1].value, // Pink
    parentARelationship: 'dad',
    parentBRelationship: 'mom',
    startDate: todayISO,
    startingParent: 'parentA',
    children: [],
  };
}

/**
 * Transform ParentSetupData to the AppState parents and config format.
 * @param data - The parent setup data from the wizard form
 * @returns Object containing parents config, partial app config, and family info
 */
export function toAppStateFormat(data: ParentSetupData): {
  parents: AppState['parents'];
  config: Pick<AppState['config'], 'startDate' | 'startingParent'>;
  familyInfo: AppState['familyInfo'];
} {
  return {
    parents: {
      parentA: {
        name: data.parentAName,
        colorClass: data.parentAColor,
        relationship: data.parentARelationship,
      },
      parentB: {
        name: data.parentBName,
        colorClass: data.parentBColor,
        relationship: data.parentBRelationship,
      },
    },
    config: {
      startDate: data.startDate,
      startingParent: data.startingParent,
    },
    familyInfo: {
      children: data.children,
      planStartDate: data.startDate,
    },
  };
}

/**
 * Transform AppState parents and config to ParentSetupData format.
 * @param parents - The parents configuration from AppState
 * @param config - The app config containing startDate and startingParent
 * @param familyInfo - Optional family info containing children
 * @returns ParentSetupData for use in the wizard form
 */
export function fromAppStateFormat(
  parents: AppState['parents'],
  config: Pick<AppState['config'], 'startDate' | 'startingParent'>,
  familyInfo?: AppState['familyInfo']
): ParentSetupData {
  return {
    parentAName: parents.parentA.name,
    parentBName: parents.parentB.name,
    parentAColor: parents.parentA.colorClass,
    parentBColor: parents.parentB.colorClass,
    parentARelationship: parents.parentA.relationship || 'dad',
    parentBRelationship: parents.parentB.relationship || 'mom',
    startDate: config.startDate,
    startingParent: config.startingParent,
    children: familyInfo?.children || [],
  };
}
