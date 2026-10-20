import { useState } from "react";
import { recaptchaToken } from "@/lib/recaptcha";

export function useSpamSeal() {
  const [company, setCompany] = useState("");
  const [opened] = useState(() => Date.now());
  return { company, setCompany, opened };
}

export async function withRecaptcha(
  spam: { company: string; opened: number },
  action: string,
) {
  const token = await recaptchaToken(action);
  return { company: spam.company, opened: spam.opened, token, action };
}

/** Off-screen field. People never see it. Bots fill it. */
export function SpamFields({
  company,
  setCompany,
}: {
  company: string;
  setCompany: (value: string) => void;
}) {
  return (
    <div aria-hidden="true" className="absolute -left-[9999px] h-0 w-0 overflow-hidden">
      <label>
        Company website
        <input
          tabIndex={-1}
          autoComplete="off"
          value={company}
          onChange={(e) => setCompany(e.target.value)}
          name="company"
        />
      </label>
    </div>
  );
}
