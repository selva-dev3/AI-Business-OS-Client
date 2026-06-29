"use client";

import * as React from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { Calendar, RefreshCw, AlertTriangle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { useAttendanceReport } from "@/hooks/queries/hrms/attendance/attendance.hooks";

export function AttendanceReportsView() {
  const [fromDate, setFromDate] = React.useState(
    new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split("T")[0]
  );
  const [toDate, setToDate] = React.useState(
    new Date().toISOString().split("T")[0]
  );

  const { data: reportData, isLoading, isError, refetch, isFetching } = useAttendanceReport({
    fromDate: fromDate ? new Date(fromDate).toISOString() : undefined,
    toDate: toDate ? new Date(toDate).toISOString() : undefined,
  });

  const totalPresent = React.useMemo(
    () => (reportData || []).reduce((sum, r) => sum + r.totalPresent, 0),
    [reportData]
  );
  const totalAbsent = React.useMemo(
    () => (reportData || []).reduce((sum, r) => sum + r.totalAbsent, 0),
    [reportData]
  );
  const totalLate = React.useMemo(
    () => (reportData || []).reduce((sum, r) => sum + r.totalLate, 0),
    [reportData]
  );
  const totalHalfDay = React.useMemo(
    () => (reportData || []).reduce((sum, r) => sum + r.totalHalfDay, 0),
    [reportData]
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-slate-900">Attendance Reports</h2>
          <p className="text-sm text-slate-500">Department-wise attendance breakdown</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-slate-400" />
            <Input
              type="date"
              value={fromDate}
              onChange={(e) => setFromDate(e.target.value)}
              className="h-9 text-xs w-36"
            />
            <span className="text-xs text-slate-400">to</span>
            <Input
              type="date"
              value={toDate}
              onChange={(e) => setToDate(e.target.value)}
              className="h-9 text-xs w-36"
            />
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => refetch()}
            disabled={isFetching}
            className="h-9"
          >
            <RefreshCw className={`h-4 w-4 ${isFetching ? "animate-spin" : ""}`} />
          </Button>
        </div>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} className="h-24 rounded-xl" />
          ))}
        </div>
      ) : isError ? (
        <Card className="border-rose-100 bg-rose-50/20">
          <CardContent className="py-12 text-center space-y-4">
            <AlertTriangle className="h-10 w-10 text-rose-500 mx-auto" />
            <p className="text-sm text-slate-500">Failed to load attendance report</p>
            <Button variant="outline" size="sm" onClick={() => refetch()}>
              Retry
            </Button>
          </CardContent>
        </Card>
      ) : (
        <>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Card className="border-slate-100">
              <CardContent className="p-5">
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Present</p>
                <p className="text-2xl font-bold text-emerald-600 mt-1">{totalPresent}</p>
              </CardContent>
            </Card>
            <Card className="border-slate-100">
              <CardContent className="p-5">
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Absent</p>
                <p className="text-2xl font-bold text-rose-600 mt-1">{totalAbsent}</p>
              </CardContent>
            </Card>
            <Card className="border-slate-100">
              <CardContent className="p-5">
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Late</p>
                <p className="text-2xl font-bold text-amber-600 mt-1">{totalLate}</p>
              </CardContent>
            </Card>
            <Card className="border-slate-100">
              <CardContent className="p-5">
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Half Day</p>
                <p className="text-2xl font-bold text-indigo-600 mt-1">{totalHalfDay}</p>
              </CardContent>
            </Card>
          </div>

          {(!reportData || reportData.length === 0) ? (
            <Card>
              <CardContent className="py-12 text-center">
                <p className="text-sm text-slate-400">No report data available for the selected period</p>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardHeader>
                <CardTitle className="text-sm font-bold text-slate-900">
                  Department-wise Attendance
                </CardTitle>
                <CardDescription>
                  Breakdown by department for {fromDate} to {toDate}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={reportData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                      <XAxis dataKey="department" tick={{ fontSize: 12 }} />
                      <YAxis tick={{ fontSize: 12 }} />
                      <Tooltip />
                      <Legend />
                      <Bar dataKey="totalPresent" name="Present" fill="#10b981" radius={[4, 4, 0, 0]} />
                      <Bar dataKey="totalAbsent" name="Absent" fill="#f43f5e" radius={[4, 4, 0, 0]} />
                      <Bar dataKey="totalLate" name="Late" fill="#f59e0b" radius={[4, 4, 0, 0]} />
                      <Bar dataKey="totalHalfDay" name="Half Day" fill="#6366f1" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          )}

          {reportData && reportData.length > 0 && (
            <Card>
              <CardContent className="p-0">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b bg-slate-50">
                      <th className="text-left px-4 py-3 font-semibold text-slate-600">Department</th>
                      <th className="text-center px-4 py-3 font-semibold text-green-600">Present</th>
                      <th className="text-center px-4 py-3 font-semibold text-rose-600">Absent</th>
                      <th className="text-center px-4 py-3 font-semibold text-amber-600">Late</th>
                      <th className="text-center px-4 py-3 font-semibold text-indigo-600">Half Day</th>
                      <th className="text-center px-4 py-3 font-semibold text-slate-600">Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {reportData.map((row, idx) => {
                      const total = row.totalPresent + row.totalAbsent + row.totalLate + row.totalHalfDay;
                      return (
                        <tr key={idx} className="border-b last:border-0 hover:bg-slate-50/50">
                          <td className="px-4 py-3 font-medium text-slate-800">{row.department}</td>
                          <td className="px-4 py-3 text-center text-emerald-600 font-semibold">{row.totalPresent}</td>
                          <td className="px-4 py-3 text-center text-rose-600 font-semibold">{row.totalAbsent}</td>
                          <td className="px-4 py-3 text-center text-amber-600 font-semibold">{row.totalLate}</td>
                          <td className="px-4 py-3 text-center text-indigo-600 font-semibold">{row.totalHalfDay}</td>
                          <td className="px-4 py-3 text-center font-semibold text-slate-700">{total}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </CardContent>
            </Card>
          )}
        </>
      )}
    </div>
  );
}
