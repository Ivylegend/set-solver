"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

import { createSamplePlayers } from "@/lib/sample-data";
import {
  createTeams,
  handleGoalScored,
  handleTimeout,
  startMatch,
} from "@/lib/match-engine";
import type { Player, Post, SessionState } from "@/lib/types";

type SessionStore = SessionState & {
  createSession: () => void;
  addPlayer: (name: string) => boolean;
  removePlayer: (playerId: string) => void;
  loadSamplePlayers: () => void;
  generateTeams: () => void;
  startMatches: () => void;
  recordGoal: (post: Post) => void;
  recordTimeout: () => void;
  resetSession: () => void;
  setTimerDuration: (seconds: number) => void;
};

const initialState: SessionState = {
  id: null,
  name: "Street Football Rotation",
  players: [],
  teams: [],
  unassignedPlayers: [],
  match: null,
  timerDuration: 5 * 60,
};

export const useSessionStore = create<SessionStore>()(
  persist(
    (set, get) => ({
      ...initialState,
      createSession: () =>
        set({
          ...initialState,
          id: crypto.randomUUID(),
        }),
      addPlayer: (name) => {
        const trimmedName = name.trim();
        if (!trimmedName) return false;

        const normalizedName = trimmedName.toLocaleLowerCase();
        const nameExists = get().players.some(
          (player) => player.name.trim().toLocaleLowerCase() === normalizedName,
        );

        if (nameExists) return false;

        const player: Player = {
          id: crypto.randomUUID(),
          name: trimmedName,
        };

        set((state) => ({
          players: [...state.players, player],
          teams: [],
          unassignedPlayers: [],
          match: null,
        }));

        return true;
      },
      removePlayer: (playerId) =>
        set((state) => ({
          players: state.players.filter((player) => player.id !== playerId),
          teams: [],
          unassignedPlayers: [],
          match: null,
        })),
      loadSamplePlayers: () =>
        set({
          players: createSamplePlayers(),
          teams: [],
          unassignedPlayers: [],
          match: null,
        }),
      generateTeams: () => {
        const generated = createTeams(get().players);
        set({
          teams: generated.teams,
          unassignedPlayers: generated.unassignedPlayers,
          match: null,
        });
      },
      startMatches: () => {
        const { teams } = get();
        if (teams.length < 2) return;
        set({ match: startMatch(teams) });
      },
      recordGoal: (post) =>
        set((state) => ({
          teams: state.teams.map((team) => {
            const winningTeamId =
              post === "left" ? state.match?.leftTeamId : state.match?.rightTeamId;
            return team.id === winningTeamId
              ? { ...team, wins: team.wins + 1 }
              : team;
          }),
          match: state.match ? handleGoalScored(state.match, post) : null,
        })),
      recordTimeout: () =>
        set((state) => ({
          match: state.match ? handleTimeout(state.match) : null,
        })),
      resetSession: () => set(initialState),
      setTimerDuration: (seconds) =>
        set({ timerDuration: Math.max(60, Math.min(seconds, 30 * 60)) }),
    }),
    {
      name: "street-football-session",
      partialize: (state) => ({
        id: state.id,
        name: state.name,
        players: state.players,
        teams: state.teams,
        unassignedPlayers: state.unassignedPlayers,
        match: state.match,
        timerDuration: state.timerDuration,
      }),
    },
  ),
);
