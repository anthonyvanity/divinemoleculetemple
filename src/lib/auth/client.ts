import { genericOAuthClient } from "better-auth/client/plugins";
import { createAuthClient } from "better-auth/react";
import { runPreSignInSignOut, runSignOut } from "../../../scripts/sign-out-plan.mjs";
import { sameHouseHost, CANONICAL_AUTH_ORIGIN } from "@/lib/vault-gate";
import { GROK_PROVIDERS } from "./providers";

/**
 * Better Auth client for this React SPA (browser-side).
 *
 * Talks to this app's OWN Better Auth at same-origin `/api/auth/*`. In the live
 * preview the app is an embedded iframe with PARTITIONED cookies, so after a
 * popup sign-in it can't read the session cookie — it authenticates with a
 * bearer token instead (captured from the popup, see `signIn`). The `onRequest`
 * hook attaches that token when present; when deployed (cookie auth) no token
 * is stored, so nothing changes.
 *
 * To sign out call `signOut()` below, NOT `authClient.signOut()`: the raw call
 * leaves the bearer token in place, and `onRequest` keeps re-attaching it, so
 * the visitor stays signed in.
 */
export const authClient = createAuthClient({
  plugins: [genericOAuthClient()],
  fetchOptions: {
    onRequest(ctx) {
      const token = getBearerToken();
      if (token) ctx.headers.set("Authorization", `Bearer ${token}`);
      return ctx;
    },
  },
});

/**
 * True when sign-in UI should be shown — i.e. whenever `VITE_AUTH_ENABLED` is
 * not `"false"`. The shipped template sets it to `"false"`
 * (`.grok/app-env.json`), which selects the dev user (see `use-current-user`);
 * with the key removed, sign-in is real in preview (baked preview client) and
 * when deployed (injected per-app client).
 */
export const authEnabled = import.meta.env.VITE_AUTH_ENABLED !== "false";

/** The upstream providers to render sign-in buttons for. */
export { GROK_PROVIDERS };

// ── Live-preview bearer token ────────────────────────────────────────────────
// The embedded preview iframe has partitioned cookies, so we keep the session's
// bearer token in sessionStorage and attach it to every Better Auth request (and
// to server functions, via `@/lib/auth/middleware`). Empty everywhere except the
// preview after a popup sign-in, so the cookie path is untouched elsewhere.
const BEARER_KEY = "grok-auth.bearer-token";

/** The stored preview bearer token, or null. */
export function getBearerToken(): string | null {
  if (typeof window === "undefined") return null;
  try {
    return window.sessionStorage.getItem(BEARER_KEY);
  } catch {
    return null;
  }
}

function setBearerToken(token: string | null): void {
  if (typeof window === "undefined") return;
  try {
    if (token) window.sessionStorage.setItem(BEARER_KEY, token);
    else window.sessionStorage.removeItem(BEARER_KEY);
  } catch {
    /* storage unavailable — ignore */
  }
}

/** Keep a session that was minted on another Temple host (custom domain handoff). */
export function adoptBearer(token: string): void {
  setBearerToken(token);
}

/** On the Temple domain, keep Google on this host. A hop to grok.me was dying before Google opened. */
function bridgeCallback(callbackURL: string, errorCallbackURL: string) {
  if (typeof window === "undefined" || sameHouseHost(window.location.hostname)) {
    return { callbackURL, errorCallbackURL };
  }
  const back = new URL(callbackURL, window.location.origin);
  if (back.origin !== window.location.origin) return { callbackURL, errorCallbackURL };
  const to = `${back.origin}${back.pathname}${back.search}`;
  return {
    callbackURL: `/auth/bridge?to=${encodeURIComponent(to)}`,
    errorCallbackURL: `/auth/bridge?to=${encodeURIComponent(`${window.location.origin}/login`)}`,
  };
}

/**
 * The sandbox live preview runs this app inside an iframe on a `*.grok-sandbox.com`
 * host, where a full-page redirect to the broker can't work — so sign-in uses a
 * popup there and a normal redirect everywhere else.
 */
function inLivePreview(): boolean {
  return (
    typeof window !== "undefined" &&
    window.location.hostname.endsWith(".grok-sandbox.com")
  );
}

const POPUP_RESULT_KEY = "grok-auth.popup-result";
const POPUP_CHANNEL = "grok-auth-popup";

/** Message the popup posts back once sign-in completes. X often nulls window.opener. */
type PopupMessage = { source: "grok-auth-popup"; token: string | null; error?: string };

function readPopupResult(): PopupMessage | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(POPUP_RESULT_KEY);
    if (!raw) return null;
    window.localStorage.removeItem(POPUP_RESULT_KEY);
    const data = JSON.parse(raw) as PopupMessage;
    if (!data || data.source !== "grok-auth-popup") return null;
    return data;
  } catch {
    return null;
  }
}

/**
 * Start sign-in with one upstream provider (`providerId` from `GROK_PROVIDERS`),
 * federating through the Grok auth broker.
 *
 * - **Live preview** (`*.grok-sandbox.com` iframe): opens a POPUP to
 *   `/auth/popup`, served by the template Vite plugin (see `vite.config.ts` +
 *   `popup.server.ts`) — 302s to the broker/upstream login (no app chrome) and,
 *   on return, posts the session bearer token back. We store it and refresh the
 *   session; no top-level navigation of the iframe to the broker.
 * - **Deployed** (and local non-iframe): a normal full-page redirect into the broker.
 *
 * Either way it clears any existing local session FIRST so switching providers
 * actually switches identity.
 */
export async function signIn(
  providerId: string,
  opts: { callbackURL?: string; errorCallbackURL?: string } = {},
): Promise<void> {
  // Google returns to grok.me. Start there so the state cookie and the
  // callback are the same host. Starting on the Temple domain sets the
  // cookie on www and the return never sees it.
  if (typeof window !== "undefined" && sameHouseHost(window.location.hostname) && !inLivePreview()) {
    const back = new URL(opts.callbackURL ?? "/dashboard", window.location.origin);
    if (back.hostname === "divinemoleculetemple.com") back.hostname = "www.divinemoleculetemple.com";
    if (back.hostname === "dmttemple.com") back.hostname = "www.dmttemple.com";
    const start = new URL("/auth/start", CANONICAL_AUTH_ORIGIN);
    start.searchParams.set("provider", providerId);
    start.searchParams.set("to", back.href);
    window.location.assign(start.href);
    return;
  }

  const bridged = bridgeCallback(opts.callbackURL ?? "/dashboard", opts.errorCallbackURL ?? "/login");
  const callbackURL = bridged.callbackURL;
  const errorCallbackURL = bridged.errorCallbackURL;

  // Open the popup SYNCHRONOUSLY on the user gesture — before any await
  // (including signOut). Awaiting first drops user-gesture privilege in some
  // browsers when the opener is a cross-origin live-preview iframe.
  const popup = inLivePreview() ? openSignInPopup(providerId) : null;

  // Clear any prior session so switching providers actually switches identity.
  // Bounded because the popup is already open — a request that never settles
  // would leave it hanging — but bounded PER ENVIRONMENT: only the server can
  // end a deployed session, so cutting it short at the preview's 1.5s would
  // start OAuth with the old session still live.
  await runPreSignInSignOut({
    livePreview: inLivePreview(),
    hasBearer: Boolean(getBearerToken()),
    requestSignOut: () => authClient.signOut(),
    clearToken: () => setBearerToken(null),
  });

  if (inLivePreview()) {
    if (!popup) throw new Error("Pop-up blocked — allow pop-ups for sign-in");
    const token = await waitForPopupToken(popup);
    if (!token) throw new Error("Sign-in was cancelled or failed");
    setBearerToken(token);
    // Refresh the client session store with the bearer attached (onRequest).
    // Avoid a full iframe reload when we're already on the destination — that
    // reload was the slow "still loading after the popup closed" feeling.
    try {
      await authClient.getSession();
    } catch {
      /* session store will recover on next useSession fetch */
    }
    if (typeof window !== "undefined") {
      const dest = new URL(callbackURL, window.location.origin);
      const here = window.location;
      if (dest.origin !== here.origin || dest.pathname !== here.pathname || dest.search !== here.search) {
        window.location.href = callbackURL;
      }
    }
    return;
  }

  const { data, error } = await authClient.signIn.oauth2({
    providerId,
    callbackURL,
    errorCallbackURL,
  });
  if (error) throw new Error(error.message ?? "Sign-in failed");
  if (data?.url) window.location.href = data.url;
}

/**
 * Open `/auth/popup` in a new window. Must run synchronously inside the click
 * handler (no await before this). The path is served by the template Vite
 * plugin (`authPopupPlugin` in vite.config.ts) — NOT by a React route.
 *
 * Opens the real URL directly (not about:blank → assign). From a cross-origin
 * iframe the about:blank dance often fails on the first click and the window
 * ends up showing the app shell.
 */
function openSignInPopup(providerId: string): Window | null {
  const origin = window.location.origin;
  const url = `${origin}/auth/popup?providerId=${encodeURIComponent(providerId)}`;
  // Unique name per attempt so a prior attempt stuck on the SPA is not reused.
  const name = `grok-signin-${Date.now()}`;
  return window.open(url, name, "popup,width=500,height=650");
}

/**
 * Wait for the popup's completion page to postMessage the session bearer (or
 * for the user to dismiss the popup).
 */
function waitForPopupToken(popup: Window): Promise<string | null> {
  return new Promise((resolve) => {
    const origin = window.location.origin;
    let settled = false;
    let closeTimer: number | undefined;
    let channel: BroadcastChannel | null = null;
    const settle = (token: string | null) => {
      if (settled) return;
      settled = true;
      cleanup();
      resolve(token);
    };
    const take = (data: PopupMessage | null | undefined) => {
      if (!data || data.source !== "grok-auth-popup") return;
      settle(data.token ?? null);
    };
    // Drop a stale result from an earlier attempt before this popup returns.
    readPopupResult();
    const onMessage = (event: MessageEvent) => {
      if (event.origin !== origin) return;
      take(event.data as PopupMessage | undefined);
    };
    const onStorage = (event: StorageEvent) => {
      if (event.key !== POPUP_RESULT_KEY || !event.newValue) return;
      try {
        take(JSON.parse(event.newValue) as PopupMessage);
      } catch {
        /* ignore a bad payload */
      }
    };
    try {
      channel = new BroadcastChannel(POPUP_CHANNEL);
      channel.onmessage = (event) => take(event.data as PopupMessage);
    } catch {
      channel = null;
    }
    // X severs window.opener, so the popup also writes localStorage. Poll in
    // case the storage event is missed, and when the window is dismissed.
    const pollTimer = window.setInterval(() => {
      take(readPopupResult());
      if (!popup.closed) return;
      window.clearInterval(pollTimer);
      closeTimer = window.setTimeout(() => settle(null), 400);
    }, 300);
    function cleanup() {
      window.clearInterval(pollTimer);
      if (closeTimer !== undefined) window.clearTimeout(closeTimer);
      window.removeEventListener("message", onMessage);
      window.removeEventListener("storage", onStorage);
      channel?.close();
    }
    window.addEventListener("message", onMessage);
    window.addEventListener("storage", onStorage);
  });
}

/**
 * Sign out of THIS app's local session, clear the preview token, then redirect.
 *
 * Use this, never `authClient.signOut()` — see the note on `authClient`.
 * Sequencing lives in `scripts/sign-out-plan.mjs` so it can be unit-tested.
 *
 * **Rejects when deployed if the server never confirms.** There the session is
 * an HttpOnly cookie only the server can clear, so redirecting anyway would
 * report a sign-out that did not happen. `<UserButton />` handles that for you;
 * a hand-rolled control must catch it and let the visitor retry. In the live
 * preview the local clear is sufficient, so it always resolves.
 */
export async function signOut(redirectTo = "/"): Promise<void> {
  await runSignOut({
    livePreview: inLivePreview(),
    hasBearer: Boolean(getBearerToken()),
    // Better Auth resolves with `{ error }` instead of rejecting, so surface a
    // failed response as a rejection for the sequence to act on.
    requestSignOut: async () => {
      const { error } = await authClient.signOut();
      if (error) throw new Error(error.message ?? "Sign-out failed");
    },
    clearToken: () => setBearerToken(null),
    redirect: () => {
      window.location.href = redirectTo;
    },
  });
}
