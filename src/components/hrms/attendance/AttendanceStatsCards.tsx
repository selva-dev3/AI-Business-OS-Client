import React from "react";
import { UserCheck, CheckCircle2, AlertTriangle, UserX, TrendingUp } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

interface StatsData {
  total: number;
  present: number;
  late: number;
  absent: number;
  halfDay: number;
  onLeave: number;
  presentRate: number;
  avgHours: number;
}

interface AttendanceStatsCardsProps {
  stats: StatsData;
}

export const AttendanceStatsCards: React.FC<AttendanceStatsCardsProps> = ({ stats }) => {
  return (
    <div className="lg:col-span-3 grid grid-cols-2 md:grid-cols-4 gap-4">
      {/* Attendance Rate Card */}
      <Card className="border-slate-100 bg-white shadow-xs">
        <CardContent className="p-5 flex flex-col justify-between h-full">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Attendance Rate
            </span>
            <div className="h-8 w-8 rounded-lg bg-emerald-50 flex items-center justify-center text-emerald-600">
              <UserCheck className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-4">
            <h3 className="text-2xl font-bold text-slate-900">{stats.presentRate}%</h3>
            <div className="flex items-center gap-1 mt-1 text-[11px] text-slate-400">
              <TrendingUp className="h-3 w-3 text-emerald-500" />
              <span className="font-medium text-emerald-600">Good</span> compliance rate
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Present Today Card */}
      <Card className="border-slate-100 bg-white shadow-xs">
        <CardContent className="p-5 flex flex-col justify-between h-full">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Present Today
            </span>
            <div className="h-8 w-8 rounded-lg bg-indigo-50 flex items-center justify-center text-indigo-600">
              <CheckCircle2 className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-4">
            <h3 className="text-2xl font-bold text-slate-900">
              {stats.present} <span className="text-xs font-normal text-slate-400">/ {stats.total - stats.onLeave}</span>
            </h3>
            <p className="text-[11px] text-slate-400 mt-1">
              Excluding {stats.onLeave} active leave
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Late Arrivals Card */}
      <Card className="border-slate-100 bg-white shadow-xs">
        <CardContent className="p-5 flex flex-col justify-between h-full">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Late Arrivals
            </span>
            <div className="h-8 w-8 rounded-lg bg-amber-50 flex items-center justify-center text-amber-600">
              <AlertTriangle className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-4">
            <h3 className="text-2xl font-bold text-slate-900">{stats.late}</h3>
            <p className="text-[11px] text-slate-400 mt-1">
              Arrived after 09:15 AM limit
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Absentees Card */}
      <Card className="border-slate-100 bg-white shadow-xs">
        <CardContent className="p-5 flex flex-col justify-between h-full">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Absentees
            </span>
            <div className="h-8 w-8 rounded-lg bg-rose-50 flex items-center justify-center text-rose-600">
              <UserX className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-4">
            <h3 className="text-2xl font-bold text-slate-900">{stats.absent}</h3>
            <p className="text-[11px] text-slate-400 mt-1">
              No check-in record reported
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};