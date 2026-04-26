import DashboardSidebar from "./Sidebar";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";

export default function PageWithSidebar({ children }) {
  return (
    <SidebarProvider>
      <div className="flex min-h-svh w-full overflow-hidden bg-background text-foreground">
        <DashboardSidebar />
        <SidebarInset className="overflow-hidden">
          <div className="flex h-full flex-col overflow-hidden px-4 py-5">
            {children}
          </div>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
}
// bg-linear-135 from-[#F8FAFC] via-[#EEF2FF] to-[#ECFEFF]