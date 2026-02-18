import { eq, isNull, desc } from "drizzle-orm";
import { db } from "./index";
import { captures, tasks, reflections, goals } from "./schema";
import type {
  StructuredExtraction,
  TaskData,
  ReflectionData,
  GoalData,
} from "../llm/extract-structured";

// --- Captures ---

export async function createCapture(
  transcript: string,
  extraction: StructuredExtraction,
) {
  const [capture] = await db
    .insert(captures)
    .values({
      transcript,
      mode: extraction.mode,
      confidence: extraction.confidence,
      summary: extraction.summary,
      proposedAction: extraction.proposed_action,
      structuredData: extraction.structured_data,
      status: "pending",
    })
    .returning();
  return capture;
}

export async function getPendingCaptures() {
  return db
    .select()
    .from(captures)
    .where(eq(captures.status, "pending"))
    .orderBy(desc(captures.createdAt));
}

export async function getAllCaptures(status?: string) {
  if (status) {
    return db
      .select()
      .from(captures)
      .where(eq(captures.status, status))
      .orderBy(desc(captures.createdAt));
  }
  return db.select().from(captures).orderBy(desc(captures.createdAt));
}

export async function acceptCapture(
  id: string,
  editedData?: Record<string, unknown>,
) {
  // Get the capture
  const [capture] = await db
    .select()
    .from(captures)
    .where(eq(captures.id, id));

  if (!capture) throw new Error("Capture not found");

  const data = (editedData ??
    capture.structuredData ??
    {}) as Record<string, unknown>;

  // Update capture status
  await db
    .update(captures)
    .set({ status: "accepted", structuredData: data, updatedAt: new Date() })
    .where(eq(captures.id, id));

  // Create entity based on mode
  switch (capture.mode) {
    case "task_capture": {
      const taskData = data as unknown as TaskData;
      const [task] = await db
        .insert(tasks)
        .values({
          captureId: id,
          title: taskData.title || capture.summary || "Untitled task",
          dueDate: taskData.due_date || null,
          priority: taskData.priority || "medium",
          project: taskData.project || null,
        })
        .returning();
      return { capture, entity: task, type: "task" };
    }
    case "reflection": {
      const refData = data as unknown as ReflectionData;
      const [reflection] = await db
        .insert(reflections)
        .values({
          captureId: id,
          summary: refData.summary || capture.summary || "Untitled reflection",
          mood: refData.mood || null,
          tags: refData.tags || [],
        })
        .returning();
      return { capture, entity: reflection, type: "reflection" };
    }
    case "goal_setting": {
      const goalData = data as unknown as GoalData;
      const [goal] = await db
        .insert(goals)
        .values({
          captureId: id,
          title: goalData.title || capture.summary || "Untitled goal",
          timeframe: goalData.timeframe || null,
          measurable: goalData.measurable || null,
        })
        .returning();
      return { capture, entity: goal, type: "goal" };
    }
    default:
      return { capture, entity: null, type: capture.mode };
  }
}

export async function rejectCapture(id: string) {
  const [capture] = await db
    .update(captures)
    .set({ status: "rejected", updatedAt: new Date() })
    .where(eq(captures.id, id))
    .returning();
  return capture;
}

// --- Tasks ---

export async function getTasks() {
  return db
    .select()
    .from(tasks)
    .where(isNull(tasks.deletedAt))
    .orderBy(tasks.sortOrder, desc(tasks.createdAt));
}

export async function updateTask(
  id: string,
  data: { status?: string; title?: string; priority?: string; dueDate?: string | null; project?: string | null },
) {
  const [task] = await db
    .update(tasks)
    .set({ ...data, updatedAt: new Date() })
    .where(eq(tasks.id, id))
    .returning();
  return task;
}

// --- Reflections ---

export async function getReflections() {
  return db
    .select()
    .from(reflections)
    .where(isNull(reflections.deletedAt))
    .orderBy(desc(reflections.createdAt));
}

// --- Goals ---

export async function getGoals() {
  return db
    .select()
    .from(goals)
    .where(isNull(goals.deletedAt))
    .orderBy(desc(goals.createdAt));
}

export async function updateGoal(
  id: string,
  data: { status?: string; title?: string; timeframe?: string | null; measurable?: string | null },
) {
  const [goal] = await db
    .update(goals)
    .set({ ...data, updatedAt: new Date() })
    .where(eq(goals.id, id))
    .returning();
  return goal;
}
