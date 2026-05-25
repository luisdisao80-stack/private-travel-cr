"use client";

import * as React from "react";
import { DayPicker } from "react-day-picker";
import { format } from "date-fns";
import { enUS, es } from "date-fns/locale";
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight } from "lucide-react";

import { cn } from "@/lib/utils";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

type DatePickerProps = {
  value?: string;
  onChange: (isoDate: string) => void;
  placeholder?: string;
  lang?: "en" | "es";
  minDate?: Date;
  className?: string;
};

export function DatePicker({
  value,
  onChange,
  placeholder,
  lang = "en",
  minDate,
  className,
}: DatePickerProps) {
  const [open, setOpen] = React.useState(false);

  const selected = value ? new Date(value + "T00:00:00") : undefined;
  const locale = lang === "es" ? es : enUS;
  const today = minDate ?? new Date(new Date().setHours(0, 0, 0, 0));

  // Bookable range: from today up to 2 years out. Most tourism
  // bookings happen 1-6 months ahead; capping at 2 years keeps the
  // year-dropdown short and the picker fast.
  const startMonth = new Date(today.getFullYear(), today.getMonth(), 1);
  const endMonth = new Date(today.getFullYear() + 2, 11, 31);

  const display = selected
    ? format(selected, "PPP", { locale })
    : placeholder ?? (lang === "es" ? "Selecciona una fecha" : "Pick a date");

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          type="button"
          className={cn(
            "flex h-12 w-full items-center justify-start gap-2 rounded-md border border-amber-500/30 bg-black/50 px-3 text-left text-white transition-colors hover:border-amber-500/60 focus:border-amber-500 focus:outline-none",
            !selected && "text-gray-500",
            className
          )}
        >
          <CalendarIcon size={16} className="text-amber-400 shrink-0" />
          <span className="truncate">{display}</span>
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-3">
        <DayPicker
          mode="single"
          selected={selected}
          onSelect={(date) => {
            if (!date) return;
            const iso = format(date, "yyyy-MM-dd");
            onChange(iso);
            setOpen(false);
          }}
          disabled={{ before: today }}
          locale={locale}
          showOutsideDays
          // Month + year dropdowns so customers booking far ahead (e.g.
          // Christmas trip in Dec 2026 from May 2026) can jump straight
          // to the target month without ~7 next-arrow clicks.
          captionLayout="dropdown"
          startMonth={startMonth}
          endMonth={endMonth}
          // Explicit chevron icons for the prev/next month nav. Without
          // this, react-day-picker v9 renders un-styled default arrows
          // that disappear against the dark popover background.
          components={{
            Chevron: ({ orientation }) =>
              orientation === "left" ? (
                <ChevronLeft size={18} aria-hidden="true" />
              ) : (
                <ChevronRight size={18} aria-hidden="true" />
              ),
          }}
          classNames={{
            months: "flex flex-col gap-4",
            month: "space-y-3",
            month_caption: "flex justify-center items-center h-9",
            // Dropdowns are now the only navigation. The text label and
            // the chevron buttons become redundant and overlap visually
            // (the v9 default renders both). Hide the text label and the
            // nav. caption_label stays as sr-only so screen readers
            // still announce 'July 2027' even though it's not visible.
            caption_label: "sr-only",
            dropdowns: "flex items-center justify-center gap-2",
            dropdown_root: "relative",
            dropdown:
              "h-8 px-2 pr-7 rounded-md bg-amber-500/10 border border-amber-500/30 text-amber-300 text-sm font-semibold appearance-none cursor-pointer hover:bg-amber-500/20 focus:outline-none focus:border-amber-500",
            months_dropdown: "",
            years_dropdown: "",
            nav: "hidden",
            button_previous: "hidden",
            button_next: "hidden",
            month_grid: "w-full border-collapse",
            weekdays: "flex",
            weekday:
              "w-9 h-9 text-[0.7rem] font-medium text-gray-500 uppercase flex items-center justify-center",
            week: "flex w-full",
            day: "h-9 w-9 text-center text-sm p-0 relative",
            day_button:
              "h-9 w-9 inline-flex items-center justify-center rounded-md text-gray-200 hover:bg-amber-500/10 hover:text-amber-400 transition-colors",
            selected:
              "[&_button]:bg-amber-500 [&_button]:text-black [&_button]:font-bold [&_button]:hover:bg-amber-500 [&_button]:hover:text-black",
            today: "[&_button]:ring-1 [&_button]:ring-amber-500/50",
            outside: "[&_button]:text-gray-700",
            disabled: "[&_button]:text-gray-700 [&_button]:opacity-40 [&_button]:cursor-not-allowed [&_button]:hover:bg-transparent [&_button]:hover:text-gray-700",
            hidden: "invisible",
          }}
        />
      </PopoverContent>
    </Popover>
  );
}
