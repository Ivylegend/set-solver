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
  swapPosts: () => void;
  recordGoal: (post: Post) => void;
  recordTimeout: () => void;
  resetSession: () => void;
  setTimerDuration: (seconds: number) => void;
  prepareTimer: (matchKey: string, duration: number) => void;
  startTimer: () => void;
  pauseTimer: (remainingSeconds: number) => void;
  resetTimer: () => void;
  finishTimer: () => void;
};

const initialState: SessionState = {
  id: null,
  name: "Street Football Rotation",
  players: [],
  teams: [],
  unassignedPlayers: [],
  match: null,
  matchHistory: [],
  timer: {
    matchKey: null,
    durationSeconds: 5 * 60,
    remainingSeconds: 5 * 60,
    isRunning: false,
    startedAt: null,
  },
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
          matchHistory: [],
          timer: initialState.timer,
        }));

        return true;
      },
      removePlayer: (playerId) =>
        set((state) => ({
          players: state.players.filter((player) => player.id !== playerId),
          teams: [],
          unassignedPlayers: [],
          match: null,
          matchHistory: [],
          timer: initialState.timer,
        })),
      loadSamplePlayers: () =>
        set({
          players: createSamplePlayers(),
          teams: [],
          unassignedPlayers: [],
          match: null,
          matchHistory: [],
          timer: initialState.timer,
        }),
      generateTeams: () => {
        const generated = createTeams(get().players);
        set({
          teams: generated.teams,
          unassignedPlayers: generated.unassignedPlayers,
          match: null,
          matchHistory: [],
          timer: initialState.timer,
        });
      },
      startMatches: () => {
        const { teams } = get();
        if (teams.length < 2) return;
        set({ match: startMatch(teams) });
      },
      swapPosts: () =>
        set((state) => ({
          match: state.match
            ? {
                ...state.match,
                leftTeamId: state.match.rightTeamId,
                rightTeamId: state.match.leftTeamId,
                lastEvent: "Teams swapped posts. Queue order did not change.",
              }
            : null,
        })),
      recordGoal: (post) =>
        set((state) => {
          const winningTeamId =
            post === "left" ? state.match?.leftTeamId : state.match?.rightTeamId;

          return {
            teams: state.teams.map((team) =>
              team.id === winningTeamId ? { ...team, wins: team.wins + 1 } : team,
            ),
            matchHistory: state.match
              ? [
                  ...state.matchHistory,
                  {
                    id: crypto.randomUUID(),
                    matchNumber: state.match.matchNumber,
                    leftTeamId: state.match.leftTeamId,
                    rightTeamId: state.match.rightTeamId,
                    winnerTeamId: winningTeamId ?? null,
                    result: "goal",
                    decidedPost: post,
                    createdAt: new Date().toISOString(),
                  },
                ]
              : state.matchHistory,
            match: state.match ? handleGoalScored(state.match, post) : null,
          };
        }),
      recordTimeout: () =>
        set((state) => ({
          matchHistory: state.match
            ? [
                ...state.matchHistory,
                {
                  id: crypto.randomUUID(),
                  matchNumber: state.match.matchNumber,
                  leftTeamId: state.match.leftTeamId,
                  rightTeamId: state.match.rightTeamId,
                  winnerTeamId: null,
                  result: "timeout",
                  decidedPost: null,
                  createdAt: new Date().toISOString(),
                },
              ]
            : state.matchHistory,
          match: state.match ? handleTimeout(state.match) : null,
        })),
      resetSession: () => set(initialState),
      setTimerDuration: (seconds) =>
        set({ timerDuration: Math.max(60, Math.min(seconds, 30 * 60)) }),
      prepareTimer: (matchKey, duration) =>
        set((state) => {
          if (
            state.timer.matchKey === matchKey &&
            state.timer.durationSeconds === duration
          ) {
            return {};
          }

          return {
            timer: {
              matchKey,
              durationSeconds: duration,
              remainingSeconds: duration,
              isRunning: false,
              startedAt: null,
            },
          };
        }),
      startTimer: () =>
        set((state) => ({
          timer: {
            ...state.timer,
            remainingSeconds:
              state.timer.remainingSeconds <= 0
                ? state.timer.durationSeconds
                : state.timer.remainingSeconds,
            isRunning: true,
            startedAt: Date.now(),
          },
        })),
      pauseTimer: (remainingSeconds) =>
        set((state) => ({
          timer: {
            ...state.timer,
            remainingSeconds,
            isRunning: false,
            startedAt: null,
          },
        })),
      resetTimer: () =>
        set((state) => ({
          timer: {
            ...state.timer,
            remainingSeconds: state.timer.durationSeconds,
            isRunning: false,
            startedAt: null,
          },
        })),
      finishTimer: () =>
        set((state) => ({
          timer: {
            ...state.timer,
            remainingSeconds: 0,
            isRunning: false,
            startedAt: null,
          },
        })),
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
        matchHistory: state.matchHistory,
        timer: state.timer,
        timerDuration: state.timerDuration,
      }),
    },
  ),
);
