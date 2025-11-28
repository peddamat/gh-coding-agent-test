# Copilot Instructions: Custody Calculator Development

## Quick Reference

**Read `docs/CONTEXT.md` first for domain knowledge, architecture rationale, and detailed explanations.**

This file contains tactical implementation instructions and quick references for building the application.

## Technology Stack

- **Build:** Vite 6.0+
- **Framework:** React 18.3+ with TypeScript 5.6+ (strict mode)
- **Styling:** Tailwind CSS 3.4+ (utility-first)
- **Icons:** lucide-react 0.460+
- **Charts:** chart.js 4.4+ and react-chartjs-2 5.2+
- **Utilities:** clsx 2.1+
- **Testing:** Vitest

## Component Structure

```
src/
├── components/
│   ├── layout/           # Header, Container
│   ├── calendar/         # DayCell, CalendarGrid, MonthNavigation
│   ├── wizard/           # WizardContainer, step components
│   ├── stats/            # Charts, StatsPanel
│   ├── plan/             # PlanBuilder, provision components
│   └── shared/           # ColorPicker, DatePicker
├── hooks/
│   ├── useCustodyEngine.ts   # Core calculation logic (CRITICAL)
│   ├── useLocalStorage.ts
│   └── useCalendarState.ts
├── context/
│   ├── AppStateContext.tsx
│   └── WizardContext.tsx
├── types/
│   └── index.ts              # ALL TypeScript interfaces
└── utils/
    ├── scheduleToText.ts
    └── exportPlan.ts
```

## Critical Implementation Rules

### Date Handling (CRITICAL)

```typescript
// ✅ CORRECT: ISO 8601 strings, date-only arithmetic
function addDays(dateStr: string, days: number): string {
  const date = new Date(dateStr + 'T00:00:00');
  date.setDate(date.getDate() + days);
  return date.toISOString().split('T')[0];
}

// ❌ WRONG: Time-based math breaks on DST
const nextDay = new Date(Date.now() + 86400000);
```

### Pattern Implementation

```typescript
const PATTERNS: Record<PatternType, ParentId[]> = {
  '2-2-5-5': ['A','A','B','B','A','A','A','A','A','B','B','B','B','B'],
  '3-4-4-3': ['A','A','A','B','B','B','B','A','A','A','A','B','B','B'],
  'alt-weeks': ['A','A','A','A','A','A','A','B','B','B','B','B','B','B'],
  'every-other-weekend': ['A','A','A','A','A','B','B','A','A','A','A','A','B','B']
};

// Get owner for any date
function getOwnerForDate(date: string, startDate: string, pattern: ParentId[]): ParentId {
  const daysDiff = calculateDaysDifference(date, startDate);
  const cycleIndex = daysDiff % pattern.length;
  return pattern[cycleIndex];
}
```

### Hierarchical Logic Implementation

```typescript
// 4-layer priority: Vacation > Holiday > Seasonal > Base
function calculateDayOwner(date: string, config: AppConfig): ParentId {
  const baseOwner = getPatternOwner(date, config.selectedPattern);
  const seasonalOverride = getSeasonalOverride(date, config);
  if (seasonalOverride) return seasonalOverride.owner;
  const holidayOverride = getHolidayOwner(date, config);
  if (holidayOverride) return holidayOverride.owner;
  const vacationOverride = getVacationOwner(date, config);
  if (vacationOverride) return vacationOverride.owner;
  return baseOwner;
}
```

### UI Conventions

- Parent A: `bg-blue-500`
- Parent B: `bg-pink-500`
- Today: Bold border
- Non-current month: Reduced opacity
- Desktop breakpoint: `lg:` (1024px)
- Calendar: Always 42 cells (6 weeks)

## Development Workflow

See `docs/PLAN.md` for detailed issue breakdown. Summary:

1. **Cycle 1 (Issues #1-7):** Static UI with mock data
2. **Cycle 2 (Issues #8-14):** Wizard UI (state only, no calculations)
3. **Cycle 3 (Issues #15-19):** Stats dashboard with hardcoded data
4. **Cycle 4 (Issues #20-23):** Core logic - **MOST CRITICAL**
5. **Cycle 5 (Issues #24-26):** localStorage persistence
6. **Cycle 6 (Issues #27-31):** Plan builder & export

## Testing Requirements

### Must-Have Tests

```typescript
describe('useCustodyEngine', () => {
  test('5-year span shows no drift', () => {
    // Day 0 and Day 1826 should have same owner
  });
  
  test('Leap year Feb 29 does not break cycle', () => {
    // Pattern continues uninterrupted through Feb 29
  });
  
  test('Alternating Weeks gives exactly 50/50', () => {
    // 365 days = 183/182 split
  });
});
```

## Common Pitfalls

❌ **Don't:** Use time-based Date math (breaks on DST)  
✅ **Do:** Use date-only arithmetic with ISO strings

❌ **Don't:** Store discrete events (causes drift)  
✅ **Do:** Store patterns as algorithms

❌ **Don't:** Delete underlying events when adding overrides  
✅ **Do:** Use non-destructive masking

## Natural Language Generation

Template structure for court-ready prose:

```typescript
const PATTERN_DESCRIPTIONS: Record<PatternType, string> = {
  '2-2-5-5': `{{parentA}} shall have the children for two days, followed by {{parentB}} for two days. {{parentA}} shall then have the children for five days, followed by {{parentB}} for five days.`,
  'alt-weeks': `{{parentA}} shall have the children for one week, followed by {{parentB}} for one week, in alternating succession.`,
  '3-4-4-3': `{{parentA}} shall have the children for three days, followed by {{parentB}} for four days. {{parentA}} shall then have the children for four days, followed by {{parentB}} for three days.`,
  'every-other-weekend': `{{parentA}} shall have primary physical custody. {{parentB}} shall have the children on alternating weekends.`
};
```

## Performance Targets

- Calendar render: < 16ms (60fps)
- Month navigation: < 50ms
- Stats calculation: < 100ms for 365 days
- Export generation: < 2 seconds

## Key Success Metrics

1. **Accuracy:** Zero drift over 5 years
2. **Calculation Precision:** Within 0.1% of reference calculators
3. **Document Quality:** Court-ready legal prose

## Quick Reference: TypeScript Types

```typescript
export type ParentId = 'parentA' | 'parentB';
export type PatternType = '2-2-5-5' | '3-4-4-3' | 'alt-weeks' | 'every-other-weekend';

export interface ParentConfig {
  name: string;
  colorClass: string; // Tailwind bg-* class
}

export interface AppConfig {
  startDate: string;        // "YYYY-MM-DD"
  selectedPattern: PatternType;
  startingParent: ParentId;
  exchangeTime: string;     // "HH:MM"
}

export interface CalendarDay {
  date: string;             // "YYYY-MM-DD"
  dayOfMonth: number;
  owner: ParentId;
  isToday: boolean;
  isCurrentMonth: boolean;
}

export interface TimeshareStats {
  parentA: { days: number; percentage: number };
  parentB: { days: number; percentage: number };
}
```

## Command Quick Reference

```bash
# Development
npm run dev              # Start dev server on :5173

# Build
npm run build           # TypeScript compile + Vite build
npm run preview         # Preview production build

# Testing
npm run test            # Run Vitest unit tests
npm run test:coverage   # Generate coverage report
```

---

**Remember:** This application deals with child custody—one of the most emotionally charged and legally consequential domains. Precision, clarity, and reliability are paramount. When in doubt, prioritize accuracy over features.

---

Guidance for Copilot Chat only. Do not include in final user documentation.

## How to properly respond to questions
When generating a response that is meant to by copied and pasted by the user, output the content inside a single, continuous code block. If the content contains internal code blocks, use 4 backticks (````) for the outer wrapper so the format doesn't break. Proceed normally for all other output.