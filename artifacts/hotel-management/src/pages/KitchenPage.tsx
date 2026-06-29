import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { ChefHat, Clock, Flame, CheckCircle2 } from "lucide-react";
import { collection, onSnapshot, updateDoc, doc, query, where } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { toast } from "sonner";

interface OrderItem {
  name?: string;
  menuItemName?: string;
  qty?: number;
  quantity?: number;
}

function normItem(item: OrderItem) {
  return {
    name: item.name || item.menuItemName || "Unknown",
    qty: item.qty ?? item.quantity ?? 1,
  };
}

interface Order {
  id: string;
  tableNumber: number;
  customerName: string;
  status: "pending" | "preparing" | "ready" | "completed";
  items: OrderItem[];
  notes?: string;
  createdAt: { toDate: () => Date } | string;
}

const COLUMNS = [
  { key: "pending", label: "Incoming", icon: Clock, color: "text-amber-400", border: "border-amber-500/30", bg: "bg-amber-500/5" },
  { key: "preparing", label: "Preparing", icon: Flame, color: "text-blue-400", border: "border-blue-500/30", bg: "bg-blue-500/5" },
  { key: "ready", label: "Ready", icon: CheckCircle2, color: "text-emerald-400", border: "border-emerald-500/30", bg: "bg-emerald-500/5" },
];

const NEXT: Record<string, string> = {
  pending: "preparing",
  preparing: "ready",
  ready: "completed",
};

const NEXT_LABEL: Record<string, string> = {
  pending: "Start Cooking",
  preparing: "Mark Ready",
  ready: "Complete",
};

function timeAgo(createdAt: Order["createdAt"]) {
  const d = createdAt && typeof createdAt === "object" && "toDate" in createdAt
    ? createdAt.toDate() : new Date(createdAt as string);
  const mins = Math.floor((Date.now() - d.getTime()) / 60000);
  if (mins < 1) return "Just now";
  if (mins === 1) return "1 min ago";
  return `${mins} mins ago`;
}

export default function KitchenPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsub = onSnapshot(
      query(
        collection(db, "orders"),
        where("status", "in", ["pending", "preparing", "ready"])
      ),
      (snap) => {
        const data = snap.docs.map(d => ({ id: d.id, ...d.data() } as Order));
        // Sort client-side to avoid needing a composite index
        data.sort((a, b) => {
          const da = a.createdAt && typeof a.createdAt === "object" && "toDate" in a.createdAt ? a.createdAt.toDate().getTime() : new Date(a.createdAt as string).getTime();
          const db_ = b.createdAt && typeof b.createdAt === "object" && "toDate" in b.createdAt ? b.createdAt.toDate().getTime() : new Date(b.createdAt as string).getTime();
          return da - db_;
        });
        setOrders(data);
        setLoading(false);
      }
    );
    return unsub;
  }, []);

  async function advance(order: Order) {
    const next = NEXT[order.status];
    if (!next) return;
    try {
      await updateDoc(doc(db, "orders", order.id), { status: next });
      toast.success(`Order T${order.tableNumber} → ${next}`);
    } catch {
      toast.error("Failed to update order");
    }
  }

  return (
    <div className="page-container">
      <div className="flex items-center gap-3 mb-2">
        <div className="w-9 h-9 bg-orange-500/10 rounded-lg flex items-center justify-center">
          <ChefHat size={20} className="text-orange-400" />
        </div>
        <div>
          <h1 className="text-xl font-bold text-slate-100">Kitchen Display</h1>
          <p className="text-sm text-slate-500">{orders.filter(o => o.status !== "ready").length} active orders</p>
        </div>
        <div className="ml-auto flex items-center gap-1.5">
          <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
          <span className="text-xs text-slate-500">Live</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 min-h-[60vh]">
        {COLUMNS.map(col => {
          const colOrders = orders.filter(o => o.status === col.key);
          return (
            <div key={col.key} className={`card-dark border ${col.border} ${col.bg} rounded-xl overflow-hidden flex flex-col`}>
              <div className={`px-4 py-3 border-b border-slate-700/50 flex items-center justify-between`}>
                <div className="flex items-center gap-2">
                  <col.icon size={16} className={col.color} />
                  <span className={`font-bold text-sm ${col.color}`}>{col.label}</span>
                </div>
                <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${col.bg} ${col.color} border ${col.border}`}>
                  {colOrders.length}
                </span>
              </div>

              <div className="flex-1 p-3 space-y-3 overflow-y-auto">
                {loading ? (
                  [...Array(2)].map((_, i) => <div key={i} className="h-28 bg-slate-700/30 rounded-lg animate-pulse" />)
                ) : colOrders.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-32 text-slate-600">
                    <col.icon size={28} className="mb-2 opacity-40" />
                    <p className="text-xs">No orders here</p>
                  </div>
                ) : (
                  colOrders.map(order => (
                    <motion.div key={order.id} layout initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
                      className="bg-slate-800 border border-slate-700/50 rounded-xl p-3">
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-bold text-slate-100">Table {order.tableNumber}</span>
                        <span className="text-xs text-slate-500">{timeAgo(order.createdAt)}</span>
                      </div>
                      <div className="text-xs text-slate-400 mb-3 font-medium">{order.customerName}</div>
                      <div className="space-y-1 mb-3">
                        {Array.isArray(order.items) && order.items.map((raw, i) => {
                          const item = normItem(raw);
                          return (
                            <div key={i} className="flex items-center gap-2 text-sm">
                              <span className="w-5 h-5 bg-slate-700 rounded text-center text-xs font-bold text-slate-300 flex items-center justify-center">
                                {item.qty}
                              </span>
                              <span className="text-slate-200">{item.name}</span>
                            </div>
                          );
                        })}
                      </div>
                      {order.notes && (
                        <div className="text-xs text-amber-400 bg-amber-500/10 rounded px-2 py-1 mb-3">
                          📝 {order.notes}
                        </div>
                      )}
                      {NEXT[order.status] && (
                        <button onClick={() => advance(order)}
                          className={`w-full py-1.5 rounded-lg text-xs font-bold transition-colors ${
                            order.status === "pending" ? "bg-blue-500 hover:bg-blue-400 text-white" :
                            order.status === "preparing" ? "bg-emerald-500 hover:bg-emerald-400 text-slate-900" :
                            "bg-slate-600 hover:bg-slate-500 text-slate-200"
                          }`}>
                          {NEXT_LABEL[order.status]}
                        </button>
                      )}
                    </motion.div>
                  ))
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
