"use client";

import { useState } from "react";
import { Reorder, useDragControls, motion } from "framer-motion";
import { Check, Trash2, GripVertical } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

function TaskContent({ task, onToggle, onDelete, draggable, dragControls }) {
    return (
        <>
            <span
                className={`flex items-center justify-center h-7 w-5 shrink-0 transition-opacity duration-150 ${
                    draggable
                        ? "opacity-0 group-hover:opacity-100 cursor-grab active:cursor-grabbing touch-none"
                        : "opacity-0 pointer-events-none"
                }`}
                onPointerDown={draggable ? (e) => dragControls?.start(e) : undefined}
            >
                <GripVertical className="h-4 w-4 text-muted-foreground/60" />
            </span>

            <div
                className="flex items-start gap-3 min-w-0 flex-1 cursor-pointer py-0.5"
                onClick={() => onToggle(task)}
            >
                <div
                    className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 transition-all duration-300 ${
                        task.completed
                            ? "bg-primary border-primary text-primary-foreground shadow-sm"
                            : "border-muted-foreground/40 hover:border-primary bg-transparent"
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
                <div className="min-w-0 flex-1 select-none">
                    <p className={`text-sm font-medium truncate transition-all duration-300 ${
                        task.completed ? "line-through text-muted-foreground opacity-60" : "text-foreground"
                    }`}>
                        {task.title}
                    </p>
                    {(task.dueDate || task.calendarEventId) && (
                        <p className={`text-xs transition-colors duration-300 mt-0.5 ${
                            task.completed ? "text-muted-foreground/40" : "text-muted-foreground"
                        }`}>
                            {task.dueDate ? `Due ${task.dueDate}` : ""}
                            {task.dueDate && task.calendarEventId ? " · " : ""}
                            {task.calendarEventId ? "On calendar" : ""}
                        </p>
                    )}
                </div>
            </div>

            <Button
                variant="ghost"
                size="icon"
                onClick={(e) => { e.stopPropagation(); onDelete(task.id); }}
                className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 h-8 w-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-full shrink-0"
                aria-label="Delete task"
            >
                <Trash2 className="h-3.5 w-3.5" />
            </Button>
        </>
    );
}

export function TaskItem({ task, onToggle, onDelete, draggable = true }) {
    const dragControls = useDragControls();
    const [isDragging, setIsDragging] = useState(false);

    if (draggable) {
        return (
            <Reorder.Item
                as="div"
                value={task}
                dragListener={false}
                dragControls={dragControls}
                onDragStart={() => setIsDragging(true)}
                onDragEnd={() => setIsDragging(false)}
                layout
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0, zIndex: isDragging ? 50 : 0 }}
                exit={{ opacity: 0, scale: 0.95, transition: { duration: 0.14, ease: "easeIn" } }}
                transition={{
                    opacity: { duration: 0.2, ease: "easeOut" },
                    y: { duration: 0.2, ease: "easeOut" },
                    layout: { type: "tween", duration: 0.14, ease: "easeOut" },
                }}
                style={{ position: "relative", outline: "none" }}
                tabIndex={-1}
            >
                <div className={cn(
                    "group flex items-center gap-2 px-3 py-2.5 rounded-xl border select-none transition-[margin,box-shadow,background-color,border-color,transform] duration-200 ease-out",
                    isDragging
                        ? "mx-2 bg-card border-border/50 shadow-[0_8px_24px_rgba(0,0,0,0.12),0_2px_8px_rgba(0,0,0,0.07)] scale-[1.018]"
                        : "border-transparent hover:border-border/40 hover:bg-muted/40"
                )}>
                    <TaskContent task={task} onToggle={onToggle} onDelete={onDelete} draggable={true} dragControls={dragControls} />
                </div>
            </Reorder.Item>
        );
    }

    return (
        <motion.div
            layout
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, transition: { duration: 0.14, ease: "easeIn" } }}
            transition={{ duration: 0.2, ease: "easeOut", layout: { type: "tween", duration: 0.14, ease: "easeOut" } }}
            style={{ outline: "none" }}
        >
            <div className="group flex items-center gap-2 px-3 py-2.5 rounded-xl border border-transparent hover:border-border/40 hover:bg-muted/40 select-none">
                <TaskContent task={task} onToggle={onToggle} onDelete={onDelete} draggable={false} />
            </div>
        </motion.div>
    );
}
