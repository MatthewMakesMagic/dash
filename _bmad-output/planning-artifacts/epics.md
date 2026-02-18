# Dash - Epics

## Epic 1: Data Layer & API Foundation

**Priority:** 1 (build first - everything depends on this)

**Description:** Set up the project structure, database schema, and API endpoints for all 12 data objects. This is the foundation - get the schema right, everything else is just a render.

**Stories:**
1. Project scaffolding (framework, build tools, folder structure)
2. Database schema for all 12 data object types
3. CRUD API endpoints for each data object
4. Data hierarchy enforcement (Identity → Vision → Goal → Project → Epic → Task)
5. Relationship validation (habit → identity/goal, routine → habits+tasks, etc.)
6. UUID generation, timestamps, audit fields
7. Seed data for development (sample identity, vision, goals, project, epics, tasks, habits)

**Acceptance Criteria:**
- All 12 data objects can be created, read, updated, deleted via API
- Hierarchy relationships enforced at API level
- JSON responses match schema from PRD section 2.2
- Seed data script populates a realistic development dataset

---

## Epic 2: Authentication & User Setup

**Priority:** 1

**Description:** Basic auth setup. Single user system but still needs auth for security and calendar OAuth.

**Stories:**
1. Authentication setup (simple - single user, could be magic link or password)
2. User profile/preferences storage
3. OAuth foundation for calendar integration (Epic 6)

**Acceptance Criteria:**
- User can log in securely
- Session persists across browser restarts
- OAuth token storage ready for calendar integration

---

## Epic 3: Core Views - Today & Kanban

**Priority:** 2

**Description:** Build the two most-used daily views. Today is the daily command center, Kanban is for project workflow.

**Stories:**
1. Today view - task list ordered by time/priority with status indicators
2. Today view - habit display with completion toggles
3. Today view - deferred task highlighting with badge count
4. Today view - RAG status indicators on tasks
5. Today view - drag to reorder
6. Today view - quick-add task
7. Today view - implementation intention display per task
8. Kanban view - board with Backlog/Today/In Progress/Done columns
9. Kanban view - filter by project/epic
10. Kanban view - drag between columns
11. Kanban view - task cards (title, estimate, energy cost, RAG, deferred count)
12. Kanban view - quick-add to any column

**Acceptance Criteria:**
- Today view displays all tasks scheduled for today with correct ordering
- Habits show with toggleable completion state
- Deferred tasks visually distinct with count
- Kanban board renders tasks in correct columns
- Drag-and-drop updates task status in database
- Quick-add creates task and it appears immediately

---

## Epic 4: Right Now View (Focus Mode)

**Priority:** 2

**Description:** The killer feature - single card focus mode with breathing ritual, timer, and zero distractions.

**Stories:**
1. Single task card display (title, description, estimate, project context)
2. Breathing ritual entry animation (30s, skippable)
3. Focus timer (start, pause, extend +5/+10/+15, complete)
4. Sound prompt on entry ("Focus playlist?" - dismissible, remembers preference)
5. On complete: log session, prompt energy level, suggest next task
6. Minimal chrome - no nav, no sidebar, no distractions
7. Exit confirmation if timer running

**Acceptance Criteria:**
- View shows exactly one task with no navigation clutter
- Breathing ritual plays on entry (skippable)
- Timer works with start/pause/extend/complete
- Session logged with duration and energy level on completion
- Sound prompt appears once, remembers dismissal

---

## Epic 5: Voice Capture System

**Priority:** 3

**Description:** Voice-first capture using Deepgram Nova-2 with Web Speech API fallback. Push-to-talk, live transcript, editable before send.

**Stories:**
1. Backend WebSocket proxy for Deepgram (auth + relay)
2. Browser audio capture (`getUserMedia` + `AudioWorklet`)
3. WebSocket connection from browser to backend proxy
4. Live transcript display (editable text area, real-time updates)
5. Push-to-talk UI (button + keyboard shortcut `V`)
6. Visual recording indicator (pulsing dot, audio level)
7. VAD integration (`@ricky0123/vad-web`) to avoid streaming silence
8. Web Speech API fallback when backend unreachable
9. Send flow: Enter/button → post transcript to processing endpoint
10. Deepgram keyword boosting for domain terms
11. Microphone permission handling with instructions
12. Voice button accessible from all views

**Acceptance Criteria:**
- Hold V or click mic button → audio streams → live transcript appears
- Release → transcript finalizes → user can edit → Enter sends to agent
- Falls back to Web Speech API if backend down
- VAD prevents streaming silence (cost optimization)
- Works in Chrome, Safari, Edge

---

## Epic 6: Agent System & Chat View

**Priority:** 3

**Description:** LLM-powered agent that parses captures, suggests actions, and communicates via chat. All push-and-confirm.

**Stories:**
1. Chat view UI - message list with agent/user messages
2. Chat view - text input always available
3. Chat view - voice input integration (mic button triggers voice capture)
4. LLM integration layer - provider-agnostic (Claude/GPT switchable)
5. Intent classification prompt - classify captures into modes
6. Structured data extraction - turn classified intent into data objects
7. Push-and-confirm card component (proposed action, accept/edit/reject)
8. Push-and-confirm inline in chat
9. "I don't know what to work on next" → structured recommendation
10. Break down vague inputs into epics/tasks with estimates
11. Agent responses with clickable object references (links to tasks/goals)
12. Chat history persistence

**Acceptance Criteria:**
- User can chat with agent via text or voice
- Agent classifies voice captures into correct mode (>80% accuracy)
- Proposed actions shown as push-and-confirm cards
- Accept creates the data object, reject dismisses
- "I don't know what to work on" produces useful recommendation
- Object references in chat are clickable

---

## Epic 7: Feedback Engine & Feedback View

**Priority:** 4

**Description:** Planned vs actual tracking, gap analysis, trend visualization, drift detection.

**Stories:**
1. Daily reflection data capture (end-of-day prompt)
2. Planned vs actual comparison logic
3. Feedback view - daily side-by-side planned vs actual
4. Feedback view - deferred task trend sparkline (30 days)
5. Feedback view - energy trend sparkline (30 days)
6. Feedback view - gap analysis summary (agent-generated)
7. Feedback view - structured work start time metric
8. Feedback view - RAG summary at top
9. Drift detection - flag tasks deferred >1 day
10. Sparkline component (reusable across views)
11. Drill-down: click metric → see underlying tasks/sessions

**Acceptance Criteria:**
- End-of-day prompts capture reflection data
- Feedback view shows planned vs actual for any selected day
- Sparklines display 30-day trends for deferred count and energy
- Drift detection creates nudges for tasks deferred >1 day
- Drill-down from any metric to underlying data works

---

## Epic 8: Agent-Initiated Flows

**Priority:** 4

**Description:** Morning briefing, end-of-day reflection, weekly narrative, nudges, tiny habit suggestions.

**Stories:**
1. Morning briefing generation (today's plan, carryover, deadlines, habits)
2. Morning briefing display in Today view
3. End-of-day reflection prompt (configurable time)
4. End-of-day reflection flow (show planned vs actual, collect notes)
5. Weekly narrative generation (agent writes "your week as a story")
6. Weekly view - display narrative and week-over-week comparisons
7. Weekly view - habit performance grid
8. Weekly view - drift alerts
9. Weekly view - next week suggestions
10. Nudge system - create, display, respond (acknowledge/act/dismiss/snooze)
11. Nudge ledger - persistent, scrollable, filterable nudge history
12. Tiny habit suggestion - auto-propose 2-min version for repeatedly deferred tasks
13. Conflict alert - flag when scheduled hours exceed available time
14. Celebration nudges - acknowledge completions, streaks

**Acceptance Criteria:**
- Morning briefing generates and displays before user's first interaction
- End-of-day prompt fires at configured time
- Weekly narrative is readable and reflects actual week events
- Nudges appear, can be responded to, and are logged in ledger
- Tiny habit suggestions appear after 2+ deferrals
- Conflict alerts fire when time math doesn't add up

---

## Epic 9: Onboarding

**Priority:** 5

**Description:** Identity-first conversational onboarding. Agent asks who you want to become, not what tasks you have.

**Stories:**
1. Onboarding conversation flow - identity discovery
2. Onboarding - vision setting
3. Onboarding - initial goal creation
4. Onboarding - first project/epic/task breakdown
5. Onboarding - habit setup
6. First morning briefing generation
7. Onboarding can be revisited (identity evolves)

**Acceptance Criteria:**
- New user guided through identity → vision → goals → first tasks
- Conversation feels natural, not form-filling
- System populated with enough data to generate first morning briefing
- User can re-enter onboarding to update identity at any time

---

## Epic 10: Calendar Integration

**Priority:** 5

**Description:** Google Calendar and Outlook sync. Read-only, display events alongside tasks in Today view.

**Stories:**
1. Google Calendar OAuth flow
2. Outlook Calendar OAuth flow
3. Calendar event sync (pull events, store locally)
4. Display calendar events in Today view inline with tasks
5. Calendar-aware scheduling (agent factors in events when suggesting task schedule)

**Acceptance Criteria:**
- OAuth connects to Google Calendar successfully
- Calendar events appear in Today view at correct times
- Agent considers calendar events when proposing daily plan
- Events are read-only (no write-back to calendar)

---

## Epic 11: Zoomable Hierarchy & Navigation

**Priority:** 5

**Description:** Drill-down from Identity level down to individual tasks. RAG status bubbles up through hierarchy.

**Stories:**
1. Hierarchy navigation component (breadcrumb + drill-down)
2. Identity → Vision → Goal → Project → Epic → Task drill-down
3. RAG status computation (bubble up from tasks through hierarchy)
4. RAG status visual indicators at every level
5. View-level navigation (sidebar or tab bar)

**Acceptance Criteria:**
- Can click from any high-level object down to its child tasks
- RAG status computed correctly at every level
- Breadcrumb shows current position in hierarchy
- Navigation between views is clear and fast
