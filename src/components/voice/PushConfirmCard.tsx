"use client";

export interface ProposedAction {
  mode: string;
  confidence: number;
  summary: string;
  proposed_action: string;
}

interface PushConfirmCardProps {
  action: ProposedAction;
  originalTranscript: string;
  onAccept: () => void;
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

export function PushConfirmCard({
  action,
  originalTranscript,
  onAccept,
  onReject,
  onEdit,
}: PushConfirmCardProps) {
  const modeLabel = modeLabels[action.mode] ?? action.mode;
  const confidencePct = Math.round(action.confidence * 100);

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

      <p className="mb-4 text-xs text-neutral-400">
        Proposed: {action.proposed_action}
      </p>

      <div className="mb-3 rounded bg-neutral-800 px-3 py-2 text-xs text-neutral-400">
        &quot;{originalTranscript}&quot;
      </div>

      <div className="flex gap-2">
        <button
          onClick={onAccept}
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
