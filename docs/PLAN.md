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

**Blocked By:** Issue #1

---

#### Issue #9: Create Step 1 - TimeSplitSelector

**Labels:** `ui`, `priority:high`

**Description:**
First wizard step where user selects desired custody split.

**Acceptance Criteria:**

- [ ] Radio card options: "50/50", "60/40", "70/30", "80/20"
- [ ] Visual cards with percentage visualization
- [ ] Selection stored in wizard state
- [ ] Pre-selects "50/50" as default

**Files to Create:**

- `src/components/wizard/steps/TimeSplitSelector.tsx`

**Blocked By:** Issue #8

---

#### Issue #10: Create Step 2 - PatternPicker with Thumbnails

**Labels:** `ui`, `priority:high`

**Description:**
Second wizard step showing visual schedule pattern options.

**Acceptance Criteria:**

- [ ] Card for each pattern: 2-2-5-5, 3-4-4-3, Alternating Weeks, Every Other Weekend
- [ ] Each card shows mini-calendar thumbnail (2-week preview)
- [ ] Brief description under each (e.g., "2-2-5-5: Most popular 50/50 schedule")
- [ ] Filters patterns based on Step 1 split selection
- [ ] Hover state shows expanded description

**Files to Create:**

- `src/components/wizard/steps/PatternPicker.tsx`
- `src/components/wizard/steps/PatternThumbnail.tsx`

**Pattern Thumbnails Data:**

```typescript
const PATTERNS: PatternOption[] = [
  {
    type: '2-2-5-5',
    label: '2-2-5-5 Rotation',
    description: 'Most popular 50/50. Each parent gets 2 weekdays, then 5 days including a weekend.',
    compatibleSplits: ['50/50'],
    preview: ['A','A','B','B','A','A','A','A','A','B','B','A','A','A'], // 14 days
  },
  // ... other patterns
];
```

**Blocked By:** Issue #8

---

#### Issue #11: Create Step 3 - ParentSetup Form

**Labels:** `ui`, `priority:high`

**Description:**
Third wizard step for parent names, colors, and schedule start date.

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

**Blocked By:** Issue #8

---

#### Issue #12: Create Step 4 - HolidaySelector (MVP Placeholder)

**Labels:** `ui`, `priority:medium`

**Description:**
Fourth wizard step for selecting major holidays. MVP version is simplified checklist.

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

**Blocked By:** Issue #8

---

#### Issue #13: Create Wizard State Management with Context

**Labels:** `state`, `priority:high`

**Description:**
Create React Context + useReducer for wizard form state.

**Acceptance Criteria:**

- [ ] `WizardContext` provides state and dispatch
- [ ] Actions: SET_SPLIT, SET_PATTERN, SET_PARENTS, SET_HOLIDAYS, RESET
- [ ] State persists across step navigation
- [ ] "Finish" action converts wizard state to AppState

**Files to Create:**

- `src/context/WizardContext.tsx`
- `src/reducers/wizardReducer.ts`

**Blocked By:** Issue #2

---

#### Issue #14: Integrate Wizard into App with Route/Modal

**Labels:** `ui`, `priority:high`

**Description:**
Add wizard to app flow. Show wizard on first visit or via "New Schedule" button.

**Acceptance Criteria:**

- [ ] Wizard shows as modal overlay or dedicated route
- [ ] "Start New Schedule" button in header opens wizard
- [ ] Completing wizard dismisses it and shows calendar
- [ ] Calendar uses wizard output (still mock calculation)

**Files to Modify:**

- `src/App.tsx`
- `src/components/layout/Header.tsx`

**Blocked By:** Issues #8-13

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

#### Issue #20: Create useCustodyEngine Hook - Base Structure

**Labels:** `logic`, `priority:critical`

**Description:**
Create the core hook that calculates custody ownership for any date. Start with 2-2-5-5 pattern only.

**Acceptance Criteria:**

- [ ] Hook accepts `AppConfig` and returns calculation functions
- [ ] `getOwnerForDate(date: string): ParentId` works for 2-2-5-5
- [ ] `getMonthDays(year: number, month: number): CalendarDay[]` returns full month
- [ ] Handles leap years correctly
- [ ] Unit test: 5-year span shows no drift

**Files to Create:**

- `src/hooks/useCustodyEngine.ts`
- `src/hooks/useCustodyEngine.test.ts`

**Core Logic (2-2-5-5):**

```typescript
const PATTERN_2_2_5_5 = ['A','A','B','B','A','A','A','A','A','B','B','A','A','A'] as const;
// 14-day cycle, index = daysDiff % 14
```

**Blocked By:** Issue #2

---

#### Issue #21: Implement Remaining Patterns in useCustodyEngine

**Labels:** `logic`, `priority:high`

**Description:**
Add 3-4-4-3, Alternating Weeks, and Every Other Weekend patterns.

**Acceptance Criteria:**

- [ ] `3-4-4-3` pattern: 14-day cycle with correct array
- [ ] `alt-weeks` pattern: 14-day cycle [A×7, B×7]
- [ ] `every-other-weekend`: 14-day cycle, Parent B gets weekends
- [ ] Pattern selection based on `config.selectedPattern`
- [ ] All patterns unit tested

**Files to Modify:**

- `src/hooks/useCustodyEngine.ts`
- `src/hooks/useCustodyEngine.test.ts`

**Pattern Arrays:**

```typescript
const PATTERNS: Record<PatternType, ParentId[]> = {
  '2-2-5-5': ['A','A','B','B','A','A','A','A','A','B','B','A','A','A'],
  '3-4-4-3': ['A','A','A','B','B','B','B','A','A','A','A','B','B','B'],
  'alt-weeks': ['A','A','A','A','A','A','A','B','B','B','B','B','B','B'],
  'every-other-weekend': ['A','A','A','A','A','B','B','A','A','A','A','A','B','B'],
};
```

**Blocked By:** Issue #20

---

#### Issue #22: Wire CalendarGrid to useCustodyEngine

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

**Blocked By:** Issues #20, #21

---

#### Issue #23: Calculate and Display Real Timeshare Stats

**Labels:** `integration`, `priority:high`

**Description:**
Wire stats panel to real calculation engine.

**Acceptance Criteria:**

- [ ] Donut chart shows actual percentage from schedule
- [ ] Bar chart shows real monthly breakdown
- [ ] Stats update when pattern or dates change
- [ ] "Nights per year" calculated correctly

**Files to Modify:**

- `src/components/stats/StatsPanel.tsx`
- `src/components/stats/TimeshareDonutChart.tsx`

**Calculation Logic:**

```typescript
const calculateYearlyStats = (startDate: string, pattern: PatternType): TimeshareStats => {
  // Count 365 days from startDate
  // Return { parentA: { days, percentage }, parentB: { days, percentage } }
};
```

**Blocked By:** Issue #20

---

### Cycle 5: Persistence & App State (Days 13-14)

**Goal:** User config persists across sessions. Complete MVP flow.

---

#### Issue #24: Create useLocalStorage Hook

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

#### Issue #25: Create AppState Context with Persistence

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

**Blocked By:** Issues #2, #24

---

#### Issue #26: Integrate AppState Across All Components

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

**Blocked By:** Issue #25

---

### Cycle 6: Plan Builder UI & Export (Days 15-17)

**Goal:** Basic parenting plan text generation and export.

---

#### Issue #27: Create PlanBuilder Shell Component

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

#### Issue #28: Create Provision Category Components

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

**Blocked By:** Issue #27

---

#### Issue #29: Implement Schedule-to-Text Generator

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

```
"The parents shall share physical custody of the children according to 
a 2-2-5-5 schedule. The rotation shall commence on January 1, 2025. 
John shall have the children for two days, followed by Sarah for two days. 
John shall then have the children for five days, followed by Sarah for 
five days. All exchanges shall occur at 3:00 PM."
```

**Blocked By:** Issue #2

---

#### Issue #30: Implement Copy & Download Export

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

**Blocked By:** Issue #29

---

#### Issue #31: Add Plan Builder to App Navigation

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

**Blocked By:** Issue #27

---

### Further Considerations

1. **Holiday override logic timing?** Add Layer 2 (holiday override) after core MVP demo approval / Defer to v2 milestone?

2. **Mobile responsive priority?** Build responsive breakpoints in parallel with each component / Focus on desktop for initial demos, mobile polish as separate cycle?

3. **Testing strategy?** Add Vitest unit tests for `useCustodyEngine` as part of Issue #20 / Create separate testing cycle after all features work?

4. **PDF export?** Text export covers MVP. PDF requires additional library (e.g., `@react-pdf/renderer`). Defer to v2 or include as Issue #32?
