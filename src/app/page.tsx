"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

/* The root forwards to the product page on the client, so "/" itself answers
   200 (the preview pane's readiness check doesn't follow a server redirect). */
export default function Home() {
  const router = useRouter();
  useEffect(() => {
    router.replace("/directors-and-officers-insurance");
  }, [router]);
  return null;
}
