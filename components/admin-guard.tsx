"use client";

import { useAuth } from "@/hooks/use-auth";
import { useRouter, usePathname } from "next/navigation";
import { useEffect } from "react";

export function AdminGuard({ children }: { children: React.ReactNode }) {
  const { user, loading, isAdmin } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!loading) {
      if (!user) {
        // Not logged in, redirect to login page
        if (pathname !== "/admin/login") {
          router.replace("/admin/login");
        }
      } else if (!isAdmin) {
        // Logged in but not an admin, redirect to home or login
        if (pathname !== "/admin/login") {
           router.replace("/admin/login");
        }
      } else {
        // Logged in and admin, if on login page redirect to dashboard
        if (pathname === "/admin/login") {
          router.replace("/admin");
        }
      }
    }
  }, [user, loading, isAdmin, router, pathname]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background text-foreground">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  // Prevent flash of content before redirecting
  if (!user && pathname !== "/admin/login") return null;
  if (user && !isAdmin && pathname !== "/admin/login") return null;

  return <>{children}</>;
}
