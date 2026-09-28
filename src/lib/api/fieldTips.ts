import { mockFieldTips } from "@/mocks/fieldTips";
import type { FieldTips } from "@/types/fieldTips";

/** Info tooltips for form fields. The seam to swap for a backend later. */
export async function getFieldTips(): Promise<FieldTips> {
  return mockFieldTips;
}
