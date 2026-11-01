function pdfEscape(value: string) {
  return value.replace(/\\/g, "\\\\").replace(/\(/g, "\\(").replace(/\)/g, "\\)");
}

function plain(value: string) {
  return value
    .replace(/[“”]/g, '"')
    .replace(/[–—]/g, "-")
    .replace(/[’‘]/g, "'")
    .replace(/[^\x20-\x7E\n]/g, "");
}

function wrap(text: string, width: number) {
  const lines: string[] = [];
  for (const paragraph of plain(text).split(/\n+/)) {
    const words = paragraph.trim().split(/\s+/).filter(Boolean);
    if (!words.length) {
      lines.push("");
      continue;
    }
    let line = "";
    for (const word of words) {
      const next = line ? `${line} ${word}` : word;
      if (next.length > width && line) {
        lines.push(line);
        line = word;
      } else {
        line = next;
      }
    }
    if (line) lines.push(line);
  }
  return lines;
}

type Run = { font: "F1" | "F2"; size: number; text: string; gap: number };

export function buildClassPdf(title: string, body: string) {
  const runs: Run[] = [
    { font: "F2", size: 9, text: "DIVINE MOLECULE TEMPLE", gap: 28 },
    ...wrap(title.toUpperCase(), 34).map((text) => ({ font: "F2" as const, size: 18, text, gap: 24 })),
    { font: "F1", size: 11, text: "", gap: 12 },
    ...wrap(body, 86).map((text) => ({ font: "F1" as const, size: 11, text, gap: 15 })),
  ];
  const pages: Run[][] = [];
  let page: Run[] = [];
  let y = 740;
  for (const run of runs) {
    if (y - run.gap < 54 && page.length) {
      pages.push(page);
      page = [];
      y = 740;
    }
    page.push(run);
    y -= run.gap;
  }
  if (page.length) pages.push(page);

  const objects: string[] = [];
  const kids: number[] = [];
  let next = 5;
  for (const lines of pages) {
    const pageId = next++;
    const contentId = next++;
    kids.push(pageId);
    const draw = ["BT", "54 740 Td"];
    for (const run of lines) {
      draw.push(`/${run.font} ${run.size} Tf`, `(${pdfEscape(run.text)}) Tj`, `0 -${run.gap} Td`);
    }
    draw.push("ET");
    const stream = draw.join("\n");
    objects[pageId] = `<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Contents ${contentId} 0 R /Resources << /Font << /F1 3 0 R /F2 4 0 R >> >> >>`;
    objects[contentId] = `<< /Length ${stream.length} >>\nstream\n${stream}\nendstream`;
  }
  objects[1] = "<< /Type /Catalog /Pages 2 0 R >>";
  objects[2] = `<< /Type /Pages /Kids [${kids.map((n) => `${n} 0 R`).join(" ")}] /Count ${kids.length} >>`;
  objects[3] = "<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>";
  objects[4] = "<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold >>";

  let pdf = "%PDF-1.4\n";
  const offsets = [0];
  for (let n = 1; n < objects.length; n += 1) {
    if (!objects[n]) continue;
    offsets[n] = pdf.length;
    pdf += `${n} 0 obj\n${objects[n]}\nendobj\n`;
  }
  const xref = pdf.length;
  const max = objects.length - 1;
  pdf += `xref\n0 ${max + 1}\n0000000000 65535 f \n`;
  for (let n = 1; n <= max; n += 1) {
    pdf += `${String(offsets[n] || 0).padStart(10, "0")} 00000 n \n`;
  }
  pdf += `trailer << /Size ${max + 1} /Root 1 0 R >>\nstartxref\n${xref}\n%%EOF`;
  return pdf;
}
