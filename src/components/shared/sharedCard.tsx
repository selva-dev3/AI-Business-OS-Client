import * as React from "react";
import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

export interface SharedCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  iconBg?: string;
  iconColor?: string;
  trend?: {
    value: string | number;
    label?: string;
    className?: string;
  };
  description?: string;
  className?: string;
  onClick?: () => void;
}

export const SharedCard: React.FC<SharedCardProps> = ({
  title,
  value,
  icon: Icon,
  iconBg = "bg-indigo-100",
  iconColor = "text-indigo-600",
  trend,
  description,
  className,
  onClick,
}) => {
  return (
    <div
      onClick={onClick}
      className={cn(
        "bg-white rounded-xl border border-slate-200 p-5 hover:shadow-md transition-shadow",
        onClick && "cursor-pointer",
        className
      )}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-slate-500">{title}</p>
          <p className="text-2xl font-bold text-slate-900 mt-1">{value}</p>
          <div className="flex items-center gap-1 mt-2">
            {trend ? (
              <>
                <span className={cn("text-sm font-medium", trend.className)}>
                  {trend.value}
                </span>
                {trend.label && <span className="text-sm text-slate-400">{trend.label}</span>}
              </>
            ) : description ? (
              <span className="text-sm text-slate-400">{description}</span>
            ) : null}
          </div>
        </div>
        <div className={cn("h-10 w-10 rounded-lg flex items-center justify-center shrink-0", iconBg)}>
          <Icon className={cn("h-5 w-5", iconColor)} />
        </div>
      </div>
    </div>
  );
};
