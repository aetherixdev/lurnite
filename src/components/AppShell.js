"use client";

import { usePathname } from "next/navigation";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import DashboardSidebar from "./Sidebar";
import BottomNav from "./BottomNav";

export default function AppShell({ children }) {
  const pathname = usePathname();

  if (pathname === "/login") {
    return children;
  }

  return (
    <SidebarProvider>
      <div className="flex min-h-svh w-full bg-background text-foreground">
        <DashboardSidebar />
        <SidebarInset className="pb-16 md:pb-0">
          {children}
        </SidebarInset>
        <BottomNav />
      </div>
    </SidebarProvider>
  );
}
