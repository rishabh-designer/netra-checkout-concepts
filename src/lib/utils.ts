import { clsx, type ClassValue } from "clsx";

/** Merge conditional class names. */
export function cn(...inputs: ClassValue[]): string {
  return clsx(inputs);
}

/** Indian mobile number as "xxxx xxx xxx": keeps digits only, drops a pasted
 *  country code / trunk prefix ("+91…", "0…"), caps at 10, and groups 4-3-3 as
 *  the user types (e.g. "9007296854" → "9007 296 854"). */
export function formatPhone(value: string): string {
  let d = value.replace(/\D/g, "");
  if (d.length > 10 && d.startsWith("91")) d = d.slice(2);
  else if (d.length > 10 && d.startsWith("0")) d = d.slice(1);
  d = d.slice(0, 10);
  return [d.slice(0, 4), d.slice(4, 7), d.slice(7)].filter(Boolean).join(" ");
}
