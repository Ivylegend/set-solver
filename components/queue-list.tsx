import type { PendingDrawTeam, Team } from "@/lib/types";

type QueueListProps = {
  teams: Team[];
  queue: string[];
  pendingDrawTeams?: PendingDrawTeam[];
};

export function QueueList({ teams, queue, pendingDrawTeams = [] }: QueueListProps) {
  const byId = new Map(teams.map((team) => [team.id, team]));

  return (
    <section className="rounded-lg border-2 border-[#142018] bg-[#142018] p-4 text-white shadow-md">
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-2xl font-black uppercase leading-none">Next Up</h2>
        <span className="rounded-md bg-white px-2 py-1 text-sm font-black text-[#142018]">
          {queue.length} waiting
        </span>
      </div>
      <div className="mt-4 grid gap-2">
        {queue.length ? (
          queue.map((teamId, index) => {
            const team = byId.get(teamId);
            const pending = pendingDrawTeams.find(
              (pendingTeam) => pendingTeam.teamId === teamId,
            );

            return (
              <div
                key={`${teamId}-${index}`}
                className="flex items-center justify-between gap-3 rounded-md bg-white/10 px-3 py-3"
              >
                <div>
                  <p className="text-xs font-black uppercase tracking-[0.16em] text-[#b8c9b1]">
                    Queue #{index + 1}
                  </p>
                  <p className="text-xl font-black">{team?.name ?? "Unknown team"}</p>
                </div>
                {pending ? (
                  <span className="rounded-md bg-[#f4c542] px-2 py-1 text-xs font-black uppercase text-[#142018]">
                    {pending.post} post
                  </span>
                ) : null}
              </div>
            );
          })
        ) : (
          <p className="rounded-md bg-white/10 px-3 py-4 text-sm font-bold text-[#d8e6d2]">
            No teams waiting. Add more players or finish the current set.
          </p>
        )}
      </div>
    </section>
  );
}
