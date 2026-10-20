import { useEffect } from "react";

/** Registers the device-side fog cache (service worker). Client only. */
export function FogNode() {
  useEffect(() => {
    if (typeof navigator === "undefined" || !("serviceWorker" in navigator)) return;
    void navigator.serviceWorker.register("/fog-sw.js").catch(() => {});
  }, []);
  return null;
}
