## Plan: UI-First Custody Calculator with Tight Feedback Cycles

A detailed implementation plan optimized for GitHub Copilot Agents. Each issue is self-contained with clear acceptance criteria, file paths, and dependencies. Uses localStorage per project constraints—delivers visible UI in Cycle 1, iterates on visuals before adding logic.

---

### Cycle 1: App Shell & Static Calendar (Days 1-3)

**Goal:** Runnable app with navigation and a static calendar grid using mock data. Customer can see the core UI immediately.

---

#### Issue #1: Initialize Vite + React + TypeScript + Tailwind Project

**Labels:** `setup`, `priority:critical`

**Description:**
Bootstrap the React application with Vite, TypeScript strict mode, and Tailwind CSS. This replaces the current package.json stub.

**Acceptance Criteria:**

- [ ] `npm run dev` starts development server on localhost:5173
- [ ] `src/App.tsx` renders "Custody Calculator" heading
- [ ] Tailwind classes work (test with `bg-blue-500`)
- [ ] TypeScript strict mode enabled in `tsconfig.json`
- [ ] ESLint + Prettier configs preserved from existing setup

**Files to Create/Modify:**

- `vite.config.ts` (new)
- `tsconfig.json` (new)
- `tailwind.config.js` (new)
- `postcss.config.js` (new)
- `src/main.tsx` (new)
- `src/App.tsx` (new)
- `src/index.css` (new - Tailwind directives only)
- `package.json` (update dependencies)
- `index.html` (new)

**Dependencies to Add:**

```json
{
  "dependencies": {
    "react": "^18.3.1",
    "react-dom": "^18.3.1",
    "clsx": "^2.1.1",
    "lucide-react": "^0.460.0"
  },
  "devDependencies": {
    "vite": "^6.0.0",
    "@vitejs/plugin-react": "^4.3.0",
    "typescript": "^5.6.0",
    "@types/react": "^18.3.0",
    "@types/react-dom": "^18.3.0",
    "tailwindcss": "^3.4.0",
    "autoprefixer": "^10.4.0",
    "postcss": "^8.4.0"
  }
}
```

**Blocked By:** None

---

#### Issue #2: Create TypeScript Type Definitions

**Labels:** `setup`, `priority:critical`

**Description:**
Define all core TypeScript interfaces per [CONTEXT.md](../CONTEXT.md) Section 3.

**Acceptance Criteria:**

- [ ] No `any` types anywhere
- [ ] All interfaces exported from `src/types/index.ts`
- [ ] Types compile without errors

**Files to Create:**

- `src/types/index.ts`

**Type Definitions:**

```typescript
export type ParentId = 'parentA' | 'parentB';
export type PatternType = 
  | 'alt-weeks'        // 50/50 - Alternating weeks (7-7)
  | '2-2-3'            // 50/50 - 2-2-3 rotation
  | '2-2-5-5'          // 50/50 - 2-2-5-5 rotation
  | '3-4-4-3'          // 50/50 - 3-4-4-3 rotation
  | 'every-weekend'    // 60/40 - Non-custodial parent gets every weekend
  | 'every-other-weekend'      // 80/20 - Non-custodial parent gets alternating weekends
  | 'same-weekends-monthly'    // 80/20 - Non-custodial parent gets 1st/3rd/5th weekends
  | 'all-to-one'       // 100/0 - Full custody to one parent
  | 'custom';          // Custom repeating rate

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
```

**Blocked By:** Issue #1

---

#### Issue #3: Create Layout Components (Header + Container)

**Labels:** `ui`, `priority:high`

**Description:**
Create reusable layout components per [CONTEXT.md](../CONTEXT.md) Section 5.

**Acceptance Criteria:**

- [ ] `Header` displays app title and placeholder export button
- [ ] `Container` provides centered max-w-6xl wrapper
- [ ] Both use Tailwind only, no CSS files
- [ ] Props interfaces defined

**Files to Create:**

- `src/components/layout/Header.tsx`
- `src/components/layout/Container.tsx`
- `src/components/layout/index.ts` (barrel export)

**Blocked By:** Issue #1

---

#### Issue #4: Create DayCell Component

**Labels:** `ui`, `priority:high`

**Description:**
Build the individual day cell component that displays a colored box for Parent A or B.

**Acceptance Criteria:**

- [ ] Accepts `CalendarDay` props
- [ ] Renders day number in corner
- [ ] Background color based on `owner` (blue for A, yellow for B)
- [ ] Visual indicator for `isToday`
- [ ] Dimmed styling for `!isCurrentMonth`

**Files to Create:**

- `src/components/calendar/DayCell.tsx`

**Props Interface:**

```typescript
interface DayCellProps {
  day: CalendarDay;
  parentAColor: string;
  parentBColor: string;
}
```

**Blocked By:** Issue #2

---

#### Issue #5: Create CalendarGrid Component with Mock Data

**Labels:** `ui`, `priority:high`

**Description:**
Build the monthly calendar grid that renders 6 weeks of `DayCell` components. Use hardcoded mock data initially.

**Acceptance Criteria:**

- [ ] Displays 7 columns (Sun-Sat or Mon-Sun configurable)
- [ ] Shows day-of-week headers
- [ ] Renders 42 cells (6 weeks × 7 days)
- [ ] Mock data shows alternating Parent A/B pattern
- [ ] Current month title displayed

**Files to Create:**

- `src/components/calendar/CalendarGrid.tsx`
- `src/components/calendar/index.ts` (barrel export)

**Mock Data for Testing:**

```typescript
const MOCK_DAYS: CalendarDay[] = [
  { date: '2025-11-01', dayOfMonth: 1, owner: 'parentA', isToday: false, isCurrentMonth: true },
  // ... generate 42 days with alternating pattern
];
```

**Blocked By:** Issue #4

---

#### Issue #6: Create MonthNavigation Component

**Labels:** `ui`, `priority:high`

**Description:**
Build previous/next month navigation controls.

**Acceptance Criteria:**

- [ ] Left arrow button for previous month
- [ ] Right arrow button for next month
- [ ] Current month/year displayed (e.g., "November 2025")
- [ ] Uses `lucide-react` icons (ChevronLeft, ChevronRight)
- [ ] Emits `onMonthChange` callback

**Files to Create:**

- `src/components/calendar/MonthNavigation.tsx`

**Props Interface:**

```typescript
interface MonthNavigationProps {
  currentMonth: Date;
  onPreviousMonth: () => void;
  onNextMonth: () => void;
}
```

**Blocked By:** Issue #1

---

#### Issue #7: Compose App.tsx with Static Calendar View

**Labels:** `ui`, `priority:high`

**Description:**
Wire up all components into `App.tsx` to display the complete static calendar.

**Acceptance Criteria:**

- [ ] Header at top
- [ ] MonthNavigation below header
- [ ] CalendarGrid fills main area
- [ ] Responsive: stacks on mobile, side-by-side on desktop (prep for stats panel)
- [ ] Customer can navigate months (visually updates title, grid stays mock)

**Files to Modify:**

- `src/App.tsx`

**Blocked By:** Issues #3, #5, #6

---

### Cycle 2: Schedule Wizard UI (Days 4-6)

**Goal:** Multi-step wizard for configuring schedule. Form state only—no calculation yet. Customer iterates on UX flow.

---

#### Issue #8: Create WizardContainer Component

> **GitHub:** [Issue #19](https://github.com/peddamat/gh-coding-agent-test/issues/19)

**Labels:** `ui`, `priority:high`

**Description:**
Build the wizard shell with step indicators and navigation buttons.

**Acceptance Criteria:**

- [ ] Shows current step number and title (e.g., "Step 1 of 4: Choose Time Split")
- [ ] Progress bar or step dots
- [ ] "Back" and "Next" buttons
- [ ] "Finish" button on final step
- [ ] Manages internal step state

**Files to Create:**

- `src/components/wizard/WizardContainer.tsx`
- `src/components/wizard/StepIndicator.tsx`
- `src/components/wizard/index.ts`

**Blocked By:** Issue #1 (GitHub #1)

---

#### Issue #9: Create PatternPicker Step (Combines Split + Pattern Selection)

> **GitHub:** [Issue #20](https://github.com/peddamat/gh-coding-agent-test/issues/20), [Issue #23](https://github.com/peddamat/gh-coding-agent-test/issues/23)

**Labels:** `ui`, `priority:high`

**Description:**
First wizard step showing all schedule patterns grouped by custody split percentage. Selecting a pattern implicitly sets the split—no separate split selector needed.

**Acceptance Criteria:**

- [ ] Patterns grouped visually: "50/50 Schedules", "60/40 Schedules", "80/20 Schedules", "Full Custody"
- [ ] Card for each pattern with mini-calendar thumbnail (2-week preview)
- [ ] Each card shows: pattern name, split percentage badge, brief description
- [ ] Selecting a pattern stores both pattern AND split in wizard state
- [ ] Hover/tap shows expanded description
- [ ] "Custom" option at bottom opens custom pattern builder (placeholder for MVP)

**Files to Create:**

- `src/components/wizard/steps/PatternPicker.tsx`
- `src/components/wizard/steps/PatternThumbnail.tsx`
- `src/data/patterns.ts` (pattern definitions)

**Pattern Definitions:**

```typescript
interface PatternDefinition {
  type: PatternType;
  label: string;
  split: string; // "50/50", "60/40", "80/20", "100/0"
  description: string;
  cycleLength: number;
  pattern: ParentId[];
}

export const PATTERNS: PatternDefinition[] = [
  // 50/50 Schedules
  {
    type: 'alt-weeks',
    label: 'Every Other Week',
    split: '50/50',
    description: 'Simplest 50/50. Full week with each parent, alternating.',
    cycleLength: 14,
    pattern: ['A','A','A','A','A','A','A','B','B','B','B','B','B','B'],
  },
  {
    type: '2-2-3',
    label: '2-2-3 Rotation',
    split: '50/50',
    description: 'Parent A: Mon-Tue, Parent B: Wed-Thu, Alternating Fri-Sun.',
    cycleLength: 14,
    pattern: ['A','A','B','B','A','A','A','B','B','A','A','B','B','B'],
  },
  {
    type: '2-2-5-5',
    label: '2-2-5-5 Rotation',
    split: '50/50',
    description: 'Most popular 50/50. Two days each, then five days each.',
    cycleLength: 14,
    pattern: ['A','A','B','B','A','A','A','A','A','B','B','B','B','B'],
  },
  {
    type: '3-4-4-3',
    label: '3-4-4-3 Rotation',
    split: '50/50',
    description: 'Three days, then four days, swapping the next week.',
    cycleLength: 14,
    pattern: ['A','A','A','B','B','B','B','A','A','A','A','B','B','B'],
  },
  // 60/40 Schedule
  {
    type: 'every-weekend',
    label: 'Every Weekend',
    split: '60/40',
    description: 'Primary parent has weekdays. Other parent has every weekend.',
    cycleLength: 7,
    pattern: ['A','A','A','A','A','B','B'],
  },
  // 80/20 Schedules
  {
    type: 'every-other-weekend',
    label: 'Every Other Weekend',
    split: '80/20',
    description: 'Primary custody with alternating weekend visitation.',
    cycleLength: 14,
    pattern: ['A','A','A','A','A','B','B','A','A','A','A','A','A','A'],
  },
  {
    type: 'same-weekends-monthly',
    label: 'Same Weekends Each Month',
    split: '80/20',
    description: '1st, 3rd, and 5th weekends to non-custodial parent.',
    cycleLength: 7, // Special handling required for 1st/3rd/5th logic
    pattern: ['A','A','A','A','A','A','A'], // Base pattern, weekends calculated dynamically
  },
  // 100/0 Schedule
  {
    type: 'all-to-one',
    label: 'All to One Parent',
    split: '100/0',
    description: 'Full custody to one parent. No scheduled visitation.',
    cycleLength: 1,
    pattern: ['A'],
  },
  // Custom
  {
    type: 'custom',
    label: 'Custom Repeating Rate',
    split: 'Custom',
    description: 'Define your own repeating pattern.',
    cycleLength: 0, // User-defined
    pattern: [],
  },
];
```

**Blocked By:** Issue #8 (GitHub #19)

---

#### Issue #10: Create Step 2 - ParentSetup Form

> **GitHub:** [Issue #21](https://github.com/peddamat/gh-coding-agent-test/issues/21)

**Labels:** `ui`, `priority:high`

**Description:**
Second wizard step for parent names, colors, and schedule start date.

**Acceptance Criteria:**

- [ ] Text inputs for Parent A and Parent B names
- [ ] Color picker (dropdown of Tailwind color options)
- [ ] Date picker for "Schedule Start Date"
- [ ] Radio for "Who has the child first?"
- [ ] Form validation (names required, date required)

**Files to Create:**

- `src/components/wizard/steps/ParentSetup.tsx`
- `src/components/shared/ColorPicker.tsx`
- `src/components/shared/DatePicker.tsx`

**Color Options:**

```typescript
const COLOR_OPTIONS = [
  { label: 'Blue', value: 'bg-blue-500', preview: '#3b82f6' },
  { label: 'Pink', value: 'bg-pink-500', preview: '#ec4899' },
  { label: 'Green', value: 'bg-green-500', preview: '#22c55e' },
  { label: 'Purple', value: 'bg-purple-500', preview: '#a855f7' },
  { label: 'Orange', value: 'bg-orange-500', preview: '#f97316' },
];
```

**Blocked By:** Issue #8 (GitHub #19)

---

#### Issue #11: Create Step 3 - HolidaySelector (MVP Placeholder)

> **GitHub:** [Issue #24](https://github.com/peddamat/gh-coding-agent-test/issues/24)

**Labels:** `ui`, `priority:medium`

**Description:**
Third wizard step for selecting major holidays. MVP version is simplified checklist.

**Acceptance Criteria:**

- [ ] Checklist of major US holidays (Thanksgiving, Christmas, New Year's, etc.)
- [ ] Each holiday has "Parent A" / "Parent B" / "Alternate Years" radio
- [ ] Summary count: "5 holidays configured"
- [ ] Can skip step (holidays optional for MVP)

**Files to Create:**

- `src/components/wizard/steps/HolidaySelector.tsx`

**Holiday Data:**

```typescript
const HOLIDAYS = [
  { id: 'thanksgiving', name: "Thanksgiving", date: 'fourth-thursday-november' },
  { id: 'christmas', name: "Christmas Day", date: '12-25' },
  { id: 'newyear', name: "New Year's Day", date: '01-01' },
  { id: 'july4', name: "Independence Day", date: '07-04' },
  { id: 'memorial', name: "Memorial Day", date: 'last-monday-may' },
  { id: 'labor', name: "Labor Day", date: 'first-monday-september' },
];
```

**Blocked By:** Issue #8 (GitHub #19)

---

#### Issue #12: Create Wizard State Management with Context

> **GitHub:** [Issue #25](https://github.com/peddamat/gh-coding-agent-test/issues/25)

**Labels:** `state`, `priority:high`

**Description:**
Create React Context + useReducer for wizard form state.

**Acceptance Criteria:**

- [ ] `WizardContext` provides state and dispatch
- [ ] Actions: SET_PATTERN (includes split), SET_PARENTS, SET_HOLIDAYS, RESET
- [ ] State persists across step navigation
- [ ] "Finish" action converts wizard state to AppState

**Files to Create:**

- `src/context/WizardContext.tsx`
- `src/reducers/wizardReducer.ts`

**Blocked By:** Issue #2 (GitHub #2)

---

#### Issue #13: Integrate Wizard into App with Route/Modal

> **GitHub:** [Issue #22](https://github.com/peddamat/gh-coding-agent-test/issues/22)

**Labels:** `ui`, `priority:high`

**Description:**
Add wizard to app flow. Show wizard on first visit or via "New Schedule" button.

**Acceptance Criteria:**

- [ ] Wizard shows as modal overlay or dedicated route
- [ ] "Start New Schedule" button in header opens wizard
- [ ] Completing wizard dismisses it and shows calendar
- [ ] Calendar uses wizard output (still mock calculation)
- [ ] Wizard is now 3 steps: Pattern → Parents → Holidays

**Files to Modify:**

- `src/App.tsx`
- `src/components/layout/Header.tsx`

**Blocked By:** Issues #8-12 (GitHub #19, #20, #21, #24, #25)

---

### Cycle 3: Calculator Dashboard UI (Days 7-8)

**Goal:** Stats panel with charts using hardcoded data. Customer approves visualization before wiring to real calculations.

---

#### Issue #15: Add chart.js and react-chartjs-2 Dependencies

**Labels:** `setup`, `priority:high`

**Description:**
Install charting library per [copilot-instructions.md](.github/copilot-instructions.md).

**Acceptance Criteria:**

- [ ] `chart.js` and `react-chartjs-2` in dependencies
- [ ] Chart.js registers configured in entry point

**Files to Modify:**

- `package.json`
- `src/main.tsx` (add Chart.js registration)

**Dependencies:**

```json
{
  "dependencies": {
    "chart.js": "^4.4.0",
    "react-chartjs-2": "^5.2.0"
  }
}
```

**Blocked By:** Issue #1

---

#### Issue #16: Create TimeshareDonutChart Component

**Labels:** `ui`, `priority:high`

**Description:**
Donut/pie chart showing custody split percentage.

**Acceptance Criteria:**

- [ ] Donut chart with Parent A and Parent B segments
- [ ] Colors match parent config
- [ ] Center text shows primary percentage
- [ ] Legend with parent names and percentages
- [ ] Responsive sizing

**Files to Create:**

- `src/components/stats/TimeshareDonutChart.tsx`

**Mock Props:**

```typescript
interface TimeshareDonutChartProps {
  parentAName: string;
  parentAPercent: number;
  parentAColor: string;
  parentBName: string;
  parentBPercent: number;
  parentBColor: string;
}
```

**Blocked By:** Issue #15

---

#### Issue #17: Create MonthlyTrendBarChart Component

**Labels:** `ui`, `priority:medium`

**Description:**
Bar chart showing month-by-month custody breakdown.

**Acceptance Criteria:**

- [ ] Stacked or grouped bar chart
- [ ] X-axis: months (Jan-Dec or rolling 12 months)
- [ ] Y-axis: days or percentage
- [ ] Parent A and B colored bars
- [ ] Tooltip on hover with exact values

**Files to Create:**

- `src/components/stats/MonthlyTrendBarChart.tsx`

**Blocked By:** Issue #15

---

#### Issue #18: Create StatsPanel Container

**Labels:** `ui`, `priority:high`

**Description:**
Side panel that contains all stats components.

**Acceptance Criteria:**

- [ ] Contains TimeshareDonutChart at top
- [ ] Contains MonthlyTrendBarChart below
- [ ] Text summary: "Parent A: 182 nights/year (50%)"
- [ ] Collapsible on mobile
- [ ] "Calculation Mode" toggle placeholder (Hours vs Overnights)

**Files to Create:**

- `src/components/stats/StatsPanel.tsx`
- `src/components/stats/index.ts`

**Blocked By:** Issues #16, #17

---

#### Issue #19: Integrate StatsPanel into Dashboard Layout

**Labels:** `ui`, `priority:high`

**Description:**
Update App.tsx to show calendar + stats side-by-side on desktop.

**Acceptance Criteria:**

- [ ] Desktop: 2-column layout (Calendar 2/3, Stats 1/3)
- [ ] Mobile: Stats below calendar (accordion or tab)
- [ ] Smooth responsive breakpoint at `lg:`

**Files to Modify:**

- `src/App.tsx`

**Blocked By:** Issue #18

---

### Cycle 4: Implement Core Schedule Logic (Days 9-12)

**Goal:** Wire real calculation to calendar. First pattern works end-to-end.

---

#### Issue #19: Create useCustodyEngine Hook - Base Structure

**Labels:** `logic`, `priority:critical`

**Description:**
Create the core hook that calculates custody ownership for any date. Implement pattern-based calculation that works for all supported patterns.

**Acceptance Criteria:**

- [ ] Hook accepts `AppConfig` and returns calculation functions
- [ ] `getOwnerForDate(date: string): ParentId` works for all standard patterns
- [ ] `getMonthDays(year: number, month: number): CalendarDay[]` returns full month
- [ ] Handles leap years correctly
- [ ] Special handling for `same-weekends-monthly` (1st/3rd/5th weekend logic)
- [ ] Unit test: 5-year span shows no drift for each pattern

**Files to Create:**

- `src/hooks/useCustodyEngine.ts`
- `src/hooks/useCustodyEngine.test.ts`

**Import patterns from data file:**

```typescript
import { PATTERNS } from '../data/patterns';

function getOwnerForDate(date: string, config: AppConfig): ParentId {
  const pattern = PATTERNS.find(p => p.type === config.selectedPattern);
  if (!pattern || pattern.type === 'custom') {
    // Handle custom patterns separately
  }
  
  // Special case: same-weekends-monthly requires week-of-month calculation
  if (pattern.type === 'same-weekends-monthly') {
    return getSameWeekendsOwner(date, config);
  }
  
  const daysDiff = calculateDaysDifference(date, config.startDate);
  const index = daysDiff % pattern.cycleLength;
  return pattern.pattern[index] === 'A' ? config.startingParent : getOtherParent(config.startingParent);
}
```

**Blocked By:** Issue #2

---

#### Issue #20: Implement Special Pattern Logic in useCustodyEngine

**Labels:** `logic`, `priority:high`

**Description:**
Implement special-case patterns that require dynamic calculation beyond simple modulo.

**Acceptance Criteria:**

- [ ] `same-weekends-monthly`: Calculate 1st/3rd/5th weekend of each month dynamically
- [ ] `custom`: Support user-defined cycle length and pattern array
- [ ] `all-to-one`: Simple single-parent assignment (trivial but must work)
- [ ] Handle "5th weekend" edge case correctly (some months have 5 weekends)
- [ ] All patterns unit tested

**Files to Modify:**

- `src/hooks/useCustodyEngine.ts`
- `src/hooks/useCustodyEngine.test.ts`

**Special Logic for 1st/3rd/5th Weekends:**

```typescript
function getSameWeekendsOwner(date: string, config: AppConfig): ParentId {
  const d = new Date(date + 'T00:00:00');
  const dayOfWeek = d.getDay(); // 0 = Sunday, 6 = Saturday
  const dayOfMonth = d.getDate();
  
  // Only weekends (Sat/Sun) go to Parent B
  if (dayOfWeek !== 0 && dayOfWeek !== 6) {
    return 'parentA'; // Weekdays always Parent A
  }
  
  // Calculate which weekend of the month (1st, 2nd, 3rd, 4th, or 5th)
  const weekendNumber = Math.ceil(dayOfMonth / 7);
  
  // 1st, 3rd, 5th weekends go to Parent B
  if (weekendNumber === 1 || weekendNumber === 3 || weekendNumber === 5) {
    return 'parentB';
  }
  
  return 'parentA';
}
```

**Blocked By:** Issue #19

---

#### Issue #21: Wire CalendarGrid to useCustodyEngine

**Labels:** `integration`, `priority:critical`

**Description:**
Replace mock data in CalendarGrid with real calculated data from hook.

**Acceptance Criteria:**

- [ ] CalendarGrid receives `AppState` or uses context
- [ ] Days colored by actual pattern calculation
- [ ] Month navigation triggers recalculation
- [ ] Changing pattern in wizard updates calendar immediately
- [ ] Performance: renders 42 cells in <16ms

**Files to Modify:**

- `src/components/calendar/CalendarGrid.tsx`
- `src/App.tsx`

**Blocked By:** Issues #19, #20

---

#### Issue #22: Calculate and Display Real Timeshare Stats

**Labels:** `integration`, `priority:high`

**Description:**
Wire stats panel to real calculation engine.

**Acceptance Criteria:**

- [ ] Donut chart shows actual percentage from schedule
- [ ] Bar chart shows real monthly breakdown
- [ ] Stats update when pattern or dates change
- [ ] "Nights per year" calculated correctly
- [ ] Handles all pattern types including `same-weekends-monthly`

**Files to Modify:**

- `src/components/stats/StatsPanel.tsx`
- `src/components/stats/TimeshareDonutChart.tsx`

**Calculation Logic:**

```typescript
const calculateYearlyStats = (startDate: string, pattern: PatternType): TimeshareStats => {
  // Count 365 days from startDate using useCustodyEngine
  // Return { parentA: { days, percentage }, parentB: { days, percentage } }
};
```

**Blocked By:** Issue #19

---

### Cycle 5: Persistence & App State (Days 13-14)

**Goal:** User config persists across sessions. Complete MVP flow.

---

#### Issue #23: Create useLocalStorage Hook

**Labels:** `logic`, `priority:high`

**Description:**
Generic hook for localStorage persistence per [CONTEXT.md](../CONTEXT.md).

**Acceptance Criteria:**

- [ ] `useLocalStorage<T>(key, initialValue)` signature
- [ ] Handles JSON serialization/deserialization
- [ ] Graceful fallback if localStorage unavailable
- [ ] Type-safe with generics

**Files to Create:**

- `src/hooks/useLocalStorage.ts`

**Blocked By:** Issue #2

---

#### Issue #24: Create AppState Context with Persistence

**Labels:** `state`, `priority:high`

**Description:**
Global app state context that persists to localStorage.

**Acceptance Criteria:**

- [ ] `AppStateContext` provides state and dispatch
- [ ] Actions: SET_CONFIG, SET_PARENTS, UPDATE_PATTERN, RESET
- [ ] State auto-saves to localStorage on change
- [ ] State auto-loads from localStorage on mount
- [ ] Wizard "Finish" populates AppState

**Files to Create:**

- `src/context/AppStateContext.tsx`
- `src/reducers/appStateReducer.ts`

**Blocked By:** Issues #2, #23

---

#### Issue #25: Integrate AppState Across All Components

**Labels:** `integration`, `priority:high`

**Description:**
Wire all components to use centralized AppState.

**Acceptance Criteria:**

- [ ] Wizard writes to AppState on finish
- [ ] Calendar reads from AppState
- [ ] Stats read from AppState
- [ ] Header shows current schedule name
- [ ] "Reset" button clears localStorage and shows wizard

**Files to Modify:**

- `src/App.tsx`
- `src/components/wizard/WizardContainer.tsx`
- `src/components/calendar/CalendarGrid.tsx`
- `src/components/stats/StatsPanel.tsx`

**Blocked By:** Issue #24

---

### Cycle 6: Holiday Configuration (Days 15-18)

**Goal:** Comprehensive holiday entry UI with tiered approach, quick setup presets, and live impact preview.

---

#### Issue #26: Holiday Data Model Enhancement

**Labels:** `logic`, `priority:high`

**Description:**
Extend holiday data model to support all assignment types and categories from the Nevada court holiday document.

**Acceptance Criteria:**

- [ ] `HolidayCategory` type: `'major-break' | 'weekend' | 'birthday' | 'religious'`
- [ ] `AssignmentType` enum: `'alternate-odd-even' | 'always-parent-a' | 'always-parent-b' | 'split-period' | 'selection-priority'`
- [ ] `HolidayConfig` interface with date calculation logic (fixed date, nth weekday, relative)
- [ ] `SplitPeriodConfig` for Winter Break (Christmas segment + New Year segment)
- [ ] `SelectionPriorityConfig` for Summer Vacation (weeks, selection deadline, alternating first pick)
- [ ] All 11 Weekend Holidays defined with correct dates
- [ ] All 3 Birthday types supported (Children, Mom, Dad)
- [ ] Spring Break, Thanksgiving, Winter Break, Summer Vacation defined

**Files to Create:**

- `src/types/holidays.ts`
- `src/data/holidays.ts`

**Type Definitions:**

```typescript
export type HolidayCategory = 'major-break' | 'weekend' | 'birthday' | 'religious';
export type AssignmentType = 
  | 'alternate-odd-even'
  | 'always-parent-a' 
  | 'always-parent-b'
  | 'split-period'
  | 'selection-priority';

export interface HolidayDefinition {
  id: string;
  name: string;
  category: HolidayCategory;
  defaultAssignment: AssignmentType;
  dateCalculation: DateCalculation;
  durationDays: number;
  priority: number; // Higher = overrides lower
}

export interface SplitPeriodConfig {
  splitPoint: string; // e.g., "Dec 26 12:00 PM"
  segment1Name: string; // "Christmas"
  segment2Name: string; // "New Year's"
  segment1Assignment: AssignmentType;
  segment2Assignment: AssignmentType;
}
```

**Blocked By:** Issue #2

---

#### Issue #27: Major Breaks Component

**Labels:** `ui`, `priority:high`

**Description:**
UI component for configuring the "Big 4" major breaks: Spring Break, Thanksgiving, Winter Break, Summer Vacation. These account for 50+ days combined.

**Acceptance Criteria:**

- [ ] Collapsible section for each major break
- [ ] Spring Break: date range picker + assignment dropdown
- [ ] Thanksgiving: preset "Wed 6pm - Sun 6pm" with assignment dropdown
- [ ] Winter Break: split configuration UI (Christmas segment + New Year segment)
- [ ] Summer Vacation: week count, selection deadline, alternating first pick toggle
- [ ] Shows day count for each break
- [ ] Total days counter at top of section

**Files to Create:**

- `src/components/wizard/holidays/MajorBreaksConfig.tsx`

**UI Structure:**

```text
┌─ Major Breaks (52 days total) ─────────────────┐
│ ▼ Spring Break (7 days)                        │
│   Dates: [Mar 17] to [Mar 23]                  │
│   Assignment: [Alternate Odd/Even ▼]           │
│                                                │
│ ▼ Thanksgiving (5 days)                        │
│   Wed 6pm - Sun 6pm                            │
│   Assignment: [Alternate Odd/Even ▼]           │
│                                                │
│ ▼ Winter Break - Split (14 days)               │
│   Christmas (Dec 23 - Dec 26 noon): [Even ▼]   │
│   New Year's (Dec 26 noon - Jan 2): [Odd ▼]    │
│                                                │
│ ▼ Summer Vacation (26 days)                    │
│   Each parent: [2] weeks × 2 blocks            │
│   Selection deadline: [April 1]                │
│   First pick in 2025: [Parent A ▼]             │
└────────────────────────────────────────────────┘
```

**Blocked By:** Issue #26

---

#### Issue #28: Weekend Holidays Component

**Labels:** `ui`, `priority:medium`

**Description:**
UI component for configuring the 11 weekend holidays. Show as compact list with batch controls.

**Acceptance Criteria:**

- [ ] Grouped list of all 11 weekend holidays
- [ ] Each shows: name, date (calculated for current year), assignment dropdown
- [ ] "Apply to All" batch control (Alternate, Always A, Always B)
- [ ] Special handling: Mother's Day always shows "Always Parent B" default
- [ ] Special handling: Father's Day always shows "Always Parent A" default
- [ ] Total days counter (3 days × 11 = 33 days potential)
- [ ] Enable/disable toggle per holiday

**Files to Create:**

- `src/components/wizard/holidays/WeekendHolidaysConfig.tsx`

**Weekend Holidays List:**

1. Martin Luther King Jr. Day (3rd Monday January)
2. Presidents' Day (3rd Monday February)
3. Mother's Day (2nd Sunday May) - Default: Always Parent B
4. Memorial Day (Last Monday May)
5. Father's Day (3rd Sunday June) - Default: Always Parent A
6. Independence Day (July 4 weekend)
7. Labor Day (1st Monday September)
8. Nevada Day (Last Friday October)
9. Halloween (October 31 weekend)
10. Veterans Day (November 11 weekend)

**Blocked By:** Issue #26

---

#### Issue #29: Birthdays & Quick Setup Component

**Labels:** `ui`, `priority:medium`

**Description:**
Birthday configuration and quick setup presets for rapid holiday configuration.

**Acceptance Criteria:**

- [ ] Birthday section with 3 entries:
  - Children's birthdays (date picker for each child)
  - Mother's birthday (date picker, default: Always Parent B)
  - Father's birthday (date picker, default: Always Parent A)
- [ ] Quick Setup presets panel with 3 options:
  - "Traditional" (alternating major holidays, fixed parent days)
  - "50/50 Split" (alternate everything odd/even)
  - "One Parent All" (all holidays to selected parent)
- [ ] Preset selection populates all holiday assignments
- [ ] User can customize after selecting preset
- [ ] "Reset to Preset" button to undo customizations

**Files to Create:**

- `src/components/wizard/holidays/BirthdaysConfig.tsx`
- `src/components/wizard/holidays/QuickSetupPresets.tsx`

**Blocked By:** Issue #26

---

#### Issue #30: Holiday Impact Preview Panel

**Labels:** `ui`, `priority:high`

**Description:**
Live preview panel showing quantitative impact of holiday configuration on timeshare percentage.

**Acceptance Criteria:**

- [ ] Shows base schedule percentage (from Cycle 4 calculation)
- [ ] Shows adjusted percentage after holiday overrides
- [ ] Delta indicator (e.g., "+12 days to Parent B")
- [ ] Breakdown by category:
  - Major Breaks: +X days Parent A, +Y days Parent B
  - Weekend Holidays: +X days Parent A, +Y days Parent B
  - Birthdays: +X days Parent A, +Y days Parent B
- [ ] Updates live as user changes assignments
- [ ] Warning if result deviates significantly from base (>10%)

**Files to Create:**

- `src/components/wizard/holidays/HolidayImpactPreview.tsx`

**UI Structure:**

```text
┌─ Holiday Impact Preview ───────────────────────┐
│ Base Schedule: 50.0% / 50.0%                   │
│                                                │
│ With Holidays: 47.3% / 52.7%                   │
│                ▲ Parent B gains 12 days        │
│                                                │
│ Breakdown:                                     │
│   Major Breaks    +18 days B                   │
│   Weekend Holidays +6 days A, +8 days B        │
│   Birthdays       +2 days A, +2 days B         │
│                                                │
│ ⚠️ Result differs from base by 5.4%            │
└────────────────────────────────────────────────┘
```

**Blocked By:** Issues #27, #28, #29, Issue #22 (real stats calculation)

---

#### Issue #31: Integrate Holiday Config into Wizard & Engine

**Labels:** `integration`, `priority:critical`

**Description:**
Wire holiday configuration into the wizard flow and custody engine hierarchy.

**Acceptance Criteria:**

- [ ] HolidaySelector step shows tabbed interface:
  - Tab 1: Quick Setup (presets)
  - Tab 2: Major Breaks
  - Tab 3: Weekend Holidays
  - Tab 4: Birthdays
- [ ] Holiday config saved to AppState
- [ ] `useCustodyEngine` respects holiday overrides (Layer 2 in hierarchy)
- [ ] Calendar shows holiday indicators on affected dates
- [ ] Holiday tooltip shows which holiday overrides that day
- [ ] "Recalculate" button forces stats refresh

**Files to Modify:**

- `src/components/wizard/steps/HolidaySelector.tsx`
- `src/hooks/useCustodyEngine.ts`
- `src/components/calendar/DayCell.tsx`
- `src/context/AppStateContext.tsx`

**Integration Logic:**

```typescript
// In useCustodyEngine - Layer 2 check
function calculateDayOwner(date: string, config: AppConfig): ParentId {
  const baseOwner = getPatternOwner(date, config.selectedPattern);
  
  // Layer 2: Holiday override
  const holidayOverride = getHolidayOwner(date, config.holidays);
  if (holidayOverride) return holidayOverride.owner;
  
  return baseOwner;
}
```

**Blocked By:** Issues #27, #28, #29, #30, Issue #24 (AppState)

---

### Cycle 7: Plan Builder UI & Export (Days 19-21)

**Goal:** Basic parenting plan text generation and export.

---

#### Issue #32: Create PlanBuilder Shell Component

**Labels:** `ui`, `priority:medium`

**Description:**
Container for the parenting plan builder interface.

**Acceptance Criteria:**

- [ ] Tabbed or accordion sections for provision categories
- [ ] Preview pane showing generated text
- [ ] "Copy to Clipboard" button
- [ ] "Download as Text" button

**Files to Create:**

- `src/components/plan/PlanBuilder.tsx`
- `src/components/plan/index.ts`

**Blocked By:** Issue #1

---

#### Issue #33: Create Provision Category Components

**Labels:** `ui`, `priority:medium`

**Description:**
UI for selecting and configuring provisions by category.

**Acceptance Criteria:**

- [ ] "Schedule Description" section (auto-generated, read-only)
- [ ] "Exchange & Transportation" section with form fields
- [ ] "Communication" section with checkboxes
- [ ] Each provision has enable/disable toggle
- [ ] Form fields for variables (e.g., "notification days")

**Files to Create:**

- `src/components/plan/ProvisionSection.tsx`
- `src/components/plan/ProvisionToggle.tsx`
- `src/data/provisions.ts` (static provision library)

**Blocked By:** Issue #32

---

#### Issue #34: Implement Schedule-to-Text Generator

**Labels:** `logic`, `priority:medium`

**Description:**
Generate natural language description of custody schedule from config.

**Acceptance Criteria:**

- [ ] Pattern name converted to prose (per PRD Section 4.1)
- [ ] Parent names interpolated
- [ ] Exchange time included
- [ ] Start date mentioned
- [ ] Output reads as professional legal language

**Files to Create:**

- `src/utils/scheduleToText.ts`

**Example Output:**

```text
"The parents shall share physical custody of the children according to 
a 2-2-5-5 schedule. The rotation shall commence on January 1, 2025. 
John shall have the children for two days, followed by Sarah for two days. 
John shall then have the children for five days, followed by Sarah for 
five days. All exchanges shall occur at 3:00 PM."
```

**Blocked By:** Issue #2

---

#### Issue #35: Implement Copy & Download Export

**Labels:** `feature`, `priority:medium`

**Description:**
Export functionality for the generated plan text.

**Acceptance Criteria:**

- [ ] "Copy to Clipboard" copies full plan text
- [ ] Toast notification confirms copy
- [ ] "Download" saves as `.txt` file
- [ ] Filename includes date (e.g., `parenting-plan-2025-11-28.txt`)

**Files to Create:**

- `src/utils/exportPlan.ts`

**Files to Modify:**

- `src/components/plan/PlanBuilder.tsx`

**Blocked By:** Issue #34

---

#### Issue #36: Add Plan Builder to App Navigation

**Labels:** `ui`, `priority:medium`

**Description:**
Integrate Plan Builder as tab or route in main app.

**Acceptance Criteria:**

- [ ] Tab bar or nav: "Calendar" | "Statistics" | "Plan Builder"
- [ ] Plan Builder reads from AppState
- [ ] State persists when switching tabs

**Files to Modify:**

- `src/App.tsx`
- `src/components/layout/Header.tsx`

**Blocked By:** Issue #32

---

### Further Considerations

1. **Holiday override logic timing?** Add Layer 2 (holiday override) after core MVP demo approval / Defer to v2 milestone?

2. **Mobile responsive priority?** Build responsive breakpoints in parallel with each component / Focus on desktop for initial demos, mobile polish as separate cycle?

3. **Testing strategy?** Add Vitest unit tests for `useCustodyEngine` as part of Issue #20 / Create separate testing cycle after all features work?

4. **PDF export?** Text export covers MVP. PDF requires additional library (e.g., `@react-pdf/renderer`). Defer to v2 or include as Issue #32?
