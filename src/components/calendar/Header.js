import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  ChevronLeft,
  ChevronRight,
  PanelRightOpen,
  PanelRightClose,
} from "lucide-react";

export default function CalendarHeader({
  title,
  goToday,
  goPrev,
  goNext,
  canPrev = true,
  canNext = true,
  view, // "Month" | "Week" | "Schedule"
  onViewChange,
  isDetailsOpen,
  onToggleDetails,
}) {
  return (
    <div className="flex items-center justify-between px-2 py-4 border-b">
      <h2 className="text-2xl font-bold text-slate-800">{title}</h2>
      <div className="flex items-center gap-2">
        <Button variant="outline" size="lg" onClick={goToday}>
          Today
        </Button>
        <Select value={view} onValueChange={onViewChange}>
          <SelectTrigger className="w-full max-w-56">
            <SelectValue placeholder="Select a view" />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              <SelectItem value="Month">Month</SelectItem>
              <SelectItem value="Week">Week</SelectItem>
              <SelectItem value="Schedule">Schedule</SelectItem>
            </SelectGroup>
          </SelectContent>
        </Select>
        <div className="flex bg-sky-100 rounded-lg">
          <Button
            variant="ghost"
            className={`hover:bg-sky-200 cursor-pointer ${!canPrev ? "opacity-50 pointer-events-none" : ""}`}
            size="icon"
            onClick={goPrev}
            disabled={!canPrev}
          >
            <ChevronLeft size={18} />
          </Button>
          <Button
            variant="ghost"
            className={`hover:bg-sky-200 cursor-pointer ${!canNext ? "opacity-50 pointer-events-none" : ""}`}
            size="icon"
            onClick={goNext}
            disabled={!canNext}
          >
            <ChevronRight size={18} />
          </Button>
        </div>
        {onToggleDetails && (
          <Button
            type="button"
            variant="outline"
            size="icon"
            className={`ml-1 transition-colors ${
              isDetailsOpen
                ? "bg-slate-100 text-slate-900 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-50 dark:hover:bg-slate-700"
                : ""
            }`}
            onClick={onToggleDetails}
          >
            {isDetailsOpen ? (
              <PanelRightOpen size={18} />
            ) : (
              <PanelRightClose size={18} />
            )}
          </Button>
        )}
      </div>
    </div>
  );
}
