import { ChevronRight } from "lucide-react";
import { useEffect, useState } from "react";
import { finishTour, tourPending } from "@/lib/first-tour";

const COPY = {
  desk: {
    k: "01",
    title: "Your desk",
    body: "This is the dashboard. Progress, class notes, and the seven days live here.",
    href: "/profile?tour=1",
    label: "Next, your profile",
  },
  profile: {
    k: "02",
    title: "Your name",
    body: "This is your profile. The picture, the handle, and your friends. Change the face whenever you want.",
    href: "/awakening",
    label: "Open the seven days",
  },
} as const;

export function FirstTour({ where }: { where: keyof typeof COPY }) {
  const [show, setShow] = useState(false);
  const step = COPY[where];

  useEffect(() => {
    setShow(tourPending());
  }, []);

  if (!show) return null;

  return (
    <div className="fixed inset-x-0 bottom-0 z-40 px-3 pb-3">
      <div className="mx-auto flex max-w-xl items-center gap-4 border border-lime bg-ink px-4 py-3 text-paper shadow-[0_12px_40px_rgba(0,0,0,0.45)]">
        <div className="min-w-0 flex-1">
          <p className="text-[10px] tracking-[0.22em] text-lime">{step.k} / 02</p>
          <p className="mt-1 text-[14px] font-semibold">{step.title}</p>
          <p className="mt-1 text-[13px] leading-snug text-paper/75">{step.body}</p>
          <button
            type="button"
            className="mt-2 text-[10px] tracking-[0.16em] text-paper/40"
            onClick={() => {
              finishTour();
              setShow(false);
            }}
          >
            Not now
          </button>
        </div>
        <a
          href={step.href}
          aria-label={step.label}
          onClick={() => {
            if (where === "profile") finishTour();
          }}
          className="grid size-10 shrink-0 place-items-center bg-lime text-ink"
        >
          <ChevronRight className="size-5" />
        </a>
      </div>
    </div>
  );
}
