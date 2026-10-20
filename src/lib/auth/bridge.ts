import { createServerFn } from "@tanstack/react-start";
import { getSql } from "@/lib/db";

const SESSION_COOKIE = "__Host-grok-auth.session_token";

/** Signed-in host (usually grok.me) mints a one-time ticket for the Temple domain. */
export const issueBridge = createServerFn({ method: "POST" })
  .validator(() => true)
  .handler(async () => {
    const { getSessionUser } = await import("@/lib/auth/verify.server");
    const { readSessionToken } = await import("@/lib/auth/server");
    const user = await getSessionUser();
    const token = readSessionToken();
    if (!user || !token || token.length < 20) throw new Error("No session on this host");
    const sql = await getSql();
    const id = crypto.randomUUID();
    const expires = new Date(Date.now() + 90_000).toISOString();
    await sql`
      insert into auth_bridge (id, token, expires_at)
      values (${id}, ${token}, ${expires})
    `;
    return { ticket: id };
  });

/** Temple domain burns the ticket, sets the host cookie, and returns the bearer. */
export const redeemBridge = createServerFn({ method: "POST" })
  .validator((ticket: string) => ticket.trim())
  .handler(async ({ data }) => {
    if (!/^[0-9a-f-]{36}$/i.test(data)) throw new Error("Bridge expired");
    const sql = await getSql();
    const [row] = await sql<{ token: string }>`
      update auth_bridge
      set used = true
      where id = ${data}
        and used = false
        and expires_at > now()
      returning token
    `;
    if (!row?.token) throw new Error("Bridge expired");
    await sql`delete from auth_bridge where id = ${data}`;
    const { setCookie } = await import("@tanstack/react-start/server");
    setCookie(SESSION_COOKIE, row.token, {
      httpOnly: true,
      secure: true,
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 7,
    });
    return { token: row.token };
  });
