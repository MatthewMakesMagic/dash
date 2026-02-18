"use client";

import { useCallback, useRef, useState } from "react";
import { useWebSpeech, type WebSpeechResult } from "./use-web-speech";
import { useDeepgram, type DeepgramResult } from "./use-deepgram";

export type TranscriptionSource = "web-speech" | "deepgram";

interface UseVoiceCaptureOptions {
  onTranscriptChange?: (transcript: string) => void;
  onFinalTranscript?: (transcript: string) => void;
  deepgramKeywords?: string[];
}

export function useVoiceCapture(options: UseVoiceCaptureOptions = {}) {
  const { onTranscriptChange, onFinalTranscript, deepgramKeywords } = options;

  const [transcript, setTranscript] = useState("");
  const [interimText, setInterimText] = useState("");
  const [isRecording, setIsRecording] = useState(false);
  const [source, setSource] = useState<TranscriptionSource>("web-speech");
  const [error, setError] = useState<string | null>(null);
  const [startTime, setStartTime] = useState<number | null>(null);

  const finalizedRef = useRef("");
  const onTranscriptChangeRef = useRef(onTranscriptChange);
  const onFinalTranscriptRef = useRef(onFinalTranscript);
  onTranscriptChangeRef.current = onTranscriptChange;
  onFinalTranscriptRef.current = onFinalTranscript;

  // Shared result handler for both sources
  const handleResult = useCallback(
    (result: WebSpeechResult | DeepgramResult) => {
      if (!result.transcript) return;

      if (result.isFinal) {
        finalizedRef.current += result.transcript;
        setTranscript(finalizedRef.current);
        setInterimText("");
        onTranscriptChangeRef.current?.(finalizedRef.current);
      } else {
        const combined = finalizedRef.current + result.transcript;
        setInterimText(result.transcript);
        onTranscriptChangeRef.current?.(combined);
      }
    },
    [],
  );

  const handleError = useCallback((err: string) => {
    setError(err);
  }, []);

  const handleEnd = useCallback(() => {
    setIsRecording(false);
    if (finalizedRef.current.trim()) {
      onFinalTranscriptRef.current?.(finalizedRef.current.trim());
    }
  }, []);

  const webSpeech = useWebSpeech({
    onResult: handleResult,
    onError: handleError,
    onEnd: handleEnd,
  });

  const deepgram = useDeepgram({
    keywords: deepgramKeywords,
    onResult: handleResult,
    onError: handleError,
    onEnd: handleEnd,
  });

  const startRecording = useCallback(async () => {
    setError(null);
    finalizedRef.current = "";
    setTranscript("");
    setInterimText("");
    setStartTime(Date.now());
    setIsRecording(true);

    // Try Deepgram first, fall back to Web Speech
    const deepgramStarted = await deepgram.start();
    if (deepgramStarted) {
      setSource("deepgram");
    } else {
      // Deepgram unavailable - use Web Speech fallback
      if (webSpeech.isSupported) {
        setSource("web-speech");
        setError("Using browser speech (Deepgram unavailable)");
        webSpeech.start();
      } else {
        setError("No speech recognition available");
        setIsRecording(false);
      }
    }
  }, [deepgram, webSpeech]);

  const stopRecording = useCallback(() => {
    deepgram.stop();
    webSpeech.stop();
    setIsRecording(false);
    setStartTime(null);
  }, [deepgram, webSpeech]);

  const clearTranscript = useCallback(() => {
    finalizedRef.current = "";
    setTranscript("");
    setInterimText("");
  }, []);

  return {
    // State
    transcript,
    interimText,
    isRecording,
    source,
    error,
    startTime,
    isSupported: webSpeech.isSupported || deepgram.isAvailable !== false,

    // Actions
    startRecording,
    stopRecording,
    clearTranscript,
    setTranscript,
  };
}
