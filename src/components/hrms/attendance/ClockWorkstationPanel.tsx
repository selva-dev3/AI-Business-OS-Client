import React from "react";
import { Clock, Play, Square } from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AttendanceCheckInButton } from "@/components/hrms/attendance/AttendanceCheckInButton";

interface ClockWorkstationPanelProps {
  currentTime: string;
  timerText: string;
  checkedIn: boolean;
  checkInTime: string | null;
  checkOutTime: string | null;
  onCheckIn: () => void;
  onCheckOut: () => void;
}

export const ClockWorkstationPanel: React.FC<ClockWorkstationPanelProps> = ({
  currentTime,
  timerText,
  checkedIn,
  checkInTime,
  checkOutTime,
  onCheckIn,
  onCheckOut,
}) => {
  return (
    <Card className="border-indigo-100 bg-indigo-50/40 relative overflow-hidden shadow-xs">
      <div className="absolute right-[-10px] top-[-10px] opacity-10">
        <Clock className="h-32 w-32 text-indigo-700" />
      </div>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-bold uppercase tracking-wider text-indigo-900">
          Clock Workstation
        </CardTitle>
        <CardDescription className="text-xs text-indigo-700/80">
          Current local workstation session.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4 pt-1">
        <div className="text-center py-2">
          <h2 className="text-3xl font-extrabold text-slate-900 font-mono tracking-tight">
            {currentTime || "--:--:--"}
          </h2>
          {checkedIn ? (
            <div className="flex items-center justify-center gap-2 mt-2">
              <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-xs font-semibold text-emerald-700">
                Logged: {timerText}
              </span>
            </div>
          ) : (
            <p className="text-xs font-medium text-slate-500 mt-2">
              Ready to clock check-in record
            </p>
          )}
        </div>

        <div className="flex gap-2">
          {!checkedIn ? (
            <AttendanceCheckInButton
              onClick={onCheckIn}
              variant="default"
              className="flex-1 bg-indigo-600 text-white hover:bg-indigo-700 font-semibold shadow-xs"
            >
              <Play className="h-4 w-4 fill-white" />
              Check In
            </AttendanceCheckInButton>
          ) : (
            <Button
              onClick={onCheckOut}
              variant="destructive"
              className="flex-1 bg-red-600 hover:bg-red-700 font-semibold shadow-xs flex items-center justify-center gap-2"
            >
              <Square className="h-4 w-4 fill-white" />
              Check Out
            </Button>
          )}
        </div>

        {checkInTime && (
          <div className="border-t border-indigo-100/60 pt-3 text-[11px] text-slate-500 space-y-1">
            <div className="flex justify-between">
              <span>Checked In:</span>
              <span className="font-semibold text-slate-800">
                {new Date(checkInTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </span>
            </div>
            {checkOutTime && (
              <div className="flex justify-between">
                <span>Checked Out:</span>
                <span className="font-semibold text-slate-800">
                  {new Date(checkOutTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};