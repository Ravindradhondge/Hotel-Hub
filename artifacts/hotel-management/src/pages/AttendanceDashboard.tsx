import { useState } from "react";
import { useGetTodayAttendance, useGetAttendanceHistory, getGetAttendanceHistoryQueryKey } from "@workspace/api-client-react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Users, Clock, UserCheck, UserX, Calendar, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";

const STATUS_STYLE = {
  present: { bg: "bg-emerald-50", border: "border-emerald-200", badge: "bg-emerald-100 text-emerald-700", label: "Present" },
  late:    { bg: "bg-amber-50",   border: "border-amber-200",   badge: "bg-amber-100 text-amber-700",   label: "Late" },
  absent:  { bg: "bg-rose-50",    border: "border-rose-200",     badge: "bg-rose-100 text-rose-700",     label: "Absent" },
};

const ROLE_STYLE: Record<string, string> = {
  waiter:     "bg-sky-100 text-sky-700",
  kitchen:    "bg-amber-100 text-amber-700",
  accountant: "bg-emerald-100 text-emerald-700",
};

function fmt(iso: string | null) {
  if (!iso) return "—";
  return new Date(iso).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit", hour12: true });
}

function fmtDate(dateStr: string) {
  return new Date(dateStr + "T00:00:00").toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
}

export default function AttendanceDashboard() {
  const [tab, setTab] = useState<"today" | "history">("today");
  const [historyMonth, setHistoryMonth] = useState(() => {
    const d = new Date();
    return { year: d.getFullYear(), month: d.getMonth() + 1 };
  });

  const { data: todayData = [], isLoading: todayLoading } = useGetTodayAttendance();

  const startDate = `${historyMonth.year}-${String(historyMonth.month).padStart(2, "0")}-01`;
  const endDate = new Date(historyMonth.year, historyMonth.month, 0).toISOString().slice(0, 10);
  const { data: historyData = [], isLoading: historyLoading } = useGetAttendanceHistory(
    { startDate, endDate },
    { query: { enabled: tab === "history", queryKey: getGetAttendanceHistoryQueryKey({ startDate, endDate }) } }
  );

  const presentCount = todayData.filter((s) => s.status === "present").length;
  const lateCount    = todayData.filter((s) => s.status === "late").length;
  const absentCount  = todayData.filter((s) => s.status === "absent").length;

  const prevMonth = () => setHistoryMonth((m) => {
    const d = new Date(m.year, m.month - 2, 1);
    return { year: d.getFullYear(), month: d.getMonth() + 1 };
  });
  const nextMonth = () => setHistoryMonth((m) => {
    const d = new Date(m.year, m.month, 1);
    return { year: d.getFullYear(), month: d.getMonth() + 1 };
  });

  return (
    <DashboardLayout title="Staff Attendance">
      <div className="space-y-5">

        {/* Summary strip */}
        <div className="grid grid-cols-3 gap-3">
          {[
            { label: "Present", count: presentCount, icon: UserCheck, from: "from-emerald-400", to: "to-emerald-600", ring: "ring-emerald-100" },
            { label: "Late",    count: lateCount,    icon: Clock,      from: "from-amber-400",  to: "to-amber-600",  ring: "ring-amber-100" },
            { label: "Absent",  count: absentCount,  icon: UserX,      from: "from-rose-400",   to: "to-rose-600",   ring: "ring-rose-100" },
          ].map((card) => (
            <div key={card.label} className={`bg-card border border-border rounded-2xl p-3 sm:p-4 card-shadow ring-2 ${card.ring} relative overflow-hidden`}>
              <div className={`absolute -right-3 -top-3 w-16 h-16 rounded-full bg-gradient-to-br ${card.from} ${card.to} opacity-10`} />
              <div className={`w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-gradient-to-br ${card.from} ${card.to} flex items-center justify-center mb-2 sm:mb-3`}>
                <card.icon className="w-4 h-4 text-white" />
              </div>
              <div className="text-xl sm:text-2xl font-extrabold">{card.count}</div>
              <div className="text-[10px] sm:text-xs font-semibold text-muted-foreground mt-0.5">{card.label} Today</div>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div className="flex gap-1.5 bg-secondary p-1 rounded-xl w-fit">
          {(["today", "history"] as const).map((t) => (
            <button key={t} onClick={() => setTab(t)}
              className={`px-3 sm:px-4 py-1.5 rounded-lg text-xs sm:text-sm font-semibold transition-all capitalize ${tab === t ? "bg-card shadow-sm text-foreground" : "text-muted-foreground hover:text-foreground"}`}>
              {t === "today" ? "Today" : "Monthly History"}
            </button>
          ))}
        </div>

        {/* Today tab */}
        {tab === "today" && (
          todayLoading ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="bg-secondary rounded-2xl h-32 animate-pulse" />
              ))}
            </div>
          ) : todayData.length === 0 ? (
            <div className="text-center py-16 text-muted-foreground">
              <Users className="w-10 h-10 mx-auto mb-3 opacity-30" />
              <p className="font-medium">No staff found</p>
              <p className="text-xs mt-1">Add staff members to track attendance</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
              {todayData.map((s) => {
                const st = STATUS_STYLE[s.status as keyof typeof STATUS_STYLE] ?? STATUS_STYLE.absent;
                return (
                  <div key={s.userId} className={`border rounded-2xl p-3 sm:p-4 card-shadow ${st.bg} ${st.border} flex flex-col gap-2`}>
                    <div className="flex items-start justify-between">
                      <div className={`w-9 h-9 sm:w-10 sm:h-10 rounded-xl flex items-center justify-center font-extrabold text-sm ${ROLE_STYLE[s.userRole] ?? "bg-secondary text-primary"}`}>
                        {s.userName.charAt(0).toUpperCase()}
                      </div>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${st.badge}`}>{st.label}</span>
                    </div>
                    <div>
                      <p className="font-semibold text-sm leading-tight">{s.userName}</p>
                      <p className="text-xs text-muted-foreground capitalize mt-0.5">{s.userRole}</p>
                    </div>
                    <div className="text-xs text-muted-foreground space-y-0.5 mt-auto">
                      <div className="flex items-center gap-1.5">
                        <span className="font-medium text-foreground/60">In:</span>
                        <span className="font-semibold">{fmt(s.checkIn ?? null)}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <span className="font-medium text-foreground/60">Out:</span>
                        <span className="font-semibold">{fmt(s.checkOut ?? null)}</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )
        )}

        {/* History tab */}
        {tab === "history" && (
          <div className="bg-card border border-border rounded-2xl card-shadow overflow-hidden">
            {/* Month nav */}
            <div className="flex items-center justify-between px-4 sm:px-5 py-3 border-b border-border">
              <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg" onClick={prevMonth}>
                <ChevronLeft className="w-4 h-4" />
              </Button>
              <div className="flex items-center gap-2 text-sm font-semibold">
                <Calendar className="w-4 h-4 text-muted-foreground" />
                {new Date(historyMonth.year, historyMonth.month - 1).toLocaleString("default", { month: "long", year: "numeric" })}
              </div>
              <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg" onClick={nextMonth}>
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>

            {historyLoading ? (
              <div className="p-6 space-y-3">
                {Array.from({ length: 5 }).map((_, i) => (
                  <div key={i} className="h-10 bg-secondary rounded-xl animate-pulse" />
                ))}
              </div>
            ) : historyData.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <p className="font-medium">No records for this month</p>
              </div>
            ) : (
              <>
                {/* Mobile: cards */}
                <div className="md:hidden divide-y divide-border">
                  {historyData.map((r) => {
                    const st = STATUS_STYLE[r.status as keyof typeof STATUS_STYLE] ?? STATUS_STYLE.absent;
                    return (
                      <div key={r.id} className="p-4 flex items-center gap-3">
                        <div className={`w-9 h-9 rounded-xl flex items-center justify-center text-xs font-bold shrink-0 ${ROLE_STYLE[r.userRole] ?? "bg-secondary text-primary"}`}>
                          {r.userName.charAt(0).toUpperCase()}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="font-semibold text-sm">{r.userName}</span>
                            <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${st.badge}`}>{st.label}</span>
                          </div>
                          <div className="text-xs text-muted-foreground mt-0.5">{fmtDate(r.date)} · {r.userRole}</div>
                          <div className="text-xs mt-0.5">
                            <span className="text-muted-foreground">In: </span><span className="font-medium">{fmt(r.checkIn ?? null)}</span>
                            <span className="text-muted-foreground ml-2">Out: </span><span className="font-medium">{fmt(r.checkOut ?? null)}</span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Desktop: table */}
                <div className="hidden md:block overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-border bg-secondary/50">
                        <th className="text-left px-4 py-2.5 font-semibold text-muted-foreground text-xs">Staff</th>
                        <th className="text-left px-4 py-2.5 font-semibold text-muted-foreground text-xs">Date</th>
                        <th className="text-left px-4 py-2.5 font-semibold text-muted-foreground text-xs">Check In</th>
                        <th className="text-left px-4 py-2.5 font-semibold text-muted-foreground text-xs">Check Out</th>
                        <th className="text-left px-4 py-2.5 font-semibold text-muted-foreground text-xs">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {historyData.map((r) => {
                        const st = STATUS_STYLE[r.status as keyof typeof STATUS_STYLE] ?? STATUS_STYLE.absent;
                        return (
                          <tr key={r.id} className="border-b border-border/50 hover:bg-secondary/30 transition-colors">
                            <td className="px-4 py-3">
                              <div className="flex items-center gap-2">
                                <div className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold ${ROLE_STYLE[r.userRole] ?? "bg-secondary text-primary"}`}>
                                  {r.userName.charAt(0).toUpperCase()}
                                </div>
                                <div>
                                  <p className="font-semibold leading-none">{r.userName}</p>
                                  <p className="text-[10px] text-muted-foreground capitalize mt-0.5">{r.userRole}</p>
                                </div>
                              </div>
                            </td>
                            <td className="px-4 py-3 text-muted-foreground">{fmtDate(r.date)}</td>
                            <td className="px-4 py-3 font-medium">{fmt(r.checkIn ?? null)}</td>
                            <td className="px-4 py-3 font-medium">{fmt(r.checkOut ?? null)}</td>
                            <td className="px-4 py-3">
                              <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${st.badge}`}>{st.label}</span>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </>
            )}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
