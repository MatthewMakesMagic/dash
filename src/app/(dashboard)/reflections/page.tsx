"use client";

import { useCallback, useEffect, useState } from "react";

interface Reflection {
  id: string;
  summary: string;
  mood: string | null;
  tags: string[] | null;
  created_at: string;
}

const moodChip: Record<string, string> = {
  energized: "chip-green",
  calm: "chip-cyan",
  focused: "chip-cyan",
  happy: "chip-amber",
  frustrated: "chip-red",
  tired: "badge-glass text-[var(--text-muted)]",
  anxious: "chip-orange",
  grateful: "chip-violet",
};

export default function ReflectionsPage() {
  const [reflections, setReflections] = useState<Reflection[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchReflections = useCallback(async () => {
    try {
      const res = await fetch("/api/reflections");
      if (res.ok) {
        const data = await res.json();
        setReflections(data);
      }
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchReflections();
  }, [fetchReflections]);

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
        <span className="gradient-text">Reflections</span>
      </h1>
      <div className="gradient-line mb-6 w-16" />

      {reflections.length === 0 ? (
        <div className="glass rounded-xl py-12 text-center text-[var(--text-muted)]">
          No reflections yet.
        </div>
      ) : (
        <div className="space-y-4">
          {reflections.map((ref) => (
            <div
              key={ref.id}
              className="glass-card rounded-xl p-4"
            >
              <div className="mb-2 flex items-center gap-2">
                {ref.mood && (
                  <span
                    className={`rounded-md px-2 py-0.5 text-xs font-medium ${moodChip[ref.mood] ?? "chip-violet"}`}
                  >
                    {ref.mood}
                  </span>
                )}
                <span className="ml-auto text-xs text-[var(--text-muted)]">
                  {new Date(ref.created_at).toLocaleDateString("en-US", {
                    weekday: "short",
                    month: "short",
                    day: "numeric",
                    hour: "numeric",
                    minute: "2-digit",
                  })}
                </span>
              </div>
              <p className="mb-2 text-sm text-[var(--text-primary)]">{ref.summary}</p>
              {ref.tags && ref.tags.length > 0 && (
                <div className="flex flex-wrap gap-1">
                  {ref.tags.map((tag) => (
                    <span
                      key={tag}
                      className="badge-glass rounded-full px-2.5 py-0.5 text-[10px] text-[var(--text-secondary)]"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
