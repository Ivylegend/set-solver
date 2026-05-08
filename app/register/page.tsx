"use client";

import { ArrowLeft, Shuffle, Trash2, UserPlus, Users } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";

import { AppShell } from "@/components/app-shell";
import { Button } from "@/components/ui/button";
import { useSessionStore } from "@/store/session-store";

export default function PlayerRegistrationPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [error, setError] = useState("");
  const {
    players,
    addPlayer,
    removePlayer,
    loadSamplePlayers,
    generateTeams,
  } = useSessionStore();
  const canGenerate = players.length > 0;
  const teamCount = Math.ceil(players.length / 4);
  const partialTeamSize = players.length % 4;

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const wasAdded = addPlayer(name);

    if (!wasAdded) {
      setError(name.trim() ? "That player name is already registered." : "Enter a player name.");
      return;
    }

    setError("");
    setName("");
  }

  function handleGenerateTeams() {
    generateTeams();
    router.push("/teams");
  }

  return (
    <AppShell>
      <header className="flex items-center justify-between gap-3 py-2">
        <Button asChild variant="ghost" size="lg" className="h-11">
          <Link href="/">
            <ArrowLeft className="size-5" />
            Home
          </Link>
        </Button>
        <div className="rounded-md bg-white px-3 py-2 text-sm font-black text-[#142018] shadow-sm">
          {players.length} players
        </div>
      </header>

      <section className="mt-4">
        <h1 className="text-4xl font-black uppercase leading-none sm:text-5xl">
          Register Players
        </h1>
        <p className="mt-3 text-base font-bold text-[#657163]">
          Add names and generate numbered teams. Every group gets 4 players, with
          the final team holding any remaining players.
        </p>
      </section>

      <form className="mt-6 grid gap-3 sm:grid-cols-[1fr_auto]" onSubmit={handleSubmit}>
        <input
          value={name}
          onChange={(event) => {
            setName(event.target.value);
            setError("");
          }}
          placeholder="Player name"
          aria-invalid={Boolean(error)}
          className="h-14 rounded-lg border-2 border-[#dce6d5] bg-white px-4 text-lg font-bold outline-none focus:border-[#1f7a3a] focus:ring-4 focus:ring-[#1f7a3a]/15 aria-invalid:border-[#d6453d] aria-invalid:ring-4 aria-invalid:ring-[#d6453d]/15"
        />
        <Button
          type="submit"
          size="lg"
          className="h-14 rounded-lg bg-[#142018] px-5 text-base font-black text-white"
        >
          <UserPlus className="size-5" />
          Add Player
        </Button>
      </form>

      {error ? (
        <p className="mt-3 rounded-md bg-[#ffe1df] px-3 py-2 text-sm font-black text-[#9d2b25]">
          {error}
        </p>
      ) : null}

      <div className="mt-3 grid gap-3 sm:grid-cols-2">
        <Button
          type="button"
          variant="outline"
          size="lg"
          className="h-12 rounded-lg border-[#cbd9c4] bg-white font-black"
          onClick={loadSamplePlayers}
        >
          <Users className="size-5" />
          Load Sample Players
        </Button>
        <Button
          type="button"
          size="lg"
          className="h-12 rounded-lg bg-[#1f7a3a] font-black text-white hover:bg-[#17642f]"
          disabled={!canGenerate}
          onClick={handleGenerateTeams}
        >
          <Shuffle className="size-5" />
          Generate Teams
        </Button>
      </div>

      {players.length ? (
        <p className="mt-3 rounded-md bg-[#fff4c7] px-3 py-2 text-sm font-bold text-[#665318]">
          This will create {teamCount} team{teamCount === 1 ? "" : "s"}
          {partialTeamSize ? `, with Team ${teamCount} having ${partialTeamSize} player${partialTeamSize === 1 ? "" : "s"}.` : "."}
        </p>
      ) : null}

      <section className="mt-6 grid gap-2 pb-8">
        {players.map((player, index) => (
          <div
            key={player.id}
            className="flex items-center justify-between gap-3 rounded-lg border border-[#dce6d5] bg-white px-4 py-3 shadow-sm"
          >
            <div>
              <p className="text-xs font-black uppercase tracking-[0.16em] text-[#657163]">
                Player #{index + 1}
              </p>
              <p className="text-xl font-black text-[#142018]">{player.name}</p>
            </div>
            <Button
              type="button"
              size="icon-lg"
              variant="destructive"
              aria-label={`Remove ${player.name}`}
              onClick={() => removePlayer(player.id)}
            >
              <Trash2 className="size-5" />
            </Button>
          </div>
        ))}
      </section>
    </AppShell>
  );
}
