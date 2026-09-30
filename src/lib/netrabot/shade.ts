/**
 * Colour shading for the body's lighting. Works on #rrggbb only (the brand
 * purple and its overrides): below 1 darkens toward black, above 1 lightens
 * toward white. Anything else is returned unchanged.
 */

import { clamp } from "./math";

export function shade(hex: string, factor: number): string {
  const match = /^#([0-9a-f]{6})$/i.exec(hex);
  if (!match) return hex;
  const value = parseInt(match[1], 16);
  const channels = [(value >> 16) & 255, (value >> 8) & 255, value & 255];
  const out = channels.map((channel) => {
    const next = factor <= 1 ? channel * factor : channel + (255 - channel) * (factor - 1);
    return clamp(Math.round(next), 0, 255).toString(16).padStart(2, "0");
  });
  return `#${out.join("")}`;
}
