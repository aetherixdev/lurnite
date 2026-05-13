import { motion } from "framer-motion";
import { NewEvent } from '@/components'

export default function EventPopup({ dragBoundaryRef, popupPosition, setIsModalOpen, selectedDate, setSelectedDate, selectedEvent, setSelectedEvent, onEventAdded, onPreviewChange }) {
  return (
    <div
      ref={dragBoundaryRef}
      className="absolute inset-0 z-50 pointer-events-none"
    >
      <motion.div
        drag
        dragMomentum
        dragElastic={0.1}
        dragConstraints={dragBoundaryRef}
        dragTransition={{
          power: 0.25,
          timeConstant: 120,
          restDelta: 0.7,
        }}
        className="absolute pointer-events-auto"
        style={{
          top: popupPosition.top,
          left: popupPosition.left,
          transform: popupPosition.above
            ? "translateY(-100%)"
            : "none",
        }}
      >
        <div className="max-h-[calc(100vh-32px)] overflow-auto rounded-lg border border-slate-200 bg-white/60 backdrop-blur-md shadow-lg dark:border-slate-700 dark:bg-neutral-900 cursor-move">
          <NewEvent
            setIsDateSelected={setIsModalOpen}
            selectedDate={selectedDate}
            setSelectedDate={setSelectedDate}
            selectedEvent={selectedEvent}
            setSelectedEvent={setSelectedEvent}
            onEventAdded={onEventAdded}
            onPreviewChange={onPreviewChange}
          />
        </div>
      </motion.div>
    </div>
  );
}