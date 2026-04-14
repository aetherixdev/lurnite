"use client";
import React, { useState, useRef, useEffect } from "react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import interactionPlugin from "@fullcalendar/interaction";
import timeGridPlugin from "@fullcalendar/timegrid";
import listPlugin from "@fullcalendar/list";
import rrulePlugin from "@fullcalendar/rrule";
import {
  PageWithSidebar,
  CalendarHeader,
  CalendarDetails,
} from "@/components";
import { usePopup } from "@/hooks/usePopup";
import { PopupManager } from "@/components";
import { useAuth } from "@/contexts/AuthContext";
import { fetchUserEvents } from "@/services/calendarService";

const RANGE_START_MONTH = new Date(2000, 0, 1);
const RANGE_END_MONTH = new Date(2100, 11, 1);
const RANGE_END_EXCLUSIVE = new Date(
  RANGE_END_MONTH.getFullYear(),
  RANGE_END_MONTH.getMonth() + 1,
  1
);

export default function StudyCalendar({ initialEvents }) {
  const [view, setView] = useState("Month");
  const [isDetailsOpen, setIsDetailsOpen] = useState(true);
  const [isTodaySoftHighlight, setIsTodaySoftHighlight] = useState(false);
  const [navAnimation, setNavAnimation] = useState(null);
  const [canPrev, setCanPrev] = useState(true);
  const [canNext, setCanNext] = useState(true);

  const dragBoundaryRef = useRef(null);
  const calendarAreaRef = useRef(null);
  const calendarRef = useRef(null);
  const touchStartRef = useRef(null);
  const lastWheelNavTimeRef = useRef(0);

  const [title, setTitle] = useState("");
  const [currentMonthDate, setCurrentMonthDate] = useState(() => new Date());

  const { user } = useAuth();
  const [events, setEvents] = useState(initialEvents || []);

  const loadEvents = async () => {
    if (user?.uid) {
      try {
        const fetchedEvents = await fetchUserEvents(user.uid);
        setEvents(fetchedEvents);
      } catch (err) {
        console.error("Failed to fetch events:", err);
      }
    }
  };

  useEffect(() => {
    loadEvents();
  }, [user]);

  const {
    isModalOpen,
    setIsModalOpen,
    selectedDate,
    setSelectedDate,
    selectedEvent,
    setSelectedEvent,
    popupPosition,
    setPopupPosition,
    handleDateClick,
    handleEventClick,
  } = usePopup(calendarAreaRef);

  const monthKey = (d) => d.getFullYear() * 12 + d.getMonth();

  const clampToMonthRange = (d) => {
    const minKey = monthKey(RANGE_START_MONTH);
    const maxKey = monthKey(RANGE_END_MONTH);
    const key = monthKey(d);
    if (key < minKey) return new Date(RANGE_START_MONTH);
    if (key > maxKey) return new Date(RANGE_END_MONTH);
    return d;
  };

  const handleDatesSet = (info) => {
    const nextTitle = info?.view?.title ?? "";
    setTitle((prev) => (prev === nextTitle ? prev : nextTitle));

    if (info?.view?.currentStart instanceof Date) {
      const nextMonth = new Date(info.view.currentStart);
      setCurrentMonthDate((prev) => {
        if (!(prev instanceof Date) || Number.isNaN(prev.getTime())) return nextMonth;
        return monthKey(prev) === monthKey(nextMonth) ? prev : nextMonth;
      });

      const minKey = monthKey(RANGE_START_MONTH);
      const maxKey = monthKey(RANGE_END_MONTH);
      const key = monthKey(nextMonth);
      setCanPrev((prev) => { const next = key > minKey; return prev === next ? prev : next; });
      setCanNext((prev) => { const next = key < maxKey; return prev === next ? prev : next; });
    }
  };

  const triggerNavAnimation = (type) => {
    setNavAnimation(type);
    setTimeout(() => setNavAnimation(null), 220);
  };

  const goNext = () => {
    if (!canNext) return;
    calendarRef.current?.getApi().next();
    triggerNavAnimation("next");
  };

  const goPrev = () => {
    if (!canPrev) return;
    calendarRef.current?.getApi().prev();
    triggerNavAnimation("prev");
  };

  const goToday = () => {
    const api = calendarRef.current?.getApi();
    if (!api) return;

    const today = new Date();
    const clampedToday = clampToMonthRange(today);
    const viewType = api.view?.type;
    const rangeStart = api.view?.currentStart;
    const rangeEnd = api.view?.currentEnd;
    const isTodayInCurrentRange =
      rangeStart instanceof Date &&
      rangeEnd instanceof Date &&
      today >= rangeStart &&
      today < rangeEnd;

    api.gotoDate(clampedToday);
    if (!(viewType === "dayGridMonth" && isTodayInCurrentRange)) {
      triggerNavAnimation("fade");
    }
    setIsTodaySoftHighlight(true);
    setTimeout(() => setIsTodaySoftHighlight(false), 900);
  };

  const handleTouchStart = (event) => {
    if (event.touches.length !== 1) return;
    const touch = event.touches[0];
    touchStartRef.current = { x: touch.clientX, y: touch.clientY, time: Date.now() };
  };

  const handleTouchEnd = (event) => {
    if (!touchStartRef.current || event.changedTouches.length === 0) return;
    const start = touchStartRef.current;
    const touch = event.changedTouches[0];
    const dx = touch.clientX - start.x;
    const dy = touch.clientY - start.y;
    const dt = Date.now() - start.time;

    if (dt <= 600 && Math.abs(dx) >= 50 && Math.abs(dx) > Math.abs(dy)) {
      if (dx < 0) goNext();
      else goPrev();
    }
    touchStartRef.current = null;
  };

  const handleWheel = (event) => {
    const now = Date.now();
    const horizontal = Math.abs(event.deltaX);
    const vertical = Math.abs(event.deltaY);

    if (horizontal <= vertical || horizontal < 40) return;
    if (now - lastWheelNavTimeRef.current < 400) return;
    lastWheelNavTimeRef.current = now;

    if (event.deltaX > 0) goNext();
    else goPrev();
  };

  const mapLabelToViewId = (label) => {
    switch (label) {
      case "Week": return "timeGridWeek";
      case "Schedule": return "listWeek";
      case "Month":
      default: return "dayGridMonth";
    }
  };

  const handleViewChange = (nextLabel) => {
    setView(nextLabel);
    calendarRef.current?.getApi().changeView(mapLabelToViewId(nextLabel));
  };

  // Keep FullCalendar layout stable when sidebar expands/collapses
  useEffect(() => {
    const api = calendarRef.current?.getApi();
    if (!api) return;
    setNavAnimation("fade");
    const id = setTimeout(() => {
      api.updateSize();
      setNavAnimation(null);
    }, 220);
    return () => clearTimeout(id);
  }, [isDetailsOpen]);

  return (
    <PageWithSidebar>
      <div className="flex h-full select-none relative">
        <div className="flex flex-1 flex-col relative">
          <CalendarHeader
            title={title}
            goToday={goToday}
            goPrev={goPrev}
            goNext={goNext}
            canPrev={canPrev}
            canNext={canNext}
            view={view}
            onViewChange={handleViewChange}
            isDetailsOpen={isDetailsOpen}
            onToggleDetails={() => setIsDetailsOpen((open) => !open)}
          />
          <div
            ref={calendarAreaRef}
            className={`flex-1 overflow-y-auto relative ${
              isTodaySoftHighlight ? "calendar-today-soft-highlight" : ""
            } ${
              navAnimation === "next"
                ? "calendar-slide-next"
                : navAnimation === "prev"
                ? "calendar-slide-prev"
                : navAnimation === "fade"
                ? "calendar-fade"
                : ""
            }`}
            onTouchStart={handleTouchStart}
            onTouchEnd={handleTouchEnd}
            onWheel={handleWheel}
          >
            <FullCalendar
              plugins={[dayGridPlugin, timeGridPlugin, listPlugin, interactionPlugin, rrulePlugin]}
              initialView={mapLabelToViewId(view)}
              events={events}
              dateClick={(arg) => handleDateClick(arg, isDetailsOpen)}
              eventClick={(arg) => handleEventClick(arg, isDetailsOpen)}
              eventClassNames={(arg) => {
                if (
                  arg.view.type === "dayGridMonth" &&
                  arg.event.start &&
                  (arg.event.start < arg.view.currentStart || arg.event.start >= arg.view.currentEnd)
                ) {
                  return ["opacity-50", "saturate-50"];
                }
                return [];
              }}
              height="100%"
              headerToolbar={false}
              ref={calendarRef}
              datesSet={handleDatesSet}
              validRange={{
                start: RANGE_START_MONTH,
                end: RANGE_END_EXCLUSIVE,
              }}
            />
            <PopupManager
              isDetailsOpen={isDetailsOpen}
              isModalOpen={isModalOpen}
              selectedDate={selectedDate}
              popupPosition={popupPosition}
              setPopupPosition={setPopupPosition}
              setIsModalOpen={setIsModalOpen}
              setSelectedDate={setSelectedDate}
              selectedEvent={selectedEvent}
              setSelectedEvent={setSelectedEvent}
              dragBoundaryRef={dragBoundaryRef}
              calendarAreaRef={calendarAreaRef}
              onEventAdded={loadEvents}
            />
          </div>
        </div>

        <div
          className={`flex h-full flex-col transition-all duration-200 ${
            isDetailsOpen ? "ml-8 w-64" : "w-0 ml-4"
          }`}
        >
          {isDetailsOpen && (
            <CalendarDetails
              monthDate={currentMonthDate}
              startMonth={RANGE_START_MONTH}
              endMonth={RANGE_END_MONTH}
              isDateSelected={isModalOpen}
              setIsDateSelected={setIsModalOpen}
              selectedDate={selectedDate}
              setSelectedDate={setSelectedDate}
              selectedEvent={selectedEvent}
              setSelectedEvent={setSelectedEvent}
              onMonthChange={(newMonth) => {
                const api = calendarRef.current?.getApi();
                if (!api) return;

                const fromKey =
                  currentMonthDate instanceof Date && !Number.isNaN(currentMonthDate.getTime())
                    ? currentMonthDate.getFullYear() * 12 + currentMonthDate.getMonth()
                    : null;
                const toKey =
                  newMonth instanceof Date && !Number.isNaN(newMonth.getTime())
                    ? newMonth.getFullYear() * 12 + newMonth.getMonth()
                    : null;

                api.gotoDate(clampToMonthRange(newMonth));

                if (fromKey !== null && toKey !== null) {
                  if (toKey > fromKey) triggerNavAnimation("next");
                  else if (toKey < fromKey) triggerNavAnimation("prev");
                  else triggerNavAnimation("fade");
                } else {
                  triggerNavAnimation("fade");
                }
              }}
              onEventAdded={loadEvents}
            />
          )}
        </div>
      </div>
    </PageWithSidebar>
  );
}