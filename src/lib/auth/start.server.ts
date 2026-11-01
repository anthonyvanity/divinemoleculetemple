/**
 * GET /auth/start — server-only. Never import from the client.
 *
 * Google's redirect_uri is registered on divinemoleculetemple.grok.me.
 * The state cookie has to be set on that same host, or the return dies.
 * This handler 302s straight to the broker and forwards that cookie.
 */
import { auth } from "./server";
import { GROK_PROVIDERS } from "./providers";
import { houseReturnUrl } from "@/lib/vault-gate";

export async function handleAuthStart(request: Request): Promise<Response> {
  const url = new URL(request.url);
  const providerId = url.searchParams.get("provider")?.trim() || "grok-google";
  if (!GROK_PROVIDERS.some((provider) => provider.providerId === providerId)) {
    return text("That sign-in is not available.", 400);
  }
  const house = houseReturnUrl(url.searchParams.get("to"));
  const callbackURL = house ? `/auth/bridge?to=${encodeURIComponent(house.href)}` : "/dashboard";
  const errorCallbackURL = house ? `/auth/bridge?to=${encodeURIComponent(`${house.origin}/login`)}` : "/login";
  try {
    const apiRes = await auth.api.signInWithOAuth2({
      body: { providerId, callbackURL, errorCallbackURL },
      headers: request.headers,
      asResponse: true,
    });
    if (!apiRes.ok) {
      const detail = await apiRes.text().catch(() => "");
      return text(detail || "Google did not open.", 502);
    }
    const body = (await apiRes.json().catch(() => null)) as { url?: string } | null;
    if (!body?.url) return text("Google did not open.", 502);
    const headers = new Headers({ location: body.url, "cache-control": "no-store" });
    const cookies = typeof apiRes.headers.getSetCookie === "function" ? apiRes.headers.getSetCookie() : [];
    for (const cookie of cookies) headers.append("set-cookie", cookie);
    return new Response(null, { status: 302, headers });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Google did not open.";
    return text(message, 500);
  }
}

function text(message: string, status: number) {
  return new Response(message, {
    status,
    headers: { "content-type": "text/plain; charset=utf-8", "cache-control": "no-store" },
  });
}
