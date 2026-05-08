export type Post = "left" | "right";

export type Player = {
  id: string;
  name: string;
};

export type Team = {
  id: string;
  name: string;
  players: Player[];
  wins: number;
};

export type PendingDrawTeam = {
  teamId: string;
  post: Post;
};

export type MatchState = {
  leftTeamId: string | null;
  rightTeamId: string | null;
  queue: string[];
  pendingDrawTeams: PendingDrawTeam[];
  matchNumber: number;
  lastEvent: string;
};

export type MatchHistoryEntry = {
  id: string;
  matchNumber: number;
  leftTeamId: string | null;
  rightTeamId: string | null;
  winnerTeamId: string | null;
  result: "goal" | "timeout";
  decidedPost: Post | null;
  createdAt: string;
};

export type MatchTimerState = {
  matchKey: string | null;
  durationSeconds: number;
  remainingSeconds: number;
  isRunning: boolean;
  startedAt: number | null;
};

export type SessionState = {
  id: string | null;
  name: string;
  players: Player[];
  teams: Team[];
  unassignedPlayers: Player[];
  match: MatchState | null;
  matchHistory: MatchHistoryEntry[];
  timer: MatchTimerState;
  timerDuration: number;
};
