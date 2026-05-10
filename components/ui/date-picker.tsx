"use client";

import * as React from "react";
import { DayPicker } from "react-day-picker";
import { format } from "date-fns";
import { enUS, es } from "date-fns/locale";
import { Calendar as CalendarIcon } from "lucide-react";

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
          classNames={{
            months: "flex flex-col gap-4",
            month: "space-y-3",
            month_caption: "flex justify-center items-center h-9 relative",
            caption_label: "text-sm font-semibold text-amber-400",
            nav: "absolute inset-x-0 top-0 flex items-center justify-between px-1 h-9",
            button_previous:
              "h-7 w-7 inline-flex items-center justify-center rounded-md text-gray-400 hover:bg-amber-500/10 hover:text-amber-400 transition-colors",
            button_next:
              "h-7 w-7 inline-flex items-center justify-center rounded-md text-gray-400 hover:bg-amber-500/10 hover:text-amber-400 transition-colors",
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
