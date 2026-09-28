import { mockDemoNotices } from "@/mocks/demoNotices";
import type { DemoNoticeContent } from "@/types/demoNotice";

/** Copy for the not-yet-built clicks. The seam to swap for a backend later. */
export async function getDemoNotices(): Promise<DemoNoticeContent> {
  return mockDemoNotices;
}
