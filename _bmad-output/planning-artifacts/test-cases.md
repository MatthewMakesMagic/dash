# Dash - Test Cases

## Data Layer Tests

### TC-DL-1: Create all data object types
**Given** the API is running
**When** I POST a valid payload for each of the 12 data object types
**Then** each returns 201 with the created object including id, created_at, updated_at

### TC-DL-2: Hierarchy enforcement - task requires valid epic or null
**Given** an epic exists with id "epic-1"
**When** I create a task with epic_id "epic-1"
**Then** task is created successfully
**When** I create a task with epic_id "nonexistent"
**Then** returns 400 with validation error
**When** I create a task with epic_id null
**Then** task is created (standalone task)

### TC-DL-3: Hierarchy enforcement - full chain
**Given** Identity "i1" → Vision "v1" → Goal "g1" → Project "p1" → Epic "e1"
**When** I create Task with epic_id "e1"
**Then** task is linked to full hierarchy and queryable at any level

### TC-DL-4: Cascade queries
**Given** an identity with nested visions, goals, projects, epics, tasks
**When** I GET /identity/:id?include=children
**Then** full hierarchy returned with all descendants

### TC-DL-5: Task deferred count increments
**Given** a task with status "today" and deferred_count 0
**When** I update status to "deferred"
**Then** deferred_count becomes 1 and current date added to deferred_dates

### TC-DL-6: Habit streak tracking
**Given** a habit with streak_current 5
**When** I POST a completion for today
**Then** streak_current becomes 6 and history entry added
**When** I skip a day and POST completion for day after tomorrow
**Then** streak_current resets to 1 and streak_best stays 6

### TC-DL-7: Session duration calculation
**Given** a session with start "2026-02-17T09:00:00Z"
**When** I update end to "2026-02-17T09:45:00Z"
**Then** duration_minutes is computed as 45

### TC-DL-8: RAG status computation
**Given** a goal with 3 projects, each with epics and tasks
**When** 70% of tasks are on track (green), 20% at risk (amber), 10% overdue (red)
**Then** goal RAG status computed as "amber"
**When** all tasks green
**Then** goal RAG status "green"
**When** any task red and >30% at risk or worse
**Then** goal RAG status "red"

### TC-DL-9: Capture resolution
**Given** a capture with status "pending"
**When** user accepts proposed task from agent
**Then** capture status becomes "resolved", resolved_to points to new task id, resolved_type is "task"

### TC-DL-10: Nudge response tracking
**Given** a nudge with response null
**When** user clicks "acknowledge"
**Then** response becomes "acknowledged" and responded_at is set

---

## Voice Capture Tests

### TC-VC-1: Push-to-talk activation
**Given** user is on any view
**When** user holds the V key
**Then** recording indicator appears, audio capture begins
**When** user releases V key
**Then** recording stops, final transcript displayed in editable area

### TC-VC-2: Live transcript streaming
**Given** user is recording
**When** user speaks "add a task to buy groceries"
**Then** words appear in real-time in the transcript area as they are spoken
**And** transcript updates with corrections as Deepgram finalizes words

### TC-VC-3: Transcript editing before send
**Given** transcript shows "buy grocery's" (misheard)
**When** user edits to "buy groceries" and presses Enter
**Then** corrected text is sent to agent, not the original transcript

### TC-VC-4: Fallback to Web Speech API
**Given** Deepgram backend is unreachable
**When** user activates voice capture
**Then** system falls back to Web Speech API with notice "Using browser speech (limited)"
**And** live transcript still works (in supported browsers)

### TC-VC-5: Microphone permission denied
**Given** browser microphone permission is denied
**When** user tries to activate voice
**Then** clear instruction overlay shows how to enable microphone permission

### TC-VC-6: VAD prevents silence streaming
**Given** user activates voice but doesn't speak for 3 seconds
**Then** no audio data is sent to Deepgram (VAD filters silence)
**And** prompt appears "I can't hear you. Check your microphone."

### TC-VC-7: Voice accessible from all views
**Given** user is on Today view
**Then** voice capture button/shortcut is accessible
**Given** user is on Kanban view
**Then** voice capture button/shortcut is accessible
**(repeat for all views)**

---

## Agent & Intent Classification Tests

### TC-AG-1: Task capture classification
**Given** user sends transcript "I need to update the landing page copy"
**When** agent classifies intent
**Then** mode is "task_capture" with confidence > 0.8
**And** proposed action is create task with title "Update the landing page copy"

### TC-AG-2: Reflection classification
**Given** user sends "Today was good, I finished the API work and feel energized"
**When** agent classifies intent
**Then** mode is "reflection" with confidence > 0.8

### TC-AG-3: Conversation classification
**Given** user sends "What should I work on next?"
**When** agent classifies intent
**Then** mode is "conversation" with confidence > 0.8
**And** agent produces a structured recommendation based on priorities, deferred tasks, deadlines

### TC-AG-4: Uncertain classification
**Given** user sends "I don't know what to do"
**When** agent classifies intent
**Then** mode is "uncertain"
**And** agent responds with recommendation rather than asking user to rephrase

### TC-AG-5: Status update classification
**Given** user is in Right Now view with active task "Design review"
**When** user sends "I finished the design review"
**Then** mode is "status_update"
**And** proposed action is mark "Design review" as done

### TC-AG-6: Push-and-confirm flow
**Given** agent proposes creating task "Buy groceries" in project "Personal"
**When** user clicks Accept
**Then** task is created in database, chat confirms "Task created: Buy groceries"
**When** user clicks Reject
**Then** no data is created, capture marked as dismissed
**When** user clicks Edit
**Then** editable form appears with proposed data pre-filled

### TC-AG-7: Vague input breakdown
**Given** user sends "I want to learn guitar"
**When** agent processes
**Then** agent proposes: Goal "Learn guitar" with suggested epics (e.g., "Learn basic chords", "Learn first song") and tasks with estimates
**And** presented as push-and-confirm

### TC-AG-8: Object references in chat
**Given** agent responds with "You have 3 overdue tasks in Project Alpha"
**Then** "Project Alpha" is a clickable link that navigates to the project
**And** "3 overdue tasks" links to filtered task list

---

## Right Now (Focus) View Tests

### TC-RN-1: Single task display
**Given** user selects a task and enters Right Now view
**Then** only that task is displayed - no sidebar, no nav, no other tasks
**And** task shows title, description, estimated time, project context

### TC-RN-2: Breathing ritual
**Given** user enters Right Now view
**Then** 30-second breathing animation plays
**When** user clicks "skip"
**Then** animation stops and focus mode begins immediately

### TC-RN-3: Focus timer
**Given** user is in Right Now view
**When** user starts timer
**Then** timer counts up, pause/extend/complete buttons visible
**When** user clicks extend +10min
**Then** timer target extends by 10 minutes
**When** user clicks complete
**Then** session logged with actual duration

### TC-RN-4: Session logging on complete
**Given** user completes a focus session (45 minutes)
**When** complete is clicked
**Then** session object created with correct start/end/duration
**And** user prompted for energy level (1-5)
**And** energy level stored on session
**And** system suggests next task or asks "what's next?"

### TC-RN-5: Exit confirmation
**Given** timer is running at 22 minutes
**When** user tries to navigate away
**Then** confirmation dialog: "Timer is running (22 min). Log this session and leave?"

### TC-RN-6: Sound prompt
**Given** user enters Right Now view for first time
**Then** prompt appears: "Have you started your focus playlist?"
**When** user dismisses
**Then** prompt doesn't appear on next entry (preference remembered)

---

## Today View Tests

### TC-TD-1: Daily task list
**Given** 5 tasks scheduled for today
**Then** all 5 appear ordered by priority/time
**And** each shows title, estimate, RAG status, energy cost

### TC-TD-2: Habit display
**Given** 3 daily habits configured
**Then** habits appear with toggle buttons
**When** user toggles a habit complete
**Then** habit marked complete for today, streak updated, sparkline updates

### TC-TD-3: Deferred task highlighting
**Given** a task deferred 3 times
**Then** task appears with distinct visual (amber/red highlight) and badge showing "3"

### TC-TD-4: Drag to reorder
**Given** tasks A, B, C in order
**When** user drags C above A
**Then** order becomes C, A, B and priority saved

### TC-TD-5: Quick-add task
**Given** user is on Today view
**When** user clicks quick-add and types "Call dentist"
**Then** task created with status "today" and appears in list

### TC-TD-6: Morning briefing display
**Given** morning briefing has been generated
**Then** briefing text appears at top of Today view
**And** includes today's plan, yesterday's carryover, upcoming deadlines

### TC-TD-7: Implementation intention display
**Given** task has implementation intention {when: "9am", where: "office", how_long: "30 min"}
**Then** task card shows "9am | office | 30 min" below the title

---

## Kanban View Tests

### TC-KB-1: Column rendering
**Given** tasks in various statuses
**Then** Backlog column shows backlog tasks, Today shows today tasks, etc.

### TC-KB-2: Drag between columns
**Given** task in "Backlog" column
**When** user drags to "Today"
**Then** task status updated to "today" and card moves to Today column

### TC-KB-3: Filter by project
**Given** tasks from projects Alpha and Beta
**When** user filters by "Alpha"
**Then** only Alpha tasks visible across all columns

### TC-KB-4: Quick-add to column
**Given** user clicks + on "Backlog" column
**When** user types "Research competitors" and submits
**Then** task created with status "backlog" and appears in Backlog column

---

## Chat View Tests

### TC-CH-1: Text input
**Given** user is in Chat view
**When** user types "What are my priorities today?" and presses Enter
**Then** message appears in chat, agent responds with today's priorities

### TC-CH-2: Voice input in chat
**Given** user is in Chat view
**When** user clicks mic button and speaks
**Then** voice capture flow activates, transcript appears, and on send, processes as chat message

### TC-CH-3: Push-and-confirm in chat
**Given** agent proposes creating a task
**Then** push-and-confirm card appears inline in chat
**When** user clicks Accept
**Then** task created and confirmation message appears in chat

### TC-CH-4: Chat history persistence
**Given** user has 50 messages in chat history
**When** user refreshes the page
**Then** all 50 messages still visible and scrollable

---

## Feedback View Tests

### TC-FB-1: Daily planned vs actual
**Given** 5 tasks planned for Monday, 3 completed, 2 deferred
**When** user views Feedback for Monday
**Then** side-by-side shows 5 planned, 3 completed (green), 2 deferred (amber)

### TC-FB-2: Sparklines
**Given** 30 days of deferred task data
**Then** sparkline shows trend line of daily deferred count
**And** last 7 days highlighted

### TC-FB-3: Drill-down
**Given** feedback shows "4 tasks deferred this week"
**When** user clicks the metric
**Then** list of those 4 specific deferred tasks appears

### TC-FB-4: Structured work start time
**Given** sessions logged over 14 days
**Then** metric shows average first-task start time
**And** sparkline shows daily first-task start times

---

## Agent-Initiated Flow Tests

### TC-AF-1: Morning briefing generation
**Given** it's a new day and tasks/habits exist
**When** user opens the app
**Then** morning briefing is generated and displayed showing today's plan, carryover, deadlines

### TC-AF-2: End-of-day reflection prompt
**Given** configured reflection time is 6pm
**When** clock hits 6pm and app is open
**Then** reflection prompt appears: "Time to reflect on your day"
**And** shows planned vs actual summary

### TC-AF-3: Drift nudge
**Given** task "Write documentation" deferred 2 times
**When** system runs drift check
**Then** nudge created: "This was your mission, has something changed?"
**And** nudge appears in chat and nudge ledger

### TC-AF-4: Tiny habit suggestion
**Given** task "Clean garage" deferred 3 times
**When** drift check runs
**Then** nudge includes: "Want to try a 2-minute version? Just organize one shelf."

### TC-AF-5: Conflict alert
**Given** 8 hours of tasks scheduled, only 5 hours available (accounting for calendar events)
**When** morning briefing generates
**Then** conflict alert: "You have 8 hours of tasks and 5 hours available. What should move?"
**And** push-and-confirm options to reschedule/defer specific tasks

### TC-AF-6: Weekly narrative
**Given** it's end of week with session/task/habit data
**When** weekly summary generates
**Then** readable narrative describes the week's events, patterns, and suggestions
**And** appears in Weekly view

### TC-AF-7: Celebration nudge
**Given** user completes a 7-day habit streak
**When** streak reaches 7
**Then** celebration nudge: "7 days in a row! Momentum is building."

### TC-AF-8: Nudge ledger
**Given** 20 nudges have been created over 2 weeks
**When** user opens nudge ledger
**Then** all 20 displayed, filterable by type and response status
**And** each shows timestamp, message, response

---

## Onboarding Tests

### TC-OB-1: Identity-first flow
**Given** new user with no data
**When** user opens app for first time
**Then** onboarding conversation starts with "Who do you want to become?"
**And** does NOT start with "What tasks do you have?"

### TC-OB-2: Full onboarding flow
**Given** user completes identity → vision → goals → first project
**Then** system has enough data to generate first morning briefing
**And** Today view is populated with initial tasks

### TC-OB-3: Onboarding revisit
**Given** user completed onboarding 3 months ago
**When** user navigates to identity settings
**Then** can update identity/vision through the same conversational flow

---

## Calendar Integration Tests

### TC-CAL-1: Google Calendar OAuth
**Given** user clicks "Connect Google Calendar"
**When** OAuth flow completes
**Then** calendar events for next 7 days pulled and stored

### TC-CAL-2: Events in Today view
**Given** Google Calendar connected with 3 events today
**Then** Today view shows those 3 events at correct times, inline with tasks
**And** events visually distinct from tasks (different style, not draggable)

### TC-CAL-3: Calendar-aware scheduling
**Given** calendar shows meetings 10am-12pm and 2pm-3pm
**When** agent suggests daily plan
**Then** tasks scheduled around meetings, not overlapping

---

## Cross-Cutting Tests

### TC-CC-1: RAG status at all levels
**Given** hierarchy: Goal → Project → Epic → 5 tasks (3 green, 1 amber, 1 red)
**Then** Epic RAG = amber, Project RAG = amber, Goal RAG = amber

### TC-CC-2: Sparklines render correctly
**Given** 30 days of data for any metric
**Then** sparkline renders as inline trend chart
**And** renders at multiple sizes (small for task cards, medium for views)

### TC-CC-3: Zoomable hierarchy navigation
**Given** user is viewing a Goal
**When** user clicks on a child Project
**Then** view drills down to Project level showing its epics
**When** user clicks breadcrumb "Goal"
**Then** view returns to Goal level

### TC-CC-4: Implementation intentions on tasks
**Given** task with implementation intention fields populated
**Then** when/where/how_long displayed on task card in Today and Kanban views

### TC-CC-5: Non-judgmental framing
**Given** task deferred 5 times
**Then** nudge says "This was your mission, has something changed?"
**And** NOT "You've failed to complete this 5 times"

### TC-CC-6: Data is always JSON + Markdown
**Given** any data object
**When** I GET it via API
**Then** response is valid JSON
**And** all text content fields are valid Markdown

### TC-CC-7: LLM provider switchable
**Given** config set to "claude"
**Then** all agent calls use Claude API
**When** config changed to "openai"
**Then** all agent calls use OpenAI API without code changes
