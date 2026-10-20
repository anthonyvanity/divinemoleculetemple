const KEY = "dmt-tour";

export function armFirstTour() {
  if (typeof window === "undefined") return;
  if (window.localStorage.getItem(KEY) === "done") return;
  window.localStorage.setItem(KEY, "pending");
}

export function tourPending() {
  if (typeof window === "undefined") return false;
  return window.localStorage.getItem(KEY) === "pending";
}

export function finishTour() {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(KEY, "done");
}
