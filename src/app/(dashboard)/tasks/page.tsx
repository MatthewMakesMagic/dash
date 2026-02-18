"use client";

import { useCallback, useEffect, useState } from "react";

interface Task {
  id: string;
  title: string;
  due_date: string | null;
  priority: string;
  project: string | null;
  status: string;
  created_at: string;
}

const priorityColors: Record<string, string> = {
  urgent: "bg-red-600/20 text-red-400",
  high: "bg-orange-600/20 text-orange-400",
  medium: "bg-yellow-600/20 text-yellow-400",
  low: "bg-neutral-600/20 text-neutral-400",
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
      <div className="flex items-center justify-center pt-24 text-neutral-500">
        Loading...
      </div>
    );
  }

  return (
    <div>
      <h1 className="mb-6 text-2xl font-semibold">Tasks</h1>
      <div className="grid grid-cols-3 gap-4">
        {columns.map((col) => {
          const colTasks = tasks.filter((t) => t.status === col.key);
          return (
            <div key={col.key}>
              <h2 className="mb-3 text-sm font-medium text-neutral-400">
                {col.label}{" "}
                <span className="text-neutral-600">({colTasks.length})</span>
              </h2>
              <div className="space-y-2">
                {colTasks.map((task) => (
                  <div
                    key={task.id}
                    className="rounded-lg border border-neutral-800 bg-neutral-900 p-3"
                  >
                    <p className="mb-2 text-sm font-medium text-neutral-100">
                      {task.title}
                    </p>
                    <div className="mb-2 flex flex-wrap items-center gap-1.5">
                      <span
                        className={`rounded px-1.5 py-0.5 text-[10px] font-medium ${priorityColors[task.priority] ?? priorityColors.medium}`}
                      >
                        {task.priority}
                      </span>
                      {task.due_date && (
                        <span className="text-[10px] text-neutral-500">
                          Due {task.due_date}
                        </span>
                      )}
                      {task.project && (
                        <span className="text-[10px] text-neutral-500">
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
                          className="rounded px-2 py-0.5 text-[10px] text-neutral-400 transition hover:bg-neutral-800 hover:text-neutral-200"
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
                          className="rounded px-2 py-0.5 text-[10px] text-neutral-400 transition hover:bg-neutral-800 hover:text-neutral-200"
                        >
                          {col.key === "todo" ? "In Progress" : "Done"}
                        </button>
                      )}
                    </div>
                  </div>
                ))}
                {colTasks.length === 0 && (
                  <p className="py-4 text-center text-xs text-neutral-600">
                    No tasks
                  </p>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
