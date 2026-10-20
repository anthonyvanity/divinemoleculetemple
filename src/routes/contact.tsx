import { createFileRoute } from "@tanstack/react-router";
import { useState, type FormEvent } from "react";
import { toast } from "sonner";
import { ChamberHero } from "@/components/chamber";
import { Button } from "@/components/ui/button";
import { SpamFields, useSpamSeal, withRecaptcha } from "@/components/spam-fields";
import { submitContact } from "@/lib/temple-data";

export const Route = createFileRoute("/contact")({ component: Contact });

const SUBJECTS = ["General", "PR packet", "Housing grant", "Educational grant", "Temple grant"] as const;

function Contact() {
  const [subject, setSubject] = useState<string>(SUBJECTS[0]);
  const [custom, setCustom] = useState("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [org, setOrg] = useState("");
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);
  const spam = useSpamSeal();
  const own = subject === "own";

  function send(e: FormEvent) {
    e.preventDefault();
    const chosen = own ? custom.trim() : subject;
    if (!chosen) {
      toast.error("Name a subject.");
      return;
    }
    setBusy(true);
    const body = [`[${chosen}]`, org.trim() ? `From: ${org.trim()}` : "", message.trim()].filter(Boolean).join("\n");
    void withRecaptcha(spam, "contact")
      .then((seal) => submitContact({ data: { name, email, message: body, ...seal } }))
      .then(() => {
        toast.success("Received.");
        setOrg("");
        setMessage("");
        setCustom("");
      })
      .catch(() => toast.error("Could not send."))
      .finally(() => setBusy(false));
  }

  return (
    <main className="bg-ink text-paper">
      <ChamberHero
        tone="lime"
        icon="Share2"
        title="Contact"
        lede={`Write the house.
Ask for a packet.
Or send a grant proposal.`}
      />
      <section className="px-4 pb-20 sm:px-6">
        <form onSubmit={send} className="relative mx-auto max-w-xl border border-lime/30 p-6">
          <SpamFields company={spam.company} setCompany={spam.setCompany} />
          <label className="block">
            <span className="text-[10px] uppercase tracking-[0.18em] text-lime">Subject</span>
            <select
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              className="mt-2 h-11 w-full border border-paper/20 bg-ink px-3 text-sm uppercase outline-none focus:border-lime"
            >
              {SUBJECTS.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
              <option value="own">Type your own</option>
            </select>
          </label>
          {own ? (
            <input
              value={custom}
              onChange={(e) => setCustom(e.target.value)}
              required
              placeholder="Your subject"
              className="mt-3 h-11 w-full border border-paper/20 bg-transparent px-3 text-sm outline-none focus:border-lime"
            />
          ) : null}
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            placeholder="Name"
            className="mt-6 h-11 w-full border border-paper/20 bg-transparent px-3 text-sm outline-none focus:border-lime"
          />
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            placeholder="Email"
            className="mt-3 h-11 w-full border border-paper/20 bg-transparent px-3 text-sm outline-none focus:border-lime"
          />
          <input
            value={org}
            onChange={(e) => setOrg(e.target.value)}
            placeholder="Organization, if any"
            className="mt-3 h-11 w-full border border-paper/20 bg-transparent px-3 text-sm outline-none focus:border-lime"
          />
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            required
            rows={7}
            placeholder="The letter, the packet request, or the proposal"
            className="mt-3 w-full border border-paper/20 bg-transparent px-3 py-3 text-sm outline-none focus:border-lime"
          />
          <Button type="submit" variant="lime" className="mt-4" disabled={busy}>
            Send
          </Button>
        </form>
      </section>
    </main>
  );
}