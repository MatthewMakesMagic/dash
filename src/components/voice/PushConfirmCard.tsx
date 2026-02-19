"use client";

import { useState } from "react";
import { normalizeStructuredData } from "@/lib/llm/extract-structured";

export interface ProposedAction {
  id?: string;
  mode: string;
  confidence: number;
  summary: string;
  proposed_action: string;
  structured_data?: Record<string, unknown>;
}

interface PushConfirmCardProps {
  action: ProposedAction;
  originalTranscript: string;
  onAccept: (editedData: Record<string, unknown>) => void;
  onReject: () => void;
  onEdit: () => void;
}

const modeLabels: Record<string, string> = {
  task_capture: "New Task",
  reflection: "Reflection",
  conversation: "Question",
  command: "Command",
  goal_setting: "Goal",
  status_update: "Status Update",
  uncertain: "Uncertain",
};

const modeChipClass: Record<string, string> = {
  task_capture: "chip-orange",
  reflection: "chip-violet",
  conversation: "chip-amber",
  command: "chip-cyan",
  goal_setting: "chip-green",
  status_update: "chip-cyan",
  uncertain: "badge-glass text-[var(--text-secondary)]",
};

function TaskFields({
  data,
  onChange,
}: {
  data: Record<string, unknown>;
  onChange: (d: Record<string, unknown>) => void;
}) {
  return (
    <div className="space-y-2">
      <div>
        <label className="mb-1 block text-xs text-[var(--text-muted)]">Title</label>
        <input
          type="text"
          value={(data.title as string) ?? ""}
          onChange={(e) => onChange({ ...data, title: e.target.value })}
          className="input-glass w-full rounded-lg px-3 py-1.5 text-sm"
        />
      </div>
      <div className="flex gap-2">
        <div className="flex-1">
          <label className="mb-1 block text-xs text-[var(--text-muted)]">Priority</label>
          <select
            value={(data.priority as string) ?? "medium"}
            onChange={(e) => onChange({ ...data, priority: e.target.value })}
            className="input-glass w-full rounded-lg px-3 py-1.5 text-sm"
          >
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
            <option value="urgent">Urgent</option>
          </select>
        </div>
        <div className="flex-1">
          <label className="mb-1 block text-xs text-[var(--text-muted)]">Due Date</label>
          <input
            type="date"
            value={(data.due_date as string) ?? ""}
            onChange={(e) =>
              onChange({ ...data, due_date: e.target.value || null })
            }
            className="input-glass w-full rounded-lg px-3 py-1.5 text-sm"
          />
        </div>
      </div>
      <div className="flex gap-2">
        <div className="flex-1">
          <label className="mb-1 block text-xs text-[var(--text-muted)]">Project</label>
          <input
            type="text"
            value={(data.project as string) ?? ""}
            onChange={(e) =>
              onChange({ ...data, project: e.target.value || null })
            }
            placeholder="Optional"
            className="input-glass w-full rounded-lg px-3 py-1.5 text-sm"
          />
        </div>
        <div className="flex-1">
          <label className="mb-1 block text-xs text-[var(--text-muted)]">Recurrence</label>
          <select
            value={(data.recurrence as string) ?? ""}
            onChange={(e) =>
              onChange({ ...data, recurrence: e.target.value || null })
            }
            className="input-glass w-full rounded-lg px-3 py-1.5 text-sm"
          >
            <option value="">None</option>
            <option value="daily">Daily</option>
            <option value="weekly">Weekly</option>
            <option value="monthly">Monthly</option>
          </select>
        </div>
      </div>
      {(data.recurrence as string) && (
        <div>
          <label className="mb-1 block text-xs text-[var(--text-muted)]">Recurrence End</label>
          <input
            type="date"
            value={(data.recurrence_end as string) ?? ""}
            onChange={(e) =>
              onChange({ ...data, recurrence_end: e.target.value || null })
            }
            className="input-glass w-full rounded-lg px-3 py-1.5 text-sm"
          />
        </div>
      )}
    </div>
  );
}

function ReflectionFields({
  data,
  onChange,
}: {
  data: Record<string, unknown>;
  onChange: (d: Record<string, unknown>) => void;
}) {
  return (
    <div className="space-y-2">
      <div>
        <label className="mb-1 block text-xs text-[var(--text-muted)]">Summary</label>
        <textarea
          value={(data.summary as string) ?? ""}
          onChange={(e) => onChange({ ...data, summary: e.target.value })}
          rows={2}
          className="input-glass w-full rounded-lg px-3 py-1.5 text-sm"
        />
      </div>
      <div className="flex gap-2">
        <div className="flex-1">
          <label className="mb-1 block text-xs text-[var(--text-muted)]">Mood</label>
          <input
            type="text"
            value={(data.mood as string) ?? ""}
            onChange={(e) =>
              onChange({ ...data, mood: e.target.value || null })
            }
            placeholder="e.g. energized, calm"
            className="input-glass w-full rounded-lg px-3 py-1.5 text-sm"
          />
        </div>
        <div className="flex-1">
          <label className="mb-1 block text-xs text-[var(--text-muted)]">Tags</label>
          <input
            type="text"
            value={
              Array.isArray(data.tags)
                ? (data.tags as string[]).join(", ")
                : ""
            }
            onChange={(e) =>
              onChange({
                ...data,
                tags: e.target.value
                  .split(",")
                  .map((t) => t.trim())
                  .filter(Boolean),
              })
            }
            placeholder="comma separated"
            className="input-glass w-full rounded-lg px-3 py-1.5 text-sm"
          />
        </div>
      </div>
    </div>
  );
}

function GoalFields({
  data,
  onChange,
}: {
  data: Record<string, unknown>;
  onChange: (d: Record<string, unknown>) => void;
}) {
  return (
    <div className="space-y-2">
      <div>
        <label className="mb-1 block text-xs text-[var(--text-muted)]">Title</label>
        <input
          type="text"
          value={(data.title as string) ?? ""}
          onChange={(e) => onChange({ ...data, title: e.target.value })}
          className="input-glass w-full rounded-lg px-3 py-1.5 text-sm"
        />
      </div>
      <div className="flex gap-2">
        <div className="flex-1">
          <label className="mb-1 block text-xs text-[var(--text-muted)]">Timeframe</label>
          <input
            type="text"
            value={(data.timeframe as string) ?? ""}
            onChange={(e) =>
              onChange({ ...data, timeframe: e.target.value || null })
            }
            placeholder="e.g. this week, Q1"
            className="input-glass w-full rounded-lg px-3 py-1.5 text-sm"
          />
        </div>
        <div className="flex-1">
          <label className="mb-1 block text-xs text-[var(--text-muted)]">Measurable</label>
          <input
            type="text"
            value={(data.measurable as string) ?? ""}
            onChange={(e) =>
              onChange({ ...data, measurable: e.target.value || null })
            }
            placeholder="How to measure success"
            className="input-glass w-full rounded-lg px-3 py-1.5 text-sm"
          />
        </div>
      </div>
    </div>
  );
}

type ArrayKey = "tasks" | "reflections" | "goals";

function getArrayKey(mode: string): ArrayKey | null {
  switch (mode) {
    case "task_capture":
      return "tasks";
    case "reflection":
      return "reflections";
    case "goal_setting":
      return "goals";
    default:
      return null;
  }
}

function getItems(mode: string, data: Record<string, unknown>): Record<string, unknown>[] {
  const key = getArrayKey(mode);
  if (!key) return [];
  const arr = (data as Record<string, unknown[]>)[key];
  return Array.isArray(arr) ? (arr as Record<string, unknown>[]) : [];
}

function setItems(mode: string, items: Record<string, unknown>[]): Record<string, unknown> {
  const key = getArrayKey(mode);
  if (!key) return {};
  return { [key]: items };
}

export function PushConfirmCard({
  action,
  originalTranscript,
  onAccept,
  onReject,
  onEdit,
}: PushConfirmCardProps) {
  const normalized = normalizeStructuredData(
    action.mode,
    action.structured_data ?? {},
  );
  const [editedData, setEditedData] = useState<Record<string, unknown>>(normalized);

  const modeLabel = modeLabels[action.mode] ?? action.mode;
  const confidencePct = Math.round(action.confidence * 100);

  const arrayKey = getArrayKey(action.mode);
  const items = getItems(action.mode, editedData);
  const isMultiMode = arrayKey !== null;

  const updateItem = (index: number, updated: Record<string, unknown>) => {
    const newItems = [...items];
    newItems[index] = updated;
    setEditedData(setItems(action.mode, newItems));
  };

  const removeItem = (index: number) => {
    const newItems = items.filter((_, i) => i !== index);
    setEditedData(setItems(action.mode, newItems));
  };

  const renderFields = (item: Record<string, unknown>, onChange: (d: Record<string, unknown>) => void) => {
    switch (action.mode) {
      case "task_capture":
        return <TaskFields data={item} onChange={onChange} />;
      case "reflection":
        return <ReflectionFields data={item} onChange={onChange} />;
      case "goal_setting":
        return <GoalFields data={item} onChange={onChange} />;
      default:
        return null;
    }
  };

  const itemCount = items.length;
  const acceptLabel = itemCount > 1 ? `Accept All (${itemCount})` : "Accept";

  return (
    <div className="glass-card rounded-xl p-4">
      <div className="mb-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className={`rounded-md px-2 py-0.5 text-xs font-medium ${modeChipClass[action.mode] ?? modeChipClass.uncertain}`}>
            {modeLabel}
          </span>
          {itemCount > 1 && (
            <span className="badge-glass rounded-md px-2 py-0.5 text-xs font-medium text-[var(--text-secondary)]">
              {itemCount} items
            </span>
          )}
          <span className="text-xs text-[var(--text-muted)]">
            {confidencePct}%
          </span>
        </div>
      </div>

      <p className="mb-2 text-sm text-[var(--text-primary)]">{action.summary}</p>

      {isMultiMode && items.length > 0 && (
        <div className="mb-3 space-y-3">
          {items.map((item, index) => (
            <div
              key={index}
              className="glass rounded-lg p-3"
            >
              <div className="mb-2 flex items-center justify-between">
                <span className="text-xs font-medium text-[var(--text-muted)] font-[family-name:var(--font-mono)]">
                  #{index + 1}
                </span>
                {items.length > 1 && (
                  <button
                    onClick={() => removeItem(index)}
                    className="chip-red rounded-md px-2 py-0.5 text-[10px] transition-all hover:brightness-125"
                  >
                    Remove
                  </button>
                )}
              </div>
              {renderFields(item, (updated) => updateItem(index, updated))}
            </div>
          ))}
        </div>
      )}

      {!isMultiMode && (
        <p className="mb-4 text-xs text-[var(--text-muted)]">
          Proposed: {action.proposed_action}
        </p>
      )}

      <div className="mb-3 glass rounded-lg px-3 py-2 text-xs text-[var(--text-muted)] italic">
        &quot;{originalTranscript}&quot;
      </div>

      <div className="flex gap-2">
        <button
          onClick={() => onAccept(editedData)}
          disabled={isMultiMode && itemCount === 0}
          className="btn-gradient rounded-lg px-4 py-1.5 text-sm font-medium disabled:opacity-40 disabled:cursor-not-allowed"
        >
          {acceptLabel}
        </button>
        <button
          onClick={onEdit}
          className="btn-glass rounded-lg px-4 py-1.5 text-sm font-medium"
        >
          Edit
        </button>
        <button
          onClick={onReject}
          className="rounded-lg px-4 py-1.5 text-sm text-[var(--text-muted)] transition hover:text-[var(--text-primary)]"
        >
          Reject
        </button>
      </div>
    </div>
  );
}
