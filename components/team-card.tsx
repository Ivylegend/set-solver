import { Trophy } from "lucide-react";

import type { Team } from "@/lib/types";
import { cn } from "@/lib/utils";

type TeamCardProps = {
  team: Team;
  label?: string;
  post?: "left" | "right";
  compact?: boolean;
  className?: string;
};

export function TeamCard({ team, label, post, compact, className }: TeamCardProps) {
  return (
    <section
      className={cn(
        "rounded-lg border border-[#dce6d5] bg-white p-4 shadow-sm",
        post === "left" && "border-l-8 border-l-[#1f7a3a]",
        post === "right" && "border-r-8 border-r-[#d6453d]",
        className,
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          {label ? (
            <p className="text-xs font-black uppercase tracking-[0.18em] text-[#657163]">
              {label}
            </p>
          ) : null}
          <h2
            className={cn(
              "mt-1 font-black uppercase leading-none text-[#142018]",
              compact ? "text-xl" : "text-3xl sm:text-4xl",
            )}
          >
            {team.name}
          </h2>
        </div>
        <div className="flex min-w-14 items-center justify-center gap-1 rounded-md bg-[#142018] px-2 py-1 text-sm font-black text-white">
          <Trophy className="size-4 text-[#f4c542]" />
          {team.wins}
        </div>
      </div>
      <ul className={cn("mt-4 grid gap-2", compact ? "grid-cols-2" : "grid-cols-1")}>
        {team.players.map((player) => (
          <li
            key={player.id}
            className="rounded-md bg-[#eef4e9] px-3 py-2 text-base font-bold text-[#243126]"
          >
            {player.name}
          </li>
        ))}
      </ul>
    </section>
  );
}
