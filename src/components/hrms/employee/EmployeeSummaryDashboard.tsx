import * as React from "react";
import { 
  Users, 
  CheckCircle2, 
  Palmtree, 
  PauseCircle, 
  XOctagon, 
  RefreshCw, 
  AlertTriangle
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useSummaryData } from "@/hooks/useSummaryData";
import { SummaryTransformer } from "@/services/SummaryTransformer";
import { ProcessedSummary, EmployeeSearchParams, CardMetricData } from "@/hooks/queries/hrms/employees/employees.types";
import { SharedCard } from "@/components/shared/sharedCard";

interface EmployeeSummaryDashboardProps {
  filterParams: EmployeeSearchParams;
  onSummaryChange?: (summary: ProcessedSummary) => void;
}

export const EmployeeSummaryDashboard: React.FC<EmployeeSummaryDashboardProps> = ({
  filterParams,
  onSummaryChange,
}) => {
  const { summary, loading, error, refetch } = useSummaryData({
    filterParams,
    cacheTime: 60000,
    autoRefresh: true,
    refreshInterval: 30000,
  });

  // Notify parent component of changes
  React.useEffect(() => {
    if (summary) {
      onSummaryChange?.(summary);
    }
  }, [summary, onSummaryChange]);

  if (error && !summary) {
    return <SummaryErrorState error={error} onRetry={refetch} />;
  }

  if (loading && !summary) {
    return <SummarySkeleton />;
  }

  if (summary) {
    return <SummaryStatsGrid summary={summary} />;
  }

  return null;
};

/* ==========================================================================
   SUBCOMPONENTS
   ========================================================================== */

/**
 * Renders the 5 status summary cards
 */
const SummaryStatsGrid: React.FC<{ summary: ProcessedSummary }> = ({ summary }) => {
  const cardMetrics = SummaryTransformer.toCardMetrics(summary);

  const getCardDetails = (label: string) => {
    switch (label) {
      case "Total Headcount":
        return {
          icon: Users,
          iconColor: "text-indigo-600",
          iconBg: "bg-indigo-100",
        };
      case "Active Staff":
        return {
          icon: CheckCircle2,
          iconColor: "text-emerald-600",
          iconBg: "bg-emerald-100",
        };
      case "On Leave":
        return {
          icon: Palmtree,
          iconColor: "text-amber-600",
          iconBg: "bg-amber-100",
        };
      case "Inactive":
        return {
          icon: PauseCircle,
          iconColor: "text-slate-600",
          iconBg: "bg-slate-100",
        };
      case "Suspended":
        return {
          icon: XOctagon,
          iconColor: "text-rose-600",
          iconBg: "bg-rose-100",
        };
      default:
        return {
          icon: Users,
          iconColor: "text-indigo-600",
          iconBg: "bg-indigo-100",
        };
    }
  };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
      {cardMetrics.map((card: CardMetricData) => {
        const { icon: Icon, iconColor, iconBg } = getCardDetails(card.label);
        
        let textColor = "text-slate-600";
        if (card.label === "Active Staff") textColor = "text-emerald-600";
        else if (card.label === "On Leave") textColor = "text-amber-600";
        else if (card.label === "Suspended") textColor = "text-red-600";

        const trend = card.label !== "Total Headcount" ? {
          value: `${card.percentage}%`,
          label: "of headcount",
          className: textColor
        } : undefined;

        const description = card.label === "Total Headcount" ? "Active workforce size" : undefined;

        return (
          <SharedCard
            key={card.label}
            title={card.label}
            value={card.value}
            icon={Icon}
            iconBg={iconBg}
            iconColor={iconColor}
            trend={trend}
            description={description}
          />
        );
      })}
    </div>
  );
};

const SummarySkeleton: React.FC = () => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
      {[...Array(5)].map((_, i) => (
        <div 
          key={i} 
          className="bg-white rounded-xl border border-slate-200 p-5"
        >
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="h-4 w-24 bg-slate-100 rounded-md animate-pulse" />
              <div className="h-8 w-16 bg-slate-100 rounded-md mt-1.5 animate-pulse" />
              <div className="h-4 w-28 bg-slate-50 rounded-md mt-2.5 animate-pulse" />
            </div>
            <div className="h-10 w-10 bg-slate-100 rounded-lg animate-pulse shrink-0" />
          </div>
        </div>
      ))}
    </div>
  );
};

/**
 * Error state display
 */
const SummaryErrorState: React.FC<{ error: Error; onRetry: () => void }> = ({ error, onRetry }) => {
  return (
    <Card className="border-rose-200 bg-rose-50/50 shadow-xs">
      <CardContent className="p-6 flex flex-col items-center text-center space-y-4">
        <AlertTriangle className="h-10 w-10 text-rose-500" />
        <div>
          <h4 className="font-bold text-rose-800 text-sm">Failed to Load Workforce Analytics</h4>
          <p className="text-xs text-rose-600 mt-1">{error.message || "An unexpected network error occurred."}</p>
        </div>
        <Button 
          variant="outline" 
          onClick={onRetry}
          className="border-rose-200 hover:bg-rose-100/50 text-rose-700 text-xs font-semibold h-9 px-4"
        >
          <RefreshCw className="h-3 w-3 mr-2" />
          Retry Connection
        </Button>
      </CardContent>
    </Card>
  );
};
