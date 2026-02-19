import { getAnthropicClient } from "./client";
import type { CaptureContext } from "./classify-intent";

export interface StructuredExtraction {
  mode:
    | "task_capture"
    | "reflection"
    | "conversation"
    | "command"
    | "goal_setting"
    | "status_update"
    | "uncertain";
  confidence: number;
  summary: string;
  proposed_action: string;
  structured_data:
    | { tasks: TaskData[] }
    | { reflections: ReflectionData[] }
    | { goals: GoalData[] }
    | Record<string, never>;
}

export interface TaskData {
  title: string;
  due_date: string | null;
  priority: "low" | "medium" | "high" | "urgent";
  project: string | null;
  recurrence: "daily" | "weekly" | "monthly" | null;
  recurrence_end: string | null;
}

export interface ReflectionData {
  summary: string;
  mood: string | null;
  tags: string[];
}

export interface GoalData {
  title: string;
  timeframe: string | null;
  measurable: string | null;
}

const SYSTEM_PROMPT = `You are the voice intent classifier and structured data extractor for Dash, a personal productivity system.
Analyze the user's voice transcription, classify intent, and extract structured fields.
If the user mentions multiple items of the same type, extract ALL of them as separate entries in the array.

Respond with JSON only, no other text:
{
  "mode": "task_capture" | "reflection" | "conversation" | "command" | "goal_setting" | "status_update" | "uncertain",
  "confidence": 0.0 to 1.0,
  "summary": "one-line summary",
  "proposed_action": "what the system should do",
  "structured_data": { ... mode-specific fields ... }
}

Mode definitions:
- task_capture: Creating a new task or to-do item
- reflection: Reflecting on their day, feelings, or progress
- conversation: Asking a question or requesting analysis
- command: Wanting to navigate or change the UI
- goal_setting: Defining or updating a goal or vision
- status_update: Reporting progress on an existing task
- uncertain: Unclear intent

structured_data by mode (ALWAYS use arrays):
- task_capture: { "tasks": [{ "title": string, "due_date": "YYYY-MM-DD" or null, "priority": "low"|"medium"|"high"|"urgent", "project": string or null, "recurrence": "daily"|"weekly"|"monthly" or null, "recurrence_end": "YYYY-MM-DD" or null }] }
- reflection: { "reflections": [{ "summary": string, "mood": string or null (e.g. "energized", "frustrated", "calm"), "tags": string[] }] }
- goal_setting: { "goals": [{ "title": string, "timeframe": string or null (e.g. "this week", "Q1 2025"), "measurable": string or null }] }
- other modes: {}

Examples:
- "meditate daily, do qigong, and pray" → 3 tasks in the tasks array, each with appropriate recurrence
- "I feel good today but also a bit stressed about work" → 1 reflection in the reflections array`;

/**
 * Normalize structured_data from old single-object format to new array format.
 * Handles both old LLM responses and already-correct array responses.
 */
export function normalizeStructuredData(
  mode: string,
  data: Record<string, unknown>,
): Record<string, unknown> {
  switch (mode) {
    case "task_capture": {
      if (Array.isArray((data as Record<string, unknown>).tasks)) return data;
      // Old format: single task object at top level
      if (typeof (data as Record<string, unknown>).title === "string") {
        return { tasks: [data] };
      }
      return { tasks: [] };
    }
    case "reflection": {
      if (Array.isArray((data as Record<string, unknown>).reflections))
        return data;
      if (typeof (data as Record<string, unknown>).summary === "string") {
        return { reflections: [data] };
      }
      return { reflections: [] };
    }
    case "goal_setting": {
      if (Array.isArray((data as Record<string, unknown>).goals)) return data;
      if (typeof (data as Record<string, unknown>).title === "string") {
        return { goals: [data] };
      }
      return { goals: [] };
    }
    default:
      return data;
  }
}

export async function extractStructured(
  transcript: string,
  context: CaptureContext,
): Promise<StructuredExtraction> {
  const anthropic = getAnthropicClient();

  const timeOfDay = context.time
    ? new Date(context.time).toLocaleTimeString("en-US", {
        hour: "numeric",
        minute: "2-digit",
      })
    : "unknown";

  const userMessage = `Context:
- Current view: ${context.current_view ?? "dashboard"}
- Active task: ${context.active_task ?? "none"}
- Time: ${timeOfDay}
- Recent captures: ${context.recent_captures?.join("; ") ?? "none"}

Transcript: "${transcript}"`;

  const response = await anthropic.messages.create({
    model: "claude-sonnet-4-5-20250929",
    max_tokens: 1024,
    system: SYSTEM_PROMPT,
    messages: [{ role: "user", content: userMessage }],
  });

  const text =
    response.content[0]?.type === "text" ? response.content[0].text : "";

  // Extract JSON from response (handle potential markdown wrapping)
  const jsonMatch = text.match(/\{[\s\S]*\}/);
  if (!jsonMatch) {
    return {
      mode: "uncertain",
      confidence: 0,
      summary: transcript,
      proposed_action: "Could not parse LLM response",
      structured_data: {},
    };
  }

  try {
    const parsed = JSON.parse(jsonMatch[0]) as StructuredExtraction;
    // Normalize to array format
    parsed.structured_data = normalizeStructuredData(
      parsed.mode,
      parsed.structured_data as Record<string, unknown>,
    ) as StructuredExtraction["structured_data"];
    return parsed;
  } catch {
    return {
      mode: "uncertain",
      confidence: 0,
      summary: transcript,
      proposed_action: "Could not parse LLM response",
      structured_data: {},
    };
  }
}
