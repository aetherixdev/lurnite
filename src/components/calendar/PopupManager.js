// components/PopupManager.jsx
import { useEffect } from "react";
import { EventPopup } from "@/components";

/**
 * Handles re-anchoring the popup when the sidebar toggles,
 * and renders the EventPopup when conditions are met.
 */
export default function PopupManager({
  isDetailsOpen,
  isModalOpen,
  selectedDate,
  popupPosition,
  setPopupPosition,
  setIsModalOpen,
  setSelectedDate,
  selectedEvent,
  setSelectedEvent,
  dragBoundaryRef,
  calendarAreaRef,
  onEventAdded,
  onPreviewChange,
}) {
  // Re-anchor popup when sidebar collapses while a date is selected
  useEffect(() => {
    if (!isDetailsOpen && isModalOpen && selectedDate && !popupPosition) {
      const timeoutId = window.setTimeout(() => {
        const dateStr =
          selectedDate instanceof Date
            ? selectedDate.toISOString().slice(0, 10)
            : selectedDate;

        const dayEl = document.querySelector(`[data-date="${dateStr}"]`);
        if (!dayEl) return;

        const viewportHeight = window.innerHeight;
        const container = calendarAreaRef?.current;
        const margin = 16;
        const cellRect = dayEl.getBoundingClientRect();
        const spaceBelow = viewportHeight - cellRect.bottom;
        const minSpaceForBelow = 220;

        let position;
        if (container) {
          const containerRect = container.getBoundingClientRect();
          if (spaceBelow < minSpaceForBelow) {
            position = {
              top: Math.max(margin, cellRect.top - containerRect.top - 8),
              left: cellRect.left - containerRect.left,
              above: true,
            };
          } else {
            position = {
              top: cellRect.bottom - containerRect.top + 8,
              left: cellRect.left - containerRect.left,
              above: false,
            };
          }
        } else {
          position = {
            top: cellRect.bottom + (window.scrollY || 0) + 8,
            left: cellRect.left + (window.scrollX || 0),
            above: false,
          };
        }

        setPopupPosition(position);
      }, 320);

      return () => window.clearTimeout(timeoutId);
    }
  }, [isDetailsOpen, isModalOpen, selectedDate, popupPosition]);

  if (isDetailsOpen || !isModalOpen || !popupPosition) return null;

  return (
    <EventPopup
      key={selectedEvent?.id ?? (selectedDate instanceof Date ? selectedDate.toISOString() : "default")}
      dragBoundaryRef={dragBoundaryRef}
      popupPosition={popupPosition}
      setIsModalOpen={setIsModalOpen}
      selectedDate={selectedDate}
      setSelectedDate={setSelectedDate}
      selectedEvent={selectedEvent}
      setSelectedEvent={setSelectedEvent}
      onEventAdded={onEventAdded}
      onPreviewChange={onPreviewChange}
    />
  );
}