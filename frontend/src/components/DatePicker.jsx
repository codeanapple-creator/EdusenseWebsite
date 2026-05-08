import React from "react";
import { format, parse, isValid } from "date-fns";
import { Calendar as CalendarIcon } from "lucide-react";
import { Calendar } from "./ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover";
import { Button } from "./ui/button";
import { cn } from "../lib/utils";

/**
 * Controlled date picker.
 * value: ISO date string YYYY-MM-DD (or "")
 * onChange: (string) => void
 */
export default function DatePicker({
  value,
  onChange,
  placeholder = "Pick a date",
  className,
  testid = "date-picker",
  fromYear,
  toYear,
  disabled,
  required,
}) {
  const parsed = value ? parse(value, "yyyy-MM-dd", new Date()) : null;
  const display = parsed && isValid(parsed) ? format(parsed, "PPP") : "";

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          type="button"
          variant="outline"
          disabled={disabled}
          data-testid={testid}
          className={cn(
            "w-full justify-start text-left font-normal rounded-xl bg-white",
            !value && "text-slate-400",
            className,
          )}
        >
          <CalendarIcon size={16} strokeWidth={2.5} className="mr-2 opacity-70" />
          {display || placeholder}
          {required && !value && <span className="sr-only">required</span>}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start" data-testid={`${testid}-popover`}>
        <Calendar
          mode="single"
          selected={parsed || undefined}
          onSelect={(d) => onChange(d ? format(d, "yyyy-MM-dd") : "")}
          captionLayout={(fromYear || toYear) ? "dropdown" : undefined}
          fromYear={fromYear}
          toYear={toYear}
          initialFocus
        />
      </PopoverContent>
    </Popover>
  );
}
