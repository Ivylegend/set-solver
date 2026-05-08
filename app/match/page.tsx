"use client";

import { ArrowLeft, Clock, Goal, History, Repeat2, ShieldAlert } from "lucide-react";
import Link from "next/link";
import { useCallback, useMemo } from "react";

import { AppShell } from "@/components/app-shell";
import { MatchTimer } from "@/components/match-timer";
import { QueueList } from "@/components/queue-list";
import { TeamCard } from "@/components/team-card";
import { Button } from "@/components/ui/button";
import { useSessionStore } from "@/store/session-store";

export default function LiveMatchPage() {
  const {
    teams,
    match,
    timerDuration,
    recordGoal,
    recordTimeout,
    setTimerDuration,
    swapPosts,
  } = useSessionStore();
  const teamById = useMemo(() => new Map(teams.map((team) => [team.id, team])), [teams]);
  const leftTeam = match?.leftTeamId ? teamById.get(match.leftTeamId) : undefined;
  const rightTeam = match?.rightTeamId ? teamById.get(match.rightTeamId) : undefined;
  const handleExpire = useCallback(() => {
    recordTimeout();
  }, [recordTimeout]);

  if (!match || !leftTeam || !rightTeam) {
    return (
      <AppShell>
        <div className="flex flex-1 flex-col items-center justify-center text-center">
          <ShieldAlert className="size-12 text-[#d6453d]" />
          <h1 className="mt-4 text-3xl font-black uppercase">No live match</h1>
          <p className="mt-2 max-w-sm font-bold text-[#657163]">
            Generate teams and start matches to open the rotation board.
          </p>
          <Button asChild className="mt-5 bg-[#142018] text-white">
            <Link href="/teams">Go to teams</Link>
          </Button>
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell>
      <header className="flex items-center justify-between gap-3 py-2">
        <Button asChild variant="ghost" size="lg" className="h-11">
          <Link href="/teams">
            <ArrowLeft className="size-5" />
            Teams
          </Link>
        </Button>
        <div className="flex items-center gap-2">
          <Button asChild variant="outline" size="lg" className="h-11 bg-white">
            <Link href="/history">
              <History className="size-5" />
              History
            </Link>
          </Button>
          <div className="rounded-md bg-[#dff15f] px-3 py-2 text-sm font-black uppercase text-[#142018]">
            Match #{match.matchNumber}
          </div>
        </div>
      </header>

      <section className="mt-3 grid gap-4 lg:grid-cols-[1fr_320px]">
        <div className="grid gap-4">
          <section className="rounded-lg border border-[#dce6d5] bg-white p-4 shadow-sm">
            <label
              htmlFor="timer-duration"
              className="text-xs font-black uppercase tracking-[0.2em] text-[#657163]"
            >
              Time Limit
            </label>
            <div className="mt-3 flex items-center gap-3">
              <input
                id="timer-duration"
                type="number"
                min={1}
                max={30}
                value={Math.round(timerDuration / 60)}
                onChange={(event) => {
                  const minutes = Number(event.target.value);
                  if (Number.isFinite(minutes)) {
                    setTimerDuration(minutes * 60);
                  }
                }}
                className="h-12 w-24 rounded-lg border-2 border-[#dce6d5] bg-white px-3 text-2xl font-black outline-none focus:border-[#1f7a3a] focus:ring-4 focus:ring-[#1f7a3a]/15"
              />
              <span className="text-lg font-black text-[#142018]">minutes</span>
              <p className="ml-auto hidden text-sm font-bold text-[#657163] sm:block">
                Timer starts only when Start is pressed.
              </p>
            </div>
          </section>

          <MatchTimer
            key={`${match.matchNumber}-${timerDuration}`}
            duration={timerDuration}
            onExpire={handleExpire}
          />

          <section className="grid gap-3 sm:grid-cols-[1fr_auto_1fr] sm:items-stretch">
            <TeamCard team={leftTeam} label="Left Post" post="left" />
            <div className="flex items-center justify-center gap-3 rounded-lg bg-[#142018] px-5 py-4 text-3xl font-black text-white sm:flex-col sm:px-3">
              <span>VS</span>
              <Button
                type="button"
                size="icon-lg"
                variant="secondary"
                aria-label="Swap team posts"
                title="Swap team posts"
                className="size-12 rounded-full bg-white text-[#142018] hover:bg-[#dff15f]"
                onClick={swapPosts}
              >
                <Repeat2 className="size-6" />
              </Button>
            </div>
            <TeamCard team={rightTeam} label="Right Post" post="right" />
          </section>

          <section className="grid gap-3 sm:grid-cols-3">
            <Button
              type="button"
              size="lg"
              className="h-16 rounded-lg bg-[#1f7a3a] text-lg font-black text-white hover:bg-[#17642f]"
              onClick={() => recordGoal("left")}
            >
              <Goal className="size-6" />
              {leftTeam.name} Won
            </Button>
            <Button
              type="button"
              size="lg"
              variant="outline"
              className="h-16 rounded-lg border-2 border-[#142018] bg-white text-lg font-black"
              onClick={recordTimeout}
            >
              <Clock className="size-6" />
              Timeout
            </Button>
            <Button
              type="button"
              size="lg"
              className="h-16 rounded-lg bg-[#d6453d] text-lg font-black text-white hover:bg-[#b9352e]"
              onClick={() => recordGoal("right")}
            >
              <Goal className="size-6" />
              {rightTeam.name} Won
            </Button>
          </section>

          <section className="rounded-lg border border-[#dce6d5] bg-white p-4 shadow-sm">
            <p className="text-xs font-black uppercase tracking-[0.18em] text-[#657163]">
              Last call
            </p>
            <p className="mt-1 text-lg font-black text-[#142018]">{match.lastEvent}</p>
          </section>
        </div>

        <aside className="grid gap-4 lg:sticky lg:top-4 lg:self-start">
          <QueueList
            teams={teams}
            queue={match.queue}
            pendingDrawTeams={match.pendingDrawTeams}
          />

          <section className="rounded-lg border border-[#dce6d5] bg-white p-4 shadow-sm">
            <h2 className="text-lg font-black uppercase">Draw Priority</h2>
            <div className="mt-3 grid gap-2">
              {match.pendingDrawTeams.length ? (
                match.pendingDrawTeams.map((pending) => {
                  const team = teamById.get(pending.teamId);
                  return (
                    <div
                      key={`${pending.teamId}-${pending.post}`}
                      className="flex items-center justify-between rounded-md bg-[#eef4e9] px-3 py-2"
                    >
                      <span className="font-black">{team?.name ?? "Unknown team"}</span>
                      <span className="rounded bg-white px-2 py-1 text-xs font-black uppercase text-[#657163]">
                        {pending.post} post
                      </span>
                    </div>
                  );
                })
              ) : (
                <p className="text-sm font-bold text-[#657163]">
                  No pending draw teams. Queue order is normal.
                </p>
              )}
            </div>
          </section>
        </aside>
      </section>
    </AppShell>
  );
}
