"use client";

import { ArrowLeft, Play } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

import { AppShell } from "@/components/app-shell";
import { TeamCard } from "@/components/team-card";
import { Button } from "@/components/ui/button";
import { useSessionStore } from "@/store/session-store";

export default function TeamsOverviewPage() {
  const router = useRouter();
  const { teams, startMatches } = useSessionStore();

  function handleStartMatches() {
    startMatches();
    router.push("/match");
  }

  return (
    <AppShell>
      <header className="flex items-center justify-between gap-3 py-2">
        <Button asChild variant="ghost" size="lg" className="h-11">
          <Link href="/register">
            <ArrowLeft className="size-5" />
            Players
          </Link>
        </Button>
        <div className="rounded-md bg-white px-3 py-2 text-sm font-black text-[#142018] shadow-sm">
          {teams.length} teams
        </div>
      </header>

      <section className="mt-4 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-4xl font-black uppercase leading-none sm:text-5xl">
            Generated Teams
          </h1>
          <p className="mt-3 text-base font-bold text-[#657163]">
            Teams are randomized into numbered groups of 4. The final team can be
            smaller when the player count is not divisible by 4.
          </p>
        </div>
        <Button
          type="button"
          size="lg"
          className="h-14 rounded-lg bg-[#1f7a3a] px-5 text-base font-black text-white hover:bg-[#17642f]"
          disabled={teams.length < 2}
          onClick={handleStartMatches}
        >
          <Play className="size-5" />
          Start Matches
        </Button>
      </section>

      {teams.length ? (
        <section className="mt-6 grid gap-4 sm:grid-cols-2">
          {teams.map((team) => (
            <TeamCard key={team.id} team={team} compact />
          ))}
        </section>
      ) : (
        <section className="mt-8 rounded-lg border border-[#dce6d5] bg-white p-6 text-center shadow-sm">
          <p className="text-lg font-black">No teams generated yet.</p>
          <Button asChild className="mt-4 bg-[#142018] text-white">
            <Link href="/register">Add players</Link>
          </Button>
        </section>
      )}

    </AppShell>
  );
}
