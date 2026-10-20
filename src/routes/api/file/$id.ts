import { createFileRoute } from "@tanstack/react-router";
import { getSql } from "@/lib/db";
import { vaultAllowed, vaultRank } from "@/lib/vault-gate";

function asBytes(value: unknown): Uint8Array {
  if (value instanceof Uint8Array) return value;
  if (typeof Buffer !== "undefined" && Buffer.isBuffer(value)) return new Uint8Array(value);
  if (typeof value === "string") {
    const hex = value.startsWith("\\x") ? value.slice(2) : value;
    if (/^[0-9a-fA-F]+$/.test(hex) && hex.length % 2 === 0) {
      const out = new Uint8Array(hex.length / 2);
      for (let i = 0; i < out.length; i++) out[i] = Number.parseInt(hex.slice(i * 2, i * 2 + 2), 16);
      return out;
    }
  }
  return new Uint8Array();
}

export const Route = createFileRoute("/api/file/$id")({
  server: {
    handlers: {
      GET: async ({ params, request }) => {
        const sql = await getSql();
        const [row] = await sql<{
          mime: string;
          bytes: unknown;
          gate: string;
          filename: string;
        }>`
          select mime, bytes, gate, filename from house_file where id = ${params.id} limit 1
        `;
        if (!row?.filename) return new Response("Missing", { status: 404 });
        if (row.gate !== "public") {
          const header = request.headers.get("authorization") ?? "";
          const bearer = header.toLowerCase().startsWith("bearer ") ? header.slice(7).trim() : undefined;
          const { getSessionUser } = await import("@/lib/auth/verify.server");
          const user = await getSessionUser(bearer);
          if (!user) return new Response("Sign in", { status: 401 });
          const [m] = await sql<{ tier: string; role: string; scholarship: boolean }>`
            select coalesce(tier, 'seeker') as tier, coalesce(role, 'member') as role, coalesce(scholarship, false) as scholarship
            from user_membership where user_id = ${user.id} limit 1
          `;
          const rank = vaultRank(m?.role ?? "", m?.tier ?? "seeker", Boolean(m?.scholarship));
          if (!vaultAllowed(row.gate, rank)) return new Response("Held", { status: 403 });
        }
        const bytes = asBytes(row.bytes);
        if (!bytes.byteLength) return new Response("Empty", { status: 404 });
        const copy = new Uint8Array(bytes.byteLength);
        copy.set(bytes);
        const name = row.filename.replace(/[^\w.\- ]+/g, "") || "temple.pdf";
        return new Response(copy.buffer, {
          headers: {
            "Content-Type": row.mime || "application/pdf",
            "Content-Length": String(bytes.byteLength),
            "Content-Disposition": `inline; filename="${name}"`,
            "Cache-Control": row.gate === "public" ? "public, max-age=3600" : "private, no-store",
          },
        });
      },
    },
  },
});
