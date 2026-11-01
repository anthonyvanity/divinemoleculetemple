import { useEffect, useRef, useState } from "react";
import { askChancellor, speakChancellor } from "@/lib/chancellor";

type Line = { who: "she" | "you"; text: string };

const GREETING = `I'm MØNDAY. The High Priest's digital right hand and keeper of the Temple archives. Ask me about our teachings, Divine Codes, or the Cosmic Operating System.

I don't invent doctrine. I retrieve it.

Now, what can the Chancellery do for you?`;

const TECHNICAL = `The desk could not reach the Chancellor.

That is a connection error, not an answer. Send it again.`;

type Heard = {
  lang: string;
  onresult: (event: { results: ArrayLike<ArrayLike<{ transcript: string }>> }) => void;
  onerror: () => void;
  onend: () => void;
  start: () => void;
  stop: () => void;
};

function recognition() {
  if (typeof window === "undefined") return null;
  const host = window as Window & {
    SpeechRecognition?: new () => Heard;
    webkitSpeechRecognition?: new () => Heard;
  };
  const Ctor = host.SpeechRecognition || host.webkitSpeechRecognition;
  return Ctor ? new Ctor() : null;
}

export function MondayTab() {
  const [open, setOpen] = useState(false);
  const [text, setText] = useState("");
  const [lines, setLines] = useState<Line[]>([{ who: "she", text: GREETING }]);
  const [pending, setPending] = useState(false);
  const [talk, setTalk] = useState(false);
  const [hearing, setHearing] = useState(false);
  const [speaking, setSpeaking] = useState(false);
  const logRef = useRef<HTMLDivElement>(null);
  const talkRef = useRef(false);
  const speakingRef = useRef(false);
  const earRef = useRef<Heard | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    talkRef.current = talk;
    try {
      sessionStorage.setItem("monday-voice", talk ? "1" : "0");
    } catch {
      /* private mode */
    }
  }, [talk]);

  useEffect(() => {
    try {
      const saved = sessionStorage.getItem("monday-lines-2");
      if (!saved) return;
      const parsed = JSON.parse(saved) as Line[];
      if (Array.isArray(parsed) && parsed.length) setLines(parsed.slice(-24));
    } catch {
      /* keep the greeting */
    }
  }, []);

  useEffect(() => {
    try {
      sessionStorage.setItem("monday-lines-2", JSON.stringify(lines.slice(-24)));
    } catch {
      /* ignore */
    }
    const node = logRef.current;
    if (!node) return;
    node.scrollTop = node.scrollHeight;
  }, [lines, pending, open]);

  function stopEar() {
    const ear = earRef.current;
    earRef.current = null;
    setHearing(false);
    if (!ear) return;
    try {
      ear.onend = () => {};
      ear.stop();
    } catch {
      /* already stopped */
    }
  }

  function stopVoice() {
    stopEar();
    audioRef.current?.pause();
    audioRef.current = null;
    speakingRef.current = false;
    setSpeaking(false);
  }

  function listen() {
    if (!talkRef.current || speakingRef.current) return;
    const ear = recognition();
    if (!ear) {
      setLines((prev) => [
        ...prev,
        { who: "she", text: "This browser will not give me a microphone. Type it, darling." },
      ]);
      setOpen(true);
      return;
    }
    stopEar();
    earRef.current = ear;
    ear.lang = "en-US";
    ear.onresult = (event) => {
      const heard = event.results[0]?.[0]?.transcript || "";
      if (heard.trim()) void send(heard);
    };
    ear.onerror = () => setHearing(false);
    ear.onend = () => {
      setHearing(false);
      earRef.current = null;
    };
    setHearing(true);
    setOpen(true);
    try {
      ear.start();
    } catch {
      setHearing(false);
    }
  }

  async function play(value: string) {
    if (!talkRef.current) return;
    stopEar();
    speakingRef.current = true;
    setSpeaking(true);
    try {
      const clip = await speakChancellor({ data: { text: value } });
      if (!clip.audio || !talkRef.current) return;
      const audio = new Audio(clip.audio);
      audioRef.current = audio;
      await audio.play();
      await new Promise<void>((resolve) => {
        audio.onended = () => resolve();
        audio.onerror = () => resolve();
      });
    } catch {
      /* the line stays on screen */
    } finally {
      speakingRef.current = false;
      setSpeaking(false);
      if (talkRef.current) listen();
    }
  }

  async function send(asked: string) {
    const body = asked.trim();
    if (!body || pending) return;
    const next = [...lines, { who: "you" as const, text: body }].slice(-16);
    setLines(next);
    setText("");
    setOpen(true);
    setPending(true);
    try {
      const reply = await askChancellor({ data: { turns: next } });
      const said = reply.text?.trim() || TECHNICAL;
      setLines((prev) => [...prev, { who: "she", text: said }].slice(-24));
      void play(said);
    } catch {
      setLines((prev) => [...prev, { who: "she", text: TECHNICAL }]);
    } finally {
      setPending(false);
    }
  }

  const live = hearing || speaking;

  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-0 z-[80] flex justify-end px-3 pb-[max(0.75rem,env(safe-area-inset-bottom))]">
      <div className="pointer-events-auto flex w-[min(100%,24rem)] flex-col items-end">
        <section
          className={`mb-2 flex w-full flex-col overflow-hidden rounded-2xl border border-white/25 bg-black text-white ${open ? "max-h-[min(78dvh,34rem)] opacity-100" : "pointer-events-none h-0 max-h-0 border-0 opacity-0"}`}
        >
          <header className="flex shrink-0 items-center gap-3 px-4 pt-4">
            <img src="/monday-tab.jpg" alt="" className={`size-[4.75rem] shrink-0 object-cover ${live ? "monday-talk" : ""}`} />
            <div className="min-w-0">
              <p className="font-sans text-[15px] font-bold uppercase leading-tight tracking-wide">Chancellor Mønday</p>
              <p className="mt-2 flex items-center gap-2 font-sans text-[11px] font-semibold uppercase tracking-[0.14em] text-lime">
                <span className={`size-2.5 shrink-0 rounded-full bg-lime ${live ? "monday-talk" : ""}`} />
                {hearing ? "Listening" : speaking ? "Speaking" : "The desk is open"}
                {live ? (
                  <span className="monday-eq" aria-hidden>
                    <i />
                    <i />
                    <i />
                    <i />
                  </span>
                ) : null}
              </p>
            </div>
          </header>
          <div className="mx-4 mt-4 shrink-0 border-t border-white/20" />
          <div ref={logRef} className="flex min-h-0 flex-1 flex-col gap-4 overflow-y-auto overscroll-contain px-4 py-4">
            {lines.map((line, index) =>
              line.who === "she" ? (
                <div key={index} className="space-y-4 font-sans text-[15px] font-normal normal-case leading-snug text-white">
                  {line.text.split(/\n\n+/).map((part, partIndex, parts) => (
                    <p key={partIndex} className={partIndex === parts.length - 1 && parts.length > 1 ? "font-bold" : ""}>
                      {part}
                    </p>
                  ))}
                </div>
              ) : (
                <p key={index} className="text-right font-sans text-[15px] font-normal normal-case leading-snug text-lime">
                  {line.text}
                </p>
              ),
            )}
            {pending ? <p className="font-sans text-[15px] normal-case text-white/50">…</p> : null}
          </div>
          <form
            className="shrink-0 px-3 pb-3"
            onSubmit={(event) => {
              event.preventDefault();
              send(text);
            }}
          >
            <div className="flex items-center gap-2 rounded-xl border border-white/30 px-3">
              <button
                type="button"
                onClick={listen}
                disabled={pending}
                className={`font-sans text-[10px] uppercase tracking-[0.08em] ${hearing ? "text-lime" : "text-white/45"}`}
              >
                {hearing ? "Hearing" : "Mic"}
              </button>
              <input
                value={text}
                onChange={(event) => setText(event.target.value)}
                placeholder="Ask the Chancellor..."
                className="min-w-0 flex-1 bg-transparent py-3 font-sans text-[15px] normal-case outline-none placeholder:text-white/40"
              />
              <button
                type="button"
                onClick={() => {
                  const next = !talk;
                  talkRef.current = next;
                  setTalk(next);
                  setOpen(true);
                  if (next) listen();
                  else stopVoice();
                }}
                className={`font-sans text-[10px] uppercase tracking-[0.08em] ${talk ? "text-lime" : "text-white/45"}`}
              >
                {talk ? "Voice on" : "Voice"}
              </button>
              <button type="submit" disabled={pending} className="font-sans text-[10px] uppercase tracking-[0.08em] text-lime disabled:opacity-40">
                Send
              </button>
            </div>
          </form>
        </section>
        <button type="button" aria-expanded={open} onClick={() => setOpen((value) => !value)} className="flex items-center gap-2">
          <span className="hidden font-mono text-[9px] uppercase tracking-[0.16em] text-lime sm:inline">{open ? "Close" : "Chancellor"}</span>
          <img src="/monday-tab.jpg" alt="Chancellor Mønday" className={`monday-live size-14 rounded-full border-2 border-lime object-cover ${live ? "monday-talk" : ""}`} />
        </button>
      </div>
    </div>
  );
}
