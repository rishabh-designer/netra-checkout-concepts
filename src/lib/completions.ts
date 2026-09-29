/**
 * Inline ghost completions: what a field can offer from what's already known
 * (the pincode and place for an address, the company's email domain), and
 * the matcher that finds the ghost for what's been typed so far.
 */

export interface CompletionContext {
  pincode?: string;
  /** "Kolkata, West Bengal". */
  place?: string;
  /** "studio2rs.in": the domain of the email on file. */
  emailDomain?: string;
}

const MAIL_DOMAINS = ["gmail.com", "outlook.com", "yahoo.com"];

/** The phrases a field's ghost can complete to, most likely first. */
export function completionsFor(key: string, ctx: CompletionContext): string[] {
  if (key === "email") return (ctx.emailDomain ? [ctx.emailDomain] : MAIL_DOMAINS).map((d) => `@${d}`);
  if (key === "address") {
    const [city, state] = (ctx.place ?? "").split(",").map((s) => s.trim());
    const pin = ctx.pincode?.trim() ?? "";
    return [city && pin && `${city} ${pin}`, city && state && pin && `${city}, ${state} ${pin}`, state && pin && `${state} ${pin}`, city, state].filter(
      (s): s is string => !!s,
    );
  }
  return [];
}

/**
 * The ghost for `value`: the rest of the first phrase that the value's last
 * word(s) start. Fragments begin at the start, after a space or comma, or at
 * an "@", and need 2+ letters (an "@" alone is enough). `accept` is the value
 * with the fragment swapped for the whole phrase (in the phrase's casing).
 */
export function ghostFor(value: string, phrases: string[]): { ghost: string; accept: string } | null {
  if (!value || !phrases.length) return null;
  const starts = [0];
  for (let i = 1; i < value.length; i++) {
    if (/[\s,]/.test(value[i - 1]) && !/[\s,]/.test(value[i])) starts.push(i);
    if (value[i] === "@") starts.push(i);
  }
  for (const i of starts) {
    const fragment = value.slice(i);
    if (fragment.length < (fragment.startsWith("@") ? 1 : 2)) continue;
    const lower = fragment.toLowerCase();
    const phrase = phrases.find((p) => p.length > fragment.length && p.toLowerCase().startsWith(lower));
    if (phrase) return { ghost: phrase.slice(fragment.length), accept: value.slice(0, i) + phrase };
  }
  return null;
}
