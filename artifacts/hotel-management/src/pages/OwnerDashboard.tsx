import { useGetOwnerDashboard, useGetTopSellingItems, useGetStaffPerformance, useGetMonthlyChart } from "@workspace/api-client-react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { TrendingUp, Users, Table2, AlertTriangle, IndianRupee, ShoppingBag } from "lucide-react";

export default function OwnerDashboard() {
  const { data: stats } = useGetOwnerDashboard();
  const { data: topItems = [] } = useGetTopSellingItems();
  const { data: staffPerf = [] } = useGetStaffPerformance();
  const now = new Date();
  const { data: chartData = [] } = useGetMonthlyChart({ year: now.getFullYear(), month: now.getMonth() + 1 });

  return (
    <DashboardLayout title="Owner Overview">
      <div className="space-y-5">
        {stats && (
          <>
            {/* KPI cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
              {[
                { label: "Today's Revenue",   value: `₹${stats.todayRevenue.toFixed(0)}`,       sub: `${stats.todayOrders} orders today`,           icon: IndianRupee, from: "from-emerald-400", to: "to-emerald-600", ring: "ring-emerald-100" },
                { label: "Monthly Revenue",   value: `₹${stats.monthRevenue.toFixed(0)}`,        sub: `${stats.monthOrders} orders this month`,       icon: TrendingUp,  from: "from-sky-400",     to: "to-sky-600",     ring: "ring-sky-100" },
                { label: "Table Occupancy",   value: `${stats.tableOccupancyRate}%`,              sub: "Currently occupied",                           icon: Table2,      from: "from-violet-400",  to: "to-violet-600",  ring: "ring-violet-100" },
                { label: "Net Profit (Month)",value: `₹${stats.netProfitThisMonth.toFixed(0)}`,  sub: `₹${stats.totalExpensesThisMonth.toFixed(0)} expenses`, icon: ShoppingBag, from: "from-amber-400", to: "to-amber-600", ring: "ring-amber-100" },
              ].map((card) => (
                <div key={card.label} className={`bg-card border border-border rounded-2xl p-4 card-shadow ring-2 ${card.ring} relative overflow-hidden`}>
                  <div className={`absolute -right-3 -top-3 w-16 h-16 rounded-full bg-gradient-to-br ${card.from} ${card.to} opacity-10`} />
                  <div className={`w-9 h-9 rounded-xl bg-gradient-to-br ${card.from} ${card.to} flex items-center justify-center mb-3`}>
                    <card.icon className="w-4 h-4 text-white" />
                  </div>
                  <div className="text-xl font-extrabold leading-none">{card.value}</div>
                  <div className="text-xs font-semibold text-foreground mt-1.5 leading-tight">{card.label}</div>
                  <div className="text-[10px] text-muted-foreground mt-0.5">{card.sub}</div>
                </div>
              ))}
            </div>

            {/* Quick stats */}
            <div className="grid grid-cols-3 gap-2 sm:gap-3">
              <div className="bg-card border border-border rounded-2xl p-3 sm:p-4 text-center card-shadow">
                <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-sky-50 flex items-center justify-center mx-auto mb-2">
                  <Users className="w-4 h-4 sm:w-5 sm:h-5 text-sky-600" />
                </div>
                <div className="text-xl sm:text-2xl font-extrabold">{stats.todayCustomers}</div>
                <div className="text-[10px] sm:text-xs text-muted-foreground mt-0.5 leading-tight">Customers<br className="sm:hidden" /> Today</div>
              </div>
              <div className={`border rounded-2xl p-3 sm:p-4 text-center card-shadow ${stats.lowStockCount > 0 ? "bg-rose-50 border-rose-200" : "bg-emerald-50 border-emerald-200"}`}>
                <div className={`w-9 h-9 sm:w-10 sm:h-10 rounded-full flex items-center justify-center mx-auto mb-2 ${stats.lowStockCount > 0 ? "bg-rose-100" : "bg-emerald-100"}`}>
                  <AlertTriangle className={`w-4 h-4 sm:w-5 sm:h-5 ${stats.lowStockCount > 0 ? "text-rose-600" : "text-emerald-600"}`} />
                </div>
                <div className={`text-xl sm:text-2xl font-extrabold ${stats.lowStockCount > 0 ? "text-rose-600" : "text-emerald-600"}`}>{stats.lowStockCount}</div>
                <div className={`text-[10px] sm:text-xs mt-0.5 font-medium leading-tight ${stats.lowStockCount > 0 ? "text-rose-600" : "text-emerald-600"}`}>Low Stock<br className="sm:hidden" /> Alerts</div>
              </div>
              <div className="bg-card border border-border rounded-2xl p-3 sm:p-4 text-center card-shadow">
                <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-violet-50 flex items-center justify-center mx-auto mb-2">
                  <Users className="w-4 h-4 sm:w-5 sm:h-5 text-violet-600" />
                </div>
                <div className="text-xl sm:text-2xl font-extrabold">{staffPerf.length}</div>
                <div className="text-[10px] sm:text-xs text-muted-foreground mt-0.5 leading-tight">Active<br className="sm:hidden" /> Waiters</div>
              </div>
            </div>
          </>
        )}

        {/* Revenue chart */}
        <div className="bg-card border border-border rounded-2xl p-5 card-shadow">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-sm">Revenue — {now.toLocaleString("default", { month: "long", year: "numeric" })}</h3>
            {chartData.length > 0 && (
              <span className="text-xs text-muted-foreground bg-secondary px-2.5 py-1 rounded-full">
                {chartData.length} days
              </span>
            )}
          </div>
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={chartData} margin={{ top: 4, right: 4, bottom: 0, left: 0 }}>
              <defs>
                <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%"  stopColor="hsl(346 45% 34%)" stopOpacity={0.2} />
                  <stop offset="95%" stopColor="hsl(346 45% 34%)" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(346 10% 92%)" />
              <XAxis dataKey="date" tickFormatter={(d) => new Date(d).getDate().toString()} tick={{ fontSize: 10 }} />
              <YAxis tick={{ fontSize: 10 }} tickFormatter={(v: number) => v >= 1000 ? `₹${(v / 1000).toFixed(0)}k` : `₹${v}`} width={44} />
              <Tooltip
                formatter={(v: number) => [`₹${v.toFixed(0)}`, "Revenue"]}
                labelFormatter={(d) => new Date(d).toLocaleDateString("en-IN", { dateStyle: "medium" })}
                contentStyle={{ borderRadius: "12px", border: "1px solid hsl(346 10% 88%)", fontSize: "12px" }}
              />
              <Area type="monotone" dataKey="revenue" stroke="hsl(346 45% 34%)" strokeWidth={2.5} fill="url(#revGrad)" dot={false} />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* Top selling */}
          <div className="bg-card border border-border rounded-2xl p-5 card-shadow">
            <h3 className="font-bold text-sm mb-4">Top Selling Items</h3>
            {topItems.length === 0 ? (
              <p className="text-muted-foreground text-sm text-center py-8">No sales data yet</p>
            ) : (
              <div className="space-y-3">
                {topItems.slice(0, 7).map((item, i) => {
                  const max = topItems[0]?.totalQuantity ?? 1;
                  const pct = Math.round((item.totalQuantity / max) * 100);
                  return (
                    <div key={item.menuItemId} data-testid={`row-item-${item.menuItemId}`} className="flex items-center gap-3">
                      <div className={`w-6 h-6 rounded-lg flex items-center justify-center text-[10px] font-extrabold shrink-0 ${i === 0 ? "bg-amber-100 text-amber-700" : i === 1 ? "bg-secondary text-muted-foreground" : "bg-secondary text-muted-foreground"}`}>{i + 1}</div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-sm font-semibold truncate">{item.name}</span>
                          <span className="text-xs font-bold text-primary ml-2 shrink-0">{item.totalQuantity} sold</span>
                        </div>
                        <div className="h-1.5 rounded-full bg-secondary overflow-hidden">
                          <div className="h-full rounded-full bg-primary transition-all" style={{ width: `${pct}%` }} />
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Staff performance */}
          <div className="bg-card border border-border rounded-2xl p-5 card-shadow">
            <h3 className="font-bold text-sm mb-4">Staff Performance</h3>
            {staffPerf.length === 0 ? (
              <p className="text-muted-foreground text-sm text-center py-8">No performance data yet</p>
            ) : (
              <div className="space-y-3">
                {staffPerf.map((s, i) => (
                  <div key={s.userId} data-testid={`row-staff-${s.userId}`} className="flex items-center gap-3">
                    <div className={`w-9 h-9 rounded-xl flex items-center justify-center text-sm font-extrabold shrink-0 ${i === 0 ? "bg-amber-100 text-amber-700" : "bg-secondary text-primary"}`}>
                      {s.name.charAt(0)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-semibold truncate">{s.name}</span>
                        <span className="text-xs font-bold text-primary ml-2 shrink-0">{s.totalOrders} orders</span>
                      </div>
                      <div className="flex items-center justify-between mt-0.5">
                        <span className="text-[10px] text-muted-foreground capitalize">{s.role}</span>
                        <span className="text-[10px] text-muted-foreground">₹{s.totalRevenue.toFixed(0)}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
