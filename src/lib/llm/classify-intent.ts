import { getAnthropicClient } from "./client";

export interface CaptureContext {
  current_view?: string;
  active_task?: string;
  time?: string;
  recent_captures?: string[];
}

export interface ClassifiedIntent {
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
}

const SYSTEM_PROMPT = `You are the voice intent classifier for Dash, a personal productivity system.
Analyze the user's voice transcription and classify their intent.

Respond with JSON only, no other text:
{
  "mode": "task_capture" | "reflection" | "conversation" | "command" | "goal_setting" | "status_update" | "uncertain",
  "confidence": 0.0 to 1.0,
  "summary": "one-line summary of what the user said",
  "proposed_action": "what the system should do with this input"
}

Mode definitions:
- task_capture: Creating a new task or to-do item
- reflection: Reflecting on their day, feelings, or progress
- conversation: Asking a question or requesting analysis
- command: Wanting to navigate or change the UI
- goal_setting: Defining or updating a goal or vision
- status_update: Reporting progress on an existing task
- uncertain: Expressing confusion or unclear intent (this is valid)`;

export async function classifyIntent(
  transcript: string,
  context: CaptureContext,
): Promise<ClassifiedIntent> {
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
    model: "claude-haiku-4-5-20251001",
    max_tokens: 256,
    system: SYSTEM_PROMPT,
    messages: [{ role: "user", content: userMessage }],
  });

  const text =
    response.content[0]?.type === "text" ? response.content[0].text : "";

  const jsonMatch = text.match(/\{[\s\S]*\}/);
  if (!jsonMatch) {
    return {
      mode: "uncertain",
      confidence: 0,
      summary: transcript,
      proposed_action: "Could not parse LLM response",
    };
  }

  return JSON.parse(jsonMatch[0]) as ClassifiedIntent;
}
