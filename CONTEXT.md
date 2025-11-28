# CONTEXT.md - Custody Calculator Domain Knowledge & Architecture

## Table of Contents

1. [Domain Context & Legal Background](#domain-context--legal-background)
2. [The Fundamental Problem](#the-fundamental-problem)
3. [Hierarchical Temporal Logic](#hierarchical-temporal-logic)
4. [Core Architectural Patterns](#core-architectural-patterns)
5. [User Personas & Behavioral Dynamics](#user-personas--behavioral-dynamics)
6. [Standard Custody Patterns](#standard-custody-patterns)
7. [Calculation Methodologies](#calculation-methodologies)
8. [Technical Constraints & Decisions](#technical-constraints--decisions)

---

## Domain Context & Legal Background

### What is a Custody Calculator?

A custody calculator is a **precision legal tool** that helps divorced or separated parents:

1. **Design** a parenting time schedule
2. **Visualize** who has the child on any given day
3. **Calculate** the exact percentage split of custody time
4. **Generate** court-ready legal documents (Parenting Plans)

### Why Precision Matters

In family law, custody percentage directly impacts:

- **Child Support Payments:** Courts use custody percentage to calculate financial obligations
- **Tax Deductions:** The parent with majority time may claim the child as a dependent
- **Legal Standing:** Custody disputes often hinge on demonstrating "substantial time"

**A 1% calculation error can translate to hundreds of dollars per month in support payments.** This is why the application must be mathematically rigorous.

### The "Time is Contested" Problem

Unlike a work calendar where "Tuesday 2PM meeting" is simply a fact, in custody schedules:

- Time is a **finite resource** being divided between two parties
- Every hour given to Parent A is an hour taken from Parent B
- Changes to the schedule require **negotiation** or court approval
- Historical patterns establish **precedent** for future disputes

This creates unique requirements:

- **Audit trails** - Who changed what and when?
- **Conflict detection** - What happens when "Dad's Vacation" overlaps "Mom's Holiday"?
- **Fairness metrics** - Is the split truly 50/50 or are there hidden imbalances?

---

## The Fundamental Problem

### Why Standard Calendar Apps Fail

Google Calendar, Outlook, and Apple Calendar are **event-based systems**:

- You create individual events: "Johnny with Mom - Jan 1"
- You manually create recurring events: "Every Monday with Dad"
- When you edit a recurrence, you must choose: "Edit this one" or "Edit all future"

**This model breaks for custody schedules because:**

1. **The 2-2-5-5 Problem:** Common custody patterns like "2 days Mom, 2 days Dad, 5 days Mom, 5 days Dad" repeat on a 14-day cycle. Standard weekly recurrence can't model this.

2. **The Infinite Projection Problem:** Legal agreements specify patterns that run "until the child turns 18" - potentially 18 years into the future. Creating 6,570 individual events is impractical.

3. **The Override Cascade Problem:** When you add "Christmas with Mom," you want it to automatically replace whatever the regular schedule says for Dec 25. In Google Calendar, you must manually delete "Dad's Weekend" every year.

4. **The Pattern Drift Problem:** If you manually create events, small errors accumulate. By Year 3, your "2-2-5-5" pattern may have drifted to "2-2-4-6" due to leap years or manual corrections.

### Our Solution: Pattern-Based Generation

Instead of storing events, we store **generation algorithms**:

- The base pattern: `['A','A','B','B','A','A','A','A','A','B','B','B','B','B']`
- An anchor date: `2025-01-01`
- A calculation function: `owner = pattern[(today - anchorDate) % 14]`

Events are **computed on-demand** when rendering the calendar, ensuring perfect consistency forever.

---

## Hierarchical Temporal Logic

### The 4-Layer Priority Stack

This is the **most critical architectural concept** in the entire application. It solves the "What happens when rules conflict?" problem.

#### Layer 4: Base Recurring Schedule (Foundation)

```
Example: "2-2-5-5 pattern starting Monday"
Priority: Lowest
Visibility: Always running in the background
```

This is the "default state" of the calendar. If no other rules apply, the base pattern determines custody.

**Technical Implementation:**

- Stored as: `{ pattern: '2-2-5-5', startDate: '2025-01-01', startingParent: 'A' }`
- Generated as: For any date D, calculate `dayIndex = (D - startDate) % 14`, return `PATTERN[dayIndex]`

#### Layer 3: Seasonal Schedules (Temporary Override)

```
Example: "Summer Break: alternating weeks from June 15 - Aug 15"
Priority: Medium-Low
Visibility: Active only within date range
```

During summer vacation, many families switch from their school-year pattern to a simpler schedule. This layer "pauses" Layer 4 for a specific window.

**Technical Implementation:**

- Stored as: `{ pattern: 'alt-weeks', startDate: '2025-06-15', endDate: '2025-08-15' }`
- Logic: `if (date >= seasonStart && date <= seasonEnd) use seasonPattern else use basePattern`

#### Layer 2: Holidays & Special Days (Puncture Points)

```
Example: "Thanksgiving with Mom in even years, Dad in odd years"
Priority: Medium-High
Visibility: Specific days that override patterns
```

Holidays are "puncture points" that override whatever schedule would normally apply. They repeat annually but follow special assignment rules.

**Technical Implementation:**

- Stored as: `{ holiday: 'thanksgiving', rule: 'alternating-years', evenYear: 'B', oddYear: 'A' }`
- Logic: Calculate Thanksgiving date for current year, check year parity, assign owner, override layers 3 & 4

**The "Monday Holiday Extension" Rule:**
Many holidays (Memorial Day, Labor Day) fall on Mondays. The system must support: "If Parent A had the weekend, they keep Monday too" - this requires looking backward at the schedule.

#### Layer 1: Vacations & One-Time Edits (Absolute Priority)

```
Example: "Dad's Disney Trip: Dec 20-27, 2025"
Priority: Highest
Visibility: Specific date ranges, highest precedence
```

Vacations are negotiated blocks that override everything. They're typically one-time events, not recurring.

**Technical Implementation:**

- Stored as: `{ type: 'vacation', parent: 'A', startDate: '2025-12-20', endDate: '2025-12-27' }`
- Logic: For any date in range, return vacation owner, ignore all other layers

### Conflict Resolution

**What if "Dad's Vacation (Dec 24-26)" overlaps "Mom's Christmas (Dec 25)"?**

The system must:

1. **Detect the conflict** - Flag dates where multiple high-priority rules apply
2. **Default to priority** - Layer 1 (vacation) beats Layer 2 (holiday) by default
3. **Warn the user** - Display: "Conflict detected: Dec 25 assigned to both parents"
4. **Allow override** - User can create a Layer 1 "exception" to give Christmas to Mom despite the vacation

---

## Core Architectural Patterns

### Pattern-Based Recurrence (Not Event Streams)

**Traditional Event-Based Calendar:**

```
Database Table: events
- id: 1, date: '2025-01-01', owner: 'A'
- id: 2, date: '2025-01-02', owner: 'A'
- id: 3, date: '2025-01-03', owner: 'B'
... (6,570 rows for 18 years)
```

**Our Pattern-Based Approach:**

```
Database Table: recurrence_rules
- id: 1, pattern: '2-2-5-5', startDate: '2025-01-01'

Runtime Calculation:
function getOwner(date) {
  days = daysBetween(date, '2025-01-01')
  index = days % 14
  return PATTERN_2_2_5_5[index]
}
```

**Advantages:**

- Zero storage growth over time
- Guaranteed consistency (no manual drift)
- Instant pattern changes (change pattern definition, all dates update)
- Easily project 50 years forward for "what if" scenarios

### Non-Destructive Masking (Not Deletion)

When a user adds "Christmas with Mom," we don't delete the underlying "Dad's Weekend" event. Instead:

```typescript
// WRONG: Destructive edit
if (date === 'Dec 25') {
  deleteEvent(dadWeekendEvent)
  createEvent(christmasWithMom)
}

// CORRECT: Layered masking
function renderDay(date) {
  const baseOwner = getPatternOwner(date) // Layer 4: "Dad"
  const holidayOwner = getHolidayOwner(date) // Layer 2: "Mom"
  
  // Higher layer masks lower layer
  return holidayOwner || baseOwner // Returns "Mom"
}

// If user deletes the holiday:
function deleteHoliday() {
  removeHolidayRule('christmas')
  // Next render: getHolidayOwner returns null
  // Calendar shows baseOwner ("Dad") again automatically
}
```

This "undo-friendly" architecture prevents data loss and allows users to experiment safely.

### Client-Side Calculation (MVP Constraint)

**Project Requirement:** No backend server in MVP. All logic runs in the browser.

**Implications:**

- State stored in `localStorage` (browser storage, 5-10MB limit)
- All date calculations happen in React hooks
- Export functions generate documents client-side

**Data Flow:**

```
User Input (Wizard)
  → WizardContext (React Context)
  → AppState (Global State + localStorage)
  → useCustodyEngine (Calculation Hook)
  → CalendarGrid (Visual Component)
```

**Performance Considerations:**

- Must calculate 365 days in < 100ms
- localStorage writes must be debounced to avoid blocking UI
- Calendar must render 42 cells (6 weeks) in < 16ms (60fps)

---

## User Personas & Behavioral Dynamics

### The Primary Parent ("The Architect")

**Profile:**

- Usually the parent who had primary custody during marriage
- Organized, detail-oriented, often anxious about fairness
- Wants to "try before they buy" - needs private draft mode

**Workflow:**

1. Creates account, starts wizard
2. Experiments with 3 different patterns in private drafts
3. Uses calculator to verify each is exactly 50/50
4. Shares final draft with co-parent for approval

**Critical Feature:** Must support multiple "Draft Calendars" that can be compared side-by-side.

### The Co-Parent ("The Collaborator/Auditor")

**In Amicable Divorces:**

- Views calendar in "Edit Mode"
- Can propose changes (add vacations, request swaps)
- Sees change history/audit log

**In High-Conflict Divorces:**

- Views calendar in "Read-Only Mode"
- Can flag discrepancies (e.g., "This doesn't match the court order")
- Cannot edit, only comment

**Critical Feature:** Granular permissions system - not in MVP but architecture must allow for it.

### The Legal Professional ("The Multi-Tenant Admin")

**Profile:**

- Family law attorney or mediator
- Manages 20-50 client families simultaneously
- Needs to generate court documents quickly

**Workflow:**

1. Creates "Family" objects for each client
2. Inputs custody order details from court documents
3. Generates visual calendar to share with clients
4. Exports Parenting Plan for court filing

**Critical Feature:** Must support "workspace switching" where one user account can access multiple unrelated calendars.

**Data Schema Requirement:**

```
User (attorney) → hasMany → Families (clients)
Family → hasOne → Calendar
```

Not in MVP, but architecture should not preclude this.

---

## Standard Custody Patterns

### 1. The 2-2-5-5 Rotation (Most Popular 50/50)

**Visual Pattern (2 weeks):**

```
Week 1:  M  T | W  T | F  S  S  M  T
         A  A | B  B | A  A  A  A  A

Week 2:  W  T  F  S  S | M  T  W  T
         B  B  B  B  B | A  A  A  A
```

**Why It's Popular:**

- Each parent gets equal weekdays and weekends
- No parent goes more than 5 days without seeing child
- Works well for school-age children (minimizes school transitions)

**Critical Configuration:**

- **Anchor Day:** Which day is "Day 1"? (Usually Monday)
- **Exchange Time:** What time does the handoff occur? (Often 3:00 PM or "after school")

**Implementation:**

```typescript
const PATTERN_2_2_5_5: ParentId[] = [
  'A', 'A', 'B', 'B', 'A', 'A', 'A', 'A', 'A', 'B', 'B', 'B', 'B', 'B'
];
```

**Edge Case:** What if the user wants to start on Wednesday? The pattern is the same, but the "alignment" to the calendar week changes:

```typescript
function getOwner(date: string, startDate: string, startDayOfWeek: number) {
  const daysSinceStart = daysBetween(date, startDate);
  const patternIndex = daysSinceStart % 14;
  return PATTERN_2_2_5_5[patternIndex];
}
```

### 2. The 3-4-4-3 Schedule (Alternative 50/50)

**Visual Pattern (2 weeks):**

```
Week 1:  M  T  W | T  F  S  S
         A  A  A | B  B  B  B

Week 2:  M  T  W  T | F  S  S
         A  A  A  A | B  B  B
```

**Advantage over 2-2-5-5:**

- Slightly longer blocks (fewer transitions per month)
- Still maintains equal weekend time

**Implementation:**

```typescript
const PATTERN_3_4_4_3: ParentId[] = [
  'A', 'A', 'A', 'B', 'B', 'B', 'B', 'A', 'A', 'A', 'A', 'B', 'B', 'B'
];
```

### 3. Alternating Weeks (7-7 Split)

**Visual Pattern:**

```
Week 1:  M  T  W  T  F  S  S
         A  A  A  A  A  A  A

Week 2:  M  T  W  T  F  S  S
         B  B  B  B  B  B  B
```

**Pros:**

- Simplest to remember
- Longest stretches (good for bonding)
- Easiest for school (only one transition per week)

**Cons:**

- Long gaps between visits (7 days without seeing child)
- Can be hard for younger children

**Implementation:**

```typescript
const PATTERN_ALT_WEEKS: ParentId[] = [
  'A', 'A', 'A', 'A', 'A', 'A', 'A', 'B', 'B', 'B', 'B', 'B', 'B', 'B'
];
```

### 4. Every Other Weekend (80/20 - Primary Custody)

**Visual Pattern:**

```
Week 1:  M  T  W  T  F | S  S
         A  A  A  A  A | B  B

Week 2:  M  T  W  T  F  S  S
         A  A  A  A  A  A  A
```

**Used When:**

- One parent has "primary custody"
- Other parent has "visitation rights"
- Distance between homes makes frequent exchanges impractical

**Configuration Options:**

- **Simple Alternating:** Every 2nd weekend (e.g., 1st and 3rd of month)
- **Fixed Weekends:** Specific weekends (e.g., 1st, 3rd, and 5th)

**The "5th Weekend Problem:"**
Some months have 5 weekends. With "1st, 3rd, 5th" rule, the non-custodial parent gets 3 weekends that month (closer to 40/60). With strict alternating, they get only 2 weekends (20/80).

**Implementation:**

```typescript
const PATTERN_EVERY_OTHER_WEEKEND: ParentId[] = [
  'A', 'A', 'A', 'A', 'A', 'B', 'B', 'A', 'A', 'A', 'A', 'A', 'B', 'B'
];
```

---

## Calculation Methodologies

### Why Two Modes?

Different courts use different standards to calculate custody percentage. The system must support both.

### Mode A: Precise Hours (Duration Method)

**Logic:** Sum the total hours each parent has the child.

**Formula:**

```
Parent A % = (Total Hours Parent A / Total Hours in Period) × 100
```

**Example Calculation:**

```
Period: Jan 1 - Jan 31 (31 days = 744 hours)
Parent A: 372 hours (15.5 days)
Parent B: 372 hours (15.5 days)
Result: 50.0% / 50.0%
```

**Handling Exchange Times:**
If exchange is at 3:00 PM:

- Jan 1 00:00 - Jan 1 15:00 (15 hours) → Parent A
- Jan 1 15:00 - Jan 2 15:00 (24 hours) → Parent B

**Third-Party Time:**
If child is at school Mon-Fri, 8 AM - 3 PM (7 hours):

- User can toggle "Deduct Third-Party Time"
- If enabled: Deduct 7 hours × 5 days = 35 hours from denominator
- Calculation becomes: `(Parent A - their third-party time) / (744 - total third-party time)`

**Pros:**

- Most accurate representation of actual "face time"
- Accounts for split days (e.g., handoff at noon)

**Cons:**

- More complex to calculate
- Requires precise exchange times

### Mode B: Overnights (Midnight Method)

**Logic:** The parent who has the child at midnight gets credit for the entire day.

**Formula:**

```
Parent A % = (Days with overnight custody / Total Days) × 100
```

**Example Calculation:**

```
Period: Jan 1 - Jan 31 (31 days)
Parent A: 16 overnights
Parent B: 15 overnights
Result: 51.6% / 48.4%
```

**Edge Cases:**

1. **No Overnight Visit:** If Parent B has child Sat 9AM - Sat 8PM (no overnight), Parent A still gets credit for Saturday.

2. **Partial Day Credit (Virginia Rule):** Some jurisdictions count a visit longer than 4 hours but less than overnight as 0.5 days:

   ```
   If visit = 5 hours (no overnight): Credit 0.5 days
   If visit < 4 hours: Credit 0 days
   ```

**Pros:**

- Simpler for courts to verify
- Matches how child support calculators work in many states

**Cons:**

- Less precise (ignores time-of-day)
- Biased toward overnight custody

### Which Mode Should Be Default?

**MVP Decision:** Default to "Overnights" (Mode B) because:

1. It's what most online custody calculators use
2. Simpler to explain to users
3. Matches most state child support formulas

However, provide a toggle in settings to switch to "Precise Hours" for advanced users.

---

## Technical Constraints & Decisions

### MVP Constraints (Per Project Requirements)

**Excluded Features (Not in MVP):**

- Backend server / API
- Database (PostgreSQL, MySQL, etc.)
- User authentication / login
- Multi-user collaboration (shared calendars)
- Child information database
- Expense tracking
- Secure messaging
- Journaling
- Mobile native apps (iOS/Android)

**Included in MVP:**

- Single-user, client-side application
- localStorage persistence
- Calendar visualization
- Schedule wizard
- Basic calculator
- Plan builder (text export only)
- Copy to clipboard / download .txt

### localStorage Architecture

**Storage Schema:**

```typescript
// Key: 'custody-calculator-state'
{
  version: '1.0.0',
  config: {
    startDate: '2025-01-01',
    selectedPattern: '2-2-5-5',
    startingParent: 'parentA',
    exchangeTime: '15:00'
  },
  parents: {
    parentA: { name: 'John', colorClass: 'bg-blue-500' },
    parentB: { name: 'Sarah', colorClass: 'bg-pink-500' }
  },
  // Future: holidays, vacations, etc.
}
```

**Size Limits:**

- localStorage limit: ~5-10MB depending on browser
- Our data: < 100KB even with 5 years of overrides
- No concern for MVP scale

**Persistence Strategy:**

```typescript
// Auto-save on every state change (debounced)
useEffect(() => {
  const timer = setTimeout(() => {
    localStorage.setItem('custody-calculator-state', JSON.stringify(state));
  }, 500); // 500ms debounce
  return () => clearTimeout(timer);
}, [state]);
```

### Date Handling Strategy

**Critical Decision:** Use ISO 8601 date strings (`YYYY-MM-DD`) exclusively, not JavaScript Date objects, for storage and calculations.

**Why?**

1. **Timezone Independence:** Custody schedules are "date-based," not "time-based." "Jan 1" is the same regardless of timezone.
2. **DST Safety:** JavaScript Date math breaks twice a year during DST transitions. Date-only arithmetic doesn't.
3. **Serialization:** Strings serialize to localStorage cleanly; Date objects don't.

**Implementation Pattern:**

```typescript
// ✅ CORRECT
function addDays(dateStr: string, days: number): string {
  const date = new Date(dateStr + 'T00:00:00'); // Force midnight
  date.setDate(date.getDate() + days);
  return date.toISOString().split('T')[0]; // "YYYY-MM-DD"
}

// ❌ WRONG
function addDaysWrong(date: Date, days: number): Date {
  return new Date(date.getTime() + days * 86400000); // Breaks on DST!
}
```

### TypeScript Strict Mode

**Requirement:** `"strict": true` in `tsconfig.json`

**Implications:**

- No `any` types allowed
- All function parameters must have explicit types
- Nullable values must be explicitly typed (`string | null`)

**Example:**

```typescript
// ❌ WRONG
function calculateOwner(date, config) {
  // TypeScript error: Parameter 'date' implicitly has an 'any' type
}

// ✅ CORRECT
function calculateOwner(date: string, config: AppConfig): ParentId {
  // All types explicit
}
```

### Performance Budgets

**Target Metrics:**

- **Calendar Render:** < 16ms (60fps) for 42 cells
- **Month Navigation:** < 50ms to recalculate + re-render
- **Stats Calculation:** < 100ms for 365-day analysis
- **Export Generation:** < 2 seconds for full text document

**Optimization Strategies:**

1. **Memoization:** Use `useMemo` for expensive calculations

   ```typescript
   const monthDays = useMemo(() => 
     calculateMonthDays(currentMonth, config),
     [currentMonth, config]
   );
   ```

2. **Virtualization:** For long lists (not needed for 42-cell grid)

3. **Lazy Loading:** Load chart.js only when user opens stats panel

### Testing Strategy

**Critical Paths That Must Have Unit Tests:**

1. **Date arithmetic** - Leap years, DST, month boundaries
2. **Pattern generation** - All 4 standard patterns
3. **Percentage calculations** - Both modes (Hours & Overnights)
4. **5-year drift test** - Ensure pattern stays aligned

**Test Framework:** Vitest (modern, fast, Vite-compatible)

**Example Test:**

```typescript
import { describe, test, expect } from 'vitest';
import { getOwnerForDate } from './useCustodyEngine';

describe('2-2-5-5 Pattern', () => {
  const config: AppConfig = {
    startDate: '2025-01-01',
    selectedPattern: '2-2-5-5',
    startingParent: 'parentA',
    exchangeTime: '15:00'
  };

  test('Day 0 is Parent A', () => {
    expect(getOwnerForDate('2025-01-01', config)).toBe('parentA');
  });

  test('Day 2 is Parent B', () => {
    expect(getOwnerForDate('2025-01-03', config)).toBe('parentB');
  });

  test('Pattern repeats after 14 days', () => {
    const day0 = getOwnerForDate('2025-01-01', config);
    const day14 = getOwnerForDate('2025-01-15', config);
    expect(day0).toBe(day14);
  });
});
```

---

## Summary: Key Architectural Principles

1. **Pattern-Based, Not Event-Based:** Generate schedules from algorithms, not discrete events
2. **Hierarchical Resolution:** 4-layer priority stack with non-destructive masking
3. **Client-Side First:** All calculations in browser, localStorage persistence
4. **Type Safety:** Strict TypeScript, no `any` types
5. **Date-Only Logic:** ISO strings, no time-based arithmetic
6. **Precision Over Features:** Accuracy is paramount; incomplete features better than incorrect ones
7. **Legal Document Quality:** Generated text must read as professional legal prose

**Remember:** This application has real legal and financial consequences. A calculation error can cost a parent thousands of dollars or affect a child's well-being. When in doubt, prioritize correctness and clarity over cleverness or features.
