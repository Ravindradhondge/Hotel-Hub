import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  IndianRupee, Table2, ShoppingBag, CheckCircle2,
  TrendingUp, Clock, Users, AlertCircle,
} from "lucide-react";
import {
  collection, query, where, onSnapshot, orderBy, limit,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "@/contexts/AuthContext";

interface Order {
  id: string;
  tableNumber: number;
  customerName?: string;
  status: "pending" | "preparing" | "ready" | "completed" | "cancelled";
  total: number;
  items: number;
  createdAt: { toDate: () => Date } | string;
}

interface TableDoc {
  id: string;
  number: number;
  status: "available" | "occupied" | "reserved";
  capacity: number;
}

const statusBadge: Record<string, string> = {
  pending: "badge badge-yellow",
  preparing: "badge badge-blue",
  ready: "badge badge-green",
  completed: "badge badge-gray",
  cancelled: "badge badge-red",
};

const fadeUp = {
  hidden: { opacity: 0, y: 16 },
  show: (i: number) => ({ opacity: 1, y: 0, transition: { delay: i * 0.07, duration: 0.35 } }),
};

export default function DashboardPage() {
  const { userProfile } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [tables, setTables] = useState<TableDoc[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubOrders = onSnapshot(
      query(collection(db, "orders"), orderBy("createdAt", "desc"), limit(20)),
      (snap) => {
        setOrders(snap.docs.map((d) => ({ id: d.id, ...d.data() } as Order)));
        setLoading(false);
      }
    );
    const unsubTables = onSnapshot(collection(db, "tables"), (snap) => {
      setTables(snap.docs.map((d) => ({ id: d.id, ...d.data() } as TableDoc)));
    });
    return () => { unsubOrders(); unsubTables(); };
  }, []);

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const todayOrders = orders.filter((o) => {
    const d = o.createdAt && typeof o.createdAt === "object" && "toDate" in o.createdAt
      ? o.createdAt.toDate()
      : new Date(o.createdAt as string);
    return d >= today;
  });

  const todaySales = todayOrders
    .filter((o) => o.status === "completed")
    .reduce((sum, o) => sum + (o.total || 0), 0);

  const activeTables = tables.filter((t) => t.status === "occupied").length;
  const pendingOrders = orders.filter((o) => o.status === "pending" || o.status === "preparing").length;
  const completedToday = todayOrders.filter((o) => o.status === "completed").length;

  const stats = [
    { label: "Today's Sales", value: `₹${todaySales.toLocaleString("en-IN")}`, icon: IndianRupee, color: "text-emerald-400", bg: "bg-emerald-400/10" },
    { label: "Active Tables", value: `${activeTables}/${tables.length}`, icon: Table2, color: "text-blue-400", bg: "bg-blue-400/10" },
    { label: "Pending Orders", value: pendingOrders, icon: Clock, color: "text-amber-400", bg: "bg-amber-400/10" },
    { label: "Completed Today", value: completedToday, icon: CheckCircle2, color: "text-purple-400", bg: "bg-purple-400/10" },
  ];

  const recentOrders = orders.slice(0, 8);

  return (
    <div className="page-container">
      {/* Welcome */}
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-xl font-bold text-slate-100">
          Good {new Date().getHours() < 12 ? "morning" : new Date().getHours() < 17 ? "afternoon" : "evening"}, {userProfile?.name?.split(" ")[0]} 👋
        </h1>
        <p className="text-slate-500 text-sm mt-0.5">
          {new Date().toLocaleDateString("en-IN", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}
        </p>
      </motion.div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((s, i) => (
          <motion.div key={s.label} custom={i} variants={fadeUp} initial="hidden" animate="show" className="stat-card">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide">{s.label}</span>
              <div className={`w-8 h-8 rounded-lg ${s.bg} flex items-center justify-center`}>
                <s.icon size={16} className={s.color} />
              </div>
            </div>
            <div className={`text-2xl font-bold ${s.color}`}>
              {loading ? <div className="h-7 w-16 bg-slate-700 rounded animate-pulse" /> : s.value}
            </div>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
        {/* Recent Orders */}
        <motion.div
          initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
          className="xl:col-span-2 card-dark overflow-hidden"
        >
          <div className="px-5 py-4 border-b border-slate-700/50 flex items-center justify-between">
            <h2 className="section-title">Recent Orders</h2>
            <TrendingUp size={16} className="text-slate-500" />
          </div>
          {loading ? (
            <div className="p-5 space-y-3">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="h-10 bg-slate-700/50 rounded animate-pulse" />
              ))}
            </div>
          ) : recentOrders.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-slate-500">
              <ShoppingBag size={32} className="mb-3 opacity-50" />
              <p className="text-sm">No orders yet today</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full data-table">
                <thead>
                  <tr>
                    <th className="text-left">Table</th>
                    <th className="text-left">Customer</th>
                    <th className="text-left">Items</th>
                    <th className="text-left">Amount</th>
                    <th className="text-left">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {recentOrders.map((order) => (
                    <tr key={order.id} className="hover:bg-slate-800/30 transition-colors">
                      <td className="font-medium text-slate-200">T{order.tableNumber}</td>
                      <td>{order.customerName || "Guest"}</td>
                      <td>{order.items} items</td>
                      <td className="text-emerald-400 font-semibold">₹{(order.total || 0).toLocaleString("en-IN")}</td>
                      <td>
                        <span className={statusBadge[order.status] || "badge badge-gray"}>
                          {order.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </motion.div>

        {/* Table Status */}
        <motion.div
          initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }}
          className="card-dark overflow-hidden"
        >
          <div className="px-5 py-4 border-b border-slate-700/50 flex items-center justify-between">
            <h2 className="section-title">Table Status</h2>
            <Users size={16} className="text-slate-500" />
          </div>
          {loading ? (
            <div className="p-4 grid grid-cols-4 gap-2">
              {[...Array(12)].map((_, i) => (
                <div key={i} className="h-12 bg-slate-700/50 rounded-lg animate-pulse" />
              ))}
            </div>
          ) : tables.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-slate-500">
              <AlertCircle size={28} className="mb-3 opacity-50" />
              <p className="text-sm">No tables configured</p>
            </div>
          ) : (
            <div className="p-4 grid grid-cols-4 gap-2">
              {tables.slice(0, 20).map((t) => (
                <div
                  key={t.id}
                  className={`flex flex-col items-center justify-center rounded-lg p-2 h-12 text-xs font-bold transition-colors ${
                    t.status === "occupied"
                      ? "bg-red-500/20 text-red-400 border border-red-500/30"
                      : t.status === "reserved"
                      ? "bg-amber-500/20 text-amber-400 border border-amber-500/30"
                      : "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                  }`}
                >
                  T{t.number}
                </div>
              ))}
            </div>
          )}
          {/* Legend */}
          <div className="px-4 pb-4 flex gap-3 flex-wrap">
            {[
              { label: "Available", color: "bg-emerald-400" },
              { label: "Occupied", color: "bg-red-400" },
              { label: "Reserved", color: "bg-amber-400" },
            ].map((l) => (
              <div key={l.label} className="flex items-center gap-1.5">
                <div className={`w-2 h-2 rounded-full ${l.color}`} />
                <span className="text-xs text-slate-500">{l.label}</span>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
