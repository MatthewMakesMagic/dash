---
stepsCompleted: [1, 2]
inputDocuments: []
session_topic: 'Personal OS (working name: MeOS) - voice-first, agent-aware productivity system with feedback loops, desktop awareness, multi-timescale intentionality, and agent-extensible architecture'
session_goals: 'Voice interaction design, information architecture (modules/views/graphs/tables), system flows, philosophical foundation, UX, agent relationship model, feedback engine (planned vs actual), desktop awareness, creativity-preserving structure'
selected_approach: 'ai-recommended'
techniques_used: ['question-storming', 'morphological-analysis', 'cross-pollination']
ideas_generated: []
context_file: ''
---

# Brainstorming Session Results

**Facilitator:** BMad
**Date:** 2026-02-17

## Session Overview

**Topic:** Personal OS - a voice-first, agent-aware productivity system. Not an AI itself - the structured persistence, visualization, and feedback layer that sits between the user and the intelligence layer (LLMs via API). Voice captures intent, agents process and improve, the dashboard visualizes, feedback loops close the gap between intention and reality.

**Goals:**
- Voice as capture mechanism - what does it need to translate spoken intent into structured, actionable data?
- Information architecture - what modules, tables, graphs, views should exist?
- Flow design - voice input → parsed intent → stored structure → visual representation → agent-improvable surface
- Philosophy - how should the system think about productivity, focus, attention, and intentional living?
- Feedback engine - planned vs actual, analysis of gaps across day/week/month/year
- Desktop awareness - understanding what's actually happening as a data source
- Agent relationship - persistent agent that holds long-term vision, conversational, trustworthy
- Creativity-preserving structure - structure AND spontaneity, knowing when to hold accountable vs let explore
- Agent extensibility - system improves when models improve, agents can fix/improve tasks and generate new approaches

**Key Framing:** The system is NOT an AI. It's the operating layer that makes agents useful for personal productivity. Intelligence is delegated to LLMs via API. The system owns structure, data, views, and feedback loops.

## Technique Selection

**Approach:** AI-Recommended Techniques
**Analysis Context:** Multi-dimensional system design spanning technical, architectural, philosophical, and UX domains

**Recommended Techniques:**

- **Question Storming:** Define the right questions across all dimensions before generating solutions. Map the boundary between what the system owns vs what it delegates.
- **Morphological Analysis:** Systematically map input types × data structures × views × timescales × feedback mechanisms × agent capabilities. Build the information architecture.
- **Cross-Pollination:** Steal patterns from fitness trackers, meditation apps, financial dashboards, game design, therapy/journaling, OS design to make this genuinely different.

**AI Rationale:** Sequence moves from defining the problem space → systematically mapping the solution space → injecting innovation from adjacent domains.

## Phase 1: Question Storming Results

**48 questions generated across 6 domains.** Key answers and principles crystallized below.

### Domain 1: Voice Capture & Intent Parsing
- Voice is primarily for capture, text for response (asymmetric I/O)
- "I don't know what to work on next" is a first-class input
- Vague inputs get broken into epics/tasks/estimates by agent, iterated with user
- No tone/emotion capture - models not good enough yet
- Context capture (screen, time, app state) is critical
- Mode (capture vs conversation) should be inferred, not selected
- "Take action now" button for skipping back-and-forth
- Don't rebuild what Claude/ChatGPT already handle well

### Domain 2: Feedback Engine - Planned vs. Actual
- Both self-reported and desktop activity inference
- Daily feedback cadence - more is friction
- Real-time gentle nudges: "Is this the task you really want to work on?"
- Quantitative AND qualitative AND pattern-based feedback
- Non-judgmental framing: "This was your mission, has something changed?"
- Push not pull - system initiates reflection
- Weekly is where gaps become materially useful patterns
- Energy tracking alongside task completion - completed but burned out isn't a win

### Domain 3: Agent Relationship & Extensibility
- No "minimum context" - this is personal, not creepy. Presentation matters, not data minimization
- Agent surfaces conflicts based on previous work, estimated hours, delegation opportunities
- Progressive autonomy: user approval → delegation → yolo mode (trust gradient)
- Data layer: JSON + Markdown, clear schema, always reviewable
- Agents CAN propose new views, modules, graphs
- Agent reconstructs from structured data every time - structure IS the memory
- Multi-agent trust hierarchy: TBD

### Domain 4: Focus, Concentration & Desktop Awareness
- Focus support = blocking + surfacing right task + protecting time
- Flow state recognition: go silent, subtle acknowledgment
- Not surveillance - user chose this. Incognito auto-disables
- Habits are NOT recurring tasks - repeated patterns toward a goal that increase in complexity, supporting identity
- Escalating intervention: gentle nudge → nudge → block (not v1, but architecture supports it)
- Focus data feeds back into task estimation
- Core user problem: procrastination on boring tasks, delay until pressure, want calm early starts

### Domain 5: Views & Information Architecture
- Multiple views essential, same data different lenses
- "Right Now" mode: single card, one thing, nothing else - the focus killer feature
- Habits and tasks are children of goals, children of vision/identity (hierarchy, not separate modules)
- Agent output in chat with references/links to system objects
- Primitives at the data layer (JSON + Markdown), not UI - get schema right, any view is a render
- Voice appears as editable text, quick edit or enter to send to agent

### Domain 6: Philosophy
- Production over productivity - creating things matters, busywork doesn't
- Energy in, not energy out - system amplifies, never drains
- System SHOULD have an opinion when patterns warrant it, stay quiet when you're crushing it
- Rest is valid output
- Procrastination is something to fix, not accommodate - evenings for living
- Drift detection: more than one day of deferral = flag it
- System needs explicit identity input - who you want to become, declared not inferred
- Gamification YES: streaks, milestones, identity progress, celebrations

### Foundational Principles

**System Beliefs:**
1. Production over productivity
2. Energy in, not energy out
3. Progressive autonomy (approval → delegation → yolo)
4. Identity-driven (habits and goals serve who you're becoming)
5. Honest data, not surveillance
6. Non-judgmental accountability
7. Push not pull, always
8. Fix procrastination, don't accommodate it

**Architecture Principles:**
1. Intelligence delegated to LLMs via API, never baked in
2. JSON for structured data + Markdown for text
3. Get the data layer right, any view is just a render
4. Built for handoff to other devs, agents, multi-agent workflows from day one

**The Golden Rule: Push and Confirm. Always.**
The agent observes, proposes, nudges, suggests. Never acts unilaterally on user data. User is always the final yes.

## Phase 2: Morphological Analysis Results

### Data Objects (13 types)

| Object | What it is | Parent | Key Properties |
|--------|-----------|--------|----------------|
| Identity | Who you're becoming | — | description, timeframe |
| Vision | Long-term destination | Identity | description, timeframe |
| Goal | Measurable milestone toward vision | Vision | target, deadline, metrics |
| Project | A set of epics toward a goal | Goal | name, status, epics[] |
| Epic | A chunk of work | Project | tasks[], estimates |
| Milestone | Concrete marker on the way | Goal or Epic | criteria, target_date |
| Task | Single actionable item | Epic | estimate, actual, energy_cost, status |
| Habit | Repeated pattern, increases in complexity | Identity/Goal | frequency, current_level, target_level, streak |
| Routine | Sequence of habits/tasks, daily structure | — | items[], time_of_day, duration |
| Reflection | Planned vs. actual feedback | — | planned[], actual[], gap_analysis, period |
| Session | Actual time block of work | Task | start, end, app_data, context_switches, energy_level |
| Capture | Raw voice/text before structuring | — | transcript, timestamp, context, resolved_to |
| Nudge | System-initiated prompt | — | type, trigger, response |

**Data Hierarchy:** Identity → Vision → Goals → Projects → Epics → Milestones → Tasks (with Habits branching from Identity/Goals, Routines composing Habits+Tasks)

### Views (11 + 1 integration)

| View | Status | Purpose |
|------|--------|---------|
| Right Now | Core | Single card focus mode |
| Today | Core | Daily plan with calendar integration |
| Kanban | Core | Project work flow |
| Weekly | Core | Patterns + planning |
| Timeline | Core | Strategic, months/quarters |
| Habits | Core | Streaks, progression, identity |
| Feedback | Core | Planned vs actual, graphics |
| Energy | Core | Energy patterns across time |
| Life Dashboard | Core | Zoomed-out identity/vision/goals |
| Wins | Core | Milestones, streaks, identity shifts, celebrations |
| Chat | Core | Agent interface with object references |
| Calendar | Integration | Sync with existing (Google/Outlook) |

### Timescales (6 levels)

| Timescale | Cycle | Push mechanism |
|-----------|-------|----------------|
| Right now | Continuous | Nudge if drifting |
| Daily | Morning briefing → work → end-of-day reflection | Agent-initiated both ends |
| Weekly | Agent-generated written summary + visual patterns | Push, end of week |
| Monthly | Goal/milestone/identity check | System nudge |
| Quarterly | Strategic recalibration | System nudge |
| Yearly | Identity evolution, wins retrospective, vision refresh | System nudge |

### Agent Capabilities (12, all push-and-confirm)

Parse, Break down, Prioritize, Schedule, Nudge, Reflect, Estimate, Conflict detection, Propose, Improve, Celebrate, Escalate

**Agent Autonomy Model:** Observe = autonomous. Surface = autonomous. Propose/Modify/Create/Archive = push and confirm. Always.

### Input/Output Flows (10 core flows)

Voice capture, Text capture, "I don't know" flow, Morning briefing, End-of-day reflection, Weekly summary, Desktop context logging, Nudge flow, Habit progression, Agent improvement proposals

## Phase 3: Cross-Pollination Results

**20 ideas generated, 17 kept, 1 killed, 2 parked**

### From Fitness/Health Tracking
- **Cognitive Readiness Score** - Daily score based on yesterday's data, adjusts today's plan
- **Strain vs Recovery Tracking** - Flags burnout before you feel it
- **Trend Lines Over Snapshots** - Show trajectory, not just today's status

### From Game Design
- **Skill Trees** - Identity goals visualized as branching progression trees with unlockable nodes
- **Combo Multipliers** - Reward batching related tasks from same epic/goal
- **Main Quest / Side Quest / Daily Quest** - Narrative framing for task types in Today view

### From Therapy/Behavioral Psychology
- **Implementation Intentions** - Tasks store what + when + where + how long
- **Pre-mortem Obstacle Anticipation** - "What might derail this?" stored and surfaced when obstacle appears
- **Narrative Self** - Agent writes weekly story, you're the protagonist
- **Tiny Habits / Activation Energy** - 2-minute versions of avoided tasks to break procrastination

### From Financial Dashboards
- **Sparklines Everywhere** - Tiny inline trend charts on every surface
- **Drill-Down Zoomable Hierarchy** - Click from Identity level down to individual tasks
- **RAG Status at Every Level** - Red/amber/green health indicators surface problems from any zoom level

### From OS Design
- **Extensible Command Palette** - Universal shortcut, agents can add commands
- **Nudge Ledger** - Persistent, scrollable, filterable history of all nudges

### From Meditation/Focus Apps
- **Breathing Ritual on Focus Entry** - 30-second transition, doubles as meditation tracking
- **Sound Prompt** - "Have you started your focus playlist?" push and confirm
- **Pomodoro-Inspired Cooldown** - Extend if flowing, log what you did and transition out

### Killed
- Achievement System - wrong incentives, would chase metrics over meaning

### Parked for v2+
- Composable widgets (iOS-style)
- Auto-play sound integration

## Phase 4: Party Mode Review & V1 Scope

**Reviewers:** John (PM), Winston (Architect), Sally (UX), Victor (Innovation Strategist), Mary (Analyst)

### V1 Scope Agreement

**V1 Views:**
- Right Now (single card focus mode)
- Today (daily plan with calendar integration)
- Kanban (project work flow)
- Chat (agent interface with object references)
- Feedback (planned vs actual)
- Weekly (patterns + planning)

**V1 Core Loop:**
1. **Onboarding** - Identity-first conversational discovery (who you want to become)
2. **Morning Briefing** - Agent-initiated daily plan
3. **Right Now Focus** - Single task focus mode with breathing ritual entry
4. **Work** - Task execution with nudges if drifting
5. **End-of-Day Reflection** - Planned vs actual review
6. **Weekly Narrative** - Agent-generated story + pattern analysis

**V1 Data Objects:** All 13 except Milestone (parked)
- Identity, Vision, Goal, Project, Epic, Task, Habit, Routine, Reflection, Session, Capture, Nudge

**V1 Agent Capabilities:**
- Parse, Break down, Prioritize, Schedule, Nudge, Reflect, Estimate, Conflict detection, Propose, Celebrate
- All follow Push and Confirm pattern

**V1 Cross-Pollination Features:**
- Implementation Intentions (tasks store what + when + where + how long)
- Sparklines Everywhere (tiny inline trend charts)
- RAG Status at Every Level (red/amber/green health indicators)
- Breathing Ritual on Focus Entry (30-second transition)
- Sound Prompt ("Have you started your focus playlist?" push and confirm)
- Pomodoro-Inspired Cooldown (extend if flowing, log and transition out)
- Narrative Self (agent writes weekly story)
- Tiny Habits / Activation Energy (2-minute versions of avoided tasks)
- Nudge Ledger (persistent, scrollable, filterable history)
- Drill-Down Zoomable Hierarchy (click from Identity level down to tasks)

**Parked for v2+:**
- Life Dashboard, Wins view, Energy view, Timeline view
- Habits dedicated view (habits exist as data objects, just no dedicated view in v1)
- Skill Trees, Combo Multipliers, Quest Framing
- Desktop Awareness (separate build target)
- Cognitive Readiness Score
- Extensible Command Palette
- Composable widgets (iOS-style)
- Pre-mortem Obstacle Anticipation
- Trend Lines Over Snapshots
- Strain vs Recovery Tracking

### Competitive Positioning
- **vs Todoist/Notion:** They're tools, not systems. No feedback loops, no identity layer, no agent relationship
- **vs Motion:** Tries AI scheduling but fails at honest feedback. No identity, no voice, no progressive autonomy
- **vs Habitica:** Gamification without meaning. Achievement-chasing, not identity-building
- **vs Streaks:** Habit-only, no task integration, no agent, no feedback
- **Key Differentiator:** Identity-first onboarding + Push-and-Confirm agent relationship + Honest feedback loops
