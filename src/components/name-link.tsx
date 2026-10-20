import { Link } from "@tanstack/react-router";
import type { CSSProperties, ReactNode } from "react";
import { CHANCELLOR_ID, HIGH_PRIEST_ID } from "@/lib/house";

export function NameLink({
  userId,
  className,
  style,
  children,
}: {
  userId: string;
  className?: string;
  style?: CSSProperties;
  children: ReactNode;
}) {
  if (userId === HIGH_PRIEST_ID) {
    return (
      <Link to="/HighPriest" className={className} style={style}>
        {children}
      </Link>
    );
  }
  if (userId === CHANCELLOR_ID) {
    return (
      <Link to="/ChancellorMonday" className={className} style={style}>
        {children}
      </Link>
    );
  }
  return (
    <Link to="/member/$userId" params={{ userId }} className={className} style={style}>
      {children}
    </Link>
  );
}
