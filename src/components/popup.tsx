import { useNavigate } from "@tanstack/react-router";
import { X } from "lucide-react";
import { useEffect, type ReactNode } from "react";

export function Popup({ children }: { children: ReactNode }) {
  const navigate = useNavigate();

  function close() {
    if (window.history.length > 1) window.history.back();
    else void navigate({ to: "/" });
  }

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") close();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  return (
    <div
      className="fixed inset-0 z-[80] overflow-y-auto bg-black/80 px-4 py-16"
      onClick={close}
    >
      <button
        type="button"
        aria-label="Close"
        onClick={(e) => {
          e.stopPropagation();
          close();
        }}
        className="fixed right-3 top-[max(0.75rem,env(safe-area-inset-top))] z-[81] grid size-11 place-items-center text-paper"
      >
        <X className="size-6" strokeWidth={1.6} />
      </button>
      <div className="mx-auto w-full max-w-5xl" onClick={(e) => e.stopPropagation()}>
        {children}
      </div>
    </div>
  );
}
