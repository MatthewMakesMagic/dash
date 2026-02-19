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
  structured_data: TaskData | ReflectionData | GoalData | Record<string, never>;
}

export interface TaskData {
  title: string;
  due_date: string | null;
  priority: "low" | "medium" | "high" | "urgent";
  project: string | null;
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

structured_data by mode:
- task_capture: { "title": string, "due_date": "YYYY-MM-DD" or null, "priority": "low"|"medium"|"high"|"urgent", "project": string or null }
- reflection: { "summary": string, "mood": string or null (e.g. "energized", "frustrated", "calm"), "tags": string[] }
- goal_setting: { "title": string, "timeframe": string or null (e.g. "this week", "Q1 2025"), "measurable": string or null }
- other modes: {}`;

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
    max_tokens: 512,
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
    return JSON.parse(jsonMatch[0]) as StructuredExtraction;
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
