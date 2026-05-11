"use client";

import { Check } from "lucide-react";

export type WizardStep = "search" | "trip" | "checkout" | "done";

const STEPS: { id: WizardStep; label: string }[] = [
  { id: "search", label: "Search" },
  { id: "trip", label: "Trip Details" },
  { id: "checkout", label: "Checkout" },
  { id: "done", label: "Done" },
];

type Props = {
  current: WizardStep;
  /** Optional click handler — only fires for already-completed steps. */
  onStepClick?: (step: WizardStep) => void;
};

function statusOf(idx: number, currentIdx: number): "done" | "current" | "todo" {
  if (idx < currentIdx) return "done";
  if (idx === currentIdx) return "current";
  return "todo";
}

export default function WizardProgress({ current, onStepClick }: Props) {
  const currentIdx = STEPS.findIndex((s) => s.id === current);

  return (
    <div className="w-full bg-gray-950/60 border-y border-amber-500/10 backdrop-blur-sm">
      <div className="max-w-6xl mx-auto px-4">
        <div className="grid grid-cols-4">
          {STEPS.map((s, i) => {
            const st = statusOf(i, currentIdx);
            const clickable = st === "done" && !!onStepClick;
            const Tag = clickable ? "button" : "div";
            return (
              <Tag
                key={s.id}
                type={clickable ? "button" : undefined}
                onClick={clickable ? () => onStepClick(s.id) : undefined}
                className={
                  "relative flex items-center justify-center gap-2 py-4 md:py-5 text-xs md:text-sm font-semibold transition-colors " +
                  (st === "current"
                    ? "text-amber-400 border-b-2 border-amber-400 bg-amber-500/5"
                    : st === "done"
                      ? "text-green-400 " + (clickable ? "hover:bg-green-500/5 cursor-pointer" : "")
                      : "text-gray-500")
                }
              >
                <span
                  className={
                    "inline-flex items-center justify-center w-6 h-6 md:w-7 md:h-7 rounded-full text-[11px] font-bold " +
                    (st === "current"
                      ? "bg-amber-500 text-black"
                      : st === "done"
                        ? "bg-green-500 text-black"
                        : "bg-gray-800 text-gray-500 border border-gray-700")
                  }
                >
                  {st === "done" ? <Check size={14} strokeWidth={3} /> : i + 1}
                </span>
                <span className="hidden sm:inline">{s.label}</span>
              </Tag>
            );
          })}
        </div>
      </div>
    </div>
  );
}
