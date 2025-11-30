import { describe, test, expect } from 'vitest';
import { NEVADA_8TH_DISTRICT_TEMPLATE } from '../nevada-8th-district';
import { ALL_TEMPLATES, TEMPLATE_REGISTRY, getTemplateById, getTemplatesByJurisdiction, templateExists } from '../index';

describe('Nevada 8th District Court Template', () => {
  test('template has correct ID', () => {
    expect(NEVADA_8TH_DISTRICT_TEMPLATE.id).toBe('nevada-8th-district-standard');
  });

  test('template has correct jurisdiction', () => {
    expect(NEVADA_8TH_DISTRICT_TEMPLATE.jurisdiction).toContain('Nevada');
    expect(NEVADA_8TH_DISTRICT_TEMPLATE.jurisdiction).toContain('8th District');
  });

  test('template has correct default pattern', () => {
    expect(NEVADA_8TH_DISTRICT_TEMPLATE.defaultPattern).toBe('every-other-weekend');
  });

  test('template has correct exchange time', () => {
    expect(NEVADA_8TH_DISTRICT_TEMPLATE.defaultExchangeTime).toBe('18:00');
  });

  test('template has holiday assignments', () => {
    expect(NEVADA_8TH_DISTRICT_TEMPLATE.holidays.length).toBeGreaterThan(0);
  });

  test('template has major breaks configured', () => {
    expect(NEVADA_8TH_DISTRICT_TEMPLATE.majorBreaks.length).toBeGreaterThan(0);
  });

  describe('Holiday Assignments', () => {
    test('has New Year\'s Day assignment', () => {
      const newYears = NEVADA_8TH_DISTRICT_TEMPLATE.holidays.find(h => h.holidayId === 'new-years-day');
      expect(newYears).toBeDefined();
      expect(newYears?.assignment).toBe('alternate-odd-even');
      expect(newYears?.oddYearParent).toBe('parentB');
    });

    test('has Thanksgiving assignment', () => {
      const thanksgiving = NEVADA_8TH_DISTRICT_TEMPLATE.holidays.find(h => h.holidayId === 'thanksgiving');
      expect(thanksgiving).toBeDefined();
      expect(thanksgiving?.assignment).toBe('alternate-odd-even');
      expect(thanksgiving?.oddYearParent).toBe('parentB');
    });

    test('has Winter Break assignment with split', () => {
      const winterBreak = NEVADA_8TH_DISTRICT_TEMPLATE.holidays.find(h => h.holidayId === 'winter-break');
      expect(winterBreak).toBeDefined();
      expect(winterBreak?.assignment).toBe('split-period');
    });

    test('has Mother\'s Day always with Parent B', () => {
      const mothersDay = NEVADA_8TH_DISTRICT_TEMPLATE.holidays.find(h => h.holidayId === 'mothers-day');
      expect(mothersDay).toBeDefined();
      expect(mothersDay?.assignment).toBe('always-parent-b');
    });

    test('has Father\'s Day always with Parent A', () => {
      const fathersDay = NEVADA_8TH_DISTRICT_TEMPLATE.holidays.find(h => h.holidayId === 'fathers-day');
      expect(fathersDay).toBeDefined();
      expect(fathersDay?.assignment).toBe('always-parent-a');
    });

    test('all holidays have enabled flag', () => {
      NEVADA_8TH_DISTRICT_TEMPLATE.holidays.forEach(holiday => {
        expect(holiday.enabled).toBe(true);
      });
    });
  });

  describe('Major Breaks', () => {
    test('has Summer Vacation configuration', () => {
      const summer = NEVADA_8TH_DISTRICT_TEMPLATE.majorBreaks.find(b => b.breakId === 'summer-vacation');
      expect(summer).toBeDefined();
      expect(summer?.weeksPerParent).toBe(2);
      expect(summer?.selectionDeadline).toBe('April 1');
    });

    test('has Winter Break configuration with split', () => {
      const winter = NEVADA_8TH_DISTRICT_TEMPLATE.majorBreaks.find(b => b.breakId === 'winter-break');
      expect(winter).toBeDefined();
      expect(winter?.isSplit).toBe(true);
    });
  });
});

describe('Template Registry', () => {
  test('registry contains Nevada template', () => {
    expect(TEMPLATE_REGISTRY['nevada-8th-district-standard']).toBeDefined();
  });

  test('ALL_TEMPLATES array contains Nevada template', () => {
    expect(ALL_TEMPLATES.length).toBeGreaterThan(0);
    expect(ALL_TEMPLATES.find(t => t.id === 'nevada-8th-district-standard')).toBeDefined();
  });

  test('getTemplateById returns correct template', () => {
    const template = getTemplateById('nevada-8th-district-standard');
    expect(template).toBeDefined();
    expect(template?.id).toBe('nevada-8th-district-standard');
  });

  test('getTemplateById returns undefined for unknown ID', () => {
    const template = getTemplateById('unknown-template');
    expect(template).toBeUndefined();
  });

  test('getTemplatesByJurisdiction returns Nevada template', () => {
    const templates = getTemplatesByJurisdiction('Nevada');
    expect(templates.length).toBeGreaterThan(0);
    expect(templates[0].id).toBe('nevada-8th-district-standard');
  });

  test('getTemplatesByJurisdiction is case-insensitive', () => {
    const templates = getTemplatesByJurisdiction('nevada');
    expect(templates.length).toBeGreaterThan(0);
  });

  test('getTemplatesByJurisdiction returns empty for unknown jurisdiction', () => {
    const templates = getTemplatesByJurisdiction('California');
    expect(templates.length).toBe(0);
  });

  test('templateExists returns true for valid template', () => {
    expect(templateExists('nevada-8th-district-standard')).toBe(true);
  });

  test('templateExists returns false for invalid template', () => {
    expect(templateExists('unknown-template')).toBe(false);
  });
});
