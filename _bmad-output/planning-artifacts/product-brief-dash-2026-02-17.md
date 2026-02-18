---
stepsCompleted: [1, 2, 3, 4, 5]
inputDocuments: ['_bmad-output/brainstorming/brainstorming-session-2026-02-17.md']
date: 2026-02-17
author: BMad
---

# Product Brief: dash

## Executive Summary

Dash is a voice-first, agent-aware personal productivity system - a "Personal OS" that sits between you and the intelligence layer (LLMs via API). It's not an AI. It's the structured persistence, visualization, and feedback layer that makes AI agents genuinely useful for personal productivity.

Existing tools (Todoist, Notion, Motion) are either dumb organizers or AI-first tools that try to automate without understanding identity. None close the loop between intention and action. None start with who you're becoming.

Dash starts with identity and cascades through vision, goals, projects, and daily tasks. Voice captures intent. Agents parse, structure, and propose. The dashboard visualizes. Feedback loops close the gap between intention and reality. The system pushes, never waits to be pulled. And it always confirms before acting.

This is a personal system built for one user. The goal is not a moat or market position - it's a system that's trivially easy to improve, iterate on, and extend as models and needs evolve.

---

## Core Vision

### Problem Statement

A fundamental gap between intention and execution. Knowing what to accomplish but lacking a system that:
1. Captures intent naturally (via voice) and translates it into structured, actionable plans
2. Connects daily tasks to long-term identity and vision
3. Provides honest feedback on the gap between planned and actual work
4. Proactively nudges and supports focus without surveillance
5. Improves itself as AI models improve, rather than becoming obsolete

The result: procrastination on boring tasks, delayed starts, late-night pressure sessions, burnout without production, and drift from the person you want to become.

### Problem Impact

- **Daily:** Tasks pile up, boring work gets deferred, evenings consumed by work that should've been done at 9am
- **Weekly:** Patterns of drift go unnoticed, no reflection on whether effort aligned with goals
- **Monthly/Quarterly:** Goals stagnate, identity aspirations remain aspirational, no accountability loop
- **Emotional:** Guilt, stress, and the feeling of being "busy but not productive" - output without production

### Why Nothing Else Works (For This)

Todoist and Notion organize but don't push, don't reflect, and don't know who you're becoming. Motion tries AI scheduling but its feedback loops don't actually work. Habitica gamifies without meaning. Streaks tracks habits but nothing else. Calendar apps show plans, not reality.

None of them are built to be extended by agents. None have a data layer designed for iteration. None connect identity → vision → goals → daily tasks → feedback in a single loop.

The gap isn't a market opportunity - it's a personal frustration that no tool solves because no tool was designed to be a personal OS.

### Proposed Solution

A web-based personal productivity dashboard with:
- **Voice capture** for natural intent input (text for response - asymmetric I/O)
- **Identity-first architecture** - who you're becoming drives everything
- **13 data object types** in a clear hierarchy (Identity → Vision → Goal → Project → Epic → Task, with Habits, Routines, Reflections, Sessions, Captures, Nudges)
- **6 core views** (Right Now, Today, Kanban, Chat, Feedback, Weekly)
- **Push-and-confirm agent relationship** - observes, proposes, nudges, but never acts unilaterally
- **Feedback engine** - planned vs actual at daily/weekly cadences
- **JSON + Markdown data layer** - always reviewable, always agent-readable, any view is just a render

### Design Principles

1. **Data layer first, views are disposable** - Get the schema and data objects right. Any view is just a render. UI is fast to build, easy to replace, and never precious.
2. **Push and confirm, always** - The golden rule. Agent observes, proposes, nudges. Never acts unilaterally.
3. **Intelligence delegated, never baked in** - LLMs called via API. System improves when models improve. No hardcoded logic that ages badly.
4. **Built for iteration** - JSON + Markdown, clear schemas, always reviewable. Any agent (or future you) can read, modify, and extend the system.
5. **Identity-driven** - Habits and goals serve who you're becoming, not arbitrary metrics.
6. **Production over productivity** - What you create matters. Busywork doesn't.
7. **Energy in, not energy out** - The system amplifies, never drains. Rest is valid output.
8. **Progressive autonomy** - Approval → delegation → yolo mode. Trust builds over time.
9. **Fix procrastination, don't accommodate it** - Get structured work done early. Evenings have more freedom for unstructured pursuits - learning music, exploring, creating without a plan.

## Target Users

### Primary User

**You.** This is a personal system, built for one person.

**Profile:** A knowledge worker and creator who juggles multiple projects, goals, and identity aspirations. Technically capable (can build and extend the system). Ambitious but prone to procrastinating on boring tasks, deferring structured work until pressure builds, and losing evenings to work that should've been done earlier in the day.

**Core behaviors:**
- Knows what needs to be done but struggles to start, especially on tedious tasks
- Works in bursts under pressure rather than calm, early starts
- Wants to build things that matter (production over productivity)
- Has multiple identity aspirations (music, technical skills, fitness, creative pursuits) that compete for attention
- Responds well to gentle accountability but resists surveillance or judgment
- Trusts systems that earn trust progressively
- Values unstructured evening time for exploration and creative pursuits

**What success looks like:** Calm mornings where structured work starts early. Honest feedback on what actually happened vs what was planned. A system that knows your goals, nudges without nagging, and gets smarter as you use it. Evenings freed up for music, exploration, and creating without a plan.

**The "aha!" moment:** Opening the app to a morning briefing that already knows what matters today, says "here's what's on deck," and when you say "I don't know what to work on next" - it actually helps.

### Secondary Users

**Agents.** The system is designed to be read, modified, and extended by AI agents. Agents are first-class consumers of the data layer - they need clear schemas, reviewable JSON + Markdown, and well-defined boundaries (push and confirm). The data layer is the agent's memory.

### User Journey

1. **Onboarding:** Identity-first conversational discovery - the agent asks who you want to become, not what tasks you have. This sets the foundation everything cascades from.
2. **Morning Briefing:** Agent-initiated. "Here's your day. Here's what matters. Here's what you deferred yesterday." Push, not pull.
3. **Work:** Right Now view - single card, one task, nothing else. Breathing ritual on entry. Nudges if drifting. Pomodoro-inspired cooldown with option to extend.
4. **Capture:** Voice input throughout the day. "Add a task," "I just finished X," "I don't know what to do next." Agent parses, structures, confirms.
5. **End-of-Day:** Agent-initiated reflection. Planned vs actual. Non-judgmental. "This was your mission, has something changed?"
6. **Weekly:** Agent-generated narrative. Patterns surfaced. Sparklines. "Here's your week as a story."
7. **Long-term:** Monthly/quarterly identity check-ins. Drift detection. Vision refresh.

## Success Metrics

Success for dash isn't user growth or revenue. It's whether the system actually changes how you work and live. Three layers:

### Personal Outcome Metrics

- **Structured work starts before noon** - The core procrastination fix. Track how often the first real task begins in the morning vs late afternoon/evening
- **Planned vs actual gap shrinks over time** - Weekly trend line. Are you getting more honest and more consistent?
- **Deferred task count decreasing** - Fewer tasks pushed to tomorrow. Drift detection catches this early
- **Evening freedom** - Less structured work bleeding into evenings. More unstructured creative time
- **Energy levels stable or improving** - Completed but burned out isn't a win. Track energy alongside output

### System Health Metrics

- **Daily loop completion rate** - Are you doing morning briefing → work → end-of-day reflection? The loop is the product
- **Voice capture → structured action rate** - How often does a voice input successfully become a task/habit/capture?
- **Nudge response rate** - Are nudges being acknowledged or ignored? If ignored, the system needs to adapt
- **Agent proposal acceptance rate** - Is the agent proposing useful things? Tracks trust and progressive autonomy

### Identity Progress Metrics

- **Goal progress over time** - Are goals moving, or stagnating?
- **Habit streak consistency** - Not just "did you do it" but "is the pattern building?"
- **Identity alignment** - Quarterly self-assessment: "Am I becoming who I said I wanted to become?"
- **Weekly narrative sentiment** - Does the agent-generated story reflect progress or drift?

### What We're NOT Measuring

- Time spent in the app (not an engagement trap)
- Number of tasks completed (busywork gaming)
- Achievement badges (wrong incentives, chasing metrics over meaning)

### Business Objectives

N/A - This is a personal system. If it works, the "business case" is a better life.

### Key Performance Indicators

The single KPI that matters most: **Do you open dash every morning and find it useful?** If yes, everything else follows. If no, nothing else matters.

## MVP Scope

### Core Features

**Data Layer (the foundation - get this right):**
- 12 data object types: Identity, Vision, Goal, Project, Epic, Task, Habit, Routine, Reflection, Session, Capture, Nudge (Milestone parked)
- JSON + Markdown storage with clear, documented schemas
- Every object reviewable by humans and agents alike
- Identity → Vision → Goal → Project → Epic → Task hierarchy enforced at the data level

**Views (disposable renders of the data layer):**
- **Right Now** - Single card focus mode. One task, nothing else. Breathing ritual on entry. Pomodoro-inspired cooldown with extend option
- **Today** - Daily plan with calendar integration (Google/Outlook sync, not rebuild)
- **Kanban** - Project workflow board
- **Chat** - Agent interface with references/links to system objects
- **Feedback** - Planned vs actual, visual gap analysis
- **Weekly** - Patterns, sparklines, agent-generated narrative

**Voice Capture:**
- Deepgram Nova-2 for real-time streaming transcription (Web Speech API as fallback)
- Voice appears as editable text, quick edit or enter to send to agent
- Agent parses intent via LLM, structures into data objects, push-and-confirm
- "I don't know what to work on next" as first-class input

**Agent Capabilities (all push-and-confirm):**
- Parse voice/text into structured data
- Break down vague inputs into epics/tasks/estimates
- Prioritize and schedule
- Nudge when drifting (non-judgmental)
- Morning briefing and end-of-day reflection (agent-initiated)
- Weekly narrative generation
- Conflict detection (estimated hours vs available time)
- Propose improvements to tasks and approaches
- Celebrate wins

**Feedback Engine:**
- Daily: planned vs actual, self-reported + inferred from session data
- Weekly: pattern analysis, trend lines, agent-generated narrative
- Drift detection: more than one day of deferral = flag it
- Energy tracking alongside task completion
- Non-judgmental framing throughout

**Onboarding:**
- Identity-first conversational discovery (agent-led)
- "Who do you want to become?" not "What tasks do you have?"
- Sets the foundation that everything cascades from

**Cross-Pollination Features in v1:**
- Implementation intentions (tasks store what + when + where + how long)
- Sparklines on every surface (tiny inline trend charts)
- RAG status at every level (red/amber/green health)
- Breathing ritual on focus entry
- Sound prompt ("Have you started your focus playlist?")
- Pomodoro-inspired cooldown
- Narrative self (weekly story)
- Tiny habits / activation energy (2-minute versions of avoided tasks)
- Nudge ledger (persistent, scrollable, filterable)
- Drill-down zoomable hierarchy (Identity level down to tasks)

### Out of Scope for MVP

- **Desktop awareness** - Separate build target, different technical challenge. v2+
- **Life Dashboard view** - Zoomed-out identity/vision/goals visualization. Views are cheap to add later
- **Wins view** - Milestones, streaks, celebrations dedicated view
- **Energy view** - Dedicated energy pattern visualization (energy data still captured, just no dedicated view)
- **Timeline view** - Strategic months/quarters view
- **Habits dedicated view** - Habits exist as data objects and appear in Today/Weekly, just no standalone view
- **Skill trees** - Identity goals as branching progression trees
- **Combo multipliers** - Reward batching related tasks
- **Quest framing** - Main quest / side quest / daily quest narrative
- **Cognitive readiness score** - Daily score adjusting today's plan
- **Extensible command palette** - Universal shortcut system
- **Pre-mortem obstacle anticipation**
- **Strain vs recovery tracking**
- **Trend lines over snapshots**
- **Composable widgets (iOS-style)**
- **Milestone data object**

### MVP Success Criteria

The MVP succeeds if:
1. You open it every morning and the briefing is useful
2. Voice capture → structured task works reliably (>80% of the time without manual correction)
3. End-of-day reflection happens at least 4/5 weekdays
4. Planned vs actual gap is visible and the trend line moves in the right direction over 4 weeks
5. You stop deferring boring tasks into the evening within the first month
6. The system feels like it amplifies energy, not drains it

### Future Vision

When this works, it becomes the operating system for an intentional life:
- Desktop awareness adds passive context (what app you're in, how long you've been there)
- Skill trees make identity progress visual and game-like
- Cognitive readiness scores adjust the day's plan based on yesterday's data
- Multi-agent workflows where specialized agents handle specific domains
- Mobile companion for capture on the go
- The data layer and agent architecture are designed from day one to support all of this - adding views and capabilities is just rendering new perspectives on the same foundation
