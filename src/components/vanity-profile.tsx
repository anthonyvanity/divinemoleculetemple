import { useEffect, useState } from "react";
import { MemberView } from "@/components/member-view";
import { resolveHouse } from "@/lib/temple-data";

export function VanityProfile({ name, alias }: { name: string; alias?: string }) {
  const [id, setId] = useState("");

  useEffect(() => {
    void resolveHouse({ data: name })
      .then((next) => setId(next || "missing"))
      .catch(() => setId("missing"));
  }, [name]);

  if (!id) {
    return (
      <main className="grid min-h-[40dvh] place-items-center bg-ink text-paper">
        <p className="text-[10px] uppercase tracking-[0.2em] text-lime">Opening the name…</p>
      </main>
    );
  }
  if (id === "missing") {
    return (
      <main className="bg-ink px-4 py-24 text-center font-display text-3xl uppercase text-paper">No one by that name.</main>
    );
  }
  return <MemberView userId={id} alias={alias} />;
}
