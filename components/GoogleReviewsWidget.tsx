"use client";

import { useEffect } from "react";

const ELFSIGHT_APP_ID = "9b1b5720-8a90-41e8-943a-cb0a078b495c";
const PLATFORM_SRC = "https://elfsightcdn.com/platform.js";

export default function GoogleReviewsWidget() {
  useEffect(() => {
    if (document.querySelector(`script[src="${PLATFORM_SRC}"]`)) return;
    const s = document.createElement("script");
    s.src = PLATFORM_SRC;
    s.async = true;
    document.body.appendChild(s);
  }, []);

  // Reserved min-height stops layout shift while the widget boots, and gives
  // a visible "something is loading" footprint instead of a blank gap.
  return (
    <div className="min-h-[400px]">
      <div className={`elfsight-app-${ELFSIGHT_APP_ID}`} />
    </div>
  );
}
