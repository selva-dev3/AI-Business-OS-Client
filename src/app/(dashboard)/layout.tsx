"use client";

import { Sidebar } from "@/components/layout/Sidebar";
import { Header } from "@/components/layout/Header";
import { useUIStore } from "@/store/uiStore";
import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/use-auth";
import { Loader2 } from "lucide-react";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { sidebarCollapsed } = useUIStore();
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#faf9f7] flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <div className="min-h-screen">{children}</div>;
  }

  return (
    <div className="min-h-screen bg-[#faf9f7]">
      <Sidebar />
      <Header />
      <main
        className={cn(
          "pt-[60px] min-h-screen transition-all duration-300",
          sidebarCollapsed ? "pl-16" : "pl-60"
        )}
      >
        <div className="p-2 max-w-7xl mx-auto">{children}</div>
      </main>
    </div>
  );
}
