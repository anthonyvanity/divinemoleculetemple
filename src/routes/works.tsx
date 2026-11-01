import { createFileRoute, Link } from "@tanstack/react-router";
import { useState, type FormEvent } from "react";
import { toast } from "sonner";
import { ChamberHero, SectionKicker } from "@/components/chamber";
import { Button } from "@/components/ui/button";
import { CONTACT_EMAIL, CONTACT_PHONE } from "@/lib/temple-content";
import { bookGuide, submitContact } from "@/lib/temple-data";
import { SpamFields, useSpamSeal, withRecaptcha } from "@/components/spam-fields";

export const Route = createFileRoute("/works")({ component: Works });

function Works() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [slot, setSlot] = useState("");
  const [notes, setNotes] = useState("");
  const contactSpam = useSpamSeal();
  const bookSpam = useSpamSeal();

  function contact(e: FormEvent) {
    e.preventDefault();
    void withRecaptcha(contactSpam, "contact")
      .then((seal) => submitContact({ data: { name, email, message, ...seal } }))
      .then(() => {
        toast.success("Message received.");
        setName("");
        setEmail("");
        setMessage("");
      })
      .catch(() => toast.error("Could not send. Try email."));
  }

  function book(e: FormEvent) {
    e.preventDefault();
    void withRecaptcha(bookSpam, "book")
      .then((seal) => bookGuide({ data: { guide: "Chancellor Monday", slot, notes, ...seal } }))
      .then(() => {
        toast.success("Booking requested.");
        setSlot("");
        setNotes("");
      })
      .catch(() => toast.error("Sign in to book a guide."));
  }

  return (
    <main className="bg-ink text-paper">
      <ChamberHero
        tone="ink"
        icon="Rocket"
        kicker="Our mission"
        title={`To restore the original code
beneath the noise.`}
        lede={`The Temple does not ask you
to believe blindly.
It asks you to remember
intelligently.
You are not broken.
You are overwritten.`}
        to="/altar"
        cta="Support the mission →"
      />

      <section className="px-4 py-20 sm:px-6">
        <div className="mx-auto max-w-3xl space-y-5 text-paper/70">
          <SectionKicker>Works of the Temple</SectionKicker>
          <h2 className="font-display text-title text-paper">A housing vision. Not a running program.</h2>
          <p>
            The Temple’s aim is supportive housing and a path back to stability for people rebuilding their lives. That work is a proposal. It is not an open, funded residence, and this page will not invent a headcount or an outcome.
          </p>
          <p>
            Faith here is meant to do something. Volunteer interest and gifts go through the house. Money designated for housing is only collected when a real designation is being administered.
          </p>
          <div className="border border-lime/30 p-6 text-paper">
            <p className="text-micro tracking-wide text-lime">Clergy contact</p>
            <p className="mt-3 font-display">Anthony DaSilva, High Priest</p>
            <p>
              <a className="text-lime underline-offset-4 hover:underline" href={`mailto:${CONTACT_EMAIL}`}>
                {CONTACT_EMAIL}
              </a>
            </p>
            <p>{CONTACT_PHONE}</p>
          </div>
          <div className="flex flex-wrap gap-3 pt-4">
            <Button asChild variant="lime">
              <Link to="/altar">Support the work</Link>
            </Button>
            <Button asChild variant="dark">
              <Link to="/contact">Volunteer</Link>
            </Button>
          </div>
        </div>
      </section>

      <section className="border-t border-paper/10 px-4 py-20 sm:px-6">
        <div className="mx-auto grid max-w-5xl gap-10 lg:grid-cols-2">
          <form onSubmit={contact} className="relative border border-lime/30 p-6">
            <SpamFields company={contactSpam.company} setCompany={contactSpam.setCompany} />
            <p className="text-micro tracking-wide text-lime">Contact request</p>
            <h2 className="mt-2 font-display text-2xl">Write the house</h2>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              placeholder="Name"
              className="mt-6 h-11 w-full border border-paper/20 bg-transparent px-3 text-sm outline-none"
            />
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="Email"
              className="mt-3 h-11 w-full border border-paper/20 bg-transparent px-3 text-sm outline-none"
            />
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              required
              rows={5}
              placeholder="Message"
              className="mt-3 w-full border border-paper/20 bg-transparent p-3 text-sm outline-none"
            />
            <Button type="submit" variant="lime" className="mt-4">
              Send
            </Button>
          </form>
          <form onSubmit={book} className="relative border border-gold/30 p-6">
            <SpamFields company={bookSpam.company} setCompany={bookSpam.setCompany} />
            <p className="text-micro tracking-wide text-gold">Video guide booking</p>
            <h2 className="mt-2 font-display text-2xl">Sit with a guide</h2>
            <input
              value={slot}
              onChange={(e) => setSlot(e.target.value)}
              required
              placeholder="Requested time"
              className="mt-6 h-11 w-full border border-paper/20 bg-transparent px-3 text-sm outline-none"
            />
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={5}
              placeholder="What you want to integrate"
              className="mt-3 w-full border border-paper/20 bg-transparent p-3 text-sm outline-none"
            />
            <Button type="submit" variant="cream" className="mt-4">
              Request session
            </Button>
          </form>
        </div>
      </section>
    </main>
  );
}
