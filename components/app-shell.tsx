import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

type AppShellProps = {
  children: ReactNode;
  className?: string;
};

export function AppShell({ children, className }: AppShellProps) {
  return (
    <main
      className={cn(
        "min-h-dvh bg-[#f7f8f3] text-[#142018]",
        "bg-[linear-gradient(180deg,#f7f8f3_0%,#edf4e8_42%,#f7f8f3_100%)]",
        className,
      )}
    >
      <div className="mx-auto flex min-h-dvh w-full max-w-5xl flex-col px-4 py-5 sm:px-6 lg:px-8">
        {children}
      </div>
    </main>
  );
}
