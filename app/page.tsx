"use client";

import { ArrowRight, Plus, RotateCcw, Users } from "lucide-react";
import { useRouter } from "next/navigation";

import { AppShell } from "@/components/app-shell";
import { Button } from "@/components/ui/button";
import { useSessionStore } from "@/store/session-store";

export default function Home() {
  const router = useRouter();
  const { id, players, match, createSession, resetSession } = useSessionStore();

  function handleCreateSession() {
    createSession();
    router.push("/register");
  }

  function handleJoinSession() {
    if (!id) {
      createSession();
      router.push("/register");
      return;
    }

    router.push(match ? "/match" : "/register");
  }

  return (
    <AppShell>
      <div className="flex flex-1 flex-col justify-between gap-8">
        <header className="pt-8">
          <div className="inline-flex rounded-md bg-[#dff15f] px-3 py-2 text-sm font-black uppercase tracking-[0.18em] text-[#142018]">
            Fair rotation
          </div>
          <h1 className="mt-5 max-w-3xl text-5xl font-black uppercase leading-[0.92] text-[#142018] sm:text-7xl">
            Street Football Rotation
          </h1>
          <p className="mt-5 max-w-xl text-xl font-bold leading-8 text-[#4d5c50]">
            Fast teams, clear queue, no arguments about who enters next.
          </p>
        </header>

        <section className="grid gap-3 pb-8 sm:grid-cols-2">
          <Button
            type="button"
            size="lg"
            className="h-20 justify-between rounded-lg bg-[#1f7a3a] px-5 text-lg font-black text-white hover:bg-[#17642f]"
            onClick={handleCreateSession}
          >
            <span className="flex items-center gap-3">
              <Plus className="size-6" />
              Create Session
            </span>
            <ArrowRight className="size-6" />
          </Button>
          <Button
            type="button"
            size="lg"
            variant="outline"
            className="h-20 justify-between rounded-lg border-2 border-[#142018] bg-white px-5 text-lg font-black"
            onClick={handleJoinSession}
          >
            <span className="flex items-center gap-3">
              <Users className="size-6" />
              Join Session
            </span>
            <span className="text-sm text-[#657163]">
              {players.length ? `${players.length} players` : "local device"}
            </span>
          </Button>
          {id ? (
            <Button
              type="button"
              size="lg"
              variant="ghost"
              className="h-12 justify-start text-[#657163] sm:col-span-2"
              onClick={resetSession}
            >
              <RotateCcw className="size-5" />
              Reset saved session
            </Button>
          ) : null}
        </section>
      </div>
    </AppShell>
  );
}
