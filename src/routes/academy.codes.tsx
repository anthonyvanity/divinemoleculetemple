import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { useCurrentUserState } from "@/lib/auth/use-current-user";
import { listMemberCodes, saveMemberCode } from "@/lib/temple-data";
import { SOURCE_CODES } from "@/lib/temple-content";
import { canRead, useTemple } from "@/lib/temple-store";

export const Route = createFileRoute("/academy/codes")({ component: Codes });

const PATTERN = [
  ["Invocation", "Name the operator and the field you are speaking into."],
  ["Target", "Name the loop, the room, or the story. One target."],
  ["Authority", "Say from where you speak. Your own flame. Not a borrowed throne."],
  ["Revocation", "Cancel the old command in plain language."],
  ["Action", "One sentence the body can do today."],
  ["Seal", "A short line you will still mean in the morning."],
  ["Confirmation", "How you will know it landed. A kept hour. A quieter room."],
];

function Codes() {
  const path = useTemple((s) => s.path);
  const { user } = useCurrentUserState();
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [mine, setMine] = useState<{ id: string; title: string; body: string; visibility: string }[]>([]);

  useEffect(() => {
    if (!user) return;
    void listMemberCodes()
      .then(setMine)
      .catch(() => {});
  }, [user]);

  return (
    <main className="bg-ink text-paper">
      <section className="mx-auto flex max-w-3xl items-center gap-4 px-4 pb-4 pt-6">
        <img src="/covers/codes.jpg" alt="" className="h-24 w-16 shrink-0 border border-cyan/40 object-cover" />
        <div>
          <p className="text-[10px] uppercase tracking-[0.18em] text-cyan">Source codes</p>
          <h1 className="mt-1 font-display text-2xl uppercase leading-none">How a code is written</h1>
        </div>
      </section>

      <section className="mx-auto max-w-3xl px-4 py-6">
        <ol className="divide-y divide-paper/10 border border-paper/15">
          {PATTERN.map(([name, line], index) => (
            <li key={name} className="px-4 py-4">
              <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-lime">
                {index + 1}. {name}
              </p>
              <p className="mt-2 font-mono text-[12px] normal-case leading-relaxed text-paper/75">{line}</p>
            </li>
          ))}
        </ol>
      </section>

      <section className="mx-auto max-w-3xl space-y-12 px-4 py-8">
        {SOURCE_CODES.map((code) => {
          const open = Boolean(user) || canRead(code.lockedFor, path);
          return (
            <article key={code.id} id={code.id}>
              <p className="text-[10px] uppercase tracking-[0.16em] text-lilac">
                {code.volume} · {code.id}
              </p>
              <h2 className="mt-2 font-display text-2xl uppercase">{code.title}</h2>
              <p className="mt-3 text-sm text-paper/70">{code.lede}</p>
              {open ? (
                <div className="mt-4 space-y-3 text-sm leading-relaxed text-paper/80">
                  {code.body.map((paragraph) => (
                    <p key={paragraph}>{paragraph}</p>
                  ))}
                </div>
              ) : (
                <Link to="/register" className="mt-4 inline-block text-[11px] uppercase tracking-wide text-lime">
                  Sign in to read
                </Link>
              )}
            </article>
          );
        })}
      </section>

      <section className="mx-auto max-w-3xl px-4 pb-20">
        <h2 className="font-display text-2xl uppercase">Write one</h2>
        <p className="mt-3 font-mono text-[12px] normal-case leading-relaxed text-paper/65">
          Use the seven moves. It is saved to your account, not this browser.
        </p>
        {user ? (
          <form
            className="mt-6 space-y-3"
            onSubmit={(e) => {
              e.preventDefault();
              const text = body.trim();
              if (!text) return;
              void saveMemberCode({ data: { title, body: text, visibility: "private" } })
                .then(() => listMemberCodes())
                .then((rows) => {
                  setMine(rows);
                  setTitle("");
                  setBody("");
                  toast.success("Code kept on your account.");
                })
                .catch(() => toast.error("The code did not save."));
            }}
          >
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Title"
              className="h-11 w-full border border-paper/20 bg-transparent px-3 text-sm outline-none focus:border-lime"
            />
            <textarea
              value={body}
              onChange={(e) => setBody(e.target.value)}
              rows={8}
              placeholder={"Invocation:\nTarget:\nAuthority:\nRevocation:\nAction:\nSeal:\nConfirmation:"}
              className="w-full border border-paper/20 bg-transparent p-3 font-mono text-[12px] normal-case leading-relaxed outline-none focus:border-lime"
            />
            <Button type="submit" variant="lime">
              Keep this code
            </Button>
          </form>
        ) : (
          <Link to="/register" className="mt-6 inline-block text-[11px] uppercase tracking-wide text-lime">
            Sign in to write
          </Link>
        )}
        {mine.length ? (
          <ul className="mt-10 divide-y divide-paper/10 border border-paper/15">
            {mine.map((row) => (
              <li key={row.id} className="px-4 py-4">
                <p className="text-[10px] uppercase tracking-wide text-lime">{row.title}</p>
                <p className="mt-2 whitespace-pre-wrap font-mono text-[12px] normal-case leading-relaxed text-paper/75">{row.body}</p>
              </li>
            ))}
          </ul>
        ) : null}
      </section>
    </main>
  );
}
