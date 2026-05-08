"use client";

import { ArrowLeft, Clock, Trophy } from "lucide-react";
import Link from "next/link";
import { useMemo } from "react";

import { AppShell } from "@/components/app-shell";
import { Button } from "@/components/ui/button";
import { useSessionStore } from "@/store/session-store";

export default function MatchHistoryPage() {
  const { teams, matchHistory } = useSessionStore();
  const teamById = useMemo(() => new Map(teams.map((team) => [team.id, team])), [teams]);

  return (
    <AppShell>
      <header className="flex items-center justify-between gap-3 py-2">
        <Button asChild variant="ghost" size="lg" className="h-11">
          <Link href="/match">
            <ArrowLeft className="size-5" />
            Match
          </Link>
        </Button>
        <div className="rounded-md bg-white px-3 py-2 text-sm font-black text-[#142018] shadow-sm">
          {matchHistory.length} games
        </div>
      </header>

      <section className="mt-4">
        <h1 className="text-4xl font-black uppercase leading-none sm:text-5xl">
          Match History
        </h1>
        <p className="mt-3 text-base font-bold text-[#657163]">
          Winners and timeout results for this session.
        </p>
      </section>

      <section className="mt-6 grid gap-3 pb-8">
        {matchHistory.length ? (
          [...matchHistory].reverse().map((entry) => {
            const leftTeam = entry.leftTeamId ? teamById.get(entry.leftTeamId) : null;
            const rightTeam = entry.rightTeamId ? teamById.get(entry.rightTeamId) : null;
            const winner = entry.winnerTeamId
              ? teamById.get(entry.winnerTeamId)
              : null;

            return (
              <article
                key={entry.id}
                className="rounded-lg border border-[#dce6d5] bg-white p-4 shadow-sm"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-xs font-black uppercase tracking-[0.18em] text-[#657163]">
                      Game #{entry.matchNumber}
                    </p>
                    <h2 className="mt-1 text-2xl font-black text-[#142018]">
                      {leftTeam?.name ?? "Unknown"} vs {rightTeam?.name ?? "Unknown"}
                    </h2>
                  </div>
                  <span className="rounded-md bg-[#eef4e9] px-2 py-1 text-xs font-black uppercase text-[#657163]">
                    {new Date(entry.createdAt).toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </span>
                </div>

                <div className="mt-4 rounded-md bg-[#142018] px-3 py-3 text-white">
                  {entry.result === "goal" ? (
                    <p className="flex items-center gap-2 text-xl font-black">
                      <Trophy className="size-5 text-[#f4c542]" />
                      {winner?.name ?? "Unknown team"} won
                    </p>
                  ) : (
                    <p className="flex items-center gap-2 text-xl font-black">
                      <Clock className="size-5 text-[#dff15f]" />
                      Timeout / draw
                    </p>
                  )}
                </div>
              </article>
            );
          })
        ) : (
          <section className="rounded-lg border border-[#dce6d5] bg-white p-6 text-center shadow-sm">
            <p className="text-lg font-black">No games recorded yet.</p>
            <Button asChild className="mt-4 bg-[#142018] text-white">
              <Link href="/match">Back to match</Link>
            </Button>
          </section>
        )}
      </section>
    </AppShell>
  );
}
