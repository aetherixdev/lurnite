// hooks/usePopup.js
import { useState, useEffect } from "react";

export function usePopup(calendarAreaRef) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [popupPosition, setPopupPosition] = useState(null);

  const computePopupPosition = (cellRect) => {
    const viewportHeight = window.innerHeight;
    const container = calendarAreaRef.current;
    const margin = 16;
    const spaceBelow = viewportHeight - cellRect.bottom;
    const minSpaceForBelow = 220;

    if (container) {
      const containerRect = container.getBoundingClientRect();
      const belowTop = cellRect.bottom - containerRect.top + 8;

      if (spaceBelow < minSpaceForBelow) {
        const anchorTop = Math.max(margin, cellRect.top - containerRect.top - 8);
        return { top: anchorTop, left: cellRect.left - containerRect.left, above: true };
      }

      return { top: belowTop, left: cellRect.left - containerRect.left, above: false };
    }

    const scrollY = window.scrollY || window.pageYOffset;
    const scrollX = window.scrollX || window.pageXOffset;
    return { top: cellRect.bottom + scrollY + 8, left: cellRect.left + scrollX, above: false };
  };

  const handleDateClick = (arg, isDetailsOpen) => {
    setSelectedDate(arg.date);
    setSelectedEvent(null); // Clear selected event

    if (!isDetailsOpen && arg.dayEl) {
      const rect = arg.dayEl.getBoundingClientRect();
      setPopupPosition(computePopupPosition(rect));
    } else {
      setPopupPosition(null);
    }

    setIsModalOpen(true);
  };

  const handleEventClick = (arg, isDetailsOpen) => {
    setSelectedEvent(arg.event);
    setSelectedDate(arg.event.start);

    if (!isDetailsOpen) {
      // Prefer anchoring to the event element, but fall back to the day cell
      // (some FullCalendar views/interactions may not provide a stable `arg.el`).
      const rect =
        arg.el?.getBoundingClientRect?.() ??
        document
          .querySelector(
            `[data-date="${(arg.event?.start ?? new Date()).toISOString().slice(0, 10)}"]`
          )
          ?.getBoundingClientRect?.();

      if (rect) setPopupPosition(computePopupPosition(rect));
      else setPopupPosition(null);
    } else {
      setPopupPosition(null);
    }

    setIsModalOpen(true);
  };

  // Clear popup position when modal closes
  useEffect(() => {
    if (!isModalOpen) setPopupPosition(null);
  }, [isModalOpen]);

  // Re-anchor popup when sidebar hides while a date is already selected
  useEffect(() => {
    // This effect is only relevant when the sidebar is hidden — callers should
    // pass `isDetailsOpen` in; instead we expose a helper they can call.
  }, []);

  const reanchorPopup = (isDetailsOpen) => {
    if (!isDetailsOpen && isModalOpen && selectedDate && !popupPosition) {
      const timeoutId = window.setTimeout(() => {
        const dateStr =
          selectedDate instanceof Date
            ? selectedDate.toISOString().slice(0, 10)
            : selectedDate;

        const dayEl = document.querySelector(`[data-date="${dateStr}"]`);
        if (dayEl) {
          const rect = dayEl.getBoundingClientRect();
          setPopupPosition(computePopupPosition(rect));
        }
      }, 320);

      return () => window.clearTimeout(timeoutId);
    }
  };

  return {
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
    reanchorPopup,
    computePopupPosition,
  };
}