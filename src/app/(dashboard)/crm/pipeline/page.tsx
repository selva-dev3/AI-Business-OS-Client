"use client";

import * as React from "react";
import {
  useDealsList,
  useChangeDealStage,
  Deal,
} from "@/hooks/queries/crm";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import {
  Briefcase,
  Search,
  Plus,
  ArrowRight,
  ArrowLeft,
  Calendar,
  Sparkles,
  TrendingUp,
  DollarSign,
  Layers,
} from "lucide-react";

// Stages order
const PIPELINE_STAGES: { key: Deal["stage"]; label: string; color: string }[] = [
  { key: "QUALIFICATION", label: "Qualification", color: "border-t-slate-400 bg-slate-50/50" },
  { key: "DEMO", label: "Demo Scheduled", color: "border-t-sky-400 bg-sky-50/10" },
  { key: "PROPOSAL", label: "Proposal Sent", color: "border-t-blue-400 bg-blue-50/10" },
  { key: "NEGOTIATION", label: "Negotiation", color: "border-t-amber-400 bg-amber-50/10" },
  { key: "WON", label: "Closed Won", color: "border-t-emerald-500 bg-emerald-50/10" },
  { key: "LOST", label: "Closed Lost", color: "border-t-rose-400 bg-rose-50/10" },
];

const MOCK_PIPELINE_DEALS: Deal[] = [
  {
    _id: "mock-deal-1",
    title: "TCS Enterprise HRMS Migration",
    value: 45000,
    currency: "USD",
    stage: "PROPOSAL",
    probability: 70,
    expectedCloseDate: new Date(Date.now() + 3600000 * 24 * 15).toISOString().substring(0, 10),
    finalValue: 0,
    status: "OPEN",
    notes: "Reviewing proposal terms this week.",
    tags: ["Enterprise", "Migration"],
    companyId: "mock-company",
    position: 0,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    _id: "mock-deal-2",
    title: "Reliance AI Operations Tooling",
    value: 85000,
    currency: "USD",
    stage: "NEGOTIATION",
    probability: 90,
    expectedCloseDate: new Date(Date.now() + 3600000 * 24 * 7).toISOString().substring(0, 10),
    finalValue: 0,
    status: "OPEN",
    notes: "Contract draft under review.",
    tags: ["AI", "Security Approved"],
    companyId: "mock-company",
    position: 1,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    _id: "mock-deal-3",
    title: "Infotech Hub Core Licenses",
    value: 12000,
    currency: "USD",
    stage: "WON",
    probability: 100,
    expectedCloseDate: new Date().toISOString().substring(0, 10),
    actualCloseDate: new Date().toISOString(),
    finalValue: 12000,
    status: "WON",
    notes: "Deal closed successfully.",
    tags: ["SMB", "Won"],
    companyId: "mock-company",
    position: 2,
    createdAt: new Date(Date.now() - 3600000 * 24 * 10).toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    _id: "mock-deal-4",
    title: "Wipro Cloud Modernization",
    value: 30000,
    currency: "USD",
    stage: "QUALIFICATION",
    probability: 20,
    expectedCloseDate: new Date(Date.now() + 3600000 * 24 * 60).toISOString().substring(0, 10),
    finalValue: 0,
    status: "OPEN",
    notes: "Needs discovery workshop scheduled.",
    tags: ["Cloud", "Discovery"],
    companyId: "mock-company",
    position: 3,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

export default function PipelinePage() {
  const [search, setSearch] = React.useState("");
  const { data: serverData, isLoading, refetch } = useDealsList({ limit: 100 });
  const changeStageMutation = useChangeDealStage();

  // Local state pipeline list for sandbox fallback
  const [localDeals, setLocalDeals] = React.useState<Deal[]>(MOCK_PIPELINE_DEALS);

  // Dragging states
  const [draggedDealId, setDraggedDealId] = React.useState<string | null>(null);

  // Compute final lists
  const deals = React.useMemo(() => {
    if (serverData?.data && serverData.data.length > 0) {
      return serverData.data;
    }
    return localDeals;
  }, [serverData, localDeals]);

  // Total active value sum
  const totalPipelineValue = React.useMemo(() => {
    return deals
      .filter((d) => d.status === "OPEN" || d.status === "WON")
      .reduce((sum, d) => sum + (d.status === "WON" ? d.finalValue || d.value : d.value), 0);
  }, [deals]);

  const handleDragStart = (e: React.DragEvent, dealId: string) => {
    e.dataTransfer.setData("text/plain", dealId);
    setDraggedDealId(dealId);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const moveDealStage = async (dealId: string, targetStage: Deal["stage"]) => {
    // If dragging to same stage, skip
    const currentDeal = deals.find((d) => d._id === dealId);
    if (!currentDeal || currentDeal.stage === targetStage) return;

    try {
      await changeStageMutation.mutateAsync({ id: dealId, stage: targetStage });
      toast.success(`Deal moved to ${targetStage} successfully!`);
      refetch();
    } catch (err) {
      console.warn("Server update failed, shifting locally...", err);
      // Determine status from stage
      const newStatus: Deal["status"] =
        targetStage === "WON" ? "WON" : targetStage === "LOST" ? "LOST" : "OPEN";
      
      const probMap: Record<Deal["stage"], number> = {
        QUALIFICATION: 10,
        DEMO: 30,
        PROPOSAL: 60,
        NEGOTIATION: 80,
        WON: 100,
        LOST: 0,
      };

      setLocalDeals((prev) =>
        prev.map((d) =>
          d._id === dealId
            ? {
                ...d,
                stage: targetStage,
                status: newStatus,
                probability: probMap[targetStage],
                finalValue: targetStage === "WON" ? d.value : 0,
              }
            : d
        )
      );
      toast.success(`Moved to ${targetStage} (Local Sandbox Mode).`);
    }
  };

  const handleDrop = (e: React.DragEvent, targetStage: Deal["stage"]) => {
    e.preventDefault();
    const id = e.dataTransfer.getData("text/plain") || draggedDealId;
    if (id) {
      moveDealStage(id, targetStage);
    }
    setDraggedDealId(null);
  };

  const shiftStageButton = (deal: Deal, direction: "left" | "right") => {
    const currentIndex = PIPELINE_STAGES.findIndex((s) => s.key === deal.stage);
    let targetIndex = currentIndex;
    if (direction === "left") {
      targetIndex = Math.max(0, currentIndex - 1);
    } else {
      targetIndex = Math.min(PIPELINE_STAGES.length - 1, currentIndex + 1);
    }
    if (targetIndex !== currentIndex) {
      moveDealStage(deal._id, PIPELINE_STAGES[targetIndex].key);
    }
  };

  // Filter deals by search query
  const filteredDeals = React.useMemo(() => {
    return deals.filter((d) => d.title.toLowerCase().includes(search.toLowerCase()));
  }, [deals, search]);

  return (
    <div className="space-y-8 p-1 animate-in fade-in duration-500">
      {/* Header bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight text-slate-900 flex items-center gap-2">
            CRM Kanban Pipeline
          </h1>
          <p className="mt-1 text-[14px] text-slate-500">
            Visualize your deal stages. Drag and drop deal cards to change pipeline phases.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="bg-indigo-50 border border-indigo-100 rounded-xl px-4 py-2 flex items-center gap-2 text-indigo-700 shadow-sm">
            <Layers className="h-4 w-4" />
            <span className="text-[12px] font-bold">Pipeline Worth:</span>
            <span className="text-[14px] font-extrabold">${totalPipelineValue.toLocaleString()}</span>
          </div>
        </div>
      </div>

      {/* Kanban Filters */}
      <div className="flex items-center justify-between bg-white border border-slate-200 p-4 rounded-xl shadow-sm">
        <div className="relative w-full md:w-80">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
          <Input
            placeholder="Search deals in board..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <p className="text-[12px] font-semibold text-slate-500">
          Tip: Grab cards to drag and drop or use the control arrows below them.
        </p>
      </div>

      {/* Kanban Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="space-y-4">
              <Skeleton className="h-8 w-full" />
              <Skeleton className="h-28 w-full" />
            </div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4 overflow-x-auto pb-4">
          {PIPELINE_STAGES.map((stage) => {
            const stageDeals = filteredDeals.filter((d) => d.stage === stage.key);
            const stageValueSum = stageDeals.reduce((sum, d) => sum + (d.status === "WON" ? d.finalValue || d.value : d.value), 0);

            return (
              <div
                key={stage.key}
                onDragOver={handleDragOver}
                onDrop={(e) => handleDrop(e, stage.key)}
                className={`flex flex-col min-w-[200px] border border-slate-200 rounded-xl shadow-sm border-t-4 ${stage.color} min-h-[500px]`}
              >
                {/* Stage Header */}
                <div className="p-3 border-b border-slate-100 flex flex-col gap-1 bg-white/70 backdrop-blur-sm rounded-t-xl">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-[13px] text-slate-700">{stage.label}</span>
                    <Badge variant="secondary" className="bg-slate-100 text-slate-600 text-[10px] px-2 py-0">
                      {stageDeals.length}
                    </Badge>
                  </div>
                  <span className="text-[11px] font-semibold text-slate-500">
                    ${stageValueSum.toLocaleString()}
                  </span>
                </div>

                {/* Stage Cards Container */}
                <div className="p-2 space-y-3 flex-1 overflow-y-auto">
                  {stageDeals.length === 0 ? (
                    <div className="text-center py-8 text-[11px] text-slate-400 border border-dashed border-slate-200 rounded-lg">
                      Drop deals here
                    </div>
                  ) : (
                    stageDeals.map((deal) => (
                      <Card
                        key={deal._id}
                        draggable
                        onDragStart={(e) => handleDragStart(e, deal._id)}
                        className={`border-slate-200 shadow-sm hover:shadow cursor-grab active:cursor-grabbing bg-white transition-all duration-200 relative ${
                          draggedDealId === deal._id ? "opacity-40" : ""
                        }`}
                      >
                        <CardContent className="p-3 space-y-2">
                          <div>
                            <div className="font-bold text-[12px] text-slate-800 leading-tight">
                              {deal.title}
                            </div>
                            {deal.tags && deal.tags.length > 0 && (
                              <div className="flex flex-wrap gap-1 mt-1">
                                {deal.tags.map((t, idx) => (
                                  <Badge key={idx} variant="secondary" className="bg-slate-100 text-slate-500 text-[8px] px-1 py-0 hover:bg-slate-100">
                                    {t}
                                  </Badge>
                                ))}
                              </div>
                            )}
                          </div>

                          <div className="flex items-center justify-between">
                            <span className="text-[12px] font-extrabold text-slate-900">
                              {deal.currency} {deal.value.toLocaleString()}
                            </span>
                            <Badge className="bg-slate-100 text-slate-600 text-[9px] px-1 py-0">
                              {deal.probability}%
                            </Badge>
                          </div>

                          {deal.expectedCloseDate && (
                            <div className="flex items-center gap-1 text-[9px] text-slate-400">
                              <Calendar className="h-3 w-3" />
                              Exp: {new Date(deal.expectedCloseDate).toLocaleDateString([], { month: "short", day: "numeric" })}
                            </div>
                          )}

                          {/* Quick Shift buttons */}
                          <div className="flex items-center justify-between border-t border-slate-100 pt-2 mt-2">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => shiftStageButton(deal, "left")}
                              className="h-6 w-6 text-slate-400 hover:text-indigo-600"
                              title="Shift Left"
                            >
                              <ArrowLeft className="h-3.5 w-3.5" />
                            </Button>
                            <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">
                              Shift Stage
                            </span>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => shiftStageButton(deal, "right")}
                              className="h-6 w-6 text-slate-400 hover:text-indigo-600"
                              title="Shift Right"
                            >
                              <ArrowRight className="h-3.5 w-3.5" />
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    ))
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
