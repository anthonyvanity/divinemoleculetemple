import { createFileRoute } from "@tanstack/react-router";
import { CosDesk } from "@/components/cos-desk";
import { displayHandle, useTemple } from "@/lib/temple-store";

export const Route = createFileRoute("/leaderboard")({ component: LeaderboardPage });

function LeaderboardPage() {
  return (
    <CosDesk>
      <Board />
    </CosDesk>
  );
}

function Board() {
  const handle = useTemple((s) => s.handle);
  const flameName = useTemple((s) => s.flameName);
  const read = useTemple((s) => s.read);
  const name = displayHandle(handle, flameName);
  return (
    <div className="p-6">
      <p className="text-[9px] tracking-[0.2em]" style={{ color: "var(--desk-muted)" }}>
        Field ranking
      </p>
      <h1 className="mt-2 font-display text-3xl">Leaderboard</h1>
      <p className="mt-3 max-w-lg text-sm" style={{ color: "var(--desk-muted)" }}>
        Standing is measured by study, not noise. The board fills as more operators seal nodes.
      </p>
      <ul className="mt-8 divide-y border" style={{ borderColor: "var(--desk-line)" }}>
        <li className="flex items-center justify-between px-4 py-4">
          <span>
            <span className="text-[10px] tracking-[0.16em]" style={{ color: "var(--desk-accent)" }}>
              01
            </span>
            <span className="ml-4 font-display">{name}</span>
          </span>
          <span className="text-[11px] tracking-[0.16em]" style={{ color: "var(--desk-muted)" }}>
            {read.length} nodes sealed
          </span>
        </li>
      </ul>
    </div>
  );
}
