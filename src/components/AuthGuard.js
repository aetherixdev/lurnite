"use client";

import { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { AuthProvider, useAuth } from "../contexts/AuthContext";
import AppShell from "./AppShell";

function RedirectGuard({ children }) {
  const { user, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (loading) return;
    if (!user && pathname !== "/login") {
      router.replace("/login");
    }
  }, [user, loading, router, pathname]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p>Loading...</p>
      </div>
    );
  }

  if (!user && pathname !== "/login") {
    return null;
  }

  return <AppShell>{children}</AppShell>;
}

export function AuthGuard({ children }) {
  return (
    <AuthProvider>
      <RedirectGuard>{children}</RedirectGuard>
    </AuthProvider>
  );
}
