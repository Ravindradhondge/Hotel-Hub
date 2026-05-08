import { useGetOwnerDashboard, useGetTopSellingItems, useGetStaffPerformance, useGetMonthlyChart } from "@workspace/api-client-react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from "recharts";
import { TrendingUp, Users, ShoppingBag, Table2, AlertTriangle, IndianRupee } from "lucide-react";

export default function OwnerDashboard() {
  const { data: stats } = useGetOwnerDashboard();
  const { data: topItems = [] } = useGetTopSellingItems();
  const { data: staffPerf = [] } = useGetStaffPerformance();
  const now = new Date();
  const { data: chartData = [] } = useGetMonthlyChart({ year: now.getFullYear(), month: now.getMonth() + 1 });

  return (
    <DashboardLayout title="Owner Overview">
      <div className="space-y-6">
        {stats && (
          <>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              {[
                { label: "Today's Revenue", value: `₹${stats.todayRevenue.toFixed(2)}`, sub: `${stats.todayOrders} orders`, icon: IndianRupee, color: "text-emerald-600", bg: "bg-emerald-50" },
                { label: "Monthly Revenue", value: `₹${stats.monthRevenue.toFixed(2)}`, sub: `${stats.monthOrders} orders`, icon: TrendingUp, color: "text-blue-600", bg: "bg-blue-50" },
                { label: "Table Occupancy", value: `${stats.tableOccupancyRate}%`, sub: "current", icon: Table2, color: "text-violet-600", bg: "bg-violet-50" },
                { label: "Net Profit (Month)", value: `₹${stats.netProfitThisMonth.toFixed(2)}`, sub: `₹${stats.totalExpensesThisMonth.toFixed(2)} expenses`, icon: TrendingUp, color: "text-amber-600", bg: "bg-amber-50" },
              ].map((card) => (
                <div key={card.label} className="bg-card border border-border rounded-xl p-5">
                  <div className={`w-10 h-10 rounded-lg ${card.bg} flex items-center justify-center mb-3`}>
                    <card.icon className={`w-5 h-5 ${card.color}`} />
                  </div>
                  <div className={`text-2xl font-bold ${card.color}`}>{card.value}</div>
                  <div className="text-sm font-medium text-foreground mt-1">{card.label}</div>
                  <div className="text-xs text-muted-foreground mt-0.5">{card.sub}</div>
                </div>
              ))}
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div className="bg-card border border-border rounded-xl p-4 text-center">
                <div className="text-3xl font-bold text-foreground">{stats.todayCustomers}</div>
                <div className="text-sm text-muted-foreground mt-1">Customers Today</div>
              </div>
              <div className={`border rounded-xl p-4 text-center ${stats.lowStockCount > 0 ? "bg-rose-50 border-rose-200" : "bg-emerald-50 border-emerald-200"}`}>
                <div className={`text-3xl font-bold ${stats.lowStockCount > 0 ? "text-rose-600" : "text-emerald-600"}`}>{stats.lowStockCount}</div>
                <div className="text-sm mt-1 flex items-center justify-center gap-1">
                  {stats.lowStockCount > 0 && <AlertTriangle className="w-3.5 h-3.5 text-rose-500" />}
                  <span className={stats.lowStockCount > 0 ? "text-rose-700" : "text-emerald-700"}>Low Stock Alerts</span>
                </div>
              </div>
              <div className="bg-card border border-border rounded-xl p-4 text-center">
                <div className="text-3xl font-bold text-foreground">{staffPerf.length}</div>
                <div className="text-sm text-muted-foreground mt-1">Active Waiters</div>
              </div>
            </div>
          </>
        )}

        <div className="bg-card border border-border rounded-xl p-5">
          <h3 className="font-semibold mb-4">Monthly Revenue — {now.toLocaleString("default", { month: "long", year: "numeric" })}</h3>
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(346 10% 90%)" />
              <XAxis dataKey="date" tickFormatter={(d) => new Date(d).getDate().toString()} tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} tickFormatter={(v) => `₹${v}`} />
              <Tooltip formatter={(v: number) => [`₹${v.toFixed(2)}`, "Revenue"]} labelFormatter={(d) => new Date(d).toLocaleDateString()} />
              <Line type="monotone" dataKey="revenue" stroke="hsl(346 41% 32%)" strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-card border border-border rounded-xl p-5">
            <h3 className="font-semibold mb-4">Top Selling Items</h3>
            {topItems.length === 0 ? (
              <p className="text-muted-foreground text-sm">No sales data yet</p>
            ) : (
              <div className="space-y-3">
                {topItems.slice(0, 8).map((item, i) => (
                  <div key={item.menuItemId} data-testid={`row-item-${item.menuItemId}`} className="flex items-center gap-3">
                    <div className="w-7 h-7 rounded-full bg-primary/10 text-primary text-xs font-bold flex items-center justify-center shrink-0">{i + 1}</div>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium truncate">{item.name}</div>
                      <div className="text-xs text-muted-foreground">{item.category}</div>
                    </div>
                    <div className="text-right shrink-0">
                      <div className="text-sm font-semibold">{item.totalQuantity} sold</div>
                      <div className="text-xs text-muted-foreground">₹{item.totalRevenue.toFixed(0)}</div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="bg-card border border-border rounded-xl p-5">
            <h3 className="font-semibold mb-4">Staff Performance</h3>
            {staffPerf.length === 0 ? (
              <p className="text-muted-foreground text-sm">No performance data yet</p>
            ) : (
              <div className="space-y-3">
                {staffPerf.map((s) => (
                  <div key={s.userId} data-testid={`row-staff-${s.userId}`} className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center text-sm font-bold text-primary shrink-0">{s.name.charAt(0)}</div>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium truncate">{s.name}</div>
                      <div className="text-xs text-muted-foreground capitalize">{s.role}</div>
                    </div>
                    <div className="text-right shrink-0">
                      <div className="text-sm font-semibold">{s.totalOrders} orders</div>
                      <div className="text-xs text-muted-foreground">₹{s.totalRevenue.toFixed(0)}</div>
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
