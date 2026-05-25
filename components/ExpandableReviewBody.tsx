"use client";

import { useState } from "react";

/**
 * Review body with a "Read more / Show less" toggle. Renders the full
 * text into the HTML always (so Google + AI crawlers see every word and
 * the review is indexable/quotable), and only clamps it visually with
 * a CSS line-clamp when collapsed.
 *
 * Used inside the otherwise-server-rendered <ReviewCards/> so we get
 * SEO/AEO benefits AND the in-place expand UX. The expand toggle only
 * shows up for reviews long enough to actually be clamped (>~280 chars),
 * which avoids dead "Read more" buttons on short reviews.
 */
type Props = {
  text: string;
  /** Character threshold above which the "Read more" toggle appears. */
  expandThreshold?: number;
};

export default function ExpandableReviewBody({ text, expandThreshold = 280 }: Props) {
  const [expanded, setExpanded] = useState(false);
  const showToggle = text.length > expandThreshold;

  return (
    <div className="flex-1 mb-4">
      <p
        className={
          "text-sm text-gray-300 leading-relaxed " +
          (expanded || !showToggle ? "" : "line-clamp-6")
        }
      >
        {text}
      </p>
      {showToggle ? (
        <button
          type="button"
          onClick={() => setExpanded((v) => !v)}
          className="mt-2 text-xs font-semibold text-amber-400 hover:text-amber-300 transition-colors"
        >
          {expanded ? "Show less ↑" : "Read more ↓"}
        </button>
      ) : null}
    </div>
  );
}
