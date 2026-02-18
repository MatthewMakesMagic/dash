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

const statusColors: Record<string, string> = {
  active: "bg-green-600/20 text-green-400",
  completed: "bg-blue-600/20 text-blue-400",
  abandoned: "bg-neutral-600/20 text-neutral-400",
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
      <div className="flex items-center justify-center pt-24 text-neutral-500">
        Loading...
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl">
      <h1 className="mb-6 text-2xl font-semibold">Goals</h1>
      {goals.length === 0 ? (
        <p className="text-neutral-500">No goals yet.</p>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {goals.map((goal) => (
            <div
              key={goal.id}
              className="rounded-lg border border-neutral-800 bg-neutral-900 p-4"
            >
              <div className="mb-2 flex items-center justify-between">
                <h3 className="font-medium text-neutral-100">{goal.title}</h3>
                <span
                  className={`rounded px-2 py-0.5 text-xs font-medium ${statusColors[goal.status] ?? statusColors.active}`}
                >
                  {goal.status}
                </span>
              </div>
              {goal.timeframe && (
                <p className="mb-1 text-xs text-neutral-400">
                  Timeframe: {goal.timeframe}
                </p>
              )}
              {goal.measurable && (
                <p className="mb-3 text-xs text-neutral-400">
                  Measure: {goal.measurable}
                </p>
              )}
              <div className="flex gap-1">
                {goal.status !== "completed" && (
                  <button
                    onClick={() => updateStatus(goal.id, "completed")}
                    className="rounded px-2 py-0.5 text-[10px] text-neutral-400 transition hover:bg-neutral-800 hover:text-green-400"
                  >
                    Complete
                  </button>
                )}
                {goal.status !== "active" && (
                  <button
                    onClick={() => updateStatus(goal.id, "active")}
                    className="rounded px-2 py-0.5 text-[10px] text-neutral-400 transition hover:bg-neutral-800 hover:text-neutral-200"
                  >
                    Reactivate
                  </button>
                )}
                {goal.status !== "abandoned" && (
                  <button
                    onClick={() => updateStatus(goal.id, "abandoned")}
                    className="rounded px-2 py-0.5 text-[10px] text-neutral-400 transition hover:bg-neutral-800 hover:text-red-400"
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
