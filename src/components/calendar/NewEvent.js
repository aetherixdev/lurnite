import React, { useState, useEffect } from "react"
import { useAuth } from "@/contexts/AuthContext";
import { addEvent, updateEvent, deleteEvent } from "@/services/calendarService";
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { format } from "date-fns"
import { Calendar as CalendarIcon, X as CloseIcon } from "lucide-react"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  SelectGroup,
} from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"

export default function NewEvent({ setIsDateSelected, selectedDate, setSelectedDate, selectedEvent, setSelectedEvent, onEventAdded }) {
  const { user } = useAuth();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [isAllDay, setIsAllDay] = useState(true);
  const [startTime, setStartTime] = useState("09:00");
  const [endTime, setEndTime] = useState("10:00");
  const [eventType, setEventType] = useState("Study Session");
  const [repeatOption, setRepeatOption] = useState("Does not repeat");
  const [customDays, setCustomDays] = useState({
    0: false, 1: false, 2: false, 3: false, 4: false, 5: false, 6: false
  });

  const [isCustomRecurrenceOpen, setIsCustomRecurrenceOpen] = useState(false);
  const [customInterval, setCustomInterval] = useState(1);
  const [customUnit, setCustomUnit] = useState("Week");
  const [customEndType, setCustomEndType] = useState("Never");
  const [customEndOccurrences, setCustomEndOccurrences] = useState(1);
  const [customEndDate, setCustomEndDate] = useState(new Date());

  useEffect(() => {
    if (selectedEvent) {
      setTitle(selectedEvent.title || "");
      setDescription(selectedEvent.extendedProps?.description || "");
      setIsAllDay(selectedEvent.allDay);

      if (selectedEvent.start && !selectedEvent.allDay) {
        setStartTime(format(selectedEvent.start, "HH:mm"));
      }
      if (selectedEvent.end) {
        setEndTime(format(selectedEvent.end, "HH:mm"));
      } else if (selectedEvent.start && !selectedEvent.allDay) {
        const fallbackEnd = new Date(selectedEvent.start);
        fallbackEnd.setHours(fallbackEnd.getHours() + 1);
        setEndTime(format(fallbackEnd, "HH:mm"));
      }

      if (selectedEvent.extendedProps?.type) setEventType(selectedEvent.extendedProps.type);
      if (selectedEvent.extendedProps?.repeatOption) setRepeatOption(selectedEvent.extendedProps.repeatOption);
    }
  }, [selectedEvent]);

  const handleSave = async () => {
    if (!user) return;
    try {
      let startStr, endStr;
      const baseDate = selectedDate || new Date();

      if (isAllDay) {
        startStr = format(baseDate, "yyyy-MM-dd");
        endStr = format(baseDate, "yyyy-MM-dd");
      } else {
        const [startH, startM] = startTime.split(":");
        const startDateTime = new Date(baseDate);
        startDateTime.setHours(parseInt(startH, 10), parseInt(startM, 10), 0);
        startStr = startDateTime.toISOString();

        const [endH, endM] = endTime.split(":");
        const endDateTime = new Date(baseDate);
        endDateTime.setHours(parseInt(endH, 10), parseInt(endM, 10), 0);
        endStr = endDateTime.toISOString();
      }

      const eventData = {
        title: title || "Untitled Event",
        description,
        start: startStr,
        end: endStr,
        allDay: isAllDay,
        type: eventType,
        repeatOption,
      };

      if (repeatOption !== "Does not repeat") {
        let rrule = {
          dtstart: startStr
        };

        if (repeatOption === "Repeat daily") {
          rrule.freq = "daily";
        } else if (repeatOption === "Repeat every week") {
          rrule.freq = "weekly";
        } else if (repeatOption === "Repeat every month") {
          rrule.freq = "monthly";
        } else if (repeatOption === "Repeat every year") {
          rrule.freq = "yearly";
        } else if (repeatOption === "Custom") {
          rrule.interval = customInterval;
          if (customUnit === "Day") {
            rrule.freq = "daily";
          } else if (customUnit === "Week") {
            rrule.freq = "weekly";
            const days = ["su", "mo", "tu", "we", "th", "fr", "sa"];
            const byweekday = [];
            Object.keys(customDays).forEach(idx => {
              if (customDays[idx]) byweekday.push(days[idx]);
            });
            if (byweekday.length > 0) rrule.byweekday = byweekday;
          } else if (customUnit === "Month") {
            rrule.freq = "monthly";
          } else if (customUnit === "Year") {
            rrule.freq = "yearly";
          }

          if (customEndType === "On" && customEndDate) {
            rrule.until = format(customEndDate, "yyyy-MM-dd");
          } else if (customEndType === "After") {
            rrule.count = customEndOccurrences;
          }
        }
        eventData.rrule = rrule;
      }

      if (selectedEvent?.id) {
        await updateEvent(selectedEvent.id, eventData);
      } else {
        await addEvent(user.uid, eventData);
      }

      if (onEventAdded) onEventAdded();
      if (setIsDateSelected) setIsDateSelected(false);
      if (setSelectedEvent) setSelectedEvent(null);
    } catch (err) {
      console.error("Error saving event:", err);
    }
  };

  const handleDelete = async () => {
    if (!selectedEvent?.id) return;
    try {
      await deleteEvent(selectedEvent.id);
      if (onEventAdded) onEventAdded();
      if (setIsDateSelected) setIsDateSelected(false);
      if (setSelectedEvent) setSelectedEvent(null);
    } catch (e) {
      console.error("Error deleting event:", e);
    }
  };

  return (
    <div className="p-2 my-2 h-full">
      <div className="flex justify-between items-center">
        <h2 className="text-lg font-semibold">{selectedEvent ? "Edit Event" : "Add Event"}</h2>
        <Button
          onClick={() => {
            setIsDateSelected(false);
            if (setSelectedEvent) setSelectedEvent(null);
          }}
          type="button"
          variant="transparent"
          size="icon"
          className="text-muted-foreground hover:bg-muted hover:text-foreground"
        >
          <CloseIcon />
        </Button>
      </div>
      <div className="my-4 flex gap-y-2 flex-col">
        <Input placeholder="Title" value={title} onChange={(e) => setTitle(e.target.value)} />
        <Textarea placeholder="Description" value={description} onChange={(e) => setDescription(e.target.value)} />
        <div className="flex flex-col gap-y-1">
          <Label htmlFor="event-date" className="text-xs text-slate-500 font-medium">Date</Label>
          <Popover>
            <PopoverTrigger
              render={
                <Button
                  id="event-date"
                  variant="outline"
                  data-empty={!selectedDate}
                  className="justify-start text-left font-normal"
                />
              }
            >
              <CalendarIcon />
              {selectedDate ? format(selectedDate, "PPP") : <span>Pick a date</span>}
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0">
              <Calendar mode="single" selected={selectedDate} onSelect={setSelectedDate} />
            </PopoverContent>
          </Popover>
        </div>
        <div className="flex items-center space-x-2 py-1 my-1 mx-[7]">
          <Checkbox
            id="all-day"
            checked={isAllDay}
            onCheckedChange={(checked) => setIsAllDay(!!checked)}
          />
          <Label htmlFor="all-day" className="cursor-pointer">All day</Label>
        </div>
        {!isAllDay && (
          <div className="flex gap-x-2 my-1">
            <div className="flex-1 flex flex-col gap-y-1">
              <Label htmlFor="start-time" className="text-xs text-slate-500 font-medium">Start Time</Label>
              <Input
                id="start-time"
                type="time"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
              />
            </div>
            <div className="flex-1 flex flex-col gap-y-1">
              <Label htmlFor="end-time" className="text-xs text-slate-500 font-medium">End Time</Label>
              <Input
                id="end-time"
                type="time"
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
              />
            </div>
          </div>
        )}
        <div className="flex flex-col gap-y-1">
          <Label htmlFor="repeat-option" className="text-xs text-slate-500 font-medium">Repeat</Label>
          <div className="flex gap-x-2">
            <Select
              value={repeatOption}
              onValueChange={(val) => {
                if (val === "Custom") {
                  setIsCustomRecurrenceOpen(true);
                } else {
                  setRepeatOption(val);
                }
              }}
            >
              <SelectTrigger id="repeat-option" className="flex-1 bg-white px-4 py-2 h-9">
                <SelectValue placeholder="Repeat" />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectItem value="Does not repeat">Does not repeat</SelectItem>
                  <SelectItem value="Repeat daily">Repeat daily</SelectItem>
                  <SelectItem value="Repeat every week">Repeat every week</SelectItem>
                  <SelectItem value="Repeat every month">Repeat every month</SelectItem>
                  <SelectItem value="Repeat every year">Repeat every year</SelectItem>
                  <SelectItem value="Custom">Custom...</SelectItem>
                </SelectGroup>
              </SelectContent>
            </Select>
            {repeatOption === "Custom" && (
              <Button
                variant="outline"
                size="sm"
                className="h-9 bg-white"
                onClick={() => setIsCustomRecurrenceOpen(true)}
              >
                Edit
              </Button>
            )}
          </div>
        </div>

        <Dialog open={isCustomRecurrenceOpen} onOpenChange={setIsCustomRecurrenceOpen}>
          <DialogContent className="sm:max-w-[425px] bg-white">
            <DialogHeader>
              <DialogTitle>Custom recurrence</DialogTitle>
            </DialogHeader>
            <div className="grid gap-6 py-4">
              <div className="flex items-center gap-4">
                <Label className="whitespace-nowrap text-sm">Repeat every</Label>
                <Input
                  type="number"
                  className="w-16 h-9"
                  value={customInterval}
                  onChange={(e) => setCustomInterval(parseInt(e.target.value) || 1)}
                />
                <Select value={customUnit} onValueChange={setCustomUnit}>
                  <SelectTrigger className="w-28 h-9 bg-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Day">Day</SelectItem>
                    <SelectItem value="Week">Week</SelectItem>
                    <SelectItem value="Month">Month</SelectItem>
                    <SelectItem value="Year">Year</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {customUnit === "Week" && (
                <div className="flex flex-col gap-3">
                  <Label className="text-sm font-medium">Repeat on</Label>
                  <div className="flex justify-between">
                    {["S", "M", "T", "W", "T", "F", "S"].map((day, index) => (
                      <Button
                        key={index}
                        type="button"
                        variant={customDays[index] ? "default" : "outline"}
                        className={`rounded-full size-9 p-0 text-xs ${customDays[index] ? 'bg-slate-900 text-white hover:bg-slate-800' : 'hover:bg-slate-100'}`}
                        onClick={() => setCustomDays(prev => ({ ...prev, [index]: !prev[index] }))}
                      >
                        {day}
                      </Button>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex flex-col gap-3">
                <Label className="text-sm font-medium">Ends</Label>
                <RadioGroup value={customEndType} onValueChange={setCustomEndType} className="gap-3">
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="Never" id="end-never" />
                    <Label htmlFor="end-never" className="font-normal cursor-pointer">Never</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="On" id="end-on" />
                    <Label htmlFor="end-on" className="font-normal cursor-pointer flex items-center gap-2">
                      On
                      <Input
                        type="date"
                        className="h-8 w-36"
                        disabled={customEndType !== "On"}
                        value={format(customEndDate, 'yyyy-MM-dd')}
                        onChange={(e) => setCustomEndDate(new Date(e.target.value))}
                      />
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="After" id="end-after" />
                    <Label htmlFor="end-after" className="font-normal cursor-pointer flex items-center gap-2">
                      After
                      <Input
                        type="number"
                        className="h-8 w-16"
                        disabled={customEndType !== "After"}
                        value={customEndOccurrences}
                        onChange={(e) => setCustomEndOccurrences(parseInt(e.target.value) || 1)}
                      />
                      occurrences
                    </Label>
                  </div>
                </RadioGroup>
              </div>
            </div>
            <DialogFooter>
              <Button variant="ghost" onClick={() => setIsCustomRecurrenceOpen(false)}>Cancel</Button>
              <Button onClick={() => {
                setRepeatOption("Custom");
                setIsCustomRecurrenceOpen(false);
              }}>Done</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        <div className="flex flex-col gap-y-1">
          <Label htmlFor="event-type" className="text-xs text-slate-500 font-medium">Event Type</Label>
          <Select value={eventType} onValueChange={setEventType}>
            <SelectTrigger id="event-type" className="w-full bg-white px-4 py-2">
              <SelectValue placeholder="Event Type" />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectItem value="Study Session">Study Session</SelectItem>
                <SelectItem value="Assignment">Assignment</SelectItem>
                <SelectItem value="Exam">Exam</SelectItem>
                <SelectItem value="Custom Event">Custom Event</SelectItem>
              </SelectGroup>
            </SelectContent>
          </Select>
        </div>
      </div>
      <div className="flex justify-between my-2 gap-2 w-full">
        {selectedEvent && (
          <Button variant="destructive" className="flex-1" onClick={handleDelete}>Delete</Button>
        )}
        <Button className="flex-1" onClick={handleSave}>Save</Button>
      </div>
    </div>
  );
}