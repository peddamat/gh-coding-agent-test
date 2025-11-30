/**
 * Court Template Registry
 * 
 * Central registry for all available court custody templates.
 * Templates provide pre-configured holiday assignments, exchange times,
 * and custody patterns based on specific court jurisdictions.
 */

import type { CourtTemplate, TemplateRegistry } from '../../types';
import { NEVADA_8TH_DISTRICT_TEMPLATE } from './nevada-8th-district';

/**
 * Registry of all available court templates.
 * Key is the template ID for quick lookup.
 */
export const TEMPLATE_REGISTRY: TemplateRegistry = {
  [NEVADA_8TH_DISTRICT_TEMPLATE.id]: NEVADA_8TH_DISTRICT_TEMPLATE,
};

/**
 * Array of all templates for iteration/display.
 */
export const ALL_TEMPLATES: CourtTemplate[] = Object.values(TEMPLATE_REGISTRY);

/**
 * Get a template by its ID.
 * @param id - Template ID to look up
 * @returns The template if found, undefined otherwise
 */
export function getTemplateById(id: string): CourtTemplate | undefined {
  return TEMPLATE_REGISTRY[id];
}

/**
 * Get all templates for a specific jurisdiction.
 * @param jurisdiction - Jurisdiction to filter by (partial match)
 * @returns Array of matching templates
 */
export function getTemplatesByJurisdiction(jurisdiction: string): CourtTemplate[] {
  const searchTerm = jurisdiction.toLowerCase();
  return ALL_TEMPLATES.filter(t => 
    t.jurisdiction.toLowerCase().includes(searchTerm)
  );
}

/**
 * Check if a template ID exists in the registry.
 * @param id - Template ID to check
 * @returns True if template exists
 */
export function templateExists(id: string): boolean {
  return id in TEMPLATE_REGISTRY;
}

// Re-export the individual template for direct imports
export { NEVADA_8TH_DISTRICT_TEMPLATE } from './nevada-8th-district';
