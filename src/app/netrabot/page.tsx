import type { Metadata } from "next";
import { NetraLab } from "@/components/features/netrabot-lab";

export const metadata: Metadata = {
  title: "NetraBot studio | BimaNetra",
  robots: { index: false, follow: false },
};

export default function NetraBotLabPage() {
  return <NetraLab />;
}
