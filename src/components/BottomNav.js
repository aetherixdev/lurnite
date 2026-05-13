"use client";

import { cn } from "@/lib/utils";
import { CalendarDays, CheckSquare, Home, Settings } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

const navItems = [
  { title: "Home", href: "/", icon: Home },
  { title: "Calendar", href: "/calendar", icon: CalendarDays },
  { title: "Tasks", href: "/tasks", icon: CheckSquare },
  { title: "Settings", href: "/settings", icon: Settings },
];

export default function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 flex h-16 items-center border-t border-border bg-sidebar md:hidden">
      {navItems.map((item) => {
        const Icon = item.icon;
        const isActive =
          item.href === "/" ? pathname === "/" : pathname?.startsWith(item.href);

        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "flex flex-1 flex-col items-center justify-center gap-1 py-2 text-xs transition-colors",
              isActive
                ? "text-sidebar-primary"
                : "text-sidebar-foreground/60 hover:text-sidebar-foreground"
            )}
          >
            <Icon className={cn("size-5", isActive && "stroke-[2.5]")} />
            <span>{item.title}</span>
          </Link>
        );
      })}
    </nav>
  );
}
