import { Link } from "@tanstack/react-router";
import {
  Atom,
  Crown,
  Eye,
  Flame,
  GraduationCap,
  Home,
  KeyRound,
  Library,
  Moon,
  Radio,
  Rocket,
  Share2,
  ShoppingBag,
  Sparkles,
  Users,
  type LucideIcon,
} from "lucide-react";
import type { ReactNode } from "react";
import { Button } from "@/components/ui/button";
import type { Tone } from "@/lib/temple-content";
import { cn } from "@/lib/utils";

const ICONS: Record<string, LucideIcon> = {
  Eye,
  Flame,
  GraduationCap,
  Home,
  KeyRound,
  Share2,
  ShoppingBag,
  Users,
  Library,
  Atom,
  Moon,
  Rocket,
  Crown,
  Sparkles,
  Radio,
};

export const TONE_CLASS: Record<Tone, string> = {
  lime: "bg-lime text-ink",
  orange: "bg-orange text-ink",
  cyan: "bg-cyan text-ink",
  ink: "bg-ink text-paper",
  pink: "bg-pink text-ink",
  lilac: "bg-lilac text-ink",
  canary: "bg-canary text-ink",
};

export const TONE_TITLE: Record<Tone, string> = {
  lime: "text-lime",
  orange: "text-orange",
  cyan: "text-cyan",
  ink: "text-paper",
  pink: "text-pink",
  lilac: "text-lilac",
  canary: "text-canary",
};

export const TONE_GHOST: Record<Tone, string> = {
  lime: "text-ink/40",
  orange: "text-ink/40",
  cyan: "text-ink/35",
  ink: "text-paper/20",
  pink: "text-ink/35",
  lilac: "text-ink/35",
  canary: "text-ink/40",
};

export const TONE_MUTED: Record<Tone, string> = {
  lime: "text-ink/85",
  orange: "text-ink/85",
  cyan: "text-ink/85",
  ink: "text-paper/85",
  pink: "text-ink/85",
  lilac: "text-ink/85",
  canary: "text-ink/85",
};

export function ChamberIcon({ name, className }: { name: string; className?: string }) {
  const Icon = ICONS[name] ?? Flame;
  return <Icon className={className} strokeWidth={1.6} />;
}

export function SentenceLines({ text }: { text: string }) {
  const lines = text
    .split(/\n+/)
    .flatMap((chunk) => chunk.split(/(?<=\.)\s+/))
    .map((line) => line.trim())
    .filter(Boolean);
  if (lines.length < 2) return text;
  return lines.map((line, i) => (
    <span key={`${i}-${line}`} className="block">
      {line}
    </span>
  ));
}

export function ChamberHero({
  tone,
  icon,
  kicker,
  title,
  lede,
  to,
  cta,
  children,
  className,
  compact,
  ghost = true,
  iconClassName,
  titleClassName,
  ledeClassName,
}: {
  tone: Tone;
  icon?: string;
  kicker?: string;
  title: string;
  lede?: string;
  to?: string;
  cta?: string;
  children?: ReactNode;
  className?: string;
  compact?: boolean;
  ghost?: boolean;
  iconClassName?: string;
  titleClassName?: string;
  ledeClassName?: string;
}) {
  const onDark = true;
  void ghost;
  return (
    <section
      className={cn(
        "relative flex scroll-mt-[var(--header-h,11rem)] overflow-visible bg-ink text-paper",
        className,
      )}
    >
      <div
        className={cn(
          "relative mx-auto flex w-full max-w-3xl flex-col items-center justify-center overflow-visible px-6 text-center",
          compact ? "pb-8 pt-20" : "px-6 pb-12 pt-36 sm:pt-40",
        )}
      >
        {icon ? (
          <ChamberIcon name={icon} className={cn("size-5 shrink-0", TONE_TITLE[tone], iconClassName)} />
        ) : null}
        {kicker ? (
          <p className="chamber-kicker mt-3 text-[10px] font-medium uppercase tracking-wide text-paper/70">
            <SentenceLines text={kicker} />
          </p>
        ) : null}
        <h1
          className={cn(
            "w-full max-w-full overflow-visible px-1 font-display uppercase leading-[0.86] tracking-tight",
            TONE_TITLE[tone],
            compact ? "mt-3 text-[clamp(1.15rem,5vw,2rem)]" : "mt-4 text-[clamp(1.5rem,5vw,2.8rem)]",
            titleClassName,
          )}
        >
          <SentenceLines text={title} />
        </h1>
        {lede ? (
          <p
            className={cn(
              "max-w-xl font-mono font-normal normal-case leading-[1.45] tracking-normal text-paper/70",
              compact ? "mt-3 text-[10px]" : "mt-5 text-[10px] sm:text-[11px]",
              ledeClassName,
            )}
          >
            <SentenceLines text={lede} />
          </p>
        ) : null}
        {to && cta ? (
          <Button asChild className="mt-10" variant={onDark ? "dark" : "default"}>
            <Link to={to}>{cta}</Link>
          </Button>
        ) : null}
        {children}
      </div>
    </section>
  );
}

export function SectionKicker({ children, className }: { children: ReactNode; className?: string }) {
  return <p className={cn("text-micro font-medium uppercase tracking-wide text-lime", className)}>{children}</p>;
}
