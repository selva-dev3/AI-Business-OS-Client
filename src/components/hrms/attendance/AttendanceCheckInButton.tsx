"use client";

import * as React from "react";
import { Play } from "lucide-react";
import { Button } from "@/components/ui/button";

interface AttendanceCheckInButtonProps {
  onClick: () => void;
  disabled?: boolean;
  size?: "default" | "sm" | "lg" | "icon";
  variant?: "default" | "outline" | "ghost" | "secondary";
  className?: string;
  children?: React.ReactNode;
}

export function AttendanceCheckInButton({
  onClick,
  disabled = false,
  size = "sm",
  variant = "outline",
  className = "",
  children,
}: AttendanceCheckInButtonProps) {
  return (
    <Button
      variant={variant}
      size={size}
      disabled={disabled}
      onClick={(e) => {
        e.stopPropagation();
        onClick();
      }}
      className={`inline-flex items-center gap-1.5 ${className}`}
    >
      <Play className="h-3.5 w-3.5 fill-current" />
      {children || "Check In"}
    </Button>
  );
}
