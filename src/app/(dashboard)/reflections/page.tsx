"use client";

import { useCallback, useEffect, useState } from "react";

interface Reflection {
  id: string;
  summary: string;
  mood: string | null;
  tags: string[] | null;
  created_at: string;
}

const moodColors: Record<string, string> = {
  energized: "text-green-400",
  calm: "text-blue-400",
  focused: "text-cyan-400",
  happy: "text-yellow-400",
  frustrated: "text-red-400",
  tired: "text-neutral-400",
  anxious: "text-orange-400",
  grateful: "text-purple-400",
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
      <div className="flex items-center justify-center pt-24 text-neutral-500">
        Loading...
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl">
      <h1 className="mb-6 text-2xl font-semibold">Reflections</h1>
      {reflections.length === 0 ? (
        <p className="text-neutral-500">No reflections yet.</p>
      ) : (
        <div className="space-y-4">
          {reflections.map((ref) => (
            <div
              key={ref.id}
              className="rounded-lg border border-neutral-800 bg-neutral-900 p-4"
            >
              <div className="mb-2 flex items-center gap-2">
                {ref.mood && (
                  <span
                    className={`text-sm font-medium ${moodColors[ref.mood] ?? "text-neutral-300"}`}
                  >
                    {ref.mood}
                  </span>
                )}
                <span className="ml-auto text-xs text-neutral-600">
                  {new Date(ref.created_at).toLocaleDateString("en-US", {
                    weekday: "short",
                    month: "short",
                    day: "numeric",
                    hour: "numeric",
                    minute: "2-digit",
                  })}
                </span>
              </div>
              <p className="mb-2 text-sm text-neutral-200">{ref.summary}</p>
              {ref.tags && ref.tags.length > 0 && (
                <div className="flex flex-wrap gap-1">
                  {ref.tags.map((tag) => (
                    <span
                      key={tag}
                      className="rounded-full bg-neutral-800 px-2 py-0.5 text-[10px] text-neutral-400"
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
