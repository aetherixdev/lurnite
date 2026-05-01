"use client";

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarSeparator,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { cn } from "@/lib/utils";
import {
  CalendarDays,
  CheckSquare,
  Home,
  Settings,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

const navItems = [
  { title: "Home", href: "/", icon: Home },
  { title: "Calendar", href: "/calendar", icon: CalendarDays },
  { title: "Tasks", href: "/tasks", icon: CheckSquare },
];

export default function DashboardSidebar() {
  const pathname = usePathname();

  return (
    <Sidebar variant="floating" collapsible="icon">
      <SidebarHeader className="flex-row items-center justify-between group-data-[collapsible=icon]:justify-center">
        <Link
          href="/"
          className="flex min-h-11 min-w-0 items-center gap-2.5 rounded-md px-2.5 py-2 text-[0.95rem] leading-5 font-medium text-sidebar-foreground transition-colors hover:bg-sidebar-accent active:bg-sidebar-accent group-data-[collapsible=icon]:hidden"
        >
          <span className="inline-flex size-9 shrink-0 items-center justify-center rounded-md bg-sidebar-accent text-sidebar-accent-foreground">
            L
          </span>
          <span className="truncate group-data-[collapsible=icon]:hidden">Lurnite</span>
        </Link>
        <SidebarTrigger className="group-data-[collapsible=icon]:mx-auto" />
      </SidebarHeader>

      <SidebarSeparator />

      <SidebarContent>
        <div className="flex flex-1 flex-col justify-center p-2">
          <SidebarMenu>
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive =
                item.href === "/"
                  ? pathname === "/"
                  : pathname?.startsWith(item.href);

              return (
                <SidebarMenuItem key={item.href}>
                  <SidebarMenuButton
                    tooltip={item.title}
                    isActive={!!isActive}
                    render={<Link href={item.href} />}
                    className={cn(isActive ? "" : "text-sidebar-foreground/80")}
                  >
                    <Icon className="size-5" />
                    <span>{item.title}</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              );
            })}
          </SidebarMenu>
        </div>
      </SidebarContent>

      <SidebarFooter>
        <SidebarSeparator />
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              tooltip="Settings"
              isActive={pathname?.startsWith("/settings")}
              render={<Link href="/settings" />}
            >
              <Settings className="size-5" />
              <span>Settings</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
