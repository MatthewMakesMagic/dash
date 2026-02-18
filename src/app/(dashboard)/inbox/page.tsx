"use client";

import { useCallback, useEffect, useState } from "react";

interface Capture {
  id: string;
  transcript: string;
  mode: string;
  confidence: number | null;
  summary: string | null;
  proposed_action: string | null;
  structured_data: Record<string, unknown> | null;
  status: string;
  created_at: string;
}

const modeLabels: Record<string, string> = {
  task_capture: "Task",
  reflection: "Reflection",
  conversation: "Question",
  command: "Command",
  goal_setting: "Goal",
  status_update: "Status",
  uncertain: "Uncertain",
};

const modeColors: Record<string, string> = {
  task_capture: "bg-blue-600/20 text-blue-400",
  reflection: "bg-purple-600/20 text-purple-400",
  goal_setting: "bg-green-600/20 text-green-400",
  conversation: "bg-yellow-600/20 text-yellow-400",
  command: "bg-orange-600/20 text-orange-400",
  status_update: "bg-cyan-600/20 text-cyan-400",
  uncertain: "bg-neutral-600/20 text-neutral-400",
};

export default function InboxPage() {
  const [captures, setCaptures] = useState<Capture[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchCaptures = useCallback(async () => {
    try {
      const res = await fetch("/api/captures?status=pending");
      if (res.ok) {
        const data = await res.json();
        setCaptures(data);
      }
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCaptures();
  }, [fetchCaptures]);

  const handleAccept = async (id: string) => {
    const capture = captures.find((c) => c.id === id);
    if (!capture) return;
    try {
      await fetch(`/api/captures/${id}/accept`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ structured_data: capture.structured_data }),
      });
      setCaptures((prev) => prev.filter((c) => c.id !== id));
    } catch {
      // ignore
    }
  };

  const handleReject = async (id: string) => {
    try {
      await fetch(`/api/captures/${id}/reject`, { method: "POST" });
      setCaptures((prev) => prev.filter((c) => c.id !== id));
    } catch {
      // ignore
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center pt-24 text-neutral-500">
        Loading...
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl">
      <h1 className="mb-6 text-2xl font-semibold">Inbox</h1>
      {captures.length === 0 ? (
        <p className="text-neutral-500">No pending captures.</p>
      ) : (
        <div className="space-y-3">
          {captures.map((capture) => (
            <div
              key={capture.id}
              className="rounded-lg border border-neutral-800 bg-neutral-900 p-4"
            >
              <div className="mb-2 flex items-center gap-2">
                <span
                  className={`rounded px-2 py-0.5 text-xs font-medium ${modeColors[capture.mode] ?? modeColors.uncertain}`}
                >
                  {modeLabels[capture.mode] ?? capture.mode}
                </span>
                {capture.confidence != null && (
                  <span className="text-xs text-neutral-500">
                    {Math.round(capture.confidence * 100)}%
                  </span>
                )}
                <span className="ml-auto text-xs text-neutral-600">
                  {new Date(capture.created_at).toLocaleString()}
                </span>
              </div>
              <p className="mb-1 text-sm text-neutral-100">
                {capture.summary ?? capture.transcript}
              </p>
              <p className="mb-3 text-xs text-neutral-500">
                &quot;{capture.transcript}&quot;
              </p>
              <div className="flex gap-2">
                <button
                  onClick={() => handleAccept(capture.id)}
                  className="rounded bg-blue-600 px-3 py-1 text-xs font-medium text-white transition hover:bg-blue-500"
                >
                  Accept
                </button>
                <button
                  onClick={() => handleReject(capture.id)}
                  className="rounded px-3 py-1 text-xs text-neutral-400 transition hover:text-neutral-200"
                >
                  Reject
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
