import React, { useEffect, useState } from "react";
import { Calendar } from "@/components/ui/calendar";
import { NewEvent } from "@/components"

export default function CalendarDetails({
  monthDate,
  onMonthChange,
  startMonth,
  endMonth,
  isDateSelected,
  setIsDateSelected,
  selectedDate,
  setSelectedDate,
  selectedEvent,
  setSelectedEvent,
  onEventAdded,
  onPreviewChange,
}) {
  const [date, setDate] = useState(new Date());

  useEffect(() => {
    if (monthDate instanceof Date && !Number.isNaN(monthDate.getTime())) {
      setDate((prev) => prev ?? new Date(monthDate));
    }
  }, [monthDate]);

  return (
    <div className="flex-1 rounded-lg border border-slate-100 bg-surface p-2 text-sm text-slate-700 dark:border-slate-700 dark:bg-neutral-900 dark:text-slate-100">
      {!isDateSelected && (<Calendar
        mode="single"
        captionLayout="dropdown"
        month={monthDate}
        startMonth={startMonth}
        endMonth={endMonth}
        onMonthChange={(newMonth) => {
          onMonthChange?.(newMonth);
        }}
        selected={date}
        onSelect={setDate}
        className="rounded-lg w-full"
      />)}
      <div>
        {isDateSelected && (
          <NewEvent
            key={selectedEvent?.id ?? (selectedDate instanceof Date ? selectedDate.toISOString() : "default")}
            setIsDateSelected={setIsDateSelected}
            selectedDate={selectedDate}
            setSelectedDate={setSelectedDate}
            selectedEvent={selectedEvent}
            setSelectedEvent={setSelectedEvent}
            onEventAdded={onEventAdded}
            onPreviewChange={onPreviewChange}
          />
        )}
      </div>
    </div>
  );
}