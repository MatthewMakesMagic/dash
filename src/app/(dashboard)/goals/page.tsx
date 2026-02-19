"use client";

import { useCallback, useEffect, useState } from "react";

interface Goal {
  id: string;
  title: string;
  timeframe: string | null;
  measurable: string | null;
  status: string;
  created_at: string;
}

const statusChip: Record<string, string> = {
  active: "chip-green",
  completed: "chip-cyan",
  abandoned: "badge-glass text-[var(--text-muted)]",
};

export default function GoalsPage() {
  const [goals, setGoals] = useState<Goal[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchGoals = useCallback(async () => {
    try {
      const res = await fetch("/api/goals");
      if (res.ok) {
        const data = await res.json();
        setGoals(data);
      }
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchGoals();
  }, [fetchGoals]);

  const updateStatus = async (id: string, status: string) => {
    try {
      const res = await fetch(`/api/goals/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      if (res.ok) {
        setGoals((prev) =>
          prev.map((g) => (g.id === id ? { ...g, status } : g)),
        );
      }
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
    <div className="mx-auto max-w-3xl">
      <h1 className="mb-1 text-2xl font-bold font-[family-name:var(--font-mono)]">
        <span className="gradient-text">Goals</span>
      </h1>
      <div className="gradient-line mb-6 w-16" />

      {goals.length === 0 ? (
        <div className="glass rounded-xl py-12 text-center text-[var(--text-muted)]">
          No goals yet.
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {goals.map((goal) => (
            <div
              key={goal.id}
              className="glass-card rounded-xl p-4"
            >
              <div className="mb-2 flex items-center justify-between">
                <h3 className="font-medium text-[var(--text-primary)]">{goal.title}</h3>
                <span
                  className={`rounded-md px-2 py-0.5 text-xs font-medium ${statusChip[goal.status] ?? statusChip.active}`}
                >
                  {goal.status}
                </span>
              </div>
              {goal.timeframe && (
                <p className="mb-1 text-xs text-[var(--text-muted)]">
                  Timeframe: {goal.timeframe}
                </p>
              )}
              {goal.measurable && (
                <p className="mb-3 text-xs text-[var(--text-muted)]">
                  Measure: {goal.measurable}
                </p>
              )}
              <div className="flex gap-1">
                {goal.status !== "completed" && (
                  <button
                    onClick={() => updateStatus(goal.id, "completed")}
                    className="rounded-md px-2 py-0.5 text-[10px] text-[var(--text-muted)] transition hover:bg-[rgba(255,255,255,0.06)] hover:text-[#4ade80]"
                  >
                    Complete
                  </button>
                )}
                {goal.status !== "active" && (
                  <button
                    onClick={() => updateStatus(goal.id, "active")}
                    className="rounded-md px-2 py-0.5 text-[10px] text-[var(--text-muted)] transition hover:bg-[rgba(255,255,255,0.06)] hover:text-[var(--text-primary)]"
                  >
                    Reactivate
                  </button>
                )}
                {goal.status !== "abandoned" && (
                  <button
                    onClick={() => updateStatus(goal.id, "abandoned")}
                    className="rounded-md px-2 py-0.5 text-[10px] text-[var(--text-muted)] transition hover:bg-[rgba(255,255,255,0.06)] hover:text-[#f87171]"
                  >
                    Abandon
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
