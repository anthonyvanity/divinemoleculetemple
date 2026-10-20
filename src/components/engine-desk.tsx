import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { deskEngine, saveArchive, saveProgram, saveStep } from "@/lib/engine";

type Desk = Awaited<ReturnType<typeof deskEngine>>;

const field = "h-11 w-full border border-paper/20 bg-transparent px-3 text-sm outline-none";

export function EngineDesk() {
  const [desk, setDesk] = useState<Desk | null>(null);
  const [err, setErr] = useState("");
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [tier, setTier] = useState("public");
  const [programTitle, setProgramTitle] = useState("");
  const [programId, setProgramId] = useState("");
  const [stepId, setStepId] = useState("");
  const [stepTitle, setStepTitle] = useState("");
  const [stepNumber, setStepNumber] = useState(1);
  const [instruction, setInstruction] = useState("");
  const [editId, setEditId] = useState("");
  const [editTitle, setEditTitle] = useState("");
  const [editBody, setEditBody] = useState("");
  const [editTier, setEditTier] = useState("public");
  const [editSlug, setEditSlug] = useState("");
  const [editType, setEditType] = useState("COS");
  const [editFeatured, setEditFeatured] = useState(false);

  function load() {
    void deskEngine()
      .then((data) => {
        setDesk(data);
        if (!programId && data.programs[0]) setProgramId(data.programs[0].id);
      })
      .catch((error: Error) => setErr(error.message || "The desk did not open"));
  }

  useEffect(() => {
    load();
    // The desk loads once for the Chancellor who can see it.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <section className="mt-10 border border-lilac/40 p-5">
      <h2 className="font-display text-xl uppercase">Archives and sequences</h2>
      <p className="mt-2 text-sm text-paper/60">
        Publish a chapter or a sequence here. The same pages render whatever you add. Bodies marked [CONTENT REQUIRED] are waiting for Temple text.
      </p>
      {err ? <p className="mt-3 text-micro text-orange">{err}</p> : null}

      <form
        className="mt-6 grid gap-3"
        onSubmit={(e) => {
          e.preventDefault();
          setErr("");
          void saveArchive({ data: { title, body, accessTier: tier, published: true, contentType: "COS" } })
            .then(() => {
              setTitle("");
              setBody("");
              load();
            })
            .catch((error: Error) => setErr(error.message || "Rejected"));
        }}
      >
        <p className="text-[10px] uppercase tracking-[0.16em] text-lilac">New archive record</p>
        <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="TITLE" className={field} />
        <textarea value={body} onChange={(e) => setBody(e.target.value)} rows={4} placeholder="BODY" className={`${field} h-auto py-3 font-mono text-[12px] normal-case`} />
        <select value={tier} onChange={(e) => setTier(e.target.value)} className={field}>
          <option value="public">Public</option>
          <option value="seeker">Seeker</option>
          <option value="initiate">Initiate</option>
          <option value="priestline">Priestline</option>
        </select>
        <Button type="submit" variant="dark">Publish record</Button>
      </form>

      <form
        className="mt-8 grid gap-3 border-t border-paper/10 pt-6"
        onSubmit={(e) => {
          e.preventDefault();
          setErr("");
          void saveArchive({
            data: {
              id: editId,
              title: editTitle,
              slug: editSlug,
              body: editBody,
              accessTier: editTier,
              published: true,
              featured: editFeatured,
              contentType: editType,
            },
          })
            .then(() => load())
            .catch((error: Error) => setErr(error.message || "Rejected"));
        }}
      >
        <p className="text-[10px] uppercase tracking-[0.16em] text-lilac">Edit a record</p>
        <select
          value={editId}
          onChange={(e) => {
            const id = e.target.value;
            setEditId(id);
            const row = desk?.archives.find((item) => item.id === id);
            if (!row) return;
            setEditTitle(row.title);
            setEditBody(row.body);
            setEditTier(row.access_tier);
            setEditSlug(row.slug);
            setEditType(row.content_type);
            setEditFeatured(row.featured);
          }}
          className={field}
        >
          <option value="">Choose a record</option>
          {(desk?.archives ?? []).map((item) => (
            <option key={item.id} value={item.id}>
              {item.title}
              {item.body.includes("[CONTENT REQUIRED]") ? " · waiting" : ""}
            </option>
          ))}
        </select>
        {editId ? (
          <>
            <input value={editTitle} onChange={(e) => setEditTitle(e.target.value)} className={field} />
            <textarea value={editBody} onChange={(e) => setEditBody(e.target.value)} rows={6} className={`${field} h-auto py-3 font-mono text-[12px] normal-case`} />
            <select value={editTier} onChange={(e) => setEditTier(e.target.value)} className={field}>
              <option value="public">Public</option>
              <option value="seeker">Seeker</option>
              <option value="initiate">Initiate</option>
              <option value="priestline">Priestline</option>
            </select>
            <Button type="submit" variant="dark">Save record</Button>
          </>
        ) : null}
      </form>

      <form
        className="mt-8 grid gap-3 border-t border-paper/10 pt-6"
        onSubmit={(e) => {
          e.preventDefault();
          setErr("");
          void saveProgram({
            data: {
              title: programTitle,
              published: true,
              accessTier: "seeker",
              completionTitle: "Complete",
              completionBody: "The sequence is sealed.",
            },
          })
            .then(() => {
              setProgramTitle("");
              load();
            })
            .catch((error: Error) => setErr(error.message || "Rejected"));
        }}
      >
        <p className="text-[10px] uppercase tracking-[0.16em] text-lime">New sequence</p>
        <input value={programTitle} onChange={(e) => setProgramTitle(e.target.value)} placeholder="SEQUENCE TITLE" className={field} />
        <Button type="submit" variant="dark">Publish sequence</Button>
      </form>

      <form
        className="mt-8 grid gap-3 border-t border-paper/10 pt-6"
        onSubmit={(e) => {
          e.preventDefault();
          setErr("");
          void saveStep({
            data: {
              id: stepId || undefined,
              programId,
              stepNumber,
              title: stepTitle,
              instruction,
              reflectionPrompt: desk?.steps.find((step) => step.id === stepId)?.reflection_prompt,
              requiredInput: desk?.steps.find((step) => step.id === stepId)?.required_input,
              published: true,
            },
          })
            .then(() => {
              setStepTitle("");
              setInstruction("");
              load();
            })
            .catch((error: Error) => setErr(error.message || "Rejected"));
        }}
      >
        <p className="text-[10px] uppercase tracking-[0.16em] text-gold">Add or edit a step</p>
        <select value={programId} onChange={(e) => setProgramId(e.target.value)} className={field}>
          {(desk?.programs ?? []).map((program) => (
            <option key={program.id} value={program.id}>
              {program.title}
            </option>
          ))}
        </select>
        <select
          value={stepId}
          onChange={(e) => {
            const id = e.target.value;
            setStepId(id);
            const step = desk?.steps.find((item) => item.id === id);
            if (!step) return;
            setProgramId(step.program_id);
            setStepNumber(step.step_number);
            setStepTitle(step.title);
            setInstruction(step.instruction);
          }}
          className={field}
        >
          <option value="">New step</option>
          {(desk?.steps ?? [])
            .filter((step) => !programId || step.program_id === programId)
            .map((step) => (
              <option key={step.id} value={step.id}>
                {String(step.step_number).padStart(2, "0")} {step.title}
                {step.instruction.includes("[CONTENT REQUIRED]") ? " · waiting" : ""}
              </option>
            ))}
        </select>
        <input
          value={stepNumber}
          onChange={(e) => setStepNumber(Number(e.target.value))}
          type="number"
          min={1}
          className={field}
        />
        <input value={stepTitle} onChange={(e) => setStepTitle(e.target.value)} placeholder="STEP TITLE" className={field} />
        <textarea value={instruction} onChange={(e) => setInstruction(e.target.value)} rows={3} placeholder="INSTRUCTION" className={`${field} h-auto py-3 font-mono text-[12px] normal-case`} />
        <Button type="submit" variant="dark">{stepId ? "Save step" : "Add step"}</Button>
      </form>

      <ul className="mt-8 space-y-2 text-[11px] uppercase tracking-wide text-paper/55">
        {(desk?.programs ?? []).map((program) => (
          <li key={program.id}>
            {program.title} · {(desk?.steps ?? []).filter((step) => step.program_id === program.id).length} steps ·{" "}
            {program.published ? "published" : "hidden"}
          </li>
        ))}
        <li className="pt-2 text-lilac">{desk?.archives.length ?? 0} archive records</li>
      </ul>
    </section>
  );
}
