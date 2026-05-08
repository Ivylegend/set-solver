"use client";

import { Pause, Play, RotateCcw } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";

import { Button } from "@/components/ui/button";

type MatchTimerProps = {
  duration: number;
  onExpire: () => void;
};

function formatTime(seconds: number) {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`;
}

function playAlarm() {
  const AudioContextClass = window.AudioContext || window.webkitAudioContext;
  if (!AudioContextClass) return;

  const context = new AudioContextClass();
  const oscillator = context.createOscillator();
  const gain = context.createGain();

  oscillator.type = "square";
  oscillator.frequency.setValueAtTime(880, context.currentTime);
  oscillator.frequency.setValueAtTime(660, context.currentTime + 0.18);
  gain.gain.setValueAtTime(0.0001, context.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.18, context.currentTime + 0.03);
  gain.gain.exponentialRampToValueAtTime(0.0001, context.currentTime + 0.8);
  oscillator.connect(gain);
  gain.connect(context.destination);
  oscillator.start();
  oscillator.stop(context.currentTime + 0.85);
}

declare global {
  interface Window {
    webkitAudioContext?: typeof AudioContext;
  }
}

export function MatchTimer({ duration, onExpire }: MatchTimerProps) {
  const [remaining, setRemaining] = useState(duration);
  const [isRunning, setIsRunning] = useState(false);
  const expiredRef = useRef(false);
  const formatted = useMemo(() => formatTime(remaining), [remaining]);

  useEffect(() => {
    if (!isRunning || remaining <= 0) return;

    const interval = window.setInterval(() => {
      setRemaining((current) => Math.max(0, current - 1));
    }, 1000);

    return () => window.clearInterval(interval);
  }, [isRunning, remaining]);

  useEffect(() => {
    if (remaining !== 0 || expiredRef.current) return;

    expiredRef.current = true;
    setIsRunning(false);
    playAlarm();
    onExpire();
  }, [onExpire, remaining]);

  return (
    <section className="rounded-lg border border-[#dce6d5] bg-white p-4 text-center shadow-sm">
      <p className="text-xs font-black uppercase tracking-[0.2em] text-[#657163]">
        Match Timer
      </p>
      <div className="mt-2 text-7xl font-black leading-none text-[#142018] tabular-nums sm:text-8xl">
        {formatted}
      </div>
      <div className="mt-4 grid grid-cols-3 gap-2">
        <Button
          type="button"
          size="lg"
          variant="outline"
          className="h-12"
          onClick={() => setIsRunning((current) => !current)}
        >
          {isRunning ? <Pause className="size-5" /> : <Play className="size-5" />}
          {isRunning ? "Pause" : "Start"}
        </Button>
        <Button
          type="button"
          size="lg"
          variant="outline"
          className="col-span-2 h-12"
          onClick={() => {
            expiredRef.current = false;
            setRemaining(duration);
            setIsRunning(false);
          }}
        >
          <RotateCcw className="size-5" />
          Reset Timer
        </Button>
      </div>
    </section>
  );
}
