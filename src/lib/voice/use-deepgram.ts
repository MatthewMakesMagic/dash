"use client";

import { useCallback, useRef, useState } from "react";

export interface DeepgramResult {
  transcript: string;
  isFinal: boolean;
  confidence: number;
}

interface UseDeepgramOptions {
  keywords?: string[];
  onResult?: (result: DeepgramResult) => void;
  onError?: (error: string) => void;
  onEnd?: () => void;
}

export function useDeepgram(options: UseDeepgramOptions = {}) {
  const { keywords = [], onResult, onError, onEnd } = options;

  const [isConnected, setIsConnected] = useState(false);
  const [isAvailable, setIsAvailable] = useState<boolean | null>(null);

  const socketRef = useRef<WebSocket | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const processorRef = useRef<ScriptProcessorNode | null>(null);
  const contextRef = useRef<AudioContext | null>(null);

  const onResultRef = useRef(onResult);
  const onErrorRef = useRef(onError);
  const onEndRef = useRef(onEnd);
  onResultRef.current = onResult;
  onErrorRef.current = onError;
  onEndRef.current = onEnd;

  const cleanup = useCallback(() => {
    if (processorRef.current) {
      processorRef.current.disconnect();
      processorRef.current = null;
    }
    if (contextRef.current) {
      contextRef.current.close();
      contextRef.current = null;
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }
    if (socketRef.current) {
      if (socketRef.current.readyState === WebSocket.OPEN) {
        // Send close message to Deepgram
        socketRef.current.send(JSON.stringify({ type: "CloseStream" }));
      }
      socketRef.current.close();
      socketRef.current = null;
    }
    setIsConnected(false);
  }, []);

  const start = useCallback(async () => {
    try {
      // 1. Get temporary token from our backend
      const tokenRes = await fetch("/api/voice/token");
      if (!tokenRes.ok) {
        setIsAvailable(false);
        onErrorRef.current?.("Deepgram service unavailable");
        return false;
      }

      const { token } = await tokenRes.json();
      setIsAvailable(true);

      // 2. Get microphone access
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          channelCount: 1,
          sampleRate: 16000,
          echoCancellation: true,
          noiseSuppression: true,
        },
      });
      streamRef.current = stream;

      // 3. Build Deepgram WebSocket URL with params
      const params = new URLSearchParams({
        model: "nova-2",
        punctuate: "true",
        smart_format: "true",
        interim_results: "true",
        endpointing: "300",
        utterance_end_ms: "1500",
        encoding: "linear16",
        sample_rate: "16000",
        channels: "1",
      });

      // Add keyword boosting
      for (const kw of keywords) {
        params.append("keywords", `${kw}:2`);
      }

      const wsUrl = `wss://api.deepgram.com/v1/listen?${params.toString()}`;

      // 4. Connect to Deepgram with token via WebSocket subprotocol
      const socket = new WebSocket(wsUrl, ["token", token]);
      socketRef.current = socket;

      socket.onopen = () => {
        setIsConnected(true);

        // 5. Set up audio processing - send raw PCM to Deepgram
        const audioContext = new AudioContext({ sampleRate: 16000 });
        contextRef.current = audioContext;

        const source = audioContext.createMediaStreamSource(stream);
        // ScriptProcessorNode is deprecated but simple and reliable for this use case
        const processor = audioContext.createScriptProcessor(4096, 1, 1);
        processorRef.current = processor;

        processor.onaudioprocess = (e) => {
          if (socket.readyState !== WebSocket.OPEN) return;
          const input = e.inputBuffer.getChannelData(0);
          // Convert float32 to int16
          const pcm = new Int16Array(input.length);
          for (let i = 0; i < input.length; i++) {
            const s = Math.max(-1, Math.min(1, input[i]));
            pcm[i] = s < 0 ? s * 0x8000 : s * 0x7fff;
          }
          socket.send(pcm.buffer);
        };

        source.connect(processor);
        processor.connect(audioContext.destination);
      };

      socket.onmessage = (event) => {
        const data = JSON.parse(event.data);
        if (data.type === "Results" && data.channel?.alternatives?.[0]) {
          const alt = data.channel.alternatives[0];
          onResultRef.current?.({
            transcript: alt.transcript,
            isFinal: data.is_final,
            confidence: alt.confidence,
          });
        }
      };

      socket.onerror = (e) => {
        console.error("Deepgram WS error:", e);
        onErrorRef.current?.("Deepgram connection error");
        cleanup();
      };

      socket.onclose = (e) => {
        console.log("Deepgram WS closed:", e.code, e.reason);
        setIsConnected(false);
        onEndRef.current?.();
      };

      return true;
    } catch (err) {
      const msg =
        err instanceof Error ? err.message : "Failed to start Deepgram";
      onErrorRef.current?.(msg);
      cleanup();
      return false;
    }
  }, [keywords, cleanup]);

  const stop = useCallback(() => {
    cleanup();
  }, [cleanup]);

  return { isConnected, isAvailable, start, stop };
}
