import { Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { NameLink } from "@/components/name-link";
import { useCurrentUserState } from "@/lib/auth/use-current-user";
import { addFriend, memberCard, openCircleWith, removeFriend } from "@/lib/temple-data";

type Card = NonNullable<Awaited<ReturnType<typeof memberCard>>>;

export function MemberView({ userId, alias }: { userId: string; alias?: string }) {
  const { user } = useCurrentUserState();
  const [card, setCard] = useState<Card | null | undefined>(undefined);
  const [busy, setBusy] = useState("");

  function load() {
    void memberCard({ data: userId })
      .then(setCard)
      .catch(() => setCard(null));
  }

  useEffect(() => {
    load();
  }, [userId, user?.id]);

  if (card === undefined) {
    return (
      <main className="grid min-h-[40dvh] place-items-center bg-ink text-paper">
        <p className="text-[10px] uppercase tracking-[0.2em] text-lime">Opening the name…</p>
      </main>
    );
  }
  if (!card) {
    return (
      <main className="bg-ink px-4 py-24 text-center text-paper">
        <p className="font-display text-3xl uppercase">No one by that name.</p>
        <Link to="/nexus" className="mt-6 inline-flex text-[11px] uppercase tracking-wide text-lime">
          Back to the Nexus
        </Link>
      </main>
    );
  }

  const title = card.flameName || card.handle;

  return (
    <main className="bg-ink text-paper">
      <section className="mx-auto max-w-xl px-4 py-16 sm:px-6">
        <Link to="/nexus" className="text-[10px] uppercase tracking-[0.16em] text-paper/50">
          ← Nexus
        </Link>
        <img src={card.avatarUrl || "/seal.jpg"} alt="" className="mt-8 size-24 rounded-full object-cover" />
        <p className="mt-6 text-[10px] uppercase tracking-[0.2em] text-lime">{card.self ? "You" : "Member"}</p>
        <h1 className="mt-3 font-display text-5xl uppercase leading-none">{title}</h1>
        {card.flameName ? <p className="mt-3 text-sm uppercase tracking-wide text-paper/60">{card.handle}</p> : null}
        {alias ? <p className="mt-2 text-[11px] uppercase tracking-wide text-paper/40">Also {alias}</p> : null}
        {card.bio ? <p className="mt-6 font-mono text-[13px] normal-case leading-relaxed text-paper/80">{card.bio}</p> : null}
        <div className="mt-8 flex flex-wrap gap-3">
          {card.self ? (
            <Link to="/profile" className="inline-flex h-11 items-center bg-lime px-4 text-[11px] uppercase tracking-wide text-ink">
              Your profile
            </Link>
          ) : !user ? (
            <Link to="/register" className="inline-flex h-11 items-center bg-lime px-4 text-[11px] uppercase tracking-wide text-ink">
              Join to add them
            </Link>
          ) : card.friend ? (
            <>
              {card.house ? (
                <span className="inline-flex h-11 items-center border border-lime px-4 text-[11px] uppercase tracking-wide text-lime">
                  Friends
                </span>
              ) : (
                <button
                  type="button"
                  className="inline-flex h-11 items-center border border-lime px-4 text-[11px] uppercase tracking-wide text-lime"
                  disabled={busy === "friend"}
                  onClick={() => {
                    setBusy("friend");
                    void removeFriend({ data: card.userId })
                      .then(() => load())
                      .catch((error: Error) => toast.error(error.message || "Still a friend."))
                      .finally(() => setBusy(""));
                  }}
                >
                  Friends
                </button>
              )}
              <button
                type="button"
                className="inline-flex h-11 items-center bg-lime px-4 text-[11px] uppercase tracking-wide text-ink"
                disabled={busy === "circle"}
                onClick={() => {
                  setBusy("circle");
                  void openCircleWith({ data: card.userId })
                    .then((circle) => {
                      window.location.href = `/nexus?circle=${circle.id}`;
                    })
                    .catch((error: Error) => {
                      setBusy("");
                      toast.error(error.message || "The circle did not open.");
                    });
                }}
              >
                Open a circle
              </button>
            </>
          ) : (
            <button
              type="button"
              className="inline-flex h-11 items-center bg-lime px-4 text-[11px] uppercase tracking-wide text-ink"
              disabled={busy === "friend"}
              onClick={() => {
                setBusy("friend");
                void addFriend({ data: card.userId })
                  .then(() => load())
                  .catch((error: Error) => toast.error(error.message || "They were not added."))
                  .finally(() => setBusy(""));
              }}
            >
              Add as a friend
            </button>
          )}
        </div>
        <div className="mt-12">
          <p className="text-[10px] uppercase tracking-[0.16em] text-lime">Friends</p>
          {card.friends.length === 0 ? (
            <p className="mt-3 text-sm text-paper/50">No one yet.</p>
          ) : (
            <ul className="mt-3 divide-y divide-paper/10 border border-paper/15">
              {card.friends.map((friend) => (
                <li key={friend.userId}>
                  <NameLink userId={friend.userId} className="flex items-center gap-3 px-3 py-2">
                    <img src={friend.avatarUrl || "/seal.jpg"} alt="" className="size-8 rounded-full object-cover" />
                    <span className="text-[12px] uppercase tracking-wide">{friend.handle}</span>
                  </NameLink>
                </li>
              ))}
            </ul>
          )}
        </div>
      </section>
    </main>
  );
}
