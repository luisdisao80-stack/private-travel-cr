"use client";

import { useEffect, useState } from "react";
import { GoogleAnalytics, GoogleTagManager } from "@next/third-parties/google";
import { hasAnalyticsConsent } from "@/components/CookieBanner";

type Props = {
  gaId?: string;
  gtmId?: string;
};

/**
 * Mounts GA4 / GTM scripts only once the visitor has accepted analytics
 * cookies. Re-checks consent when the banner dispatches our custom
 * `ptcr:consent-changed` event so the scripts can come online in the
 * same session, without a reload.
 */
export default function ConsentGatedAnalytics({ gaId, gtmId }: Props) {
  const [consented, setConsented] = useState(false);

  useEffect(() => {
    setConsented(hasAnalyticsConsent());
    const onChange = () => setConsented(hasAnalyticsConsent());
    window.addEventListener("ptcr:consent-changed", onChange);
    return () => window.removeEventListener("ptcr:consent-changed", onChange);
  }, []);

  if (!consented) return null;
  return (
    <>
      {gaId ? <GoogleAnalytics gaId={gaId} /> : null}
      {gtmId ? <GoogleTagManager gtmId={gtmId} /> : null}
    </>
  );
}
