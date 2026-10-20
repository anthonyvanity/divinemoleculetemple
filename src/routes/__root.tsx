import { createRootRoute, HeadContent, Outlet, Scripts } from "@tanstack/react-router";
import { AuthProvider } from "@/lib/auth/provider";
import { PreviewHostBridge } from "@/components/preview-host-bridge";
import { SiteShell, PhoneDock } from "@/components/site-shell";
import { RadioDock } from "@/components/radio-dock";
import { FogNode } from "@/components/fog-node";
import { AccessSync } from "@/components/access-sync";
import { Toaster } from "sonner";
import appCss from "../styles.css?url";

const APP_NAME = "Divine Molecule Temple";

function publicShareHost() {
  const raw =
    (typeof process !== "undefined" ? process.env.VITE_PUBLIC_HOSTNAME : "") ||
    (typeof import.meta !== "undefined" ? String(import.meta.env.VITE_PUBLIC_HOSTNAME ?? "") : "");
  const host = raw.split(",")[0]?.trim().split(":")[0]?.toLowerCase() ?? "";
  if (!host || !/^[a-z0-9.-]+$/.test(host) || !host.includes(".")) return "";
  if (/^\d{1,3}(?:\.\d{1,3}){3}$/.test(host)) return "";
  if (host.endsWith(".vercel.app") || host.endsWith(".vercel.com")) return "";
  return host;
}

const host = publicShareHost();
const xBanner = host ? `https://${host}/x-banner.jpg` : "";

export const Route = createRootRoute({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1, viewport-fit=cover" },
      { title: APP_NAME },
      {
        name: "description",
        content:
          "A digital sanctuary and modern academy. Where sacred technology meets consciousness expansion.",
      },
      { name: "theme-color", content: "#050505" },
      { name: "apple-mobile-web-app-status-bar-style", content: "black" },
      ...(xBanner ? [{ property: "x:game:image", content: xBanner }] : []),
    ],
    links: [
      { rel: "icon", type: "image/svg+xml", href: "/favicon.svg" },
      { rel: "apple-touch-icon", href: "/apple-touch.png" },
      { rel: "stylesheet", href: appCss },
      { rel: "manifest", href: "/__grok/manifest.webmanifest" },
    ],
  }),
  component: () => (
    <html lang="en" className="antialiased" suppressHydrationWarning>
      <head>
        <HeadContent />
      </head>
      <body>
        <PreviewHostBridge />
        <FogNode />
        <AccessSync />
        <AuthProvider>
          <SiteShell>
            <Outlet />
          </SiteShell>
          <RadioDock />
          <PhoneDock />
          <Toaster
            theme="dark"
            toastOptions={{
              className: "font-sans bg-ink text-bg border-orange",
            }}
          />
        </AuthProvider>
        <Scripts />
      </body>
    </html>
  ),
});
