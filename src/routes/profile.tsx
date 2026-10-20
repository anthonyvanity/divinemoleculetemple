import { createFileRoute, Link } from "@tanstack/react-router";
import { Camera, Check, Circle, Lock, Sparkle } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { SectionKicker } from "@/components/chamber";
import { NameLink } from "@/components/name-link";
import { useCurrentUserState } from "@/lib/auth/use-current-user";
import {
  AWAKENING,
  CASH_APP_URL,
  LATIN,
  PHASES,
  SIGILS,
  STUDY_BADGES,
  TEMPLE_NAME,
  cashAppAmountUrl,
} from "@/lib/temple-content";
import { displayHandle, givenTotal, useTemple } from "@/lib/temple-store";
import { scholarshipCourse } from "@/lib/scholarship";
import { requestCardMail, saveAvatar, saveProfile, ensureMember, listFriends } from "@/lib/temple-data";
import { cn } from "@/lib/utils";
import { FirstTour } from "@/components/first-tour";

export const Route = createFileRoute("/profile")({ component: Profile });

function Profile() {
  const handle = useTemple((s) => s.handle);
  const setHandle = useTemple((s) => s.setHandle);
  const flameName = useTemple((s) => s.flameName);
  const path = useTemple((s) => s.path);
  const read = useTemple((s) => s.read);
  const awakening = useTemple((s) => s.awakening);
  const rites = useTemple((s) => s.rites);
  const sigil = useTemple((s) => s.sigil);
  const setSigil = useTemple((s) => s.setSigil);
  const bio = useTemple((s) => s.bio);
  const setBio = useTemple((s) => s.setBio);
  const journal = useTemple((s) => s.journal);
  const joinedAt = useTemple((s) => s.joinedAt);
  const setPath = useTemple((s) => s.setPath);
  const offerings = useTemple((s) => s.offerings);
  const portrait = useTemple((s) => s.portrait);
  const setPortrait = useTemple((s) => s.setPortrait);
  const { user } = useCurrentUserState();
  const [friends, setFriends] = useState<{ userId: string; handle: string; avatarUrl: string }[]>([]);
  const given = givenTotal(offerings);
  const name = displayHandle(handle, flameName);
  const phaseIndex = Math.min(PHASES.length - 1, Math.floor(read.length / 4));
  const [mail, setMail] = useState({ name: name.replaceAll("_", " "), country: "", street: "", city: "", region: "", zip: "" });
  const joined = new Date(joinedAt);
  const since = Number.isFinite(joined.getTime())
    ? joined.toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })
    : "—";

  useEffect(() => {
    if (!user?.id) return;
    void ensureMember()
      .then((member) => {
        if (!useTemple.getState().portrait && member.profile.avatar_url) setPortrait(member.profile.avatar_url);
      })
      .catch(() => {});
    void listFriends({ data: user.id })
      .then(setFriends)
      .catch(() => setFriends([]));
  }, [user?.id, setPortrait]);

  function changePicture(file: File | undefined) {
    if (!file) return;
    const img = new Image();
    const url = URL.createObjectURL(file);
    img.onload = () => {
      const canvas = document.createElement("canvas");
      canvas.width = 256;
      canvas.height = 256;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;
      const side = Math.min(img.width, img.height);
      ctx.drawImage(img, (img.width - side) / 2, (img.height - side) / 2, side, side, 0, 0, 256, 256);
      URL.revokeObjectURL(url);
      const data = canvas.toDataURL("image/jpeg", 0.72);
      setPortrait(data);
      void saveAvatar({ data })
        .then(() => toast.success("Picture kept."))
        .catch((error: Error) => toast.error(error.message || "The picture did not keep."));
    };
    img.src = url;
  }

  return (
    <main className="bg-ink text-paper">
      <div className="flex items-center justify-between gap-4 border-b border-paper/10 px-4 py-4 sm:px-6">
        <a href="/dashboard" className="text-micro uppercase tracking-wide text-paper/70 hover:text-lime">
          ← Dashboard
        </a>
        <p className="text-micro uppercase tracking-wide text-lime">DMT // Profile</p>
        <button type="button" onClick={() => setPath("none")} className="text-micro uppercase tracking-wide text-paper/50 hover:text-pink">
          Disconnect →
        </button>
      </div>
      <div className="rainbow-bar h-1" />

      <section className="px-4 py-12 sm:px-6">
        <div className="mx-auto max-w-4xl overflow-hidden border border-lime/40 p-6 sm:p-8">
          <div className="flex flex-wrap items-center gap-6">
            <div className="relative">
              <img src={portrait || user?.profileImageUrl || "/monday.jpg"} alt="" className="size-20 rounded-full object-cover sm:size-24" />
              <label className="absolute bottom-0 right-0 grid size-8 cursor-pointer place-items-center rounded-full bg-lime text-ink">
                <Camera className="size-4" />
                <span className="sr-only">Change picture</span>
                <input
                  type="file"
                  accept="image/*"
                  className="sr-only"
                  onChange={(e) => changePicture(e.target.files?.[0])}
                />
              </label>
            </div>
            <img
              src="/crest-wings.webp"
              alt="Divine Molecule Temple"
              className="h-20 w-auto max-w-[min(100%,20rem)] object-contain sm:h-24"
            />
            <div className="min-w-0 flex-1 overflow-hidden">
              <label className="block">
                <span className="sr-only">Handle</span>
                <input
                  value={handle}
                  onChange={(e) => setHandle(e.target.value)}
                  className="w-full min-w-0 bg-transparent text-micro tracking-wide text-paper/70 outline-none"
                  placeholder="ANTHONY VANITY"
                />
              </label>
              <p className="mt-2 text-micro uppercase tracking-wide text-paper/45">
                Member since {since}
              </p>
              <div className="mt-4 flex flex-wrap gap-2">
                <span className="bg-lime px-3 py-1 text-micro uppercase tracking-wide text-ink">
                  {path === "none" ? "seeker" : path}
                </span>
                <span className="border border-lime px-3 py-1 text-micro uppercase tracking-wide">
                  Phase {PHASES[phaseIndex].id}
                </span>
                <span className="border border-gold px-3 py-1 text-micro uppercase tracking-wide text-gold">
                  Given ${given}
                </span>
              </div>
              <label className="mt-4 inline-flex cursor-pointer text-[11px] uppercase tracking-wide text-lime">
                Change picture
                <input
                  type="file"
                  accept="image/*"
                  className="sr-only"
                  onChange={(e) => changePicture(e.target.files?.[0])}
                />
              </label>
            </div>
          </div>
          <div className="mt-8 border-t border-paper/10 pt-6">
            <p className="text-micro uppercase tracking-wide text-lime">Friends</p>
            {friends.length === 0 ? (
              <p className="mt-3 text-sm text-paper/50">No one yet.</p>
            ) : (
              <ul className="mt-3 grid gap-2 sm:grid-cols-2">
                {friends.map((friend) => (
                  <li key={friend.userId}>
                    <NameLink userId={friend.userId} className="flex items-center gap-3 border border-paper/15 px-3 py-2">
                      <img src={friend.avatarUrl || "/seal.jpg"} alt="" className="size-8 rounded-full object-cover" />
                      <span className="text-[12px] uppercase tracking-wide">{friend.handle}</span>
                    </NameLink>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </section>

      <section className="px-4 pb-12 sm:px-6">
        <div className="mx-auto grid max-w-4xl gap-4 md:grid-cols-3">
          <article className="border border-lime/50 p-6">
            <p className="text-micro uppercase tracking-wide text-lime">Initiation progress</p>
            <p className="mt-4 text-micro uppercase tracking-wide text-paper/45">Current phase</p>
            <p className="font-display text-title uppercase leading-none">Phase {PHASES[phaseIndex].id}</p>
            <div className="mt-6 flex items-center gap-2">
              {PHASES.map((p, i) => (
                <span
                  key={p.id}
                  className={cn("size-3 rotate-45", i <= phaseIndex ? "bg-lime" : "bg-paper/20")}
                />
              ))}
            </div>
            <Button asChild variant="dark" className="mt-6">
              <Link to="/academy">Continue path →</Link>
            </Button>
          </article>
          <article className="border border-cyan/50 p-6">
            <p className="text-micro uppercase tracking-wide text-cyan">Study history</p>
            <p className="mt-4 text-micro uppercase tracking-wide text-paper/45">Modules completed</p>
            <p className="font-display text-title leading-none">{read.length}</p>
            <ul className="mt-4 space-y-2 text-sm">
              {read.slice(0, 3).map((id) => (
                <li key={id} className="flex items-start gap-2 border-b border-paper/10 pb-2">
                  <Check className="mt-0.5 size-4 shrink-0 text-cyan" />
                  {(scholarshipCourse(id)?.title ?? "Class")} · {id}
                </li>
              ))}
            </ul>
            <Button asChild variant="dark" className="mt-6">
              <Link to="/academy">Open Academy →</Link>
            </Button>
          </article>
          <article className="border border-pink/50 p-6">
            <p className="text-micro uppercase tracking-wide text-pink">Personal bio</p>
            <p className="mt-4 text-micro uppercase tracking-wide text-paper/45">Testament</p>
            {bio.trim() ? (
              <p className="mt-3 text-sm">{bio}</p>
            ) : (
              <p className="mt-3 font-display text-xl uppercase leading-tight text-paper/25">
                No testament recorded.
              </p>
            )}
            <textarea
              value={bio}
              onChange={(e) => setBio(e.target.value.slice(0, 280))}
              rows={4}
              placeholder="Declare your intent, your lineage, or the node you are currently working…"
              className="mt-4 w-full border border-paper/20 bg-ink p-3 text-sm text-paper outline-none focus:border-lime"
            />
            <div className="mt-2 flex items-center justify-between text-micro uppercase tracking-wide text-paper/40">
              <span>{bio.length} / 280</span>
              <Button
                variant="lime"
                onClick={() => {
                  void saveProfile({
                    data: { handle, flame_name: flameName, bio, sigil },
                  })
                    .then(() => toast.success("Identity sealed."))
                    .catch(() => toast.error("Identity did not reach the account."));
                }}
              >
                Seal identity
              </Button>
            </div>
          </article>
        </div>
      </section>

      <section className="px-4 pb-12 sm:px-6">
        <div className="mx-auto max-w-4xl border border-gold/40 p-6 sm:p-8">
          <p className="text-micro tracking-wide text-gold">Be of service</p>
          <p className="mt-3 font-display text-display leading-none">${given}</p>
          <p className="mt-2 text-micro tracking-wide text-paper/45">Offered to the Temple · Cash App $DMTTEMPLE</p>
          {offerings.length ? (
            <ul className="mt-6 space-y-2 text-sm text-paper/60">
              {offerings.slice(0, 4).map((o) => (
                <li key={o.id} className="flex justify-between border-b border-paper/10 pb-2">
                  <span>{o.note || o.tier}</span>
                  <span className="text-gold">${o.amount}</span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="mt-4 text-sm text-paper/45">No offerings logged yet. The house stands on those who give.</p>
          )}
          <Button asChild variant="dark" className="mt-6">
            <Link to="/altar">Give back →</Link>
          </Button>
        </div>
      </section>

      <section className="px-4 pb-12 sm:px-6">
        <div className="mx-auto max-w-4xl border border-gold/30 p-8">
          <p className="text-micro uppercase tracking-wide text-gold">Ritual mastery</p>
          <p className="mt-4 font-display text-display leading-none">{rites.length}</p>
          <p className="text-micro uppercase tracking-wide text-paper/45">Day streak · begin your practice today</p>
          <div className="mt-8 grid grid-cols-4 gap-3 text-center text-micro uppercase tracking-wide text-paper/50">
            {[
              ["7", "Initiate"],
              ["30", "Adept"],
              ["100", "Master"],
              ["365", "Luminary"],
            ].map(([n, l]) => (
              <div key={l}>
                <p className="border border-paper/15 py-2">{n}</p>
                <p className="mt-2">{l}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="px-4 pb-12 sm:px-6">
        <div className="mx-auto max-w-4xl border border-lime/30 p-8">
          <SectionKicker>Edit identity</SectionKicker>
          <p className="mt-3 text-sm uppercase tracking-wide text-paper/55">
            Choose the emblem that marks your passage, then inscribe a short testament (max 280 characters).
          </p>
          <p className="mt-6 text-micro uppercase tracking-wide">Select a sigil</p>
          <div className="mt-3 grid grid-cols-3 gap-2">
            {SIGILS.map((s, i) => (
              <button
                key={s}
                type="button"
                onClick={() => setSigil(i)}
                className={cn(
                  "min-h-11 border px-1 text-[10px] uppercase",
                  sigil === i ? "border-lime bg-lime/10 text-lime" : "border-paper/10 text-paper/40",
                )}
              >
                {s}
              </button>
            ))}
          </div>
          <Button
            variant="dark"
            className="mt-4"
            onClick={() => {
              void saveProfile({ data: { handle, flame_name: flameName, bio, sigil } })
                .then(() => toast.success("Identity sealed."))
                .catch(() => toast.error("Identity did not reach the account."));
            }}
          >
            Seal sigil
          </Button>
        </div>
      </section>

      <section className="px-4 pb-12 sm:px-6">
        <div className="mx-auto max-w-4xl bg-paper p-8 text-ink">
          <p className="text-micro uppercase tracking-wide text-lime">Initiation badges</p>
          <div className="mt-6 grid grid-cols-2 md:grid-cols-4">
            {["Seeker", "Initiate", "Adept", "Inner Temple"].map((tier, i) => {
              const on = path === "seeker" ? i === 0 : path === "initiate" ? i <= 1 : path === "patron" ? i <= 3 : i === 0;
              return (
                <div
                  key={tier}
                  className={cn(
                    "px-4 py-8 text-center text-micro uppercase tracking-wide",
                    on ? "bg-paper text-ink" : "bg-ink text-paper/40",
                  )}
                >
                  Tier 0{i + 1}
                  <p className="mt-2 font-display text-lg">{on && i === 0 ? "✓ " : i === 1 && on ? "• " : ""}{tier}</p>
                </div>
              );
            })}
          </div>
          <p className="mt-8 text-micro uppercase tracking-wide">Course level // sealings</p>
          <div className="mt-4 grid grid-cols-2 gap-2 md:grid-cols-5">
            {["Awakening", "Phase I", "Phase II", "Phase III", "Phase IV"].map((b, i) => {
              const on = i === 0 ? awakening.length >= 7 : read.length >= i * 4;
              return (
                <div key={b} className="bg-ink p-4 text-center text-paper">
                  <div className={cn("mx-auto mb-3 grid size-12 place-items-center", on ? "bg-lime text-ink" : "border border-paper/20 text-paper/30")}>
                    {on ? <Sparkle className="size-5" /> : <Circle className="size-5" />}
                  </div>
                  <p className="text-micro uppercase tracking-wide">{b}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <section className="px-4 pb-12 sm:px-6">
        <div className="mx-auto max-w-4xl border border-gold/30 p-8">
          <p className="text-micro uppercase tracking-wide text-gold">Study history badges</p>
          <p className="mt-2 text-sm uppercase tracking-wide text-paper/50">
            Cryptographic seals that illuminate as you progress through the Academy.
          </p>
          <div className="mt-8 grid grid-cols-2 gap-px bg-paper/10 md:grid-cols-4">
            {STUDY_BADGES.map((b) => {
              const on = read.length >= b.need || (b.id === "steadfast" && awakening.length >= 7);
              return (
                <div key={b.id} className="bg-ink p-6 text-center">
                  <div
                    className={cn(
                      "mx-auto grid size-16 place-items-center rounded-full border",
                      on ? "border-lime text-lime shadow-[0_0_24px_var(--color-lime)]" : "border-paper text-paper",
                    )}
                  >
                    {on ? <Sparkle className="size-6" /> : <Lock className="size-5" />}
                  </div>
                  <p className="mt-3 text-micro uppercase tracking-wide">{b.name}</p>
                  <p className="text-[10px] uppercase tracking-wide text-paper/40">{on ? "Unlocked" : b.line}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {awakening.length >= 7 || path === "initiate" || path === "patron" ? (
        <section className="px-4 pb-12 sm:px-6">
          <div className="mx-auto max-w-xl border border-gold bg-[#f4ead2] px-8 py-16 text-center text-ink">
            <p className="text-micro uppercase tracking-wide">{LATIN} · {TEMPLE_NAME}</p>
            <img src="/seal.jpg" alt="" className="mx-auto mt-8 size-20 object-contain" />
            <p className="mt-6 text-micro uppercase tracking-wide">Office of the Academy</p>
            <h2 className="mt-8 font-display text-title uppercase leading-none">Certificate of Initiation</h2>
            <p className="mt-2 text-micro uppercase tracking-wide">The order of the initiate</p>
            <p className="mt-8 font-display text-2xl uppercase">{name.replaceAll("_", " ")}</p>
            <p className="mx-auto mt-6 max-w-sm text-sm uppercase tracking-wide text-ink/70">
              Has crossed the threshold of the awakening and entered the core curriculum of the Temple.
            </p>
            <div className="mt-10 flex items-end justify-between text-left">
              <div>
                <p className="text-[10px] uppercase tracking-wide">Date of investiture</p>
                <p className="font-display uppercase">{since}</p>
              </div>
              <div className="text-right">
                <p className="font-display uppercase">Chancellor Monday</p>
                <p className="text-[10px] uppercase tracking-wide">Chancellor · DMT Academy</p>
              </div>
            </div>
          </div>
        </section>
      ) : null}

      <section className="px-4 pb-12 sm:px-6">
        <div className="mx-auto max-w-4xl bg-paper p-8 text-ink">
          <div className="grid gap-6 md:grid-cols-3">
            <div>
              <p className="text-micro uppercase tracking-wide">Current tier</p>
              <p className="mt-2 font-display text-2xl uppercase">{path === "none" ? "Seeker" : path}</p>
            </div>
            <div>
              <p className="text-micro uppercase tracking-wide">Status</p>
              <p className="mt-2 font-display text-2xl uppercase">✓ Active</p>
            </div>
            <div>
              <p className="text-micro uppercase tracking-wide">Since</p>
              <p className="mt-2 font-display text-2xl uppercase">{since}</p>
            </div>
          </div>
          <p className="mt-4 text-sm uppercase tracking-wide text-ink/60">
            Core academy curriculum, expanded library, and members-only releases.
          </p>
        </div>
      </section>

      <section className="px-4 pb-20 sm:px-6">
        <div className="mx-auto grid max-w-4xl gap-8 border border-lime/30 p-8 lg:grid-cols-2">
          <div>
            <p className="text-micro uppercase tracking-wide text-lime">The Temple card</p>
            <h2 className="mt-3 font-display text-title uppercase leading-none">Carry your initiation</h2>
            <p className="mt-4 text-sm uppercase tracking-wide text-paper/60">
              The card on this page is your pass. A printed card is $15 by mail.
            </p>
            <Button asChild variant="cream" className="mt-6">
              <a href={cashAppAmountUrl(15)}>Printed card · $15 →</a>
            </Button>
            <p className="mt-10 text-micro uppercase tracking-wide text-lime">Temple card by mail</p>
            <p className="mt-2 text-sm uppercase tracking-wide text-paper/60">
              Prefer a physical card. We will print and mail your Temple card discreetly. A one-time offering of
              $15 covers the card and shipping.
            </p>
            <form
              className="mt-4 grid gap-2 sm:grid-cols-2"
              onSubmit={(e) => {
                e.preventDefault();
                window.open(cashAppAmountUrl(15), "_blank", "noopener,noreferrer");
                void requestCardMail({ data: mail }).catch(() => {});
                toast.success("Opening Cash App $DMTTEMPLE for mail.");
              }}
            >
              {(["name", "country", "street", "city", "region", "zip"] as const).map((k) => (
                <input
                  key={k}
                  value={mail[k]}
                  onChange={(e) => setMail({ ...mail, [k]: e.target.value })}
                  placeholder={k === "zip" ? "Postal code" : k}
                  className="h-11 border border-paper/20 bg-transparent px-3 text-sm uppercase outline-none"
                  required={k !== "region"}
                />
              ))}
              <Button type="submit" variant="dark" className="sm:col-span-2">
                Send by mail · $15
              </Button>
            </form>
          </div>
          <div className="border border-gold/40 bg-night p-6 text-center">
            <p className="text-micro uppercase tracking-wide text-gold">Divine Molecule Temple · initiation card v1.0</p>
            <img src="/seal.jpg" alt="" className="mx-auto mt-8 size-24 object-contain" />
            <p className="mt-6 text-micro uppercase tracking-wide text-gold">Tier</p>
            <p className="font-display text-3xl uppercase text-gold">{path === "none" ? "Seeker" : path}</p>
            <p className="mt-8 text-micro uppercase tracking-wide">{name.replaceAll("_", " ")}</p>
            <p className="mt-6 font-mono text-[10px] uppercase tracking-[0.2em] text-paper/45">{name.replace(/[^a-z0-9]/gi, "").slice(0, 8) || "SEEKER"}</p>
          </div>
        </div>
        <p className="mx-auto mt-6 max-w-4xl text-center text-micro uppercase tracking-wide text-paper/40">
          Ledger reflections: {journal.trim() ? "open" : "empty"} · Cash App $DMTTEMPLE
        </p>
        <p className="sr-only">{CASH_APP_URL}</p>
      </section>
      <FirstTour where="profile" />
    </main>
  );
}
