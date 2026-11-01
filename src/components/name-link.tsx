import { Link } from "@tanstack/react-router";
import type { CSSProperties, ReactNode } from "react";
import { CHANCELLOR_ID, HIGH_PRIEST_ID, type TempleRank } from "@/lib/house";

export function RankFlame({ className = "inline-block h-4 w-auto align-[-0.2em]" }: { className?: string }) {
  return <img src="/rank-flame.png" alt="" className={className} />;
}

export function NameLink({
  userId,
  className,
  style,
  children,
  rank = "",
}: {
  userId: string;
  className?: string;
  style?: CSSProperties;
  children: ReactNode;
  rank?: TempleRank;
}) {
  const verified = rank || (userId === HIGH_PRIEST_ID ? "high-priest" : userId === CHANCELLOR_ID ? "chancellor" : "");
  const body = (
    <>
      {children}
      {verified ? <RankFlame className="ml-1 inline-block h-3.5 w-auto align-[-0.15em]" /> : null}
    </>
  );
  if (userId === HIGH_PRIEST_ID) {
    return (
      <Link to="/HighPriest" className={className} style={style}>
        {body}
      </Link>
    );
  }
  if (userId === CHANCELLOR_ID) {
    return (
      <Link to="/ChancellorMonday" className={className} style={style}>
        {body}
      </Link>
    );
  }
  return (
    <Link to="/member/$userId" params={{ userId }} className={className} style={style}>
      {body}
    </Link>
  );
}
