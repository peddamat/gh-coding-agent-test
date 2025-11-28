# **Product Requirements Document: Custody Calculator Web Application**

## **1\. Executive Summary and Strategic Product Definition**

### **1.1 Architectural Vision and Product Scope**

The "Custody Calculator" is conceptualized as a high-precision, domain-specific web application designed to solve the complex logistical and legal challenges faced by co-parents and family law professionals. The product aims to replicate the core scheduling and planning intelligence of industry-standard custody-planning platforms, distilling their functionality into a specialized tool for **Custody Calendar Management** and **Parenting Plan Generation**.1

Unlike generic calendar applications such as Google Calendar or Outlook, which treat events as flat, equal-priority occurrences, the Custody Calculator must operate on a **Hierarchical Temporal Logic**. In family law, time is not merely a sequence of hours but a contested asset governed by a strict stack of legal priorities—where a "Holiday" legally supersedes a "Weekend," and a "Vacation" may supersede both. The application’s primary technical challenge, and its core value proposition, is the flawless execution of this logic to provide mathematically accurate "Parenting Time" calculations that can withstand scrutiny in a court of law.2

The scope of this Product Requirements Document (PRD) is strictly delineated to focus on the **Scheduling Engine**, the **Calculation Module**, and the **Plan Builder**. Per the project constraints, peripheral features found in the reference model—such as the child information database, secure messaging platform, expense tracking, and journaling—are explicitly excluded.4 This focus allows for a lean, highly optimized architectural approach that prioritizes the integrity of the schedule and the resulting legal documentation. The resulting application must be buildable by a sophisticated coding agent (e.g., Gemini Pro 3.0, ChatGPT-5.1-codex) and must demonstrate a nuanced understanding of recurrence patterns, conflict resolution algorithms, and document automation.2

### **1.2 User Personas and Behavioral Dynamics**

To design an effective system, the coding agent must understand the distinct psychological and operational needs of the primary user groups. The system is not just a utility; it is a mechanism for conflict reduction.2

The Primary Parent (The Architect):

This user is often the primary organizer of the child's life or the parent initiating the divorce proceedings. They require a "sandbox" environment where they can draft multiple schedule scenarios (e.g., "What if we did 2-2-5-5?" vs. "What if we did alternating weeks?") without immediately revealing these drafts to the other party. This requirement necessitates a "Private vs. Shared" calendar architecture.2 The Architect values precision and requires the system to validate that their proposed schedule results in a "fair" time split (e.g., exactly 50/50), using the calculator as a negotiation tool.1

The Co-Parent (The Collaborator/Auditor):

In amicable situations, this user acts as a collaborator with edit permissions. In high-conflict situations, they are an auditor who views a "Read-Only" version of the schedule. The system must support granular permission levels to accommodate this spectrum. Crucially, the "Shared Calendar" feature implies that any change made by the Primary Parent must be auditable or notifiable, ensuring that both parties are operating from a single source of truth regarding exchanges and holidays.2

The Legal Professional (The Multi-Tenant Admin):

Lawyers and mediators use the software to manage schedules for multiple clients. This dictates a data schema that supports multi-tenancy, where a single professional account can access and manipulate distinct, unconnected "Family" objects. For the coding agent, this means the User entity must be decoupled from the Calendar entity, allowing a many-to-many relationship where a lawyer can oversee dozens of distinct parenting plans simultaneously.4

### **1.3 Strategic Differentiators and Success Metrics**

The success of the Custody Calculator will be measured by its ability to handle complexity that breaks standard calendar apps.

- **Accuracy of "The Shuffle":** The system must correctly handle the "2-2-5-5" rotation over a 5-year span, accounting for leap years, without the drift that occurs in simple weekly repeats.10
- **The "Holiday Override":** The system must successfully render a scenario where "Dad's Weekend" is erased because it falls on "Mom's Christmas," without the user needing to manually delete the weekend events. This "automatic collision detection and resolution" is the defining technical feature.6
- **Document Fidelity:** The generated Parenting Plan must read as natural, professional legal prose, not as a computer-generated list. It must bridge the gap between the visual grid and the textual court order.9

---

## **2\. Technical Feature Specification: The Custody Calendar Engine**

The Custody Calendar Engine is the core backend service of the application. It acts as the "Source of Truth" for all other modules. Unlike a typical CRUD (Create, Read, Update, Delete) system for events, this engine acts as a **Rule Composition System**, where the final state of any given day is calculated by compositing multiple layers of rules.

### **2.1 The Layered Temporal Resolution Algorithm**

To accurately model family law custody, the coding agent must implement a hierarchical priority system. When the frontend requests the schedule for a specific date range (e.g., "June 2025"), the backend must query four distinct layers of data and merge them. The higher layers must visually and logically obscure the lower layers. The priority stack, from bottom to top, is as follows 2:

| Priority Level | Layer Name | Description and Logic |
| :---- | :---- | :---- |
| **Layer 4 (Base)** | **Recurring Schedule** | The fundamental repeating pattern (e.g., Alternating Weeks). This runs infinitely in the background. It is the default state of the calendar. 12 |
| **Layer 3** | **Seasonal Schedules** | A temporary recurring pattern that overrides Layer 4 for a specific date range (e.g., "Summer Break Schedule" from June 15 to August 15). The engine must suppress Layer 4 during this window. 2 |
| **Layer 2** | **Holidays & Special Days** | Recurring annual events (e.g., Thanksgiving) or one-off special days (e.g., "Mom's Birthday"). These specific days puncture through Layers 3 and 4\. A holiday rule (e.g., "Mom gets Christmas") overrides the regular rotation. 6 |
| **Layer 1 (Top)** | **Vacations & One-Time Edits** | The highest priority. A specific vacation block (e.g., "Dad's Trip to Disney") or a manual "Swap Day" overrides everything below it. If a vacation conflicts with a holiday, the vacation (Layer 1\) generally wins, or the system flags a conflict. 2 |

Implementation Note for Coding Agents:

The algorithm should not "delete" the underlying events. Instead, it should use a "Masking" approach.

1. Generate the Layer 4 events for the viewport.
2. Generate Layer 3 events. If a Layer 3 event exists for Date X, discard the Layer 4 event for Date X.
3. Generate Layer 2 events. If a Layer 2 event exists for Date X, discard the surviving lower-layer event.
4. Generate Layer 1 events. If a Layer 1 event exists, it claims the slot.  
   This non-destructive approach allows users to delete a Vacation (Layer 1\) and immediately see the Holiday (Layer 2\) or Regular Schedule (Layer 4\) "re-appear" underneath it, preserving the integrity of the recurring rules.14

### **2.2 Standard Recurrence Patterns (The "Templates")**

The application must provide a "Schedule Wizard" that allows users to generate Layer 4 patterns without manual entry. The coding agent must implement the specific logic for the following industry-standard schedules identified in the research.

#### **2.2.1 The 2-2-5-5 Rotation**

This is one of the most common 50/50 schedules. The logic requires a 14-day repeating array.10

- **Pattern Logic:**
  - Days 1-2: Parent A (e.g., Monday, Tuesday).
  - Days 3-4: Parent B (e.g., Wednesday, Thursday).
  - Days 5-9: Parent A (e.g., Friday, Saturday, Sunday, Monday, Tuesday).
  - Days 10-14: Parent B (e.g., Wednesday through Sunday).
- **User Configuration Parameters:**
  - _Anchor Day:_ The user must select the day of the week the cycle begins. Changing this from Monday to Thursday dramatically alters which parent gets the weekend.
  - _Exchange Time:_ The system must allow split exchange times (e.g., Drop-off at School at 8:00 AM vs. Pick-up at 3:00 PM).10

#### **2.2.2 The 3-4-4-3 Schedule**

A 50/50 schedule that provides three days to one parent and four to the other, swapping the next week.

- **Pattern Logic:**
  - Week 1: Parent A (3 days), Parent B (4 days).
  - Week 2: Parent A (4 days), Parent B (3 days).
- **Technical Nuance:** Unlike 2-2-5-5, the "handover day" changes. In Week 1, the exchange might be Wednesday; in Week 2, it might be Thursday. The visualization engine must handle variable exchange days accurately.15

#### **2.2.3 Alternating Weeks (7-7)**

The simplest 50/50 schedule.

- **Pattern Logic:** Parent A for 7 days, then Parent B for 7 days.
- **Configuration:** The critical parameter here is the "Exchange Day." Many parents prefer Fridays (to handle the weekend transition) or Mondays (to handle the school week transition). The UI must emphasize this choice.10

#### **2.2.4 The "Every Other Weekend" (80/20)**

Used for primary custody arrangements.

- **Pattern Logic:** Parent A is the default (Primary). Parent B has a recurrence rule for specific weekends.
- **Configuration:** The system must distinguish between "Strictly Alternating" (Every 2 weeks) and "Specific Weekends" (1st, 3rd, and 5th weekends of the month).
  - _Edge Case:_ The "5th Weekend." In months with 5 weekends, the 1st/3rd/5th logic gives Parent B three weekends, whereas strict alternating might not. The user must explicitly choose the logic model.16

### **2.3 Holiday and Special Occasion Logic**

Holidays are "Floating" or "Fixed" events that override the regular schedule. The database must include a pre-populated table of standard holidays (US Federal, Christian, Jewish, Islamic, etc.) to reduce user data entry friction.6

#### **2.3.1 Holiday Assignment Rules**

The system must support complex assignment heuristics, not just simple ownership.6

- **Alternating Years:** A common pattern where Parent A gets Thanksgiving in Even Years, and Parent B gets it in Odd Years. The system must project this logic infinitely into the future.
- **Fixed Assignment:** Parent A _always_ gets Mother's Day; Parent B _always_ gets Father's Day.
- **Split Holidays:** The day is divided. e.g., Christmas Eve (Parent A) vs. Christmas Day (Parent B), or a single day split at 2:00 PM.
- **The "Monday Holiday" Rule:** If a holiday falls on a Monday (e.g., Labor Day), the system should offer a rule to "Extend the Weekend." If Parent A had the weekend, they keep the child through Monday. This logic requires the engine to look "backward" at the previous events to determine ownership.6

#### **2.3.2 Conflict Resolution: The "Double Booking" Problem**

What happens when "Dad's Vacation" overlaps with "Mom's Thanksgiving"?

- **System Behavior:** The system should default to the priority stack (Vacation \> Holiday). However, it must visually flag this conflict with a UI warning (e.g., "Conflict Detected: Nov 24-28").
- **User Action:** The user can resolve this by manually adjusting the dates or setting a "One-Time Exception" to swap the holiday ownership for that specific year.20

### **2.4 Third-Party Time (The "Masking" Layer)**

Accurate calculation requires accounting for time when the child is at school or daycare. This is known as "Third-Party Time".22

- **Visualization:** This should be rendered as a "Texture" (e.g., grey diagonal stripes) overlaying the parent's color block. It indicates that while Parent A is "On Duty" (responsible if the school calls), they are not accumulating "Face Time."
- **Data Structure:** Third-Party events are recurring events (e.g., Mon-Fri, 8 AM \- 3 PM) that sit on top of all other layers but do not _change_ the custody ownership; they only affect the _calculation_ statistics.22

---

## **3\. Functional Specification: The Parenting Time Calculator**

The Calculator module is the analytical engine that interprets the visual schedule. Its primary output is the "Timeshare Percentage," a critical figure used to determine child support payments in many jurisdictions. Accuracy here is paramount; a 1% error can translate to hundreds of dollars in monthly support.3

### **3.1 Calculation Algorithms**

Different courts accept different calculation methods. The Custody Calculator must offer a toggle to switch between these modes.8

#### **3.1.1 Mode A: Precise Hours (The "Duration" Method)**

- **Logic:** The system sums the total minutes assigned to each parent over a selected period.
- **Formula:** (Total Minutes Assigned to Parent A / Total Minutes in Period) \* 100\.
- **Third-Party Logic:** Users can toggle "Deduct Third-Party Time." If active, school hours are subtracted from the denominator (Total Minutes) and the numerator (Parent Minutes) if the parent was scheduled during that time.
  - _Example:_ If a parent has a 48-hour weekend but 10 hours are "Third Party," their "Face Time" credit is only 38 hours.

#### **3.1.2 Mode B: Overnights (The "Midnight" Method)**

- **Logic:** Custody is counted in discrete "days." The parent who has the child at a specific "cutoff time" (usually midnight) gets credit for the entire 24-hour block.
- **Nuance (The Virginia Rule):** Some jurisdictions calculate "partial days." e.g., A visit longer than 4 hours but no overnight counts as 0.5 days. The system must support a "Weighted Visit" rule engine to accommodate these state-specific variations.24

### **3.2 Reporting and Visualization**

The Calculator must provide a dashboard view.3

- **The Pie Chart:** A high-level view of the split (e.g., "42% Mom, 58% Dad").
- **The Trend Bar Graph:** A month-by-month breakdown. This is crucial for identifying seasonal anomalies (e.g., "Why did Dad get 70% in July?" Answer: Summer Vacation).
- **The Scenario Comparator:** A "Compare" feature allowing the user to select two different calendars (e.g., "Draft A" and "Draft B") and see the percentage difference side-by-side. This empowers the user to negotiate ("If I give you Christmas, my time drops to 48%. I need an extra weekend in August to balance it").1

---

## **4\. Functional Specification: The Parenting Plan Builder**

The Parenting Plan Builder transforms the structured data of the calendar into a legal text document. It functions as a "Legal Compiler," parsing the database state to generate natural language provisions.9

### **4.1 Integration with Calendar Data (NLP Generation)**

The system must not require the user to re-type the schedule into the plan. It must automatically generate the "Schedule Description" section based on the active Recurrence Rules.9

- **Text Generation Logic:**
  - _Input:_ Rule \= "2-2-5-5", Start \= Monday, Exchange \= 3:00 PM.
  - _Generated Prose:_ "The parents shall share physical custody of the children according to a 2-2-5-5 schedule. The rotation shall commence on Monday. The Father shall have the children for two days, followed by the Mother for two days. The Father shall then have the children for five days, followed by the Mother for five days. All exchanges shall occur at 3:00 PM unless otherwise noted."
- **Holiday Section Generation:** The system iterates through the "Holidays" table and generates a list: "Thanksgiving: In even-numbered years, the Father shall have the children. In odd-numbered years, the Mother shall have the children.".26

### **4.2 Provision Library and Categorization**

The research indicates the need for over 140 common provisions. The coding agent must structure these into a navigable UI, grouped by category.27

#### **4.2.1 Legal Custody & Decision Making**

This section defines _authority_, not time.

- **Provisions:**
  - _Sole vs. Joint:_ "The parents shall share joint legal custody."
  - _Tie-Breaker:_ "In the event of a disagreement regarding education, the Mother shall have final decision-making authority."
  - _Records Access:_ "Both parents shall have full access to the children's medical and school records."

#### **4.2.2 Exchange & Transportation**

Logistics of the physical handoff.

- **Provisions:**
  - _Location:_ A text input field for specific addresses (e.g., "The exchange shall occur at the Starbucks at 123 Main St").
  - _Transportation:_ "The receiving parent shall be responsible for transportation."
  - _Restrictions:_ "The parents shall not exit their vehicles during the exchange" (High-conflict provision).

#### **4.2.3 Communication Guidelines**

Rules for how parents interact.

- **Provisions:**
  - _Methods:_ "Communication shall be limited to email and text message, except in emergencies."
  - _Right of First Refusal:_ A critical provision mentioned in snippets. "If a parent is unable to care for the child for more than hours during their scheduled time, they must offer the time to the other parent before hiring a babysitter".

#### **4.2.4 Relocation and Travel**

Restrictions on movement.

- **Provisions:**
  - _Move-Away Clause:_ "Neither parent shall move the primary residence of the children more than miles from the current location without written consent."
  - _International Travel:_ "Parents must provide days notice and an itinerary before taking the children out of the country."

### **4.3 Document Export Engine**

The system must compile the selected provisions, the generated schedule text, and the user-filled variables into a cohesive document.

- **Formats:** PDF (for immediate printing/signing) and Microsoft Word .docx (for attorney editing).9
- **Exhibit Attachment:** The system must render the visual calendar (the grid view) as an image or vector graphic and append it as "Exhibit A" at the end of the text document. This visual aid is highly valued by judges for quick reference.26
- **Formatting:** The output must use standard legal styling—12pt Times New Roman, numbered lists (1.1, 1.2), and clear signature blocks for parents and witnesses/notaries.30

---

## **5\. UI/UX Interaction Design**

### **5.1 The "Canvas" (Calendar View)**

The primary interface is a large, interactive calendar grid.

- **Drag-and-Drop Painting:** To allow for custom schedules that don't fit a template, the user should be able to select a "Paintbrush" tool (assigned to Parent A or B) and click/drag across days to color them. This updates the underlying "Pattern Array" in real-time.16
- **Visual Semantics:**
  - _Parent A:_ Blue background.
  - _Parent B:_ Yellow background.
  - _Exchange Icons:_ Small arrows or car icons at the specific time of exchange (e.g., 3 PM) to visually break the day.31
  - _Third-Party:_ Grey hatching.
- **Responsive Design:** On mobile devices, the grid should collapse into a "List View" or "3-Day Agenda View," as complex drag-and-drop is difficult on touchscreens. The research highlights the importance of mobile accessibility for parents on the go.4

### **5.2 The "Schedule Wizard" Workflow**

For new users, a "Blank Canvas" is intimidating. The app must feature a step-by-step Wizard upon first login.32

- **Step 1:** "How do you want to split your time?" (Options: 50/50, 60/40, 70/30, Custom).
- **Step 2:** "Choose a Pattern." (Displays visual thumbnails of 2-2-5-5, Alternating Weeks, etc.).
- **Step 3:** "When does the rotation start?" (Date Picker).
- **Step 4:** "Select Major Holidays." (Checklist: Xmas, Thanksgiving, etc.).
- **Action:** The system then generates the calendar for the next 2 years instantly.

---

## **6\. Technical Architecture and Schema Specification**

To support the coding agent in building this application, we provide a detailed schema and architectural strategy.

### **6.1 Database Schema (Relational Model)**

A SQL database (PostgreSQL) is recommended for its robust handling of relational constraints and date logic.

#### Table: users

- id (UUID, PK)
- email (VARCHAR)
- password_hash (VARCHAR)
- role (ENUM: 'primary', 'co-parent', 'legal_pro')
- subscription_tier (ENUM: 'free', 'silver', 'gold') 3

#### Table: calendars

- id (UUID, PK)
- owner_id (UUID, FK \-\> users.id)
- name (VARCHAR) \- e.g., "Proposed Draft 1"
- is_shared (BOOLEAN) \- Determines visibility to linked accounts.
- timezone (VARCHAR) \- Critical for accurate exchange times.
- calculation_mode (ENUM: 'hours', 'overnights')

#### Table: recurrence_rules (The Core Engine)

- id (UUID, PK)
- calendar_id (UUID, FK \-\> calendars.id)
- parent_id (UUID, FK \-\> users.id or generic 'Parent A/B')
- pattern_type (ENUM: 'weekly', 'biweekly', 'monthly', 'yearly')
- interval (INT) \- e.g., '2' for every 2 weeks.
- start_date (DATE) \- The Anchor Date.
- days_of_week (BITMASK or JSON) \- For simple weekly patterns.
- cycle_definition (JSONB) \- For complex patterns like 2-2-5-5.
  - _Example JSON:_ \`\`
- priority (INT) \- 5 (Low) for regular, 2 (High) for holidays.

#### Table: events (Overrides & Instantiated Events)

- id (UUID, PK)
- calendar_id (UUID, FK)
- start_at (TIMESTAMPTZ)
- end_at (TIMESTAMPTZ)
- owner (ENUM: 'Parent A', 'Parent B', 'Third Party')
- type (ENUM: 'vacation', 'holiday', 'one_time_exception', 'third_party')
- recurrence_rule_id (UUID, Nullable) \- Links back to the rule if generated.

#### Table: provisions (Static Library)

- id (UUID, PK)
- category (VARCHAR)
- title (VARCHAR)
- content_template (TEXT) \- Contains variables like {{notification\_days}}.
- jurisdiction (VARCHAR) \- Allows filtering by state (e.g., "VA Specific").

#### Table: parenting_plans (The Document State)

- id (UUID, PK)
- calendar_id (UUID, FK)
- selected_provisions (JSONB) \- Array of provision IDs enabled.
- form_data (JSONB) \- The user's input for the variables (e.g., {"notification_days": "14"}).

### **6.2 API Logic and Endpoints**

The backend must expose RESTful endpoints that handle the "Expansion Logic" (converting rules to dates).

- GET /api/calendars/{id}/events?start=2025-01-01\&end=2025-02-01
  - **Logic:**
    1. Fetch all recurrence_rules for the calendar.
    2. Fetch all events (overrides) for the window.
    3. Instantiate the recurrence patterns into memory for the requested window.
    4. Apply the "Layer Masking" (See Section 2.1) to resolve conflicts.
    5. Return a flattened array of "Visual Blocks" to the frontend.
- POST /api/calculations/timeshare
  - **Payload:** { calendar_id: ID, start: DATE, end: DATE, mode: 'overnights' }
  - **Logic:** Perform the summation math server-side to ensure consistency and return the percentages.
- POST /api/plans/generate
  - **Payload:** { plan_id: ID, format: 'pdf' }
  - **Logic:** Utilize a library like Puppeteer (Node) or WeasyPrint (Python) to render the plan template with the injected data and return a binary stream.

---

## **7\. Implementation Strategy for Coding Agents**

### **7.1 Development Phases**

To build this effectively, the coding agent should follow a phased approach:

1. **Phase 1: The visualizer.** Build the frontend grid and the "2-2-5-5" algorithm. Ensure the grid correctly paints the pattern infinitely.
2. **Phase 2: The Exception Handler.** Implement the "Holiday" layer. Test that adding a "Christmas" rule visually overwrites the underlying 2-2-5-5 pattern for that week.
3. **Phase 3: The Calculator.** Build the math engine. Verify it against known edge cases (e.g., DST transitions).
4. **Phase 4: The Document Builder.** Implement the text generation and PDF export.

### **7.2 Testing Strategies**

The agent must implement robust **Unit Tests** for the date logic.

- _Test Case:_ "Leap Year Handling." Ensure that a 2-2-5-5 rotation does not "skip" Feb 29th or break the cycle.
- _Test Case:_ "Priority Conflict." Create a Vacation that overlaps a Holiday. Assert that the Vacation logic (Layer 1\) takes precedence or triggers the correct conflict flag.

---

## **8\. Conclusion**

The "Custody Calculator" is a sophisticated application that demands rigorous adherence to the logic of family law. By following the temporal hierarchy, recurrence patterns, and document generation rules outlined in this PRD, a coding agent can successfully reconstruct the high-value functionality of leading custody-planning platforms. The resulting tool will empower parents to navigate the complexities of custody with clarity, precision, and reduced conflict, fulfilling the core promise of the original reference model. The architecture prioritized here—separation of concerns, layered priority logic, and template-based text generation—ensures a scalable and maintainable codebase.
