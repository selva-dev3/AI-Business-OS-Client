import React from "react";
import { cn } from "@/lib/utils";

interface TabNavigationProps {
  activeTab: "records" | "regularization";
  onTabChange: (tab: "records" | "regularization") => void;
}

export const TabNavigation: React.FC<TabNavigationProps> = ({ activeTab, onTabChange }) => {
  return (
    <div className="flex border-b border-slate-200 dark:border-slate-800">
      <button
        onClick={() => onTabChange("records")}
        className={cn(
          "px-5 py-2.5 text-sm font-semibold border-b-2 transition-all duration-200 outline-hidden",
          activeTab === "records"
            ? "border-indigo-600 text-indigo-600 dark:border-indigo-500 dark:text-indigo-400 font-bold"
            : "border-transparent text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200"
        )}
      >
        Attendance Records
      </button>
      <button
        onClick={() => onTabChange("regularization")}
        className={cn(
          "px-5 py-2.5 text-sm font-semibold border-b-2 transition-all duration-200 outline-hidden",
          activeTab === "regularization"
            ? "border-indigo-600 text-indigo-600 dark:border-indigo-500 dark:text-indigo-400 font-bold"
            : "border-transparent text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200"
        )}
      >
        Attendance Regularization
      </button>
    </div>
  );
};