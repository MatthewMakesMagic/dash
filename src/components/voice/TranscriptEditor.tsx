"use client";

import { useCallback, useEffect, useRef } from "react";

interface TranscriptEditorProps {
  transcript: string;
  interimText: string;
  isRecording: boolean;
  onTranscriptChange: (value: string) => void;
  onSend: (transcript: string) => void;
}

export function TranscriptEditor({
  transcript,
  interimText,
  isRecording,
  onTranscriptChange,
  onSend,
}: TranscriptEditorProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const displayText = transcript + (interimText ? interimText : "");

  // Auto-resize textarea
  useEffect(() => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = el.scrollHeight + "px";
  }, [displayText]);

  // Auto-scroll to bottom while recording
  useEffect(() => {
    if (isRecording && textareaRef.current) {
      textareaRef.current.scrollTop = textareaRef.current.scrollHeight;
    }
  }, [displayText, isRecording]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        const text = (transcript + interimText).trim();
        if (text) {
          onSend(text);
        }
      }
    },
    [transcript, interimText, onSend],
  );

  return (
    <div className="relative">
      <textarea
        ref={textareaRef}
        value={displayText}
        onChange={(e) => onTranscriptChange(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder={
          isRecording ? "Listening..." : "Press the mic button and speak..."
        }
        rows={3}
        className="input-glass w-full resize-none rounded-xl px-4 py-3 text-[var(--text-primary)]"
        aria-label="Voice transcript"
        aria-live="polite"
      />
      {interimText && (
        <div className="pointer-events-none absolute bottom-2 right-3 text-xs text-[var(--text-muted)]">
          interim
        </div>
      )}
    </div>
  );
}
