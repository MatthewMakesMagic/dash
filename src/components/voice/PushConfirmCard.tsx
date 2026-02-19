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
        <label className="mb-1 block text-xs text-neutral-400">Title</label>
        <input
          type="text"
          value={(data.title as string) ?? ""}
          onChange={(e) => onChange({ ...data, title: e.target.value })}
          className="w-full rounded border border-neutral-700 bg-neutral-800 px-3 py-1.5 text-sm text-neutral-100 focus:border-blue-500 focus:outline-none"
        />
      </div>
      <div className="flex gap-2">
        <div className="flex-1">
          <label className="mb-1 block text-xs text-neutral-400">
            Priority
          </label>
          <select
            value={(data.priority as string) ?? "medium"}
            onChange={(e) => onChange({ ...data, priority: e.target.value })}
            className="w-full rounded border border-neutral-700 bg-neutral-800 px-3 py-1.5 text-sm text-neutral-100 focus:border-blue-500 focus:outline-none"
          >
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
            <option value="urgent">Urgent</option>
          </select>
        </div>
        <div className="flex-1">
          <label className="mb-1 block text-xs text-neutral-400">
            Due Date
          </label>
          <input
            type="date"
            value={(data.due_date as string) ?? ""}
            onChange={(e) =>
              onChange({ ...data, due_date: e.target.value || null })
            }
            className="w-full rounded border border-neutral-700 bg-neutral-800 px-3 py-1.5 text-sm text-neutral-100 focus:border-blue-500 focus:outline-none"
          />
        </div>
      </div>
      <div className="flex gap-2">
        <div className="flex-1">
          <label className="mb-1 block text-xs text-neutral-400">Project</label>
          <input
            type="text"
            value={(data.project as string) ?? ""}
            onChange={(e) =>
              onChange({ ...data, project: e.target.value || null })
            }
            placeholder="Optional"
            className="w-full rounded border border-neutral-700 bg-neutral-800 px-3 py-1.5 text-sm text-neutral-100 placeholder:text-neutral-600 focus:border-blue-500 focus:outline-none"
          />
        </div>
        <div className="flex-1">
          <label className="mb-1 block text-xs text-neutral-400">Recurrence</label>
          <select
            value={(data.recurrence as string) ?? ""}
            onChange={(e) =>
              onChange({ ...data, recurrence: e.target.value || null })
            }
            className="w-full rounded border border-neutral-700 bg-neutral-800 px-3 py-1.5 text-sm text-neutral-100 focus:border-blue-500 focus:outline-none"
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
          <label className="mb-1 block text-xs text-neutral-400">Recurrence End</label>
          <input
            type="date"
            value={(data.recurrence_end as string) ?? ""}
            onChange={(e) =>
              onChange({ ...data, recurrence_end: e.target.value || null })
            }
            className="w-full rounded border border-neutral-700 bg-neutral-800 px-3 py-1.5 text-sm text-neutral-100 focus:border-blue-500 focus:outline-none"
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
        <label className="mb-1 block text-xs text-neutral-400">Summary</label>
        <textarea
          value={(data.summary as string) ?? ""}
          onChange={(e) => onChange({ ...data, summary: e.target.value })}
          rows={2}
          className="w-full rounded border border-neutral-700 bg-neutral-800 px-3 py-1.5 text-sm text-neutral-100 focus:border-blue-500 focus:outline-none"
        />
      </div>
      <div className="flex gap-2">
        <div className="flex-1">
          <label className="mb-1 block text-xs text-neutral-400">Mood</label>
          <input
            type="text"
            value={(data.mood as string) ?? ""}
            onChange={(e) =>
              onChange({ ...data, mood: e.target.value || null })
            }
            placeholder="e.g. energized, calm"
            className="w-full rounded border border-neutral-700 bg-neutral-800 px-3 py-1.5 text-sm text-neutral-100 placeholder:text-neutral-600 focus:border-blue-500 focus:outline-none"
          />
        </div>
        <div className="flex-1">
          <label className="mb-1 block text-xs text-neutral-400">Tags</label>
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
            className="w-full rounded border border-neutral-700 bg-neutral-800 px-3 py-1.5 text-sm text-neutral-100 placeholder:text-neutral-600 focus:border-blue-500 focus:outline-none"
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
        <label className="mb-1 block text-xs text-neutral-400">Title</label>
        <input
          type="text"
          value={(data.title as string) ?? ""}
          onChange={(e) => onChange({ ...data, title: e.target.value })}
          className="w-full rounded border border-neutral-700 bg-neutral-800 px-3 py-1.5 text-sm text-neutral-100 focus:border-blue-500 focus:outline-none"
        />
      </div>
      <div className="flex gap-2">
        <div className="flex-1">
          <label className="mb-1 block text-xs text-neutral-400">
            Timeframe
          </label>
          <input
            type="text"
            value={(data.timeframe as string) ?? ""}
            onChange={(e) =>
              onChange({ ...data, timeframe: e.target.value || null })
            }
            placeholder="e.g. this week, Q1"
            className="w-full rounded border border-neutral-700 bg-neutral-800 px-3 py-1.5 text-sm text-neutral-100 placeholder:text-neutral-600 focus:border-blue-500 focus:outline-none"
          />
        </div>
        <div className="flex-1">
          <label className="mb-1 block text-xs text-neutral-400">
            Measurable
          </label>
          <input
            type="text"
            value={(data.measurable as string) ?? ""}
            onChange={(e) =>
              onChange({ ...data, measurable: e.target.value || null })
            }
            placeholder="How to measure success"
            className="w-full rounded border border-neutral-700 bg-neutral-800 px-3 py-1.5 text-sm text-neutral-100 placeholder:text-neutral-600 focus:border-blue-500 focus:outline-none"
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
    <div className="rounded-lg border border-neutral-700 bg-neutral-900 p-4">
      <div className="mb-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="rounded bg-blue-600/20 px-2 py-0.5 text-xs font-medium text-blue-400">
            {modeLabel}
          </span>
          {itemCount > 1 && (
            <span className="rounded bg-neutral-700 px-2 py-0.5 text-xs font-medium text-neutral-300">
              {itemCount} items
            </span>
          )}
          <span className="text-xs text-neutral-500">
            {confidencePct}% confidence
          </span>
        </div>
      </div>

      <p className="mb-2 text-sm text-neutral-100">{action.summary}</p>

      {isMultiMode && items.length > 0 && (
        <div className="mb-3 space-y-3">
          {items.map((item, index) => (
            <div
              key={index}
              className="rounded border border-neutral-700/50 bg-neutral-800/50 p-3"
            >
              <div className="mb-2 flex items-center justify-between">
                <span className="text-xs font-medium text-neutral-400">
                  #{index + 1}
                </span>
                {items.length > 1 && (
                  <button
                    onClick={() => removeItem(index)}
                    className="rounded px-2 py-0.5 text-[10px] text-red-400 transition hover:bg-red-900/20 hover:text-red-300"
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
        <p className="mb-4 text-xs text-neutral-400">
          Proposed: {action.proposed_action}
        </p>
      )}

      <div className="mb-3 rounded bg-neutral-800 px-3 py-2 text-xs text-neutral-400">
        &quot;{originalTranscript}&quot;
      </div>

      <div className="flex gap-2">
        <button
          onClick={() => onAccept(editedData)}
          disabled={isMultiMode && itemCount === 0}
          className="rounded bg-blue-600 px-4 py-1.5 text-sm font-medium text-white transition hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {acceptLabel}
        </button>
        <button
          onClick={onEdit}
          className="rounded bg-neutral-700 px-4 py-1.5 text-sm font-medium text-neutral-200 transition hover:bg-neutral-600"
        >
          Edit
        </button>
        <button
          onClick={onReject}
          className="rounded px-4 py-1.5 text-sm text-neutral-400 transition hover:text-neutral-200"
        >
          Reject
        </button>
      </div>
    </div>
  );
}
