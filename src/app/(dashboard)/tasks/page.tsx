"use client";

import { useCallback, useEffect, useState } from "react";

interface Task {
  id: string;
  title: string;
  due_date: string | null;
  priority: string;
  project: string | null;
  status: string;
  recurrence: string | null;
  recurrence_end: string | null;
  created_at: string;
}

const priorityChip: Record<string, string> = {
  urgent: "chip-red",
  high: "chip-orange",
  medium: "chip-amber",
  low: "badge-glass text-[var(--text-muted)]",
};

const columns = [
  { key: "todo", label: "To Do" },
  { key: "in_progress", label: "In Progress" },
  { key: "done", label: "Done" },
];

export default function TasksPage() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchTasks = useCallback(async () => {
    try {
      const res = await fetch("/api/tasks");
      if (res.ok) {
        const data = await res.json();
        setTasks(data);
      }
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  const updateStatus = async (id: string, status: string) => {
    try {
      const res = await fetch(`/api/tasks/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      if (res.ok) {
        setTasks((prev) =>
          prev.map((t) => (t.id === id ? { ...t, status } : t)),
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
    <div>
      <h1 className="mb-1 text-2xl font-bold font-[family-name:var(--font-mono)]">
        <span className="gradient-text">Tasks</span>
      </h1>
      <div className="gradient-line mb-6 w-16" />

      <div className="grid grid-cols-3 gap-4">
        {columns.map((col) => {
          const colTasks = tasks.filter((t) => t.status === col.key);
          return (
            <div key={col.key}>
              <h2 className="mb-3 text-sm font-medium text-[var(--text-secondary)]">
                {col.label}{" "}
                <span className="text-[var(--text-muted)]">({colTasks.length})</span>
              </h2>
              <div className="space-y-2">
                {colTasks.map((task) => (
                  <div
                    key={task.id}
                    className="glass-card rounded-xl p-3"
                  >
                    <p className="mb-2 text-sm font-medium text-[var(--text-primary)]">
                      {task.title}
                    </p>
                    <div className="mb-2 flex flex-wrap items-center gap-1.5">
                      <span
                        className={`rounded-md px-1.5 py-0.5 text-[10px] font-medium ${priorityChip[task.priority] ?? priorityChip.medium}`}
                      >
                        {task.priority}
                      </span>
                      {task.due_date && (
                        <span className="text-[10px] text-[var(--text-muted)]">
                          Due {task.due_date}
                        </span>
                      )}
                      {task.recurrence && (
                        <span className="chip-fuchsia rounded-md px-1.5 py-0.5 text-[10px] font-medium">
                          {task.recurrence}
                        </span>
                      )}
                      {task.project && (
                        <span className="text-[10px] text-[var(--text-muted)]">
                          {task.project}
                        </span>
                      )}
                    </div>
                    <div className="flex gap-1">
                      {col.key !== "todo" && (
                        <button
                          onClick={() =>
                            updateStatus(
                              task.id,
                              col.key === "done" ? "in_progress" : "todo",
                            )
                          }
                          className="rounded-md px-2 py-0.5 text-[10px] text-[var(--text-muted)] transition hover:bg-[rgba(255,255,255,0.06)] hover:text-[var(--text-primary)]"
                        >
                          {col.key === "done" ? "In Progress" : "To Do"}
                        </button>
                      )}
                      {col.key !== "done" && (
                        <button
                          onClick={() =>
                            updateStatus(
                              task.id,
                              col.key === "todo" ? "in_progress" : "done",
                            )
                          }
                          className="rounded-md px-2 py-0.5 text-[10px] text-[var(--text-muted)] transition hover:bg-[rgba(255,255,255,0.06)] hover:text-[var(--text-primary)]"
                        >
                          {col.key === "todo" ? "In Progress" : "Done"}
                        </button>
                      )}
                    </div>
                  </div>
                ))}
                {colTasks.length === 0 && (
                  <div className="glass rounded-xl py-8 text-center text-xs text-[var(--text-muted)]">
                    No tasks
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
