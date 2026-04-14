"use client";

import { PageWithSidebar } from "@/components";
import { useAuth } from "../contexts/AuthContext";
import { Button } from "@/components";

export default function Home() {
  const { user } = useAuth();
  return (
      <PageWithSidebar>
        <div className="h-full flex flex-col space-y-4 items-center justify-center">
          <div className="flex flex-col space-y-2 items-center justify-center">
            <p className="text-2xl font-semibold">Hi, {user.displayName}</p> 
            <p className="text-gray-500">Welcome back to Study Manager!</p>
          </div>
        </div>
      </PageWithSidebar>
  );
}
