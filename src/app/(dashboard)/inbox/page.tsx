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

const modeChipClass: Record<string, string> = {
  task_capture: "chip-orange",
  reflection: "chip-violet",
  goal_setting: "chip-green",
  conversation: "chip-amber",
  command: "chip-cyan",
  status_update: "chip-cyan",
  uncertain: "badge-glass text-[var(--text-muted)]",
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
      <div className="flex items-center justify-center pt-24 text-[var(--text-muted)]">
        Loading...
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl">
      <h1 className="mb-1 text-2xl font-bold font-[family-name:var(--font-mono)]">
        <span className="gradient-text">Inbox</span>
      </h1>
      <div className="gradient-line mb-6 w-16" />

      {captures.length === 0 ? (
        <div className="glass rounded-xl py-12 text-center text-[var(--text-muted)]">
          No pending captures.
        </div>
      ) : (
        <div className="space-y-3">
          {captures.map((capture) => (
            <div
              key={capture.id}
              className="glass-card rounded-xl p-4"
            >
              <div className="mb-2 flex items-center gap-2">
                <span
                  className={`rounded-md px-2 py-0.5 text-xs font-medium ${modeChipClass[capture.mode] ?? modeChipClass.uncertain}`}
                >
                  {modeLabels[capture.mode] ?? capture.mode}
                </span>
                {capture.confidence != null && (
                  <span className="text-xs text-[var(--text-muted)]">
                    {Math.round(capture.confidence * 100)}%
                  </span>
                )}
                <span className="ml-auto text-xs text-[var(--text-muted)]">
                  {new Date(capture.created_at).toLocaleString()}
                </span>
              </div>
              <p className="mb-1 text-sm text-[var(--text-primary)]">
                {capture.summary ?? capture.transcript}
              </p>
              <p className="mb-3 text-xs text-[var(--text-muted)] italic">
                &quot;{capture.transcript}&quot;
              </p>
              <div className="flex gap-2">
                <button
                  onClick={() => handleAccept(capture.id)}
                  className="btn-gradient rounded-lg px-3 py-1 text-xs font-medium"
                >
                  Accept
                </button>
                <button
                  onClick={() => handleReject(capture.id)}
                  className="rounded-lg px-3 py-1 text-xs text-[var(--text-muted)] transition hover:text-[var(--text-primary)]"
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
