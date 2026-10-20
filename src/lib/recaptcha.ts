declare global {
  interface Window {
    grecaptcha?: {
      ready: (cb: () => void) => void;
      execute: (key: string, opts: { action: string }) => Promise<string>;
    };
  }
}

export function recaptchaSiteKey() {
  return String(import.meta.env.VITE_RECAPTCHA_SITE_KEY ?? "").trim();
}

let loading: Promise<void> | null = null;

function load(key: string) {
  if (typeof window === "undefined") return Promise.resolve();
  if (window.grecaptcha) return Promise.resolve();
  if (loading) return loading;
  loading = new Promise((resolve, reject) => {
    const script = document.createElement("script");
    script.src = `https://www.google.com/recaptcha/api.js?render=${encodeURIComponent(key)}`;
    script.async = true;
    script.onload = () => resolve();
    script.onerror = () => {
      loading = null;
      reject(new Error("reCAPTCHA did not load"));
    };
    document.head.appendChild(script);
  });
  return loading;
}

export async function recaptchaToken(action: string) {
  const key = recaptchaSiteKey();
  if (!key) return "";
  await load(key);
  const grecaptcha = window.grecaptcha;
  if (!grecaptcha) throw new Error("reCAPTCHA did not load");
  await new Promise<void>((resolve) => grecaptcha.ready(resolve));
  return grecaptcha.execute(key, { action });
}
