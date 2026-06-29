import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Plus, Search, Filter, ShoppingBag, Clock, CheckCircle2 } from "lucide-react";
import {
  collection, onSnapshot, addDoc, updateDoc, doc,
  serverTimestamp, query, orderBy,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

interface Order {
  id: string;
  tableNumber: number;
  customerName: string;
  status: "pending" | "preparing" | "ready" | "completed" | "cancelled";
  items: OrderItem[];
  total: number;
  notes?: string;
  createdAt: { toDate: () => Date } | string;
}

interface OrderItem {
  name?: string;
  menuItemName?: string;
  qty?: number;
  quantity?: number;
  price?: number;
  menuItemPrice?: number;
  subtotal?: number;
}

function normItem(item: OrderItem) {
  return {
    name: item.name || item.menuItemName || "Unknown",
    qty: item.qty ?? item.quantity ?? 1,
    price: item.price ?? item.menuItemPrice ?? (item.subtotal ?? 0),
  };
}

interface MenuItem {
  id: string;
  name: string;
  price: number;
  category: string;
  available: boolean;
}

interface TableDoc {
  id: string;
  number: number;
  status: string;
}

const statusConfig = {
  pending: { label: "Pending", cls: "badge badge-yellow", icon: Clock },
  preparing: { label: "Preparing", cls: "badge badge-blue", icon: Clock },
  ready: { label: "Ready", cls: "badge badge-green", icon: CheckCircle2 },
  completed: { label: "Completed", cls: "badge badge-gray", icon: CheckCircle2 },
  cancelled: { label: "Cancelled", cls: "badge badge-red", icon: ShoppingBag },
};

const STATUS_FLOW: Record<string, string> = {
  pending: "preparing",
  preparing: "ready",
  ready: "completed",
};

export default function OrdersPage() {
  const { userProfile } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [tables, setTables] = useState<TableDoc[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [newOrder, setNewOrder] = useState({ tableNumber: "", customerName: "", notes: "" });
  const [cart, setCart] = useState<OrderItem[]>([]);

  useEffect(() => {
    const u1 = onSnapshot(query(collection(db, "orders"), orderBy("createdAt", "desc")),
      (snap) => { setOrders(snap.docs.map(d => ({ id: d.id, ...d.data() } as Order))); setLoading(false); });
    const u2 = onSnapshot(collection(db, "menu"), (snap) => {
      setMenuItems(snap.docs.map(d => ({ id: d.id, ...d.data() } as MenuItem)).filter(m => m.available));
    });
    const u3 = onSnapshot(collection(db, "tables"), (snap) => {
      setTables(snap.docs.map(d => ({ id: d.id, ...d.data() } as TableDoc)));
    });
    return () => { u1(); u2(); u3(); };
  }, []);

  const filtered = orders.filter(o => {
    const matchFilter = filter === "all" || o.status === filter;
    const matchSearch = !search || `T${o.tableNumber} ${o.customerName}`.toLowerCase().includes(search.toLowerCase());
    return matchFilter && matchSearch;
  });

  function addToCart(item: MenuItem) {
    setCart(c => {
      const ex = c.find(ci => ci.name === item.name);
      if (ex) return c.map(ci => ci.name === item.name ? { ...ci, qty: ci.qty + 1 } : ci);
      return [...c, { name: item.name, qty: 1, price: item.price }];
    });
  }

  function cartTotal() { return cart.reduce((s, i) => s + i.qty * i.price, 0); }

  async function handleCreateOrder() {
    if (!newOrder.tableNumber || cart.length === 0) {
      toast.error("Select a table and add at least one item");
      return;
    }
    try {
      await addDoc(collection(db, "orders"), {
        tableNumber: Number(newOrder.tableNumber),
        customerName: newOrder.customerName || "Guest",
        status: "pending",
        items: cart,
        total: cartTotal(),
        notes: newOrder.notes,
        createdBy: userProfile?.uid,
        createdAt: serverTimestamp(),
      });
      const tableDoc = tables.find(t => t.number === Number(newOrder.tableNumber));
      if (tableDoc) await updateDoc(doc(db, "tables", tableDoc.id), { status: "occupied" });
      toast.success("Order created successfully");
      setShowModal(false);
      setCart([]);
      setNewOrder({ tableNumber: "", customerName: "", notes: "" });
    } catch {
      toast.error("Failed to create order");
    }
  }

  async function advanceStatus(order: Order) {
    const next = STATUS_FLOW[order.status];
    if (!next) return;
    try {
      await updateDoc(doc(db, "orders", order.id), { status: next });
      toast.success(`Order moved to ${next}`);
    } catch {
      toast.error("Failed to update order");
    }
  }

  return (
    <div className="page-container">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-xl font-bold text-slate-100">Orders</h1>
          <p className="text-sm text-slate-500 mt-0.5">{orders.length} total · {orders.filter(o => o.status === "pending").length} pending</p>
        </div>
        <button onClick={() => setShowModal(true)} className="btn-primary">
          <Plus size={16} /> New Order
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 items-center">
        <div className="relative flex-1 min-w-[180px]">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
          <input value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Search orders..." className="input-dark pl-9 py-2" />
        </div>
        <div className="flex gap-1.5 flex-wrap">
          {["all","pending","preparing","ready","completed"].map(f => (
            <button key={f} onClick={() => setFilter(f)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors capitalize ${filter === f ? "bg-emerald-500 text-slate-900" : "bg-slate-800 text-slate-400 hover:text-slate-200"}`}>
              {f}
            </button>
          ))}
        </div>
      </div>

      {/* Order cards */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => <div key={i} className="h-40 bg-slate-800 rounded-xl animate-pulse" />)}
        </div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-slate-500">
          <ShoppingBag size={40} className="mb-3 opacity-40" />
          <p className="text-sm">No orders found</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {filtered.map((order, i) => {
            const cfg = statusConfig[order.status] ?? statusConfig.pending;
            return (
              <motion.div key={order.id} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}
                className="card-dark p-4 flex flex-col gap-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-lg font-bold text-slate-100">Table {order.tableNumber}</span>
                    <span className={cfg.cls}>{cfg.label}</span>
                  </div>
                  <span className="text-lg font-bold text-emerald-400">₹{(order.total || 0).toLocaleString("en-IN")}</span>
                </div>
                <div className="text-sm text-slate-400">{order.customerName} · {Array.isArray(order.items) ? order.items.length : 0} items</div>
                {Array.isArray(order.items) && (
                  <div className="text-xs text-slate-500 space-y-0.5">
                    {order.items.slice(0, 3).map((raw, idx) => {
                      const item = normItem(raw);
                      return <div key={idx}>{item.qty}× {item.name} — ₹{(item.qty * item.price).toLocaleString("en-IN")}</div>;
                    })}
                    {order.items.length > 3 && <div className="text-slate-600">+{order.items.length - 3} more</div>}
                  </div>
                )}
                {STATUS_FLOW[order.status] && (
                  <button onClick={() => advanceStatus(order)}
                    className="btn-primary text-xs py-1.5 justify-center">
                    Mark as {STATUS_FLOW[order.status]}
                  </button>
                )}
              </motion.div>
            );
          })}
        </div>
      )}

      {/* Create Order Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
            className="card-dark w-full max-w-2xl max-h-[90vh] overflow-y-auto p-6">
            <h3 className="text-base font-bold text-slate-100 mb-5">Create New Order</h3>
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-xs text-slate-400 mb-1.5">Table Number</label>
                <select value={newOrder.tableNumber} onChange={e => setNewOrder(o => ({ ...o, tableNumber: e.target.value }))}
                  className="input-dark">
                  <option value="">Select table</option>
                  {tables.map(t => <option key={t.id} value={t.number}>Table {t.number}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs text-slate-400 mb-1.5">Customer Name</label>
                <input value={newOrder.customerName} onChange={e => setNewOrder(o => ({ ...o, customerName: e.target.value }))}
                  className="input-dark" placeholder="Guest" />
              </div>
            </div>

            <div className="mb-4">
              <label className="block text-xs text-slate-400 mb-2">Menu Items</label>
              <div className="grid grid-cols-2 gap-2 max-h-52 overflow-y-auto pr-1">
                {menuItems.map(item => (
                  <button key={item.id} onClick={() => addToCart(item)}
                    className="flex items-center justify-between bg-slate-700/50 hover:bg-slate-700 rounded-lg p-3 text-left transition-colors">
                    <div>
                      <div className="text-sm font-medium text-slate-200">{item.name}</div>
                      <div className="text-xs text-slate-500">{item.category}</div>
                    </div>
                    <div className="text-sm font-bold text-emerald-400">₹{item.price}</div>
                  </button>
                ))}
              </div>
              {menuItems.length === 0 && <p className="text-xs text-slate-500 text-center py-4">No menu items. Add items in Menu page first.</p>}
            </div>

            {cart.length > 0 && (
              <div className="mb-4 bg-slate-700/30 rounded-lg p-3">
                <div className="text-xs font-semibold text-slate-400 mb-2">Order Summary</div>
                {cart.map((item, idx) => (
                  <div key={idx} className="flex items-center justify-between py-1 text-sm">
                    <span className="text-slate-300">{item.qty}× {item.name}</span>
                    <div className="flex items-center gap-3">
                      <span className="text-emerald-400">₹{(item.qty * item.price).toLocaleString("en-IN")}</span>
                      <button onClick={() => setCart(c => c.filter((_, i) => i !== idx))} className="text-slate-500 hover:text-red-400">×</button>
                    </div>
                  </div>
                ))}
                <div className="border-t border-slate-600 mt-2 pt-2 flex justify-between font-bold">
                  <span className="text-slate-300">Total</span>
                  <span className="text-emerald-400">₹{cartTotal().toLocaleString("en-IN")}</span>
                </div>
              </div>
            )}

            <div className="mb-4">
              <label className="block text-xs text-slate-400 mb-1.5">Notes</label>
              <input value={newOrder.notes} onChange={e => setNewOrder(o => ({ ...o, notes: e.target.value }))}
                className="input-dark" placeholder="Special instructions..." />
            </div>

            <div className="flex gap-3">
              <button onClick={() => { setShowModal(false); setCart([]); }} className="btn-secondary flex-1 justify-center">Cancel</button>
              <button onClick={handleCreateOrder} className="btn-primary flex-1 justify-center">Place Order</button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
