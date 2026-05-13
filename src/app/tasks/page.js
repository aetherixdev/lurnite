"use client";

import { PageWithSidebar } from "@/components";
import { Button, buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { useEffect, useMemo, useRef, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { addEvent } from "@/services/calendarService";
import { addTask, deleteTask, fetchUserTasks, updateTask, updateTasksOrder } from "@/services/taskService";
import { TaskItem } from "@/components/tasks/TaskItem";
import { TaskSkeleton } from "@/components/tasks/TaskSkeleton";
import { AnimatePresence, Reorder, motion } from "framer-motion";
import { Inbox, CalendarIcon, Clock, ChevronRight } from "lucide-react";
import { format } from "date-fns";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { cn } from "@/lib/utils";

const TIME_OPTIONS = Array.from({ length: 96 }).map((_, i) => {
    const hrs = Math.floor(i / 4).toString().padStart(2, "0");
    const mins = ((i % 4) * 15).toString().padStart(2, "0");
    return `${hrs}:${mins}`;
});

const COMPLETION_DELAY = 800;

export default function Tasks() {
    const { user, loading } = useAuth();
    const [tasks, setTasks] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [title, setTitle] = useState("");
    const [dueDate, setDueDate] = useState("");
    const [isAllDay, setIsAllDay] = useState(true);
    const [startTime, setStartTime] = useState("09:00");
    const [endTime, setEndTime] = useState("10:00");
    const [addToCalendar, setAddToCalendar] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [recentlyCompleted, setRecentlyCompleted] = useState(new Set());
    const [isCompletedOpen, setIsCompletedOpen] = useState(false);

    const completionTimers = useRef({});
    const reorderDebounceTimer = useRef(null);
    const saveOrderTimer = useRef(null);
    const pendingReorder = useRef(null);

    const activeTasks = useMemo(
        () => tasks.filter((t) => !t.completed || recentlyCompleted.has(t.id)),
        [tasks, recentlyCompleted]
    );

    const completedTasks = useMemo(
        () => tasks.filter((t) => t.completed && !recentlyCompleted.has(t.id)),
        [tasks, recentlyCompleted]
    );

    const remainingCount = activeTasks.filter((t) => !t.completed).length;

    const loadTasks = async () => {
        if (!user?.uid) return;
        setIsLoading(true);
        try {
            const fetched = await fetchUserTasks(user.uid);
            setTasks(fetched);
        } catch (e) {
            console.error("Failed to fetch tasks:", e);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        if (!loading && user?.uid) loadTasks();
    }, [loading, user?.uid]);

    useEffect(() => {
        return () => {
            Object.values(completionTimers.current).forEach(clearTimeout);
            if (reorderDebounceTimer.current) clearTimeout(reorderDebounceTimer.current);
            if (saveOrderTimer.current) clearTimeout(saveOrderTimer.current);
        };
    }, []);

    const toEventDateStrings = () => {
        if (!dueDate) return null;
        if (isAllDay) return { start: dueDate, end: dueDate, allDay: true };
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
            setAddToCalendar(false);
            await loadTasks();
        } catch (err) {
            console.error("Error adding task:", err);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleReorder = (newActiveTasks) => {
        // Always track the latest intended order
        pendingReorder.current = newActiveTasks;

        // Debounce the state update: only reposition items after the dragged
        // item has held the same slot for 100ms, eliminating jitter on fast drags.
        if (reorderDebounceTimer.current) clearTimeout(reorderDebounceTimer.current);
        reorderDebounceTimer.current = setTimeout(() => {
            const latest = pendingReorder.current;
            setTasks((prev) => {
                const inActive = new Set(latest.map((t) => t.id));
                const stableCompleted = prev.filter((t) => t.completed && !inActive.has(t.id));
                return [...latest, ...stableCompleted];
            });
        }, 100);

        // Backend save uses a longer debounce and always reads the latest order
        if (saveOrderTimer.current) clearTimeout(saveOrderTimer.current);
        saveOrderTimer.current = setTimeout(async () => {
            const latest = pendingReorder.current;
            if (!latest) return;
            const updates = latest.map((t, i) => ({ id: t.id, order: i * 1000 }));
            try {
                await updateTasksOrder(updates);
            } catch (e) {
                console.error("Failed to persist task order:", e);
            }
        }, 700);
    };

    const handleToggleCompleted = async (task) => {
        const wasCompleted = task.completed;
        setTasks((prev) =>
            prev.map((t) => (t.id === task.id ? { ...t, completed: !t.completed } : t))
        );

        if (!wasCompleted) {
            setRecentlyCompleted((prev) => new Set([...prev, task.id]));
            if (completionTimers.current[task.id]) clearTimeout(completionTimers.current[task.id]);
            completionTimers.current[task.id] = setTimeout(() => {
                setRecentlyCompleted((prev) => {
                    const next = new Set(prev);
                    next.delete(task.id);
                    return next;
                });
                delete completionTimers.current[task.id];
            }, COMPLETION_DELAY);
        } else {
            setRecentlyCompleted((prev) => {
                const next = new Set(prev);
                next.delete(task.id);
                return next;
            });
            if (completionTimers.current[task.id]) {
                clearTimeout(completionTimers.current[task.id]);
                delete completionTimers.current[task.id];
            }
        }

        try {
            await updateTask(task.id, { completed: !wasCompleted });
        } catch (e) {
            console.error("Failed to update task:", e);
            setTasks((prev) =>
                prev.map((t) => (t.id === task.id ? { ...t, completed: wasCompleted } : t))
            );
        }
    };

    const handleDelete = async (taskId) => {
        if (completionTimers.current[taskId]) {
            clearTimeout(completionTimers.current[taskId]);
            delete completionTimers.current[taskId];
        }
        setRecentlyCompleted((prev) => {
            const next = new Set(prev);
            next.delete(taskId);
            return next;
        });
        setTasks((prev) => prev.filter((t) => t.id !== taskId));
        try {
            await deleteTask(taskId);
        } catch (e) {
            console.error("Failed to delete task:", e);
            await loadTasks();
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

                <form onSubmit={handleAddTask} className="flex flex-col gap-2 rounded-xl border border-border bg-card p-3 transition-all duration-300">
                    <Input
                        id="task-title"
                        placeholder="What needs to be done?"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        className="border-0 bg-transparent shadow-none focus-visible:ring-0 px-2 text-base placeholder:text-muted-foreground/50 h-auto py-1 font-medium"
                    />

                    <div className="flex flex-wrap items-center justify-between gap-2 px-2 mt-1">
                        <div className="flex flex-wrap items-center gap-1.5">
                            <Popover>
                                <PopoverTrigger
                                    className={cn(
                                        buttonVariants({ variant: "ghost", size: "sm" }),
                                        "h-8 flex gap-2 text-xs font-medium justify-start cursor-pointer rounded-lg transition-all",
                                        dueDate ? "bg-pulse/10 text-pulse hover:bg-pulse/20 hover:text-pulse" : "text-muted-foreground hover:text-pulse hover:bg-pulse/10"
                                    )}
                                >
                                    <CalendarIcon className="h-3.5 w-3.5" />
                                    {dueDate ? format(new Date(dueDate + "T12:00:00"), "PPP") : "Set date"}
                                </PopoverTrigger>
                                <PopoverContent className="w-auto p-0" align="start">
                                    <Calendar
                                        mode="single"
                                        selected={dueDate ? new Date(dueDate + "T12:00:00") : undefined}
                                        onSelect={(date) => setDueDate(date ? format(date, "yyyy-MM-dd") : "")}
                                        initialFocus
                                    />
                                    {dueDate && (
                                        <div className="p-2 border-t border-border">
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                className="w-full h-8 text-xs text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                                                onClick={() => { setDueDate(""); setAddToCalendar(false); }}
                                            >
                                                Clear Date
                                            </Button>
                                        </div>
                                    )}
                                </PopoverContent>
                            </Popover>

                            <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                onClick={() => setAddToCalendar(!addToCalendar)}
                                className={cn(
                                    "h-8 px-3 text-xs font-medium transition-all rounded-lg",
                                    addToCalendar ? "bg-pulse/10 text-pulse hover:bg-pulse/20 hover:text-pulse" : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                                )}
                            >
                                Add to calendar
                            </Button>

                            {addToCalendar && (
                                <>
                                    <Button
                                        type="button"
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => setIsAllDay(!isAllDay)}
                                        className={cn(
                                            "h-8 px-3 text-xs font-medium transition-all rounded-lg",
                                            isAllDay ? "bg-pulse/10 text-pulse hover:bg-pulse/20 hover:text-pulse" : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                                        )}
                                    >
                                        All day
                                    </Button>

                                    {!isAllDay && (
                                        <div className="flex items-center gap-1 bg-muted/30 rounded-lg px-1.5 h-8 border border-transparent hover:border-border/50 transition-colors">
                                            <Clock className="h-3.5 w-3.5 text-muted-foreground ml-1 mr-0.5" />
                                            <Select value={startTime} onValueChange={setStartTime}>
                                                <SelectTrigger className="h-6 w-[60px] px-1 border-0 bg-transparent shadow-none focus-visible:ring-0 text-xs font-medium text-muted-foreground hover:text-foreground transition-colors [&>svg]:hidden justify-center">
                                                    <SelectValue placeholder="Start" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {TIME_OPTIONS.map((t) => (
                                                        <SelectItem key={t} value={t} className="text-xs">{t}</SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                            <span className="text-muted-foreground/40 text-xs">–</span>
                                            <Select value={endTime} onValueChange={setEndTime}>
                                                <SelectTrigger className="h-6 w-[60px] px-1 border-0 bg-transparent shadow-none focus-visible:ring-0 text-xs font-medium text-muted-foreground hover:text-foreground transition-colors [&>svg]:hidden justify-center">
                                                    <SelectValue placeholder="End" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {TIME_OPTIONS.map((t) => (
                                                        <SelectItem key={t} value={t} className="text-xs">{t}</SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        </div>
                                    )}
                                </>
                            )}
                        </div>

                        <Button type="submit" size="sm" className="h-8 px-4 text-xs font-semibold bg-spark text-white hover:bg-spark/90" disabled={isSubmitting || !user?.uid || !title.trim()}>
                            {isSubmitting ? "Adding…" : "Add task"}
                        </Button>
                    </div>
                </form>

                <div className="flex-1 overflow-y-auto rounded-xl border border-border bg-card flex flex-col min-h-0">
                    <div className="p-4 border-b border-border flex items-center justify-between sticky top-0 bg-card z-10">
                        <p className="text-sm font-semibold tracking-tight">Your Tasks</p>
                    </div>

                    <div className="flex-1 p-2">
                        {isLoading ? (
                            <TaskSkeleton />
                        ) : tasks.length === 0 ? (
                            <div className="h-full min-h-[300px] flex flex-col items-center justify-center text-center p-8 space-y-4 animate-in fade-in duration-500">
                                <div className="h-20 w-20 rounded-full bg-muted flex items-center justify-center">
                                    <Inbox className="h-10 w-10 text-muted-foreground/50" />
                                </div>
                                <div className="space-y-1">
                                    <p className="text-lg font-medium text-foreground">No tasks yet</p>
                                    <p className="text-sm text-muted-foreground max-w-[250px]">
                                        Add a task above to get started with your day.
                                    </p>
                                </div>
                            </div>
                        ) : (
                            <div className="flex flex-col">
                                <Reorder.Group
                                    axis="y"
                                    values={activeTasks}
                                    onReorder={handleReorder}
                                    as="div"
                                    className="flex flex-col gap-0.5"
                                    style={{ listStyle: "none", padding: 0, margin: 0 }}
                                >
                                    <AnimatePresence mode="popLayout">
                                        {activeTasks.map((task) => (
                                            <TaskItem
                                                key={task.id}
                                                task={task}
                                                onToggle={handleToggleCompleted}
                                                onDelete={handleDelete}
                                                draggable={true}
                                            />
                                        ))}
                                    </AnimatePresence>
                                </Reorder.Group>

                                <AnimatePresence>
                                    {completedTasks.length > 0 && (
                                        <motion.div
                                            key="completed-section"
                                            initial={{ opacity: 0, y: 6 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            exit={{ opacity: 0, y: 6 }}
                                            transition={{ duration: 0.25, ease: "easeOut" }}
                                            className="mt-2"
                                        >
                                            <button
                                                onClick={() => setIsCompletedOpen((v) => !v)}
                                                className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-muted/40 transition-colors duration-150 outline-none focus:outline-none"
                                            >
                                                <motion.span
                                                    animate={{ rotate: isCompletedOpen ? 90 : 0 }}
                                                    transition={{ duration: 0.2, ease: [0.4, 0, 0.2, 1] }}
                                                    className="flex items-center justify-center"
                                                >
                                                    <ChevronRight className="h-3.5 w-3.5" />
                                                </motion.span>
                                                <span>Completed</span>
                                                <span className="tabular-nums text-muted-foreground/50">({completedTasks.length})</span>
                                            </button>

                                            <AnimatePresence initial={false}>
                                                {isCompletedOpen && (
                                                    <motion.div
                                                        key="completed-list"
                                                        initial={{ height: 0, opacity: 0 }}
                                                        animate={{ height: "auto", opacity: 1 }}
                                                        exit={{ height: 0, opacity: 0 }}
                                                        transition={{ duration: 0.28, ease: [0.4, 0, 0.2, 1] }}
                                                        className="overflow-hidden"
                                                    >
                                                        <div className="flex flex-col gap-0.5 pt-1">
                                                            <AnimatePresence mode="popLayout">
                                                                {completedTasks.map((task) => (
                                                                    <TaskItem
                                                                        key={task.id}
                                                                        task={task}
                                                                        onToggle={handleToggleCompleted}
                                                                        onDelete={handleDelete}
                                                                        draggable={false}
                                                                    />
                                                                ))}
                                                            </AnimatePresence>
                                                        </div>
                                                    </motion.div>
                                                )}
                                            </AnimatePresence>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </PageWithSidebar>
    );
}
