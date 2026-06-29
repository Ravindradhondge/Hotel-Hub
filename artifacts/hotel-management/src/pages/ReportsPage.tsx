import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { BarChart3, TrendingUp, IndianRupee, ShoppingBag } from "lucide-react";
import { collection, onSnapshot, query, orderBy } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from "recharts";

interface Payment {
  id: string;
  grandTotal: number;
  tableNumber: number;
  paymentMethod: string;
  createdAt: { toDate: () => Date } | string;
}

interface Order {
  id: string;
  items: { name: string; qty: number; price: number }[];
  status: string;
  total: number;
  createdAt: { toDate: () => Date } | string;
}

const COLORS = ["#10b981","#3b82f6","#f59e0b","#8b5cf6","#ec4899","#14b8a6"];

const MONTHS = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];

export default function ReportsPage() {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const u1 = onSnapshot(query(collection(db, "payments"), orderBy("createdAt", "desc")), snap => {
      setPayments(snap.docs.map(d => ({ id: d.id, ...d.data() } as Payment)));
    });
    const u2 = onSnapshot(query(collection(db, "orders"), orderBy("createdAt", "desc")), snap => {
      setOrders(snap.docs.map(d => ({ id: d.id, ...d.data() } as Order)));
      setLoading(false);
    });
    return () => { u1(); u2(); };
  }, []);

  function getDate(ts: Payment["createdAt"]) {
    return ts && typeof ts === "object" && "toDate" in ts ? ts.toDate() : new Date(ts as string);
  }

  const today = new Date();
  today.setHours(0,0,0,0);
  const todayPayments = payments.filter(p => getDate(p.createdAt) >= today);
  const todaySales = todayPayments.reduce((s, p) => s + p.grandTotal, 0);

  const thisMonth = new Date(); thisMonth.setDate(1); thisMonth.setHours(0,0,0,0);
  const monthPayments = payments.filter(p => getDate(p.createdAt) >= thisMonth);
  const monthSales = monthPayments.reduce((s, p) => s + p.grandTotal, 0);

  const last7 = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(); d.setDate(d.getDate() - (6 - i)); d.setHours(0,0,0,0);
    const end = new Date(d); end.setDate(end.getDate() + 1);
    const total = payments.filter(p => { const dt = getDate(p.createdAt); return dt >= d && dt < end; }).reduce((s, p) => s + p.grandTotal, 0);
    return { day: d.toLocaleDateString("en-IN", { weekday: "short" }), sales: Math.round(total) };
  });

  const last12 = Array.from({ length: 12 }, (_, i) => {
    const m = (today.getMonth() - (11 - i) + 12) % 12;
    const y = today.getFullYear() + Math.floor((today.getMonth() - (11 - i)) / 12);
    const total = payments.filter(p => {
      const dt = getDate(p.createdAt);
      return dt.getMonth() === m && dt.getFullYear() === y;
    }).reduce((s, p) => s + p.grandTotal, 0);
    return { month: MONTHS[m], sales: Math.round(total) };
  });

  const itemCounts: Record<string, number> = {};
  orders.filter(o => o.status === "completed").forEach(o => {
    if (Array.isArray(o.items)) {
      o.items.forEach(item => {
        itemCounts[item.name] = (itemCounts[item.name] || 0) + item.qty;
      });
    }
  });
  const topItems = Object.entries(itemCounts).sort((a, b) => b[1] - a[1]).slice(0, 6).map(([name, count]) => ({ name, count }));

  const methodData = ["cash","card","upi"].map(m => ({
    name: m.toUpperCase(),
    value: payments.filter(p => p.paymentMethod === m).length,
  })).filter(d => d.value > 0);

  const stats = [
    { label: "Today's Revenue", value: `₹${todaySales.toLocaleString("en-IN")}`, icon: IndianRupee, color: "text-emerald-400" },
    { label: "This Month", value: `₹${monthSales.toLocaleString("en-IN")}`, icon: TrendingUp, color: "text-blue-400" },
    { label: "Total Transactions", value: payments.length, icon: ShoppingBag, color: "text-amber-400" },
    { label: "Total Orders", value: orders.length, icon: BarChart3, color: "text-purple-400" },
  ];

  const CustomTooltip = ({ active, payload, label }: { active?: boolean; payload?: { value: number }[]; label?: string }) => {
    if (active && payload?.length) return (
      <div className="bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-xs">
        <div className="text-slate-400">{label}</div>
        <div className="text-emerald-400 font-bold">₹{payload[0].value.toLocaleString("en-IN")}</div>
      </div>
    );
    return null;
  };

  return (
    <div className="page-container">
      <div>
        <h1 className="text-xl font-bold text-slate-100">Reports & Analytics</h1>
        <p className="text-sm text-slate-500 mt-0.5">Real-time business insights</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((s, i) => (
          <motion.div key={s.label} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.07 }} className="stat-card">
            <div className="flex items-center gap-2 mb-2">
              <s.icon size={14} className={s.color} />
              <span className="text-xs text-slate-500">{s.label}</span>
            </div>
            <div className={`text-2xl font-bold ${s.color}`}>
              {loading ? <div className="h-7 w-20 bg-slate-700 animate-pulse rounded" /> : s.value}
            </div>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
        {/* Daily Sales */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="card-dark p-5 rounded-xl">
          <h2 className="section-title mb-4">Last 7 Days Sales</h2>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={last7}>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
              <XAxis dataKey="day" tick={{ fill: "#64748b", fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: "#64748b", fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={v => v === 0 ? "0" : `₹${(v/1000).toFixed(0)}k`} />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="sales" fill="#10b981" radius={[4,4,0,0]} />
            </BarChart>
          </ResponsiveContainer>
        </motion.div>

        {/* Monthly Trend */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }} className="card-dark p-5 rounded-xl">
          <h2 className="section-title mb-4">Monthly Revenue Trend</h2>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={last12}>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
              <XAxis dataKey="month" tick={{ fill: "#64748b", fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: "#64748b", fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={v => v === 0 ? "0" : `₹${(v/1000).toFixed(0)}k`} />
              <Tooltip content={<CustomTooltip />} />
              <Line type="monotone" dataKey="sales" stroke="#10b981" strokeWidth={2} dot={{ fill: "#10b981", r: 3 }} />
            </LineChart>
          </ResponsiveContainer>
        </motion.div>

        {/* Top Items */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="card-dark p-5 rounded-xl">
          <h2 className="section-title mb-4">Top Selling Items</h2>
          {topItems.length === 0 ? (
            <div className="flex items-center justify-center h-40 text-slate-600 text-sm">No completed orders yet</div>
          ) : (
            <div className="space-y-3">
              {topItems.map((item, i) => (
                <div key={item.name}>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-slate-300">{item.name}</span>
                    <span className="text-slate-500 font-medium">{item.count} sold</span>
                  </div>
                  <div className="h-1.5 bg-slate-700 rounded-full overflow-hidden">
                    <motion.div initial={{ width: 0 }} animate={{ width: `${(item.count / topItems[0].count) * 100}%` }}
                      transition={{ delay: 0.5 + i * 0.05, duration: 0.5 }}
                      className="h-full rounded-full" style={{ backgroundColor: COLORS[i % COLORS.length] }} />
                  </div>
                </div>
              ))}
            </div>
          )}
        </motion.div>

        {/* Payment Methods */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.45 }} className="card-dark p-5 rounded-xl">
          <h2 className="section-title mb-4">Payment Methods</h2>
          {methodData.length === 0 ? (
            <div className="flex items-center justify-center h-40 text-slate-600 text-sm">No payments yet</div>
          ) : (
            <div className="flex items-center gap-6">
              <ResponsiveContainer width={160} height={160}>
                <PieChart>
                  <Pie data={methodData} cx="50%" cy="50%" innerRadius={45} outerRadius={70} dataKey="value" paddingAngle={3}>
                    {methodData.map((_, i) => <Cell key={i} fill={COLORS[i]} />)}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
              <div className="space-y-3 flex-1">
                {methodData.map((m, i) => (
                  <div key={m.name} className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[i] }} />
                    <span className="text-sm text-slate-300 flex-1">{m.name}</span>
                    <span className="text-sm font-semibold text-slate-200">{m.value}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
}
