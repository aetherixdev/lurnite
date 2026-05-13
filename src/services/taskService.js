import { collection, addDoc, getDocs, query, where, Timestamp, doc, updateDoc, deleteDoc, orderBy, writeBatch } from "firebase/firestore";
import { db } from "../config";

export const addTask = async (userId, taskData) => {
  try {
    const tasksRef = collection(db, "tasks");
    const dataToSave = Object.entries(taskData).reduce((acc, [k, v]) => {
      if (v !== undefined) acc[k] = v;
      return acc;
    }, {});

    dataToSave.userId = userId;
    dataToSave.completed = !!dataToSave.completed;
    dataToSave.order = Date.now();

    const docRef = await addDoc(tasksRef, dataToSave);
    return { id: docRef.id, ...dataToSave };
  } catch (error) {
    console.error("Error adding task:", error);
    throw error;
  }
};

export const fetchUserTasks = async (userId) => {
  if (!userId) return [];
  try {
    const tasksRef = collection(db, "tasks");
    const q = query(tasksRef, where("userId", "==", userId), orderBy("order", "asc"));
    const querySnapshot = await getDocs(q);
    const tasks = [];
    querySnapshot.forEach((d) => tasks.push({ id: d.id, ...d.data() }));
    return tasks;
  } catch (error) {
    console.error("Error fetching tasks:", error);
    throw error;
  }
};

export const updateTask = async (taskId, taskData) => {
  try {
    const taskRef = doc(db, "tasks", taskId);
    const dataToSave = Object.entries(taskData).reduce((acc, [k, v]) => {
      if (v !== undefined) acc[k] = v;
      return acc;
    }, {});
    await updateDoc(taskRef, dataToSave);
    return { id: taskId, ...dataToSave };
  } catch (error) {
    console.error("Error updating task:", error);
    throw error;
  }
};

export const deleteTask = async (taskId) => {
  try {
    const taskRef = doc(db, "tasks", taskId);
    await deleteDoc(taskRef);
    return taskId;
  } catch (error) {
    console.error("Error deleting task:", error);
    throw error;
  }
};

export const updateTasksOrder = async (orderedTasks) => {
  try {
    const batch = writeBatch(db);
    orderedTasks.forEach(({ id, order }) => {
      const taskRef = doc(db, "tasks", id);
      batch.update(taskRef, { order });
    });
    await batch.commit();
  } catch (error) {
    console.error("Error updating tasks order:", error);
    throw error;
  }
};

