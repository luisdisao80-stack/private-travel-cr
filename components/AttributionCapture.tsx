"use client";

import { useEffect } from "react";
import { captureAttribution } from "@/lib/attribution";

// Tiny mount-once component that fires the first-touch attribution
// capture on app startup. Lives at the root layout so EVERY page view
// gets a chance to record where the visitor came from — landing on
// /blog/*, /routes/*, the home, or anywhere else all funnel through here.
//
// Renders nothing.
export default function AttributionCapture() {
  useEffect(() => {
    captureAttribution();
  }, []);
  return null;
}
