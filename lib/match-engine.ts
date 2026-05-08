import type { MatchState, PendingDrawTeam, Player, Post, Team } from "@/lib/types";

const TEAM_SIZE = 4;

function shuffle<T>(items: T[]) {
  const copy = [...items];

  for (let index = copy.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(Math.random() * (index + 1));
    [copy[index], copy[swapIndex]] = [copy[swapIndex], copy[index]];
  }

  return copy;
}

export function createTeams(players: Player[]) {
  const randomizedPlayers = shuffle(players);
  const teamCount = Math.ceil(randomizedPlayers.length / TEAM_SIZE);
  const teams: Team[] = [];

  for (let index = 0; index < teamCount; index += 1) {
    const start = index * TEAM_SIZE;
    teams.push({
      id: crypto.randomUUID(),
      name: `Team ${index + 1}`,
      players: randomizedPlayers.slice(start, start + TEAM_SIZE),
      wins: 0,
    });
  }

  return {
    teams,
    unassignedPlayers: [],
  };
}

export function startMatch(teams: Team[]): MatchState {
  return {
    leftTeamId: teams[0]?.id ?? null,
    rightTeamId: teams[1]?.id ?? null,
    queue: teams.slice(2).map((team) => team.id),
    pendingDrawTeams: [],
    matchNumber: 1,
    lastEvent: "Opening match is ready.",
  };
}

function removePendingTeam(pendingDrawTeams: PendingDrawTeam[], teamId: string) {
  return pendingDrawTeams.filter((pending) => pending.teamId !== teamId);
}

export function applyPostPriorityRule(
  post: Post,
  queue: string[],
  pendingDrawTeams: PendingDrawTeam[],
) {
  const priorityTeam = pendingDrawTeams.find(
    (pending) => pending.post === post && queue.includes(pending.teamId),
  );

  if (!priorityTeam) {
    const [teamId, ...nextQueue] = queue;
    return {
      teamId: teamId ?? null,
      queue: nextQueue,
      pendingDrawTeams: teamId
        ? removePendingTeam(pendingDrawTeams, teamId)
        : pendingDrawTeams,
      usedPriority: false,
    };
  }

  return {
    teamId: priorityTeam.teamId,
    queue: queue.filter((teamId) => teamId !== priorityTeam.teamId),
    pendingDrawTeams: removePendingTeam(pendingDrawTeams, priorityTeam.teamId),
    usedPriority: true,
  };
}

function takeNextQueueTeam(queue: string[], pendingDrawTeams: PendingDrawTeam[]) {
  const [teamId, ...nextQueue] = queue;

  return {
    teamId: teamId ?? null,
    queue: nextQueue,
    pendingDrawTeams: teamId
      ? removePendingTeam(pendingDrawTeams, teamId)
      : pendingDrawTeams,
  };
}

export function getNextTeams(
  queue: string[],
  pendingDrawTeams: PendingDrawTeam[],
) {
  const left = takeNextQueueTeam(queue, pendingDrawTeams);
  const right = takeNextQueueTeam(left.queue, left.pendingDrawTeams);

  return {
    leftTeamId: left.teamId,
    rightTeamId: right.teamId,
    queue: right.queue,
    pendingDrawTeams: right.pendingDrawTeams,
  };
}

export function handleGoalScored(
  match: MatchState,
  scoringPost: Post,
): MatchState {
  const winnerId = scoringPost === "left" ? match.leftTeamId : match.rightTeamId;
  const loserId = scoringPost === "left" ? match.rightTeamId : match.leftTeamId;
  const openPost: Post = scoringPost === "left" ? "right" : "left";
  const queueWithLoser = loserId ? [...match.queue, loserId] : [...match.queue];
  const next = applyPostPriorityRule(
    openPost,
    queueWithLoser,
    match.pendingDrawTeams,
  );

  const priorityNote = next.usedPriority
    ? " Post priority was applied for the open side."
    : "";

  return {
    leftTeamId: scoringPost === "left" ? winnerId : next.teamId,
    rightTeamId: scoringPost === "right" ? winnerId : next.teamId,
    queue: next.queue,
    pendingDrawTeams: next.pendingDrawTeams,
    matchNumber: match.matchNumber + 1,
    lastEvent: `${scoringPost === "left" ? "Left" : "Right"} team scored. Winner stays.${priorityNote}`,
  };
}

export function handleTimeout(match: MatchState): MatchState {
  const pendingDrawTeams: PendingDrawTeam[] = [
    ...match.pendingDrawTeams,
    ...(match.leftTeamId ? [{ teamId: match.leftTeamId, post: "left" as const }] : []),
    ...(match.rightTeamId ? [{ teamId: match.rightTeamId, post: "right" as const }] : []),
  ];
  const queueWithDrawnTeams = [
    ...match.queue,
    ...(match.leftTeamId ? [match.leftTeamId] : []),
    ...(match.rightTeamId ? [match.rightTeamId] : []),
  ];
  const next = getNextTeams(queueWithDrawnTeams, pendingDrawTeams);

  return {
    leftTeamId: next.leftTeamId,
    rightTeamId: next.rightTeamId,
    queue: next.queue,
    pendingDrawTeams: next.pendingDrawTeams,
    matchNumber: match.matchNumber + 1,
    lastEvent: "Timeout/draw. Both teams left and normal queue order selected the next match.",
  };
}

export function advanceQueue(queue: string[], teamId: string) {
  return [...queue.filter((queuedId) => queuedId !== teamId), teamId];
}
