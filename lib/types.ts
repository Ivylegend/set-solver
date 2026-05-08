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

export type SessionState = {
  id: string | null;
  name: string;
  players: Player[];
  teams: Team[];
  unassignedPlayers: Player[];
  match: MatchState | null;
  timerDuration: number;
};
