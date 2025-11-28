export type ParentId = 'parentA' | 'parentB';
export type PatternType = '2-2-5-5' | '3-4-4-3' | 'alt-weeks' | 'every-other-weekend';

export interface ParentConfig {
  name: string;
  colorClass: string; // Tailwind bg class e.g., "bg-blue-500"
}

export interface AppConfig {
  startDate: string; // ISO "YYYY-MM-DD"
  selectedPattern: PatternType;
  startingParent: ParentId;
  exchangeTime: string; // "HH:MM" format
}

export interface AppState {
  config: AppConfig;
  parents: {
    parentA: ParentConfig;
    parentB: ParentConfig;
  };
}

export interface CalendarDay {
  date: string; // "YYYY-MM-DD"
  dayOfMonth: number;
  owner: ParentId;
  isToday: boolean;
  isCurrentMonth: boolean;
}

export interface TimeshareStats {
  parentA: { days: number; percentage: number };
  parentB: { days: number; percentage: number };
}
