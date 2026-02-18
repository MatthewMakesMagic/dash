"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useVoiceCapture } from "@/lib/voice/use-voice-capture";
import { useAudioLevel } from "@/lib/voice/use-audio-level";
import { RecordingIndicator } from "./RecordingIndicator";
import { TranscriptEditor } from "./TranscriptEditor";
import { PushConfirmCard, type ProposedAction } from "./PushConfirmCard";

interface VoiceCaptureModalProps {
  onClose: () => void;
}

export function VoiceCaptureModal({ onClose }: VoiceCaptureModalProps) {
  const [proposedAction, setProposedAction] = useState<ProposedAction | null>(
    null,
  );
  const [sentTranscript, setSentTranscript] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);

  const {
    transcript,
    interimText,
    isRecording,
    error,
    startTime,
    startRecording,
    stopRecording,
    clearTranscript,
    setTranscript,
  } = useVoiceCapture({
    deepgramKeywords: ["Dash", "task", "goal", "reflect"],
  });

  const {
    level: audioLevel,
    startMonitoring,
    stopMonitoring,
  } = useAudioLevel();

  const handleStartRecording = useCallback(async () => {
    await startRecording();
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      startMonitoring(stream);
    } catch {
      // optional
    }
  }, [startRecording, startMonitoring]);

  const handleStopRecording = useCallback(() => {
    stopRecording();
    stopMonitoring();
  }, [stopRecording, stopMonitoring]);

  // Hold V shortcut within modal
  const isHoldingVRef = useRef(false);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
        return;
      }
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
  }, [handleStartRecording, handleStopRecording, onClose]);

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
              current_view: "floating_mic",
              time: new Date().toISOString(),
            },
          }),
        });
        if (!res.ok) throw new Error("Failed");
        setProposedAction(await res.json());
      } catch {
        setProposedAction({
          mode: "uncertain",
          confidence: 0,
          summary: text.trim(),
          proposed_action: "Could not reach LLM.",
        });
      } finally {
        setIsProcessing(false);
      }
    },
    [isProcessing, clearTranscript],
  );

  const handleAccept = useCallback(
    async (editedData: Record<string, unknown>) => {
      if (proposedAction?.id) {
        try {
          await fetch(`/api/captures/${proposedAction.id}/accept`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ structured_data: editedData }),
          });
        } catch {
          // best effort
        }
      }
      setProposedAction(null);
      setSentTranscript("");
      onClose();
    },
    [proposedAction, onClose],
  );

  const handleReject = useCallback(async () => {
    if (proposedAction?.id) {
      try {
        await fetch(`/api/captures/${proposedAction.id}/reject`, {
          method: "POST",
        });
      } catch {
        // best effort
      }
    }
    setProposedAction(null);
    setSentTranscript("");
  }, [proposedAction]);

  const handleEdit = useCallback(() => {
    setTranscript(sentTranscript);
    setProposedAction(null);
    setSentTranscript("");
  }, [sentTranscript, setTranscript]);

  const toggleRecording = useCallback(() => {
    if (isRecording) handleStopRecording();
    else handleStartRecording();
  }, [isRecording, handleStartRecording, handleStopRecording]);

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60"
        onClick={onClose}
      />
      {/* Panel */}
      <div className="relative z-10 w-full max-w-xl animate-slide-up rounded-t-2xl border-t border-neutral-700 bg-neutral-900 p-6">
        <div className="mb-4 flex items-center justify-between">
          <RecordingIndicator
            isRecording={isRecording}
            startTime={startTime}
            audioLevel={audioLevel}
          />
          <button
            onClick={onClose}
            className="rounded p-1 text-neutral-400 transition hover:text-neutral-200"
          >
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="mb-4 flex gap-3">
          <button
            onClick={toggleRecording}
            className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-full transition ${
              isRecording
                ? "bg-red-600 text-white shadow-lg shadow-red-600/25 hover:bg-red-500"
                : "bg-neutral-800 text-neutral-300 hover:bg-neutral-700"
            }`}
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

        <div className="mb-4 flex justify-end">
          <button
            onClick={() => handleSend(transcript + interimText)}
            disabled={!(transcript + interimText).trim() || isProcessing}
            className="rounded bg-blue-600 px-4 py-1.5 text-sm font-medium text-white transition hover:bg-blue-500 disabled:opacity-40"
          >
            {isProcessing ? "Processing..." : "Send"}
          </button>
        </div>

        {error && (
          <div className="mb-4 rounded px-3 py-2 text-sm bg-red-900/30 text-red-400">
            {error}
          </div>
        )}

        {proposedAction && (
          <PushConfirmCard
            action={proposedAction}
            originalTranscript={sentTranscript}
            onAccept={handleAccept}
            onReject={handleReject}
            onEdit={handleEdit}
          />
        )}
      </div>
    </div>
  );
}
