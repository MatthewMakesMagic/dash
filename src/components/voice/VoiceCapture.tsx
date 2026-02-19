"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useVoiceCapture } from "@/lib/voice/use-voice-capture";
import { useAudioLevel } from "@/lib/voice/use-audio-level";
import { RecordingIndicator } from "./RecordingIndicator";
import { TranscriptEditor } from "./TranscriptEditor";
import { PushConfirmCard, type ProposedAction } from "./PushConfirmCard";

export function VoiceCapture() {
  const [proposedAction, setProposedAction] = useState<ProposedAction | null>(
    null,
  );
  const [sentTranscript, setSentTranscript] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [actionLog, setActionLog] = useState<
    Array<{ transcript: string; action: ProposedAction; status: string }>
  >([]);

  const {
    transcript,
    interimText,
    isRecording,
    source,
    error,
    startTime,
    isSupported,
    startRecording,
    stopRecording,
    clearTranscript,
    setTranscript,
  } = useVoiceCapture({
    deepgramKeywords: ["Dash", "task", "goal", "reflect"],
  });

  const { level: audioLevel, startMonitoring, stopMonitoring } = useAudioLevel();

  const handleStartRecording = useCallback(async () => {
    await startRecording();
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      startMonitoring(stream);
    } catch {
      // Audio level monitoring is optional
    }
  }, [startRecording, startMonitoring]);

  const handleStopRecording = useCallback(() => {
    stopRecording();
    stopMonitoring();
  }, [stopRecording, stopMonitoring]);

  // Hold V keyboard shortcut
  const isHoldingVRef = useRef(false);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (
        e.key === "v" &&
        !e.metaKey &&
        !e.ctrlKey &&
        !e.altKey &&
        !isHoldingVRef.current
      ) {
        const tag = (e.target as HTMLElement)?.tagName;
        if (tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT") return;

        isHoldingVRef.current = true;
        handleStartRecording();
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.key === "v" && isHoldingVRef.current) {
        isHoldingVRef.current = false;
        handleStopRecording();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
    };
  }, [handleStartRecording, handleStopRecording]);

  const handleSend = useCallback(
    async (text: string) => {
      if (!text.trim() || isProcessing) return;

      setSentTranscript(text.trim());
      setIsProcessing(true);
      setProposedAction(null);
      clearTranscript();

      try {
        const res = await fetch("/api/capture", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            transcript: text.trim(),
            context: {
              current_view: "voice_capture",
              time: new Date().toISOString(),
            },
          }),
        });

        if (!res.ok) throw new Error("Failed to process capture");

        const data = await res.json();
        setProposedAction(data);
      } catch {
        setProposedAction({
          mode: "uncertain",
          confidence: 0,
          summary: text.trim(),
          proposed_action: "Could not reach LLM. Saved as raw capture.",
        });
      } finally {
        setIsProcessing(false);
      }
    },
    [isProcessing, clearTranscript],
  );

  const handleAccept = useCallback(
    async (editedData: Record<string, unknown>) => {
      if (!proposedAction?.id) {
        if (proposedAction) {
          setActionLog((prev) => [
            { transcript: sentTranscript, action: proposedAction, status: "accepted" },
            ...prev,
          ]);
        }
        setProposedAction(null);
        setSentTranscript("");
        return;
      }

      try {
        await fetch(`/api/captures/${proposedAction.id}/accept`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ structured_data: editedData }),
        });
        setActionLog((prev) => [
          { transcript: sentTranscript, action: proposedAction, status: "accepted" },
          ...prev,
        ]);
      } catch {
        if (proposedAction) {
          setActionLog((prev) => [
            { transcript: sentTranscript, action: proposedAction, status: "accept_failed" },
            ...prev,
          ]);
        }
      }
      setProposedAction(null);
      setSentTranscript("");
    },
    [proposedAction, sentTranscript],
  );

  const handleReject = useCallback(async () => {
    if (proposedAction?.id) {
      try {
        await fetch(`/api/captures/${proposedAction.id}/reject`, {
          method: "POST",
        });
      } catch {
        // Ignore
      }
    }
    if (proposedAction) {
      setActionLog((prev) => [
        { transcript: sentTranscript, action: proposedAction, status: "rejected" },
        ...prev,
      ]);
    }
    setProposedAction(null);
    setSentTranscript("");
  }, [proposedAction, sentTranscript]);

  const handleEdit = useCallback(() => {
    setTranscript(sentTranscript);
    setProposedAction(null);
    setSentTranscript("");
  }, [sentTranscript, setTranscript]);

  const toggleRecording = useCallback(() => {
    if (isRecording) {
      handleStopRecording();
    } else {
      handleStartRecording();
    }
  }, [isRecording, handleStartRecording, handleStopRecording]);

  if (!isSupported) {
    return (
      <div className="chip-amber rounded-xl p-4 text-sm">
        Voice capture is not supported in this browser. Try Chrome or Safari.
      </div>
    );
  }

  return (
    <div className="flex w-full max-w-xl flex-col gap-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <RecordingIndicator
          isRecording={isRecording}
          startTime={startTime}
          audioLevel={audioLevel}
        />
        {!isRecording && (
          <span className="text-xs text-[var(--text-muted)]">
            via {source === "web-speech" ? "Web Speech API" : "Deepgram"}
            {" · hold "}
            <kbd className="badge-glass rounded px-1.5 py-0.5 text-[10px] font-[family-name:var(--font-mono)]">
              V
            </kbd>
            {" to talk"}
          </span>
        )}
      </div>

      {/* Mic button + transcript */}
      <div className="flex gap-3">
        <button
          onClick={toggleRecording}
          className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-full transition-all duration-200 ${
            isRecording
              ? "bg-red-500/80 text-white animate-pulse-glow"
              : "btn-glass"
          }`}
          aria-label={isRecording ? "Stop recording" : "Start recording"}
        >
          {isRecording ? (
            <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
              <rect x="6" y="6" width="12" height="12" rx="2" />
            </svg>
          ) : (
            <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3zm-1-9c0-.55.45-1 1-1s1 .45 1 1v6c0 .55-.45 1-1 1s-1-.45-1-1V5z" />
              <path d="M17 11c0 2.76-2.24 5-5 5s-5-2.24-5-5H5c0 3.53 2.61 6.43 6 6.92V21h2v-3.08c3.39-.49 6-3.39 6-6.92h-2z" />
            </svg>
          )}
        </button>

        <div className="flex-1">
          <TranscriptEditor
            transcript={transcript}
            interimText={interimText}
            isRecording={isRecording}
            onTranscriptChange={setTranscript}
            onSend={handleSend}
          />
        </div>
      </div>

      {/* Send button */}
      <div className="flex items-center justify-between">
        <span className="text-xs text-[var(--text-muted)]">
          {isRecording
            ? "Speak now..."
            : "Press Enter to send, Shift+Enter for newline"}
        </span>
        <button
          onClick={() => handleSend(transcript + interimText)}
          disabled={!(transcript + interimText).trim() || isProcessing}
          className="btn-gradient rounded-lg px-5 py-2 text-sm font-medium disabled:opacity-40 disabled:cursor-not-allowed"
        >
          {isProcessing ? "Processing..." : "Send"}
        </button>
      </div>

      {/* Error */}
      {error && (
        <div
          className={`rounded-xl px-3 py-2 text-sm ${
            error.includes("Using browser speech")
              ? "chip-amber"
              : "chip-red"
          }`}
        >
          {error}
        </div>
      )}

      {/* Push-and-confirm card */}
      {proposedAction && (
        <PushConfirmCard
          action={proposedAction}
          originalTranscript={sentTranscript}
          onAccept={handleAccept}
          onReject={handleReject}
          onEdit={handleEdit}
        />
      )}

      {/* Action log */}
      {actionLog.length > 0 && (
        <div className="mt-4 space-y-2">
          <h3 className="text-xs font-medium uppercase tracking-widest text-[var(--text-muted)]">
            Recent
          </h3>
          {actionLog.slice(0, 5).map((entry, i) => (
            <div
              key={i}
              className="glass rounded-lg px-3 py-2 text-xs"
            >
              <span
                className={
                  entry.status === "accepted"
                    ? "text-[#4ade80]"
                    : "text-[var(--text-muted)]"
                }
              >
                {entry.status === "accepted" ? "+" : "-"}
              </span>{" "}
              <span className="text-[var(--text-secondary)]">{entry.action.summary}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
