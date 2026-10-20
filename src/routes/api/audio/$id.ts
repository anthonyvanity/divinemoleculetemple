import { createFileRoute } from "@tanstack/react-router";
import { getSql } from "@/lib/db";

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

export const Route = createFileRoute("/api/audio/$id")({
  server: {
    handlers: {
      GET: async ({ params }) => {
        const sql = await getSql();
        const [row] = await sql<{ mime: string; bytes: unknown }>`
          select mime, bytes from house_audio where id = ${params.id} limit 1
        `;
        if (!row) return new Response("Missing", { status: 404 });
        const bytes = asBytes(row.bytes);
        if (!bytes.byteLength) return new Response("Empty", { status: 404 });
        const copy = new Uint8Array(bytes.byteLength);
        copy.set(bytes);
        return new Response(copy.buffer, {
          headers: {
            "Content-Type": row.mime || "audio/mpeg",
            "Content-Length": String(bytes.byteLength),
            "Cache-Control": "public, max-age=86400",
          },
        });
      },
    },
  },
});
