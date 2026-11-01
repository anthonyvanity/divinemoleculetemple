import { useEffect } from "react";

/** The old device cache was saving a broken stylesheet. Clear it and do not register another. */
export function FogNode() {
  useEffect(() => {
    if (typeof navigator !== "undefined" && "serviceWorker" in navigator) {
      void navigator.serviceWorker.getRegistrations().then((regs) => {
        regs.forEach((reg) => void reg.unregister());
      });
    }
    if (typeof caches !== "undefined") {
      void caches.keys().then((keys) => {
        keys.forEach((key) => void caches.delete(key));
      });
    }
  }, []);
  return null;
}
