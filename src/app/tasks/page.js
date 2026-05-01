"use client";

import { PageWithSidebar } from "@/components";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { useEffect, useMemo, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { addEvent } from "@/services/calendarService";
import { addTask, deleteTask, fetchUserTasks, updateTask } from "@/services/taskService";

export default function Tasks() {
    const { user, loading } = useAuth();
    const [tasks, setTasks] = useState([]);
    const [title, setTitle] = useState("");
    const [dueDate, setDueDate] = useState("");
    const [isAllDay, setIsAllDay] = useState(true);
    const [startTime, setStartTime] = useState("09:00");
    const [endTime, setEndTime] = useState("10:00");
    const [addToCalendar, setAddToCalendar] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const remainingCount = useMemo(
        () => tasks.filter((t) => !t.completed).length,
        [tasks]
    );

    const loadTasks = async () => {
        if (!user?.uid) return;
        try {
            const fetched = await fetchUserTasks(user.uid);
            setTasks(fetched);
        } catch (e) {
            console.error("Failed to fetch tasks:", e);
        }
    };

    useEffect(() => {
        if (!loading && user?.uid) loadTasks();
    }, [loading, user?.uid]);

    const toEventDateStrings = () => {
        if (!dueDate) return null;
        if (isAllDay) {
            return { start: dueDate, end: dueDate, allDay: true };
        }
        const startISO = new Date(`${dueDate}T${startTime}:00`).toISOString();
        const endISO = new Date(`${dueDate}T${endTime}:00`).toISOString();
        return { start: startISO, end: endISO, allDay: false };
    };

    const handleAddTask = async (e) => {
        e?.preventDefault?.();
        if (!user?.uid) return;
        const trimmed = title.trim();
        if (!trimmed) return;

        setIsSubmitting(true);
        try {
            let calendarEventId;
            const eventDates = toEventDateStrings();

            if (addToCalendar && eventDates) {
                const created = await addEvent(user.uid, {
                    title: trimmed,
                    description: "Created from Tasks",
                    ...eventDates,
                    type: "Assignment",
                    repeatOption: "Does not repeat",
                    linkedTaskTitle: trimmed,
                });
                calendarEventId = created?.id;
            }

            await addTask(user.uid, {
                title: trimmed,
                completed: false,
                dueDate: dueDate || undefined,
                allDay: !!dueDate ? isAllDay : undefined,
                startTime: !isAllDay && !!dueDate ? startTime : undefined,
                endTime: !isAllDay && !!dueDate ? endTime : undefined,
                calendarEventId,
            });

            setTitle("");
            setDueDate("");
            setIsAllDay(true);
            setStartTime("09:00");
            setEndTime("10:00");
            setAddToCalendar(true);
            await loadTasks();
        } catch (err) {
            console.error("Error adding task:", err);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleToggleCompleted = async (task) => {
        try {
            await updateTask(task.id, { completed: !task.completed });
            setTasks((prev) =>
                prev.map((t) => (t.id === task.id ? { ...t, completed: !t.completed } : t))
            );
        } catch (e) {
            console.error("Failed to update task:", e);
        }
    };

    const handleDelete = async (taskId) => {
        try {
            await deleteTask(taskId);
            setTasks((prev) => prev.filter((t) => t.id !== taskId));
        } catch (e) {
            console.error("Failed to delete task:", e);
        }
    };

    return (
        <PageWithSidebar>
            <div className="h-full flex flex-col gap-4 overflow-hidden">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-xl font-semibold">Tasks</h1>
                        <p className="text-sm text-muted-foreground">{remainingCount} remaining</p>
                    </div>
                </div>

                <form onSubmit={handleAddTask} className="rounded-xl border border-border bg-card p-4">
                    <div className="flex flex-col gap-3">
                        <div className="flex flex-col gap-1">
                            <Label htmlFor="task-title" className="text-xs text-muted-foreground font-medium">
                                Task
                            </Label>
                            <Input
                                id="task-title"
                                placeholder="e.g. Finish biology notes"
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                            />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                            <div className="flex flex-col gap-1">
                                <Label htmlFor="task-due" className="text-xs text-muted-foreground font-medium">
                                    Due date (optional)
                                </Label>
                                <Input
                                    id="task-due"
                                    type="date"
                                    value={dueDate}
                                    onChange={(e) => setDueDate(e.target.value)}
                                />
                            </div>

                            <div className="flex items-center gap-2 pt-6">
                                <Checkbox
                                    id="task-allday"
                                    checked={isAllDay}
                                    disabled={!dueDate}
                                    onCheckedChange={(checked) => setIsAllDay(!!checked)}
                                />
                                <Label htmlFor="task-allday" className={`cursor-pointer ${!dueDate ? "opacity-50" : ""}`}>
                                    All day
                                </Label>
                            </div>

                            <div className="flex items-center gap-2 pt-6">
                                <Checkbox
                                    id="task-add-calendar"
                                    checked={addToCalendar}
                                    disabled={!dueDate}
                                    onCheckedChange={(checked) => setAddToCalendar(!!checked)}
                                />
                                <Label
                                    htmlFor="task-add-calendar"
                                    className={`cursor-pointer ${!dueDate ? "opacity-50" : ""}`}
                                >
                                    Add to calendar
                                </Label>
                            </div>
                        </div>

                        {!isAllDay && !!dueDate && (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                <div className="flex flex-col gap-1">
                                    <Label htmlFor="task-start" className="text-xs text-muted-foreground font-medium">
                                        Start time
                                    </Label>
                                    <Input
                                        id="task-start"
                                        type="time"
                                        value={startTime}
                                        onChange={(e) => setStartTime(e.target.value)}
                                    />
                                </div>
                                <div className="flex flex-col gap-1">
                                    <Label htmlFor="task-end" className="text-xs text-muted-foreground font-medium">
                                        End time
                                    </Label>
                                    <Input
                                        id="task-end"
                                        type="time"
                                        value={endTime}
                                        onChange={(e) => setEndTime(e.target.value)}
                                    />
                                </div>
                            </div>
                        )}

                        <div className="flex justify-end">
                            <Button type="submit" disabled={isSubmitting || !user?.uid}>
                                {isSubmitting ? "Adding..." : "Add task"}
                            </Button>
                        </div>
                    </div>
                </form>

                <div className="flex-1 overflow-y-auto rounded-xl border border-border bg-card">
                    <div className="p-3 border-b border-border">
                        <p className="text-sm font-medium">Your list</p>
                    </div>
                    <div className="divide-y">
                        {tasks.length === 0 ? (
                            <div className="p-4 text-sm text-muted-foreground">No tasks yet.</div>
                        ) : (
                            tasks.map((task) => (
                                <div key={task.id} className="p-3 flex items-center justify-between gap-3">
                                    <div className="flex items-start gap-3 min-w-0">
                                        <Checkbox
                                            checked={!!task.completed}
                                            onCheckedChange={() => handleToggleCompleted(task)}
                                            aria-label={`Mark ${task.title} as ${task.completed ? "not completed" : "completed"}`}
                                        />
                                        <div className="min-w-0">
                                            <p
                                                className={`text-sm font-medium truncate ${
                                                    task.completed ? "line-through text-muted-foreground" : ""
                                                }`}
                                            >
                                                {task.title}
                                            </p>
                                            <p className="text-xs text-muted-foreground">
                                                {task.dueDate ? `Due ${task.dueDate}` : "No due date"}
                                                {task.calendarEventId ? " • On calendar" : ""}
                                            </p>
                                        </div>
                                    </div>
                                    <Button variant="destructive" size="sm" onClick={() => handleDelete(task.id)}>
                                        Delete
                                    </Button>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </div>
        </PageWithSidebar>
    );
}
