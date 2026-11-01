import { useSyncExternalStore } from "react";

const KEY = "dmt-dash-theme";
let dark = true;
const listeners = new Set<() => void>();

function emit() {
  listeners.forEach((listener) => listener());
}

export function useDashDark() {
  return useSyncExternalStore(
    (listener) => {
      listeners.add(listener);
      return () => listeners.delete(listener);
    },
    () => dark,
    () => true,
  );
}

export function toggleDashDark() {
  dark = !dark;
  try {
    localStorage.setItem(KEY, dark ? "dark" : "light");
  } catch {
    /* private mode */
  }
  emit();
}

if (typeof window !== "undefined") {
  try {
    dark = localStorage.getItem(KEY) !== "light";
  } catch {
    dark = true;
  }
}
