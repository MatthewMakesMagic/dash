"use client";

import { useEffect, useState } from "react";

interface RecordingIndicatorProps {
  isRecording: boolean;
  startTime: number | null;
  audioLevel?: number; // 0-1
}

export function RecordingIndicator({
  isRecording,
  startTime,
  audioLevel = 0,
}: RecordingIndicatorProps) {
  if (!isRecording) return null;

  return (
    <div className="flex items-center gap-3 text-sm text-red-400">
      <span className="relative flex h-3 w-3">
        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-red-400 opacity-75" />
        <span className="relative inline-flex h-3 w-3 rounded-full bg-red-500" />
      </span>
      <span>Recording</span>
      {startTime && <DurationTimer startTime={startTime} />}
      <AudioLevelMeter level={audioLevel} />
    </div>
  );
}

function DurationTimer({ startTime }: { startTime: number }) {
  const [elapsed, setElapsed] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setElapsed(Math.floor((Date.now() - startTime) / 1000));
    }, 1000);
    return () => clearInterval(interval);
  }, [startTime]);

  const mins = Math.floor(elapsed / 60);
  const secs = elapsed % 60;

  return (
    <span className="tabular-nums text-neutral-400">
      {mins}:{secs.toString().padStart(2, "0")}
    </span>
  );
}

function AudioLevelMeter({ level }: { level: number }) {
  const bars = 5;
  const activeBars = Math.round(level * bars);

  return (
    <div className="flex items-end gap-0.5" aria-label={`Audio level: ${Math.round(level * 100)}%`}>
      {Array.from({ length: bars }, (_, i) => (
        <div
          key={i}
          className={`w-1 rounded-full transition-all duration-75 ${
            i < activeBars ? "bg-red-400" : "bg-neutral-700"
          }`}
          style={{ height: `${6 + i * 3}px` }}
        />
      ))}
    </div>
  );
}
