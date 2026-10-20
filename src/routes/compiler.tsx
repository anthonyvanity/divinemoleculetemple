import { createFileRoute, Link } from "@tanstack/react-router";
import { Sparkles } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { CosDesk } from "@/components/cos-desk";
import { Button } from "@/components/ui/button";
import { compilePrayer } from "@/lib/compiler";
import { useTemple } from "@/lib/temple-store";

export const Route = createFileRoute("/compiler")({ component: Compiler });

function Compiler() {
  const [issue, setIssue] = useState("");
  const addCompiled = useTemple((s) => s.addCompiled);
  const compiled = useTemple((s) => s.compiled);
  const latest = compiled[0];

  function run() {
    const result = compilePrayer(issue);
    addCompiled({ issue: issue.trim() || "unspecified field distortion", ...result });
    toast.success("Execution complete // awaiting transmission");
  }

  return (
    <CosDesk>
      <div className="mx-auto max-w-6xl space-y-6">
        <div className="border border-[var(--desk-line)] px-6 py-10 text-center">
          <p className="text-micro uppercase tracking-wide" style={{ color: "var(--desk-muted)" }}>
            Directory empty
          </p>
          <p className="mt-3 text-sm" style={{ color: "var(--desk-muted)" }}>
            No connections yet. Visit the Nexus to meet fellow students and send your first request.
          </p>
          <Button asChild variant="dark" className="mt-6">
            <Link to="/nexus">Enter the Nexus →</Link>
          </Button>
        </div>

        <section className="border border-[var(--desk-line)] p-5">
          <p className="font-mono text-micro uppercase tracking-wide" style={{ color: "var(--desk-accent)" }}>
            {">"} Divine code // executable prayers
          </p>
          <p className="mt-4 text-micro uppercase tracking-wide" style={{ color: "var(--desk-muted)" }}>
            State the issue
          </p>
          <div className="mt-2 flex flex-col gap-2 sm:flex-row">
            <input
              value={issue}
              onChange={(e) => setIssue(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") run();
              }}
              placeholder="this attachment wont leave me alone."
              className="h-12 flex-1 border bg-ink px-4 font-mono text-sm text-paper outline-none"
              style={{ borderColor: "var(--desk-line)" }}
            />
            <Button variant="lime" onClick={run} className="gap-2">
              <Sparkles className="size-4" />
              Compile executable
            </Button>
          </div>

          {latest ? (
            <div className="mt-6 grid gap-4 lg:grid-cols-[1.4fr_1fr]">
              <div>
                <p className="text-micro uppercase tracking-wide" style={{ color: "var(--desk-muted)" }}>
                  Terminal output
                </p>
                <div className="mt-2 overflow-hidden border bg-ink font-mono text-xs text-paper" style={{ borderColor: "var(--desk-line)" }}>
                  <div className="flex items-center justify-between border-b px-3 py-2" style={{ borderColor: "var(--desk-line)" }}>
                    <span className="flex gap-1">
                      <span className="size-2.5 rounded-full bg-orange" />
                      <span className="size-2.5 rounded-full bg-gold" />
                      <span className="size-2.5 rounded-full bg-lime" />
                    </span>
                    <span className="text-[10px] uppercase tracking-wide text-paper/40">
                      CODE:{latest.filename.toUpperCase()}
                    </span>
                  </div>
                  <pre className="max-h-[28rem] overflow-auto p-4 leading-relaxed text-lime">{latest.code}</pre>
                  <div className="flex flex-wrap items-center gap-2 border-t px-3 py-3" style={{ borderColor: "var(--desk-line)" }}>
                    <p className="text-[10px] uppercase tracking-wide text-lime">
                      {">"} Execution complete // awaiting transmission
                    </p>
                    <Button
                      variant="lime"
                      size="sm"
                      onClick={() => {
                        void navigator.clipboard.writeText(latest.prayer);
                        toast.success("Sent to cosmos.");
                      }}
                    >
                      Send to cosmos
                    </Button>
                    <Button variant="dark" size="sm" onClick={() => setIssue("")}>
                      New executable
                    </Button>
                    <span className="ml-auto text-[10px] uppercase tracking-wide text-paper/40">
                      {latest.code.split("\n").length} lines
                    </span>
                  </div>
                </div>
              </div>
              <div>
                <p className="text-micro uppercase tracking-wide" style={{ color: "var(--desk-muted)" }}>
                  Human prayer
                </p>
                <article className="mt-2 border p-5 text-sm leading-relaxed" style={{ borderColor: "var(--desk-line)" }}>
                  <p className="text-[10px] uppercase tracking-wide text-lime">
                    To identify and purge the lingering energetic attachment currently adhering to the user's field.
                  </p>
                  <p className="mt-4 whitespace-pre-wrap uppercase tracking-wide text-paper/80">{latest.prayer}</p>
                </article>
              </div>
            </div>
          ) : null}
        </section>
      </div>
    </CosDesk>
  );
}
