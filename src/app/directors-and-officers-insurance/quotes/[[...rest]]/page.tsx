import { LegacyCaseRedirect } from "@/components/features/CaseSync";

/** Old links without a case: sent on to the saved flow's case. */
export default function LegacyPage() {
  return <LegacyCaseRedirect />;
}
