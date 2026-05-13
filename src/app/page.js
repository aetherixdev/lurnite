"use client";

import { PageWithSidebar } from "@/components";
import { useAuth } from "../contexts/AuthContext";
import { useEffect, useRef, useState } from "react";
import { fetchUserTasks, updateTask } from "@/services/taskService";
import { fetchUserEvents, TYPE_COLORS } from "@/services/calendarService";
import { Check, CalendarDays, ChevronRight, ListTodo, Inbox, CalendarX } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import Link from "next/link";
import { format, parseISO, isAfter, startOfDay } from "date-fns";

const COMPLETION_DELAY = 1400;

function TaskRow({ task, onToggle }) {
    return (
        <motion.div
            layout
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6, transition: { duration: 0.22, ease: "easeIn" } }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="flex items-center gap-3 py-2.5 px-1 group cursor-pointer select-none"
            onClick={() => onToggle(task)}
        >
            <div
                className={`shrink-0 flex h-5 w-5 items-center justify-center rounded-full border-2 transition-all duration-300 ${
                    task.completed
                        ? "bg-primary border-primary text-primary-foreground"
                        : "border-muted-foreground/40 group-hover:border-primary"
                }`}
            >
                <motion.div
                    initial={false}
                    animate={{ scale: task.completed ? 1 : 0, opacity: task.completed ? 1 : 0 }}
                    transition={{ type: "spring", stiffness: 400, damping: 20 }}
                >
                    <Check className="h-3 w-3 stroke-3" />
                </motion.div>
            </div>
            <span className={`text-sm flex-1 truncate transition-all duration-300 ${task.completed ? "line-through text-muted-foreground opacity-60" : "text-foreground"}`}>
                {task.title}
            </span>
            {task.dueDate && (
                <span className="text-xs text-muted-foreground shrink-0">
                    {format(parseISO(task.dueDate + "T12:00:00"), "MMM d")}
                </span>
            )}
        </motion.div>
    );
}

function EventRow({ event }) {
    const color = TYPE_COLORS[event.type] || "#5B4FD9";
    const start = event.start
        ? typeof event.start === "string"
            ? parseISO(event.start)
            : event.start.toDate?.() ?? new Date(event.start)
        : null;

    return (
        <div className="flex items-center gap-3 py-2.5 px-1">
            <span className="shrink-0 h-2.5 w-2.5 rounded-full mt-0.5" style={{ backgroundColor: color }} />
            <span className="text-sm flex-1 truncate text-foreground">{event.title}</span>
            {start && (
                <span className="text-xs text-muted-foreground shrink-0">
                    {event.allDay ? format(start, "MMM d") : format(start, "MMM d, h:mm a")}
                </span>
            )}
        </div>
    );
}

function DashboardCard({ icon, title, linkHref, linkLabel, children }) {
    return (
        <div className="rounded-xl border border-border bg-card flex flex-col overflow-hidden">
            <div className="flex items-center justify-between px-4 py-3 border-b border-border">
                <div className="flex items-center gap-2">
                    {icon}
                    <span className="text-sm font-semibold tracking-tight">{title}</span>
                </div>
                <Link href={linkHref} className="flex items-center gap-0.5 text-xs text-muted-foreground hover:text-pulse transition-colors">
                    {linkLabel}
                    <ChevronRight className="h-3.5 w-3.5" />
                </Link>
            </div>
            <div className="flex-1 px-4 py-1 divide-y divide-border/60">
                {children}
            </div>
        </div>
    );
}

function EmptyState({ icon, text }) {
    return (
        <div className="flex flex-col items-center justify-center gap-2 py-8 text-center">
            <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center">
                {icon}
            </div>
            <p className="text-sm text-muted-foreground">{text}</p>
        </div>
    );
}

export default function Home() {
    const { user, loading } = useAuth();
    const [tasks, setTasks] = useState([]);
    const [events, setEvents] = useState([]);
    const [dataLoading, setDataLoading] = useState(true);
    const [recentlyCompleted, setRecentlyCompleted] = useState(new Set());
    const completionTimers = useRef({});

    useEffect(() => {
        if (loading || !user?.uid) return;
        setDataLoading(true);
        Promise.all([fetchUserTasks(user.uid), fetchUserEvents(user.uid)])
            .then(([t, e]) => { setTasks(t); setEvents(e); })
            .catch(console.error)
            .finally(() => setDataLoading(false));
    }, [loading, user?.uid]);

    useEffect(() => {
        return () => Object.values(completionTimers.current).forEach(clearTimeout);
    }, []);

    const handleToggle = async (task) => {
        const wasCompleted = task.completed;
        setTasks((prev) => prev.map((t) => t.id === task.id ? { ...t, completed: !wasCompleted } : t));

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
            setTasks((prev) => prev.map((t) => t.id === task.id ? { ...t, completed: wasCompleted } : t));
            setRecentlyCompleted((prev) => { const next = new Set(prev); next.delete(task.id); return next; });
        }
    };

    const topTasks = tasks
        .filter((t) => !t.completed || recentlyCompleted.has(t.id))
        .slice(0, 5);

    const today = startOfDay(new Date());
    const upcomingEvents = events
        .filter((e) => {
            if (!e.start) return false;
            const start = typeof e.start === "string" ? parseISO(e.start) : e.start.toDate?.() ?? new Date(e.start);
            return isAfter(start, today) || start >= today;
        })
        .sort((a, b) => {
            const getTime = (e) => {
                const s = typeof e.start === "string" ? parseISO(e.start) : e.start.toDate?.() ?? new Date(e.start);
                return s.getTime();
            };
            return getTime(a) - getTime(b);
        })
        .slice(0, 5);

    const pendingCount = tasks.filter((t) => !t.completed).length;

    const greeting = () => {
        const h = new Date().getHours();
        if (h < 12) return "Good morning";
        if (h < 18) return "Good afternoon";
        return "Good evening";
    };

    return (
        <PageWithSidebar>
            <div className="h-full flex flex-col gap-6 overflow-y-auto">
                <div className="flex flex-col gap-0.5 max-w-4xl">
                    <h1 className="text-2xl font-semibold">{greeting()}, {user?.displayName?.split(" ")[0]}</h1>
                    <p className="text-sm text-muted-foreground">
                        {dataLoading
                            ? "Loading your day…"
                            : `${pendingCount} task${pendingCount !== 1 ? "s" : ""} to do · ${upcomingEvents.length} upcoming event${upcomingEvents.length !== 1 ? "s" : ""}`}
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-4xl">
                    <DashboardCard
                        icon={<ListTodo className="h-4 w-4 text-pulse" />}
                        title="Top Tasks"
                        linkHref="/tasks"
                        linkLabel="All tasks"
                    >
                        {dataLoading ? (
                            <EmptyState icon={<ListTodo className="h-5 w-5 text-muted-foreground/40" />} text="Loading…" />
                        ) : topTasks.length === 0 ? (
                            <EmptyState icon={<Inbox className="h-5 w-5 text-muted-foreground/40" />} text="No pending tasks — great work!" />
                        ) : (
                            <AnimatePresence mode="popLayout">
                                {topTasks.map((task) => (
                                    <TaskRow key={task.id} task={task} onToggle={handleToggle} />
                                ))}
                            </AnimatePresence>
                        )}
                    </DashboardCard>

                    <DashboardCard
                        icon={<CalendarDays className="h-4 w-4 text-pulse" />}
                        title="Upcoming Events"
                        linkHref="/calendar"
                        linkLabel="Open calendar"
                    >
                        {dataLoading ? (
                            <EmptyState icon={<CalendarDays className="h-5 w-5 text-muted-foreground/40" />} text="Loading…" />
                        ) : upcomingEvents.length === 0 ? (
                            <EmptyState icon={<CalendarX className="h-5 w-5 text-muted-foreground/40" />} text="No upcoming events scheduled." />
                        ) : (
                            upcomingEvents.map((event) => (
                                <EventRow key={event.id} event={event} />
                            ))
                        )}
                    </DashboardCard>
                </div>
            </div>
        </PageWithSidebar>
    );
}
