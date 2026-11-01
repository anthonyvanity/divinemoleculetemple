import { useEffect, useState } from "react";
import { toast } from "sonner";
import { joinWaitlist, leaveWaitlist, myFlame, sendFlameNote, setFlameConsent, setFlameNotify } from "@/lib/flame";
import { cancelFlame, startStripeCheckout } from "@/lib/stripe-temple";

type Flame = Awaited<ReturnType<typeof myFlame>>;

export function FlameCard() {
  const [flame, setFlame] = useState<Flame | null>(null);
  const [note, setNote] = useState("");

  function load() {
    void myFlame()
      .then(setFlame)
      .catch(() => {});
  }

  useEffect(() => {
    load();
  }, []);

  if (!flame) return null;
  const sponsor = flame.sponsor;
  const active = sponsor && ["active", "past_due", "paused"].includes(sponsor.status);

  return (
    <section className="mt-4 border border-white/10 bg-[#101014] p-4">
      <p className="text-[10px] uppercase tracking-[0.16em] text-[#c6ff00]">Pass the Flame</p>
      {flame.received ? (
        <div className="mt-3">
          <h2 className="font-sans text-lg font-semibold uppercase">Academy access: sponsored</h2>
          <p className="mt-2 font-mono text-[12px] normal-case text-white/70">
            Payment status: {flame.billing || "complimentary"}. Sponsorship: {flame.received.status}. No charge. No debt. You do not owe the person who opened this.
          </p>
          {flame.received.grace_until ? <p className="mt-2 text-[11px] uppercase text-white/50">Grace until {flame.received.grace_until}</p> : null}
          <label className="mt-3 block text-[10px] uppercase tracking-[0.12em] text-white/50">
            What your anonymous sponsor may see
            <select
              value={flame.received.consent}
              onChange={(e) => void setFlameConsent({ data: e.target.value }).then(load)}
              className="mt-1 block border border-white/15 bg-black px-2 py-2 text-[12px] text-white"
            >
              <option value="private">Private</option>
              <option value="progress">Share academic progress</option>
              <option value="journey">Share selected updates</option>
            </select>
          </label>
          <p className="mt-2 font-mono text-[11px] normal-case text-white/45">Private is the default. Changing this does not change the scholarship.</p>
        </div>
      ) : null}

      {active && sponsor ? (
        <div className="mt-3">
          <h2 className="font-sans text-lg font-semibold uppercase">
            {sponsor.assignment === "unassigned" ? "Your contribution is in the fund" : "Your flame is shared"}
          </h2>
          <p className="mt-2 font-mono text-[12px] normal-case text-white/70">
            {sponsor.assignment === "unassigned"
              ? "The $22 is recorded. It is not a one-to-one sponsorship until an approved Seeker and an open place are both waiting. Unused money stays in the fund. You are not shown a student who does not exist."
              : "A student is matched. You are not shown who they are."}
          </p>
          <p className="mt-2 text-[11px] uppercase text-white/55">
            ${sponsor.amountCents / 100}/month · {sponsor.status} · {sponsor.assignment === "unassigned" ? "Unassigned" : sponsor.anon}
            {sponsor.periodEnd ? ` · Period ${sponsor.periodEnd.slice(0, 10)}` : ""}
          </p>
          {sponsor.progress?.milestones?.map((line) => (
            <p key={line} className="mt-2 font-mono text-[12px] normal-case text-white/70">
              {line}
            </p>
          ))}
          {sponsor.notes.map((item) => (
            <p key={item.at + item.body} className="mt-2 font-mono text-[12px] normal-case text-white/70">
              A note they chose to share: {item.body}
            </p>
          ))}
          {!sponsor.progress ? <p className="mt-2 font-mono text-[11px] normal-case text-white/45">Their study stays private unless they opt in.</p> : null}
          <div className="mt-3 flex flex-wrap gap-2">
            <button
              type="button"
              className="border border-white/20 px-3 py-2 text-[10px] uppercase"
              onClick={() => {
                if (!window.confirm("Cancel the $22 sponsorship only? The Academy membership stays.")) return;
                void cancelFlame()
                  .then(() => {
                    toast.success("Sponsorship canceled. The student keeps a grace period.");
                    load();
                  })
                  .catch((error: Error) => toast.error(error.message));
              }}
            >
              Cancel sponsorship
            </button>
          </div>
        </div>
      ) : null}

      {!active && flame.paying ? (
        <div className="mt-3">
          <p className="font-mono text-[12px] normal-case text-white/70">$22 a month goes into the scholarship fund. It becomes a sponsorship of one Seeker only when an approved student and an open place are both waiting. If neither is, the money stays unassigned. The other $11 of tuition is a Temple discount, not a second charge.</p>
          <button
            type="button"
            className="mt-3 bg-[#c6ff00] px-3 py-2 text-[10px] uppercase text-black"
            onClick={() =>
              void startStripeCheckout({ data: { kind: "flame", label: "Pass the Flame", origin: window.location.origin } })
                .then((session) => window.location.assign(session.url))
                .catch((error: Error) => toast.error(error.message))
            }
          >
            Sponsor a Seeker — $22/mo
          </button>
          <p className="mt-2 text-[10px] uppercase text-white/40">Anonymous. Optional. Canceled apart from your membership.</p>
        </div>
      ) : null}

      {!flame.paying && !flame.received ? (
        <div className="mt-3">
          <h2 className="font-sans text-lg font-semibold uppercase">{flame.waitlist && flame.waitlist.status !== "removed" ? "Your request is registered" : "The scholarship waiting list"}</h2>
          <p className="mt-2 font-mono text-[12px] normal-case text-white/70">
            {flame.waitlist && flame.waitlist.status !== "removed"
              ? `Status: ${flame.waitlist.status}. Joined ${flame.waitlist.created_at.slice(0, 10)}. A place is not guaranteed, and there is no promised wait.`
              : "Members can sponsor a scholarship. You are not charged for asking."}
          </p>
          {flame.waitlist && flame.waitlist.status !== "removed" ? (
            <div className="mt-3 flex flex-wrap gap-2">
              <button type="button" className="border border-white/20 px-3 py-2 text-[10px] uppercase" onClick={() => void setFlameNotify({ data: !flame.waitlist?.notify }).then(load)}>
                {flame.waitlist.notify ? "Mute emails" : "Allow emails"}
              </button>
              <button type="button" className="border border-white/20 px-3 py-2 text-[10px] uppercase" onClick={() => void leaveWaitlist().then(load)}>
                Leave the list
              </button>
            </div>
          ) : (
            <button type="button" className="mt-3 bg-[#c6ff00] px-3 py-2 text-[10px] uppercase text-black" onClick={() => void joinWaitlist().then(load).catch((error: Error) => toast.error(error.message))}>
              Join the waiting list
            </button>
          )}
        </div>
      ) : null}

      {(flame.received?.consent === "journey" || (active && sponsor?.consent === "journey")) && (
        <form
          className="mt-3 flex gap-2"
          onSubmit={(e) => {
            e.preventDefault();
            void sendFlameNote({ data: { body: note, from: flame.received ? "recipient" : "sponsor" } })
              .then(() => {
                setNote("");
                toast.success("Held for the desk. It is not delivered until it is released.");
              })
              .catch((error: Error) => toast.error(error.message));
          }}
        >
          <input value={note} onChange={(e) => setNote(e.target.value)} placeholder="A short anonymous note" className="flex-1 border border-white/15 bg-black px-2 py-2 text-[12px]" />
          <button type="submit" className="border border-white/20 px-3 text-[10px] uppercase">
            Send
          </button>
        </form>
      )}
    </section>
  );
}
