import { collection, addDoc, getDocs, query, where, Timestamp, doc, updateDoc, deleteDoc } from "firebase/firestore";
import { db } from "../config";

// ─── Offline pending-event queue ────────────────────────────────────────────

const PENDING_KEY = "study_manager_pending_events";

const readQueue = () => {
  if (typeof window === "undefined") return [];
  try { return JSON.parse(localStorage.getItem(PENDING_KEY) || "[]"); }
  catch { return []; }
};

const writeQueue = (q) => {
  if (typeof window === "undefined") return;
  localStorage.setItem(PENDING_KEY, JSON.stringify(q));
};

export const queuePendingEvent = (sessionId, type, userId, eventData, eventId = null) => {
  const queue = readQueue();
  const idx = queue.findIndex((e) => e.sessionId === sessionId);
  const entry = { sessionId, type, userId, eventId, eventData, ts: Date.now() };
  if (idx >= 0) queue[idx] = entry;
  else queue.push(entry);
  writeQueue(queue);
};

export const dequeuePendingEvent = (sessionId) => {
  writeQueue(readQueue().filter((e) => e.sessionId !== sessionId));
};

export const flushPendingEvents = async (userId) => {
  const queue = readQueue().filter((e) => e.userId === userId);
  if (queue.length === 0) return false;
  let anyFlushed = false;
  for (const entry of queue) {
    try {
      if (entry.type === "create") {
        await addEvent(userId, entry.eventData);
      } else if (entry.type === "update" && entry.eventId) {
        await updateEvent(entry.eventId, entry.eventData);
      }
      dequeuePendingEvent(entry.sessionId);
      anyFlushed = true;
    } catch {
      // still offline — leave it for next flush
    }
  }
  return anyFlushed;
};

export const TYPE_COLORS = {
  "Study Session": "#5B4FD9",
  "Assignment":    "#FFD23F",
  "Exam":          "#FF6B9D",
  "Custom Event":  "#8886A0",
};

// Returns pending-create localStorage entries as FullCalendar event objects
export const getPendingCalendarEvents = (userId) =>
  readQueue()
    .filter((e) => e.userId === userId && e.type === "create")
    .map((e) => ({
      id: `__pending_${e.sessionId}`,
      title: e.eventData.title,
      start: e.eventData.start,
      end: e.eventData.end,
      allDay: e.eventData.allDay,
      backgroundColor: TYPE_COLORS[e.eventData.type] || "#5B4FD9",
      borderColor:     TYPE_COLORS[e.eventData.type] || "#5B4FD9",
      extendedProps: {
        description:  e.eventData.description,
        type:         e.eventData.type,
        repeatOption: e.eventData.repeatOption,
        pending:      true,
      },
    }));

/**
 * Add a new event to Firestore
 * @param {string} userId - The ID of the user creating the event
 * @param {Object} eventData - The event details
 */
export const addEvent = async (userId, eventData) => {
  try {
    const eventsRef = collection(db, "events");
    // Remove any undefined values
    const dataToSave = Object.entries(eventData).reduce((acc, [k, v]) => {
      if (v !== undefined) acc[k] = v;
      return acc;
    }, {});
    
    dataToSave.userId = userId;
    dataToSave.createdAt = Timestamp.now();

    const docRef = await addDoc(eventsRef, dataToSave);
    return { id: docRef.id, ...dataToSave };
  } catch (error) {
    console.error("Error adding event:", error);
    throw error;
  }
};

/**
 * Fetch all events for a given user
 * @param {string} userId - The ID of the user
 */
export const fetchUserEvents = async (userId) => {
  if (!userId) return [];
  
  try {
    const eventsRef = collection(db, "events");
    const q = query(eventsRef, where("userId", "==", userId));
    const querySnapshot = await getDocs(q);
    
    const events = [];
    querySnapshot.forEach((doc) => {
      const data = doc.data();
      events.push({
        id: doc.id,
        ...data,
        backgroundColor: TYPE_COLORS[data.type] || "#5B4FD9",
        borderColor:     TYPE_COLORS[data.type] || "#5B4FD9",
      });
    });
    return events;
  } catch (error) {
    console.error("Error fetching events:", error);
    throw error;
  }
};

/**
 * Update an existing event in Firestore
 * @param {string} eventId - The ID of the event to update
 * @param {Object} eventData - The updated event details
 */
export const updateEvent = async (eventId, eventData) => {
  try {
    const eventRef = doc(db, "events", eventId);
    // Remove undefined
    const dataToSave = Object.entries(eventData).reduce((acc, [k, v]) => {
      if (v !== undefined) acc[k] = v;
      return acc;
    }, {});
    
    await updateDoc(eventRef, dataToSave);
    return { id: eventId, ...dataToSave };
  } catch (error) {
    console.error("Error updating event:", error);
    throw error;
  }
};

/**
 * Delete an event from Firestore
 * @param {string} eventId - The ID of the event to delete
 */
export const deleteEvent = async (eventId) => {
  try {
    const eventRef = doc(db, "events", eventId);
    await deleteDoc(eventRef);
    return eventId;
  } catch (error) {
    console.error("Error deleting event:", error);
    throw error;
  }
};
