"use client";

import { useState } from "react";

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
      <div>
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

export function PushConfirmCard({
  action,
  originalTranscript,
  onAccept,
  onReject,
  onEdit,
}: PushConfirmCardProps) {
  const [editedData, setEditedData] = useState<Record<string, unknown>>(
    action.structured_data ?? {},
  );

  const modeLabel = modeLabels[action.mode] ?? action.mode;
  const confidencePct = Math.round(action.confidence * 100);

  const hasStructuredFields =
    action.mode === "task_capture" ||
    action.mode === "reflection" ||
    action.mode === "goal_setting";

  return (
    <div className="rounded-lg border border-neutral-700 bg-neutral-900 p-4">
      <div className="mb-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="rounded bg-blue-600/20 px-2 py-0.5 text-xs font-medium text-blue-400">
            {modeLabel}
          </span>
          <span className="text-xs text-neutral-500">
            {confidencePct}% confidence
          </span>
        </div>
      </div>

      <p className="mb-2 text-sm text-neutral-100">{action.summary}</p>

      {hasStructuredFields && (
        <div className="mb-3">
          {action.mode === "task_capture" && (
            <TaskFields data={editedData} onChange={setEditedData} />
          )}
          {action.mode === "reflection" && (
            <ReflectionFields data={editedData} onChange={setEditedData} />
          )}
          {action.mode === "goal_setting" && (
            <GoalFields data={editedData} onChange={setEditedData} />
          )}
        </div>
      )}

      {!hasStructuredFields && (
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
          className="rounded bg-blue-600 px-4 py-1.5 text-sm font-medium text-white transition hover:bg-blue-500"
        >
          Accept
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
