"use client";

import { Pause, Play, RotateCcw } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";

import { Button } from "@/components/ui/button";
import type { MatchTimerState } from "@/lib/types";
import { useSessionStore } from "@/store/session-store";

type MatchTimerProps = {
  duration: number;
  matchKey: string;
  onExpire: () => void;
};

function getRemainingSeconds(timer: MatchTimerState, now: number) {
  if (!timer.isRunning || !timer.startedAt) {
    return timer.remainingSeconds;
  }

  const elapsedSeconds = Math.floor((now - timer.startedAt) / 1000);
  return Math.max(0, timer.remainingSeconds - elapsedSeconds);
}

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

export function MatchTimer({ duration, matchKey, onExpire }: MatchTimerProps) {
  const {
    timer,
    prepareTimer,
    startTimer,
    pauseTimer,
    resetTimer,
    finishTimer,
  } = useSessionStore();
  const [now, setNow] = useState(() => Date.now());
  const expiredRef = useRef(false);
  const remaining = useMemo(() => getRemainingSeconds(timer, now), [now, timer]);
  const formatted = useMemo(() => formatTime(remaining), [remaining]);

  useEffect(() => {
    prepareTimer(matchKey, duration);
    expiredRef.current = false;
  }, [duration, matchKey, prepareTimer]);

  useEffect(() => {
    if (!timer.isRunning || remaining <= 0) return;

    const interval = window.setInterval(() => {
      setNow(Date.now());
    }, 1000);

    return () => window.clearInterval(interval);
  }, [remaining, timer.isRunning]);

  useEffect(() => {
    if (!timer.isRunning || remaining !== 0 || expiredRef.current) return;

    expiredRef.current = true;
    finishTimer();
    playAlarm();
    onExpire();
  }, [finishTimer, onExpire, remaining, timer.isRunning]);

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
          onClick={() => {
            if (timer.isRunning) {
              pauseTimer(remaining);
              return;
            }

            expiredRef.current = false;
            startTimer();
            setNow(Date.now());
          }}
        >
          {timer.isRunning ? <Pause className="size-5" /> : <Play className="size-5" />}
          {timer.isRunning ? "Pause" : "Start"}
        </Button>
        <Button
          type="button"
          size="lg"
          variant="outline"
          className="col-span-2 h-12"
          onClick={() => {
            expiredRef.current = false;
            resetTimer();
            setNow(Date.now());
          }}
        >
          <RotateCcw className="size-5" />
          Reset Timer
        </Button>
      </div>
    </section>
  );
}
