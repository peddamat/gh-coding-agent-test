import type {
  ReligiousHolidayDefinition,
  ReligiousHolidayUserConfig,
  ReligionType,
  AssignmentType,
} from '../types/holidays';
import { addDays } from '../utils/holidayExpansion';

/**
 * Jewish holidays with dates for 2024-2030.
 * Dates are based on the Hebrew calendar which is lunar.
 * First night/day of multi-day holidays is listed.
 */
export const JEWISH_HOLIDAYS: ReligiousHolidayDefinition[] = [
  {
    id: 'passover',
    name: 'Passover (First Seder)',
    religion: 'jewish',
    duration: 2,
    description: 'First two nights of Passover',
    dates: {
      2024: '2024-04-22',
      2025: '2025-04-12',
      2026: '2026-04-01',
      2027: '2027-04-21',
      2028: '2028-04-10',
      2029: '2029-03-30',
      2030: '2030-04-17',
    },
  },
  {
    id: 'rosh-hashanah',
    name: 'Rosh Hashanah',
    religion: 'jewish',
    duration: 2,
    description: 'Jewish New Year',
    dates: {
      2024: '2024-10-02',
      2025: '2025-09-22',
      2026: '2026-09-11',
      2027: '2027-10-01',
      2028: '2028-09-20',
      2029: '2029-09-09',
      2030: '2030-09-27',
    },
  },
  {
    id: 'yom-kippur',
    name: 'Yom Kippur',
    religion: 'jewish',
    duration: 1,
    description: 'Day of Atonement',
    dates: {
      2024: '2024-10-11',
      2025: '2025-10-01',
      2026: '2026-09-20',
      2027: '2027-10-10',
      2028: '2028-09-29',
      2029: '2029-09-18',
      2030: '2030-10-06',
    },
  },
  {
    id: 'sukkot',
    name: 'Sukkot (First Days)',
    religion: 'jewish',
    duration: 2,
    description: 'Feast of Tabernacles',
    dates: {
      2024: '2024-10-16',
      2025: '2025-10-06',
      2026: '2026-09-25',
      2027: '2027-10-15',
      2028: '2028-10-04',
      2029: '2029-09-23',
      2030: '2030-10-11',
    },
  },
  {
    id: 'hanukkah',
    name: 'Hanukkah (First Night)',
    religion: 'jewish',
    duration: 1,
    description: 'Festival of Lights (first night)',
    dates: {
      2024: '2024-12-25',
      2025: '2025-12-14',
      2026: '2026-12-04',
      2027: '2027-12-24',
      2028: '2028-12-12',
      2029: '2029-12-01',
      2030: '2030-12-20',
    },
  },
  {
    id: 'purim',
    name: 'Purim',
    religion: 'jewish',
    duration: 1,
    description: 'Festival of Lots',
    dates: {
      2024: '2024-03-23',
      2025: '2025-03-13',
      2026: '2026-03-02',
      2027: '2027-03-22',
      2028: '2028-03-11',
      2029: '2029-02-28',
      2030: '2030-03-18',
    },
  },
];

/**
 * Christian holidays with dates for 2024-2030.
 * Easter and related holidays are based on the lunar calendar.
 */
export const CHRISTIAN_HOLIDAYS: ReligiousHolidayDefinition[] = [
  {
    id: 'good-friday',
    name: 'Good Friday',
    religion: 'christian',
    duration: 1,
    description: 'Friday before Easter Sunday',
    dates: {
      2024: '2024-03-29',
      2025: '2025-04-18',
      2026: '2026-04-03',
      2027: '2027-03-26',
      2028: '2028-04-14',
      2029: '2029-03-30',
      2030: '2030-04-19',
    },
  },
  {
    id: 'easter-sunday',
    name: 'Easter Sunday',
    religion: 'christian',
    duration: 1,
    description: 'Celebration of the resurrection',
    dates: {
      2024: '2024-03-31',
      2025: '2025-04-20',
      2026: '2026-04-05',
      2027: '2027-03-28',
      2028: '2028-04-16',
      2029: '2029-04-01',
      2030: '2030-04-21',
    },
  },
  {
    id: 'ash-wednesday',
    name: 'Ash Wednesday',
    religion: 'christian',
    duration: 1,
    description: 'Beginning of Lent',
    dates: {
      2024: '2024-02-14',
      2025: '2025-03-05',
      2026: '2026-02-18',
      2027: '2027-02-10',
      2028: '2028-03-01',
      2029: '2029-02-14',
      2030: '2030-03-06',
    },
  },
];

/**
 * Islamic holidays with dates for 2024-2030.
 * Based on the Islamic lunar calendar (Hijri).
 * Note: Dates can vary by 1-2 days based on moon sighting.
 */
export const ISLAMIC_HOLIDAYS: ReligiousHolidayDefinition[] = [
  {
    id: 'eid-al-fitr',
    name: 'Eid al-Fitr',
    religion: 'islamic',
    duration: 3,
    description: 'Festival of Breaking the Fast (end of Ramadan)',
    dates: {
      2024: '2024-04-09',
      2025: '2025-03-30',
      2026: '2026-03-19',
      2027: '2027-03-08',
      2028: '2028-02-25',
      2029: '2029-02-13',
      2030: '2030-02-03',
    },
  },
  {
    id: 'eid-al-adha',
    name: 'Eid al-Adha',
    religion: 'islamic',
    duration: 4,
    description: 'Festival of Sacrifice',
    dates: {
      2024: '2024-06-16',
      2025: '2025-06-06',
      2026: '2026-05-26',
      2027: '2027-05-16',
      2028: '2028-05-04',
      2029: '2029-04-23',
      2030: '2030-04-12',
    },
  },
];

/**
 * All predefined religious holidays grouped by religion.
 */
export const RELIGIOUS_HOLIDAYS: Record<ReligionType, ReligiousHolidayDefinition[]> = {
  jewish: JEWISH_HOLIDAYS,
  christian: CHRISTIAN_HOLIDAYS,
  islamic: ISLAMIC_HOLIDAYS,
  other: [], // User-defined holidays
};

/**
 * All predefined religious holidays as a flat array.
 */
export const ALL_RELIGIOUS_HOLIDAYS: ReligiousHolidayDefinition[] = [
  ...JEWISH_HOLIDAYS,
  ...CHRISTIAN_HOLIDAYS,
  ...ISLAMIC_HOLIDAYS,
];

/**
 * Get a religious holiday definition by its ID.
 */
export function getReligiousHolidayById(id: string): ReligiousHolidayDefinition | undefined {
  return ALL_RELIGIOUS_HOLIDAYS.find((h) => h.id === id);
}

/**
 * Get religious holidays by religion.
 */
export function getReligiousHolidaysByReligion(religion: ReligionType): ReligiousHolidayDefinition[] {
  return RELIGIOUS_HOLIDAYS[religion] || [];
}

/**
 * Get the date(s) for a religious holiday in a specific year.
 * Returns an array of ISO date strings.
 */
export function getReligiousHolidayDates(holiday: ReligiousHolidayDefinition, year: number): string[] {
  const startDate = holiday.dates[year];
  if (!startDate) return [];

  const dates: string[] = [];
  for (let i = 0; i < holiday.duration; i++) {
    dates.push(addDays(startDate, i));
  }
  return dates;
}

/**
 * Get the display date string for a religious holiday in the current year.
 */
export function getReligiousHolidayDisplayDate(
  holiday: ReligiousHolidayDefinition,
  year: number = new Date().getFullYear()
): string {
  const dates = getReligiousHolidayDates(holiday, year);
  if (dates.length === 0) return 'Date varies';

  const formatDate = (dateStr: string): string => {
    const date = new Date(dateStr + 'T00:00:00');
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  if (dates.length === 1) {
    return formatDate(dates[0]);
  }

  return `${formatDate(dates[0])} - ${formatDate(dates[dates.length - 1])}`;
}

/**
 * Create default religious holiday configurations (all disabled by default).
 */
export function createDefaultReligiousHolidayConfigs(): ReligiousHolidayUserConfig[] {
  return ALL_RELIGIOUS_HOLIDAYS.map((holiday) => ({
    holidayId: holiday.id,
    enabled: false, // Religious holidays are optional, disabled by default
    assignment: 'alternate-odd-even' as AssignmentType,
  }));
}

/**
 * Get religion display name.
 */
export function getReligionDisplayName(religion: ReligionType): string {
  const names: Record<ReligionType, string> = {
    jewish: 'Jewish Holidays',
    christian: 'Christian Holidays',
    islamic: 'Islamic Holidays',
    other: 'Other Religious Holidays',
  };
  return names[religion];
}

/**
 * Calculate total days for enabled religious holidays.
 */
export function calculateReligiousHolidayDays(
  configs: ReligiousHolidayUserConfig[]
): number {
  return configs
    .filter((c) => c.enabled)
    .reduce((sum, config) => {
      const holiday = getReligiousHolidayById(config.holidayId);
      return sum + (holiday?.duration || 0);
    }, 0);
}
