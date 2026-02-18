"use client";

import { useCallback, useRef, useState } from "react";

export function useAudioLevel() {
  const [level, setLevel] = useState(0);
  const contextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const rafRef = useRef<number>(0);

  const startMonitoring = useCallback((stream: MediaStream) => {
    const ctx = new AudioContext();
    const source = ctx.createMediaStreamSource(stream);
    const analyser = ctx.createAnalyser();
    analyser.fftSize = 256;
    source.connect(analyser);

    contextRef.current = ctx;
    analyserRef.current = analyser;

    const data = new Uint8Array(analyser.frequencyBinCount);

    const tick = () => {
      analyser.getByteFrequencyData(data);
      // RMS of frequency data, normalized to 0-1
      let sum = 0;
      for (let i = 0; i < data.length; i++) {
        sum += data[i] * data[i];
      }
      const rms = Math.sqrt(sum / data.length) / 255;
      setLevel(rms);
      rafRef.current = requestAnimationFrame(tick);
    };

    tick();
  }, []);

  const stopMonitoring = useCallback(() => {
    cancelAnimationFrame(rafRef.current);
    contextRef.current?.close();
    contextRef.current = null;
    analyserRef.current = null;
    setLevel(0);
  }, []);

  return { level, startMonitoring, stopMonitoring };
}
