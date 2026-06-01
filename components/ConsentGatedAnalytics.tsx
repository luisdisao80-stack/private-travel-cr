"use client";

import { useEffect, useState } from "react";
import Script from "next/script";
import { GoogleAnalytics, GoogleTagManager } from "@next/third-parties/google";
import { hasAnalyticsConsent } from "@/components/CookieBanner";

type Props = {
  gaId?: string;
  gtmId?: string;
  /** Microsoft Clarity project ID. Free heatmaps + session recordings.
   *  Find it at clarity.microsoft.com → Settings → Setup. Like GA, we
   *  only load it after analytics consent is granted. */
  clarityId?: string;
};

/**
 * Mounts GA4 / GTM / Clarity scripts only once the visitor has accepted
 * analytics cookies. Re-checks consent when the banner dispatches our
 * custom `ptcr:consent-changed` event so the scripts can come online in
 * the same session, without a reload.
 */
export default function ConsentGatedAnalytics({ gaId, gtmId, clarityId }: Props) {
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
      {clarityId ? (
        <Script
          id="ms-clarity"
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{
            __html: `
              (function(c,l,a,r,i,t,y){
                c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};
                t=l.createElement(r);t.async=1;t.src="https://www.clarity.ms/tag/"+i;
                y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y);
              })(window, document, "clarity", "script", "${clarityId}");
            `,
          }}
        />
      ) : null}
    </>
  );
}
