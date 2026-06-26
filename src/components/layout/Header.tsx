"use client";

import * as React from "react";
import Link from "next/link";
import { useAuth } from "@/hooks/use-auth";
import { useUIStore } from "@/store/uiStore";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  Menu,
  Bell,
  Search,
  LogOut,
  ChevronDown,
  Settings,
  User,
} from "lucide-react";

export function Header() {
  const { user, logout } = useAuth();
  const { sidebarCollapsed, toggleSidebar } = useUIStore();
  const [showUserMenu, setShowUserMenu] = React.useState(false);
  const menuRef = React.useRef<HTMLDivElement>(null);

  // Close menu on click outside
  React.useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setShowUserMenu(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const initials = user
    ? `${user.firstName?.[0] || ""}${user.lastName?.[0] || ""}`.toUpperCase()
    : "U";

  return (
    <header
      className={cn(
        "fixed top-0 right-0 z-30 h-[60px] border-b border-slate-200 bg-white/80 backdrop-blur-md flex items-center justify-between px-6 transition-all duration-300",
        sidebarCollapsed ? "left-16" : "left-60"
      )}
    >
      {/* Left */}
      <div className="flex items-center gap-4">
        <button
          onClick={toggleSidebar}
          className="h-8 w-8 rounded-lg flex items-center justify-center text-slate-500 hover:bg-slate-100 hover:text-slate-700 transition-colors md:hidden"
        >
          <Menu className="h-4.5 w-4.5" />
        </button>

        {/* Search bar */}
        <div className="hidden sm:flex items-center gap-2 h-9 w-64 px-3 rounded-lg border border-slate-200 bg-slate-50/50 text-slate-400 text-[13px]">
          <Search className="h-3.5 w-3.5 shrink-0" />
          <input
            type="text"
            placeholder="Search modules, actions..."
            className="flex-1 bg-transparent outline-none text-slate-700 placeholder:text-slate-400"
          />
          <kbd className="hidden lg:inline text-[10px] font-mono text-slate-400 border border-slate-200 rounded px-1 py-0.5">
            ⌘K
          </kbd>
        </div>
      </div>

      {/* Right */}
      <div className="flex items-center gap-3">
        {/* Notifications */}
        <Link href="/notifications">
          <button className="relative h-9 w-9 rounded-lg flex items-center justify-center text-slate-500 hover:bg-slate-100 hover:text-slate-700 transition-colors">
            <Bell className="h-[18px] w-[18px]" />
            <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-rose-500 ring-2 ring-white" />
          </button>
        </Link>

        {/* User menu */}
        <div className="relative" ref={menuRef}>
          <button
            onClick={() => setShowUserMenu(!showUserMenu)}
            className="flex items-center gap-2.5 h-9 pl-1 pr-2.5 rounded-lg hover:bg-slate-50 transition-colors"
          >
            <div className="h-7 w-7 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 text-[11px] font-bold">
              {initials}
            </div>
            {user && (
              <span className="hidden md:block text-[13px] font-medium text-slate-700 max-w-[120px] truncate">
                {user.firstName} {user.lastName}
              </span>
            )}
            <ChevronDown className="h-3.5 w-3.5 text-slate-400" />
          </button>

          {/* Dropdown */}
          {showUserMenu && (
            <div className="absolute right-0 top-full mt-2 w-52 rounded-xl border border-slate-200 bg-white shadow-lg py-1.5 animate-in fade-in slide-in-from-top-1 duration-150">
              <div className="px-3 py-2.5 border-b border-slate-100">
                <p className="text-[13px] font-semibold text-slate-800 truncate">
                  {user?.firstName} {user?.lastName}
                </p>
                <p className="text-[11px] text-slate-400 truncate">{user?.email}</p>
              </div>

              <Link
                href="/settings/profile"
                className="flex items-center gap-2.5 px-3 py-2 text-[13px] text-slate-600 hover:bg-slate-50 transition-colors"
                onClick={() => setShowUserMenu(false)}
              >
                <User className="h-4 w-4" />
                Profile
              </Link>
              <Link
                href="/settings"
                className="flex items-center gap-2.5 px-3 py-2 text-[13px] text-slate-600 hover:bg-slate-50 transition-colors"
                onClick={() => setShowUserMenu(false)}
              >
                <Settings className="h-4 w-4" />
                Settings
              </Link>

              <div className="border-t border-slate-100 mt-1 pt-1">
                <button
                  onClick={() => {
                    setShowUserMenu(false);
                    logout();
                  }}
                  className="w-full flex items-center gap-2.5 px-3 py-2 text-[13px] text-rose-600 hover:bg-rose-50 transition-colors"
                >
                  <LogOut className="h-4 w-4" />
                  Sign out
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
