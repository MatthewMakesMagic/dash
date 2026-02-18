---
stepsCompleted: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11]
inputDocuments: ['_bmad-output/planning-artifacts/product-brief-dash-2026-02-17.md', '_bmad-output/brainstorming/brainstorming-session-2026-02-17.md', 'docs/voice-to-text-research.md']
workflowType: 'prd'
date: 2026-02-17
---

# Product Requirements Document - Dash

**Author:** BMad
**Date:** 2026-02-17

---

## 1. Overview

Dash is a voice-first, agent-aware personal productivity system. It's the structured persistence, visualization, and feedback layer between the user and LLMs via API. Voice captures intent, agents parse and structure, the dashboard visualizes, feedback loops close the gap between intention and reality.

**This is a personal system for one user.** Not a SaaS product. The goal is a system that's trivially easy to improve, iterate on, and extend.

### Design Principles

1. Data layer first, views are disposable
2. Push and confirm, always
3. Intelligence delegated, never baked in
4. Built for iteration (JSON + Markdown, clear schemas)
5. Identity-driven
6. Production over productivity
7. Energy in, not energy out
8. Progressive autonomy (approval → delegation → yolo)
9. Fix procrastination, don't accommodate it

---

## 2. Data Architecture

### 2.1 Data Object Hierarchy

```
Identity
  └── Vision
       └── Goal
            └── Project
                 └── Epic
                      └── Task
```

**Branching from Identity/Goals:** Habit
**Composing Habits + Tasks:** Routine
**Cross-cutting:** Reflection, Session, Capture, Nudge

### 2.2 Data Object Schemas

All objects stored as JSON. Text content fields use Markdown.

#### Identity
```json
{
  "id": "uuid",
  "type": "identity",
  "description": "Who I want to become - markdown",
  "timeframe": "ongoing | year | multi-year",
  "created_at": "iso-datetime",
  "updated_at": "iso-datetime"
}
```

#### Vision
```json
{
  "id": "uuid",
  "type": "vision",
  "identity_id": "uuid",
  "description": "Long-term destination - markdown",
  "timeframe": "string",
  "created_at": "iso-datetime",
  "updated_at": "iso-datetime"
}
```

#### Goal
```json
{
  "id": "uuid",
  "type": "goal",
  "vision_id": "uuid",
  "title": "string",
  "description": "markdown",
  "target": "string",
  "deadline": "iso-date | null",
  "metrics": ["string"],
  "status": "active | completed | paused | abandoned",
  "rag_status": "red | amber | green",
  "created_at": "iso-datetime",
  "updated_at": "iso-datetime"
}
```

#### Project
```json
{
  "id": "uuid",
  "type": "project",
  "goal_id": "uuid",
  "title": "string",
  "description": "markdown",
  "status": "active | completed | paused | abandoned",
  "rag_status": "red | amber | green",
  "created_at": "iso-datetime",
  "updated_at": "iso-datetime"
}
```

#### Epic
```json
{
  "id": "uuid",
  "type": "epic",
  "project_id": "uuid",
  "title": "string",
  "description": "markdown",
  "estimate_hours": "number | null",
  "status": "backlog | in_progress | done",
  "rag_status": "red | amber | green",
  "created_at": "iso-datetime",
  "updated_at": "iso-datetime"
}
```

#### Task
```json
{
  "id": "uuid",
  "type": "task",
  "epic_id": "uuid | null",
  "title": "string",
  "description": "markdown",
  "estimate_minutes": "number | null",
  "actual_minutes": "number | null",
  "energy_cost": "low | medium | high",
  "energy_level_after": "number 1-5 | null",
  "status": "backlog | today | in_progress | done | deferred",
  "deferred_count": "number",
  "deferred_dates": ["iso-date"],
  "implementation_intention": {
    "what": "string",
    "when": "iso-datetime | null",
    "where": "string | null",
    "how_long": "string | null"
  },
  "tiny_version": "string | null",
  "scheduled_date": "iso-date | null",
  "completed_at": "iso-datetime | null",
  "created_at": "iso-datetime",
  "updated_at": "iso-datetime"
}
```

#### Habit
```json
{
  "id": "uuid",
  "type": "habit",
  "identity_id": "uuid | null",
  "goal_id": "uuid | null",
  "title": "string",
  "description": "markdown",
  "frequency": "daily | weekdays | weekly | custom",
  "current_level": "string",
  "target_level": "string",
  "streak_current": "number",
  "streak_best": "number",
  "history": [{"date": "iso-date", "completed": "boolean", "notes": "string | null"}],
  "created_at": "iso-datetime",
  "updated_at": "iso-datetime"
}
```

#### Routine
```json
{
  "id": "uuid",
  "type": "routine",
  "title": "string",
  "time_of_day": "morning | afternoon | evening",
  "items": [{"type": "habit | task", "ref_id": "uuid", "order": "number"}],
  "duration_minutes": "number | null",
  "created_at": "iso-datetime",
  "updated_at": "iso-datetime"
}
```

#### Reflection
```json
{
  "id": "uuid",
  "type": "reflection",
  "period": "daily | weekly | monthly | quarterly",
  "date": "iso-date",
  "planned": ["uuid - task/habit refs"],
  "actual": ["uuid - task/habit refs"],
  "gap_analysis": "markdown - agent generated",
  "narrative": "markdown - agent generated weekly story",
  "energy_summary": { "average": "number", "trend": "up | down | stable" },
  "user_notes": "markdown | null",
  "created_at": "iso-datetime"
}
```

#### Session
```json
{
  "id": "uuid",
  "type": "session",
  "task_id": "uuid",
  "start": "iso-datetime",
  "end": "iso-datetime | null",
  "duration_minutes": "number",
  "energy_level_start": "number 1-5 | null",
  "energy_level_end": "number 1-5 | null",
  "context_switches": "number",
  "notes": "string | null",
  "focus_rating": "number 1-5 | null",
  "created_at": "iso-datetime"
}
```

#### Capture
```json
{
  "id": "uuid",
  "type": "capture",
  "transcript": "string",
  "source": "voice | text",
  "timestamp": "iso-datetime",
  "context": {
    "view": "string",
    "active_task": "uuid | null",
    "time_of_day": "string"
  },
  "classified_mode": "task_capture | reflection | conversation | command | goal_setting | status_update | uncertain",
  "confidence": "number 0-1",
  "resolved_to": "uuid | null",
  "resolved_type": "task | habit | goal | reflection | null",
  "status": "pending | resolved | dismissed",
  "created_at": "iso-datetime"
}
```

#### Nudge
```json
{
  "id": "uuid",
  "type": "nudge",
  "nudge_type": "drift | focus | reflection | celebration | suggestion | conflict",
  "trigger": "string - what caused this nudge",
  "message": "string",
  "references": ["uuid - related objects"],
  "response": "acknowledged | acted | dismissed | snoozed | null",
  "responded_at": "iso-datetime | null",
  "created_at": "iso-datetime"
}
```

---

## 3. Views

All views are renders of the data layer. Views are disposable - the data layer is what matters.

### 3.1 Right Now View
**Purpose:** Single card focus mode. One task, nothing else.

**Requirements:**
- FR-RN-1: Display exactly one task card with title, description, estimated time, and project context
- FR-RN-2: Breathing ritual on entry (30-second transition animation, skippable)
- FR-RN-3: Focus timer with pomodoro-inspired controls: start, pause, extend (+5/+10/+15 min), complete
- FR-RN-4: On complete: log session, prompt for energy level, ask "what's next?" or auto-suggest
- FR-RN-5: Sound prompt on entry: "Have you started your focus playlist?" (push and confirm, dismissible, remembers preference)
- FR-RN-6: Minimal chrome - no navigation, no sidebar, no distractions. Just the task and timer
- FR-RN-7: Exit confirmation if timer is running

### 3.2 Today View
**Purpose:** Daily plan with calendar integration.

**Requirements:**
- FR-TD-1: Show today's scheduled tasks ordered by time/priority
- FR-TD-2: Show today's habits with completion toggles
- FR-TD-3: Calendar integration - display Google/Outlook events inline (read-only sync, not rebuild)
- FR-TD-4: Deferred tasks highlighted with deferred count badge
- FR-TD-5: RAG status indicators on each task (derived from deferred count, estimate vs time remaining)
- FR-TD-6: Drag to reorder priority
- FR-TD-7: Quick-add task from Today view
- FR-TD-8: Morning briefing display area (agent-generated summary at top)
- FR-TD-9: Implementation intention preview on each task (when, where, how long)
- FR-TD-10: Sparklines for habits showing recent streak data inline

### 3.3 Kanban View
**Purpose:** Project workflow board.

**Requirements:**
- FR-KB-1: Board columns: Backlog, Today, In Progress, Done
- FR-KB-2: Filter by project/epic
- FR-KB-3: Drag between columns to update status
- FR-KB-4: Task cards show title, estimate, energy cost, RAG status, deferred count
- FR-KB-5: Quick-add task to any column
- FR-KB-6: Swimlanes by epic (optional toggle)

### 3.4 Chat View
**Purpose:** Agent interface with object references.

**Requirements:**
- FR-CH-1: Chat interface for conversational interaction with the agent
- FR-CH-2: Agent responses include clickable references/links to system objects (tasks, goals, habits)
- FR-CH-3: Voice input integrated - microphone button triggers voice capture flow
- FR-CH-4: Text input always available as alternative
- FR-CH-5: Push-and-confirm cards appear inline in chat (proposed task, proposed change, etc.)
- FR-CH-6: Chat history persisted and scrollable
- FR-CH-7: "I don't know what to work on next" produces a structured recommendation
- FR-CH-8: Agent can propose breaking down vague inputs into epics/tasks with estimates

### 3.5 Feedback View
**Purpose:** Planned vs actual gap analysis.

**Requirements:**
- FR-FB-1: Daily view: side-by-side planned vs actual tasks for selected day
- FR-FB-2: Task-level comparison: estimated vs actual time, completed vs deferred
- FR-FB-3: Deferred task trend (sparkline showing deferred count over last 30 days)
- FR-FB-4: Energy trend sparkline over last 30 days
- FR-FB-5: Gap analysis summary (agent-generated text explaining patterns)
- FR-FB-6: Drill-down: click any metric to see the underlying tasks/sessions
- FR-FB-7: RAG summary at top: overall health across all active goals/projects
- FR-FB-8: "Structured work start time" metric - when did the first task begin each day?

### 3.6 Weekly View
**Purpose:** Patterns, sparklines, agent-generated narrative.

**Requirements:**
- FR-WK-1: Agent-generated weekly narrative ("Here's your week as a story")
- FR-WK-2: Week-over-week comparison sparklines (tasks completed, hours focused, energy, deferred count)
- FR-WK-3: Habit performance grid (days x habits, green/red cells)
- FR-WK-4: Top accomplishments list (agent-curated from completed tasks/sessions)
- FR-WK-5: Drift alerts - goals/projects that haven't seen activity
- FR-WK-6: Next week suggestions (agent-generated based on patterns and upcoming deadlines)
- FR-WK-7: Zoomable hierarchy: click from weekly → goal → project → epic → task level

---

## 4. Voice Capture System

### 4.1 Architecture
- Primary: Deepgram Nova-2 via WebSocket (through backend proxy)
- Fallback: Web Speech API (browser native, zero cost)
- Audio capture via `getUserMedia` + `AudioWorklet`
- VAD via `@ricky0123/vad-web` (Silero VAD, WASM) to avoid streaming silence

### 4.2 Requirements

- FR-VC-1: Push-to-talk activation (button click or keyboard shortcut, default: hold `V`)
- FR-VC-2: Visual recording indicator (pulsing dot, waveform, audio level meter)
- FR-VC-3: Live transcript appears in editable text area as user speaks (real-time streaming)
- FR-VC-4: On release/silence: transcript finalizes, user can quick-edit
- FR-VC-5: Enter key or "Send" button sends transcript to agent for processing
- FR-VC-6: Agent classifies intent via LLM (task_capture, reflection, conversation, command, goal_setting, status_update, uncertain)
- FR-VC-7: Push-and-confirm card displays proposed structured data
- FR-VC-8: Accept / Edit / Reject actions on proposed data
- FR-VC-9: Graceful fallback to Web Speech API if backend unreachable
- FR-VC-10: Microphone permission handling with clear instructions if denied
- FR-VC-11: Voice capture accessible from any view (floating button or persistent UI element)
- FR-VC-12: Deepgram keyword boosting for domain terms (project names, "epic", "kanban", etc.)

---

## 5. Agent System

### 5.1 Core Principle
**Push and confirm, always.** Agent observes and proposes autonomously. Agent never modifies user data without confirmation.

### 5.2 Agent Capabilities

- FR-AG-1: **Parse** - Classify voice/text captures into structured data objects
- FR-AG-2: **Break down** - Decompose vague inputs into epics/tasks with estimates
- FR-AG-3: **Prioritize** - Suggest task ordering based on deadlines, energy, goals, deferred count
- FR-AG-4: **Schedule** - Propose daily plans factoring calendar events, estimated time, energy patterns
- FR-AG-5: **Nudge** - Proactive non-judgmental prompts when drift detected (deferred >1 day, off-task, idle)
- FR-AG-6: **Reflect** - Generate end-of-day planned vs actual analysis, weekly narratives
- FR-AG-7: **Estimate** - Propose time estimates for new tasks based on similar completed tasks
- FR-AG-8: **Conflict detect** - Flag when estimated hours exceed available time, or goals conflict
- FR-AG-9: **Propose** - Suggest improvements to tasks, approaches, routines
- FR-AG-10: **Celebrate** - Acknowledge completions, streaks, milestones (genuine, not gamified)

### 5.3 Agent-Initiated Flows

- FR-AF-1: **Morning briefing** - Push notification or view update with today's plan, yesterday's carryover, upcoming deadlines, habit reminders
- FR-AF-2: **End-of-day reflection** - Prompt at configured time: "Here's what you planned vs what happened. Any thoughts?"
- FR-AF-3: **Drift nudge** - When a task has been deferred >1 day: "This was your mission, has something changed?"
- FR-AF-4: **Weekly summary** - End of week: generate narrative, surface patterns, suggest next week priorities
- FR-AF-5: **Tiny habit suggestion** - When a task has been deferred repeatedly: "Want to try a 2-minute version to break the ice?"
- FR-AF-6: **Conflict alert** - When scheduled tasks exceed available time: "You have 8 hours of tasks and 5 hours available. What should move?"

### 5.4 Intelligence Layer
- All agent intelligence via LLM API calls (Claude/GPT)
- Classification: Claude Haiku (fast, cheap) for intent classification
- Complex analysis: Claude Sonnet/Opus for narratives, breakdowns, conflict detection
- No hardcoded logic for decisions - LLM handles all reasoning
- Context window includes: current task state, recent sessions, user identity/goals, relevant history

---

## 6. Feedback Engine

- FR-FE-1: Daily reflection data captured: planned tasks, actual completed, deferred tasks, energy levels
- FR-FE-2: Weekly pattern analysis: agent identifies trends in deferred tasks, energy, focus time, start times
- FR-FE-3: Drift detection: any task deferred >1 day flagged with nudge
- FR-FE-4: Energy tracking: prompt for energy level at session start/end, track alongside output
- FR-FE-5: Non-judgmental framing in all feedback: "This was your mission, has something changed?" not "You failed to..."
- FR-FE-6: Structured work start time tracking: when did the first task begin each day?
- FR-FE-7: Sparklines on every relevant surface showing trends, not just snapshots
- FR-FE-8: RAG status computed at every hierarchy level (task → epic → project → goal) and surfaced visually

---

## 7. Onboarding

- FR-OB-1: Identity-first conversational flow - agent asks "Who do you want to become?" not "What tasks do you have?"
- FR-OB-2: Agent-guided discovery of identity, visions, and initial goals through conversation
- FR-OB-3: After identity/vision established, agent helps create first project, epics, and tasks
- FR-OB-4: First morning briefing generated after onboarding completes
- FR-OB-5: Onboarding can be revisited/updated at any time (identity evolves)

---

## 8. Cross-Pollination Features (v1)

- FR-CP-1: Implementation intentions on tasks (what + when + where + how long fields)
- FR-CP-2: Sparklines everywhere - inline trend charts on tasks, habits, goals, views
- FR-CP-3: RAG status at every hierarchy level - red/amber/green health indicators
- FR-CP-4: Breathing ritual on Right Now view entry (30s transition)
- FR-CP-5: Sound prompt ("Have you started your focus playlist?" - push and confirm)
- FR-CP-6: Pomodoro-inspired cooldown with extend option
- FR-CP-7: Weekly narrative (agent writes "your week as a story")
- FR-CP-8: Tiny habits / activation energy (2-min version of avoided tasks)
- FR-CP-9: Nudge ledger - persistent, scrollable, filterable history of all nudges and responses
- FR-CP-10: Drill-down zoomable hierarchy (Identity → Vision → Goal → Project → Epic → Task)

---

## 9. Non-Functional Requirements

- NFR-1: Web-based, works in modern browsers (Chrome, Safari, Edge, Firefox)
- NFR-2: Responsive - usable on desktop and tablet (mobile is v2)
- NFR-3: Data stored as JSON + Markdown - always human-readable, always agent-readable
- NFR-4: API-first backend - every action available via API for agent extensibility
- NFR-5: Voice latency: live transcript visible within 500ms of speech
- NFR-6: Page load: dashboard usable within 2 seconds
- NFR-7: Offline-capable for read operations (view today's plan without network)
- NFR-8: Calendar sync: Google Calendar and Outlook via OAuth
- NFR-9: LLM provider-agnostic - support Claude and GPT, switchable via config
- NFR-10: All agent actions logged for transparency and debugging

---

## 10. Out of Scope (v1)

- Desktop awareness / screen monitoring
- Mobile native app
- Life Dashboard, Wins, Energy, Timeline, Habits dedicated views
- Skill trees, combo multipliers, quest framing
- Cognitive readiness score
- Extensible command palette
- Multi-user / sharing
- Milestone data object
- Pre-mortem obstacle anticipation
- Strain vs recovery tracking
- Always-listening / wake word
- Composable widgets
