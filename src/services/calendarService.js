import { collection, addDoc, getDocs, query, where, Timestamp, doc, updateDoc, deleteDoc } from "firebase/firestore";
import { db } from "../config";

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
    
    const typeColors = {
      "Study Session": "#5B4FD9",
      "Assignment": "#FFD23F",
      "Exam": "#FF6B9D",
      "Custom Event": "#8886A0"
    };

    const events = [];
    querySnapshot.forEach((doc) => {
      // Need to format timestamps back to what FullCalendar or our app expects
      // E.g. date strings
      const data = doc.data();
      events.push({
        id: doc.id,
        ...data,
        backgroundColor: typeColors[data.type] || "#5B4FD9",
        borderColor: typeColors[data.type] || "#5B4FD9"
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
