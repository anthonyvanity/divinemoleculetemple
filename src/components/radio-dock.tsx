import { Pause, Play, SkipBack, SkipForward, X } from "lucide-react";
import { useEffect, useRef } from "react";
import { Link } from "@tanstack/react-router";
import { currentTransmission, useRadio, withHouseAudio } from "@/lib/radio-store";
import { listHouseAudio } from "@/lib/temple-admin";

function fmt(n: number) {
  if (!Number.isFinite(n) || n < 0) return "0:00";
  const m = Math.floor(n / 60);
  const s = Math.floor(n % 60);
  return `${m}:${String(s).padStart(2, "0")}`;
}

export function RadioDock() {
  const tracks = useRadio((s) => s.tracks);
  const setTracks = useRadio((s) => s.setTracks);
  const index = useRadio((s) => s.index);
  const playing = useRadio((s) => s.playing);
  const progress = useRadio((s) => s.progress);
  const duration = useRadio((s) => s.duration);
  const toggle = useRadio((s) => s.toggle);
  const next = useRadio((s) => s.next);
  const prev = useRadio((s) => s.prev);
  const stop = useRadio((s) => s.stop);
  const setProgress = useRadio((s) => s.setProgress);
  const setDuration = useRadio((s) => s.setDuration);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const track = tracks[index] ?? tracks[0] ?? currentTransmission(0);

  useEffect(() => {
    void listHouseAudio()
      .then((rows: { id: string; title: string; path_label: string }[]) => {
        setTracks(withHouseAudio(rows));
      })
      .catch(() => {});
  }, [setTracks]);
  const open = playing || progress > 0;

  useEffect(() => {
    document.documentElement.style.paddingTop = open ? "calc(4.5rem + env(safe-area-inset-top))" : "";
    return () => {
      document.documentElement.style.paddingTop = "";
    };
  }, [open]);

  useEffect(() => {
    const el = audioRef.current;
    if (!el) return;
    if (el.src !== new URL(track.src, window.location.origin).href) {
      el.src = track.src;
    }
    if (playing) void el.play().catch(() => useRadio.setState({ playing: false }));
    else el.pause();
  }, [playing, index, track.src]);

  return (
    <>
      <audio
        ref={audioRef}
        preload="auto"
        loop
        onTimeUpdate={(e) => setProgress(e.currentTarget.currentTime)}
        onLoadedMetadata={(e) => setDuration(e.currentTarget.duration || 0)}
      />
      {open ? (
        <div className="fixed inset-x-0 top-0 z-[70] border-b border-lime/40 bg-ink/95 pt-[env(safe-area-inset-top)] text-paper backdrop-blur-xl">
          <label className="block">
            <span className="sr-only">Seek</span>
            <input
              type="range"
              min={0}
              max={duration || 0}
              step={0.1}
              value={Math.min(progress, duration || 0)}
              onChange={(e) => {
                const t = Number(e.target.value);
                const el = audioRef.current;
                if (el) el.currentTime = t;
                setProgress(t);
              }}
              className="h-1 w-full accent-lime"
            />
          </label>
          <div className="mx-auto flex max-w-5xl items-center gap-2 px-3 py-1.5">
            <button type="button" onClick={prev} className="grid size-11 place-items-center" aria-label="Previous">
              <SkipBack className="size-4" />
            </button>
            <button
              type="button"
              onClick={toggle}
              className="grid size-11 place-items-center bg-lime text-ink"
              aria-label={playing ? "Pause" : "Play"}
            >
              {playing ? <Pause className="size-4" /> : <Play className="size-4" />}
            </button>
            <button type="button" onClick={next} className="grid size-11 place-items-center" aria-label="Next">
              <SkipForward className="size-4" />
            </button>
            <Link to="/transmissions" className="min-w-0 flex-1">
              <p className="truncate text-micro tracking-wide text-lime">
                {track.path} · {fmt(progress)} / {fmt(duration || 0)}
              </p>
              <p className="truncate font-display text-sm leading-tight">{track.title}</p>
            </Link>
            <p className="hidden text-micro tracking-wide text-paper/40 sm:block">
              {index + 1}/{tracks.length}
            </p>
            <button type="button" onClick={stop} className="grid size-11 place-items-center" aria-label="Stop">
              <X className="size-4" />
            </button>
          </div>
        </div>
      ) : null}
    </>
  );
}
