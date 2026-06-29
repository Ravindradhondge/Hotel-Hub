import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Receipt, Printer, CheckCircle2, Percent, IndianRupee } from "lucide-react";
import {
  collection, onSnapshot, addDoc, updateDoc, doc, query, where, serverTimestamp,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

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
  const qty = item.qty ?? item.quantity ?? 1;
  const price = item.price ?? item.menuItemPrice ?? 0;
  return {
    name: item.name || item.menuItemName || "Unknown",
    qty,
    price,
    lineTotal: item.subtotal ?? qty * price,
  };
}

interface Order {
  id: string;
  tableNumber: number;
  customerName: string;
  status: string;
  items: OrderItem[];
  total: number;
}

interface Bill {
  subtotal: number;
  cgst: number;
  sgst: number;
  serviceCharge: number;
  discount: number;
  grandTotal: number;
  paymentMethod: "cash" | "card" | "upi";
}

const GST_RATE = 0.09;
const SERVICE_CHARGE_RATE = 0.05;

function computeBill(order: Order, discount: number, includeService: boolean): Bill {
  const subtotal = order.total || 0;
  const cgst = subtotal * GST_RATE;
  const sgst = subtotal * GST_RATE;
  const serviceCharge = includeService ? subtotal * SERVICE_CHARGE_RATE : 0;
  const discountAmt = subtotal * (discount / 100);
  const grandTotal = subtotal + cgst + sgst + serviceCharge - discountAmt;
  return { subtotal, cgst, sgst, serviceCharge, discount: discountAmt, grandTotal };
}

export default function BillingPage() {
  const { userProfile } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<Order | null>(null);
  const [discount, setDiscount] = useState(0);
  const [includeService, setIncludeService] = useState(true);
  const [paymentMethod, setPaymentMethod] = useState<"cash" | "card" | "upi">("cash");
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    const unsub = onSnapshot(
      query(collection(db, "orders"), where("status", "in", ["ready", "completed"])),
      (snap) => {
        const data = snap.docs
          .map(d => ({ id: d.id, ...d.data() } as Order))
          .filter(o => o.status === "ready");
        // Sort client-side to avoid composite index requirement
        data.sort((a, b) => {
          const getTime = (ts: unknown) => {
            if (ts && typeof ts === "object" && "toDate" in (ts as { toDate: () => Date })) return (ts as { toDate: () => Date }).toDate().getTime();
            return new Date(ts as string).getTime();
          };
          return getTime((b as unknown as Record<string, unknown>).createdAt) - getTime((a as unknown as Record<string, unknown>).createdAt);
        });
        setOrders(data);
        setLoading(false);
      }
    );
    return unsub;
  }, []);

  const bill = selected ? computeBill(selected, discount, includeService) : null;

  async function handlePayment() {
    if (!selected || !bill) return;
    setProcessing(true);
    try {
      await addDoc(collection(db, "payments"), {
        orderId: selected.id,
        tableNumber: selected.tableNumber,
        customerName: selected.customerName,
        subtotal: bill.subtotal,
        cgst: bill.cgst,
        sgst: bill.sgst,
        serviceCharge: bill.serviceCharge,
        discount: bill.discount,
        grandTotal: bill.grandTotal,
        paymentMethod,
        processedBy: userProfile?.uid,
        createdAt: serverTimestamp(),
      });
      await updateDoc(doc(db, "orders", selected.id), { status: "completed" });
      toast.success(`Payment collected — ₹${bill.grandTotal.toFixed(2)}`);
      setSelected(null);
    } catch {
      toast.error("Payment failed. Try again.");
    } finally {
      setProcessing(false);
    }
  }

  return (
    <div className="page-container">
      <div>
        <h1 className="text-xl font-bold text-slate-100">Billing</h1>
        <p className="text-sm text-slate-500 mt-0.5">{orders.length} order{orders.length !== 1 ? "s" : ""} ready for billing</p>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Order List */}
        <div className="xl:col-span-1 space-y-3">
          <h2 className="text-sm font-semibold text-slate-400 uppercase tracking-wide">Ready Orders</h2>
          {loading ? (
            [...Array(4)].map((_, i) => <div key={i} className="h-20 bg-slate-800 rounded-xl animate-pulse" />)
          ) : orders.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-slate-500 card-dark rounded-xl">
              <Receipt size={32} className="mb-3 opacity-40" />
              <p className="text-sm">No orders to bill</p>
            </div>
          ) : (
            orders.map(order => (
              <motion.button key={order.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                onClick={() => setSelected(order)}
                className={`w-full text-left card-dark p-4 rounded-xl transition-all ${selected?.id === order.id ? "border-emerald-500 ring-1 ring-emerald-500/30" : "hover:border-slate-600"}`}>
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-100">Table {order.tableNumber}</span>
                  <span className="text-emerald-400 font-bold">₹{(order.total || 0).toLocaleString("en-IN")}</span>
                </div>
                <div className="text-xs text-slate-500 mt-1">{order.customerName} · {Array.isArray(order.items) ? order.items.length : 0} items</div>
              </motion.button>
            ))
          )}
        </div>

        {/* Bill Panel */}
        <div className="xl:col-span-2">
          {!selected ? (
            <div className="flex flex-col items-center justify-center h-64 card-dark rounded-xl text-slate-500">
              <IndianRupee size={40} className="mb-3 opacity-30" />
              <p className="text-sm">Select an order to generate bill</p>
            </div>
          ) : (
            <motion.div initial={{ opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }} className="card-dark rounded-xl overflow-hidden">
              <div className="px-5 py-4 border-b border-slate-700/50 flex items-center justify-between">
                <div>
                  <h2 className="font-bold text-slate-100">Table {selected.tableNumber} — {selected.customerName}</h2>
                  <p className="text-xs text-slate-500 mt-0.5">Tax Invoice</p>
                </div>
                <div className="w-8 h-8 bg-emerald-500/10 rounded-lg flex items-center justify-center">
                  <Receipt size={16} className="text-emerald-400" />
                </div>
              </div>

              <div className="p-5 space-y-5">
                {/* Items */}
                <div>
                  <div className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-2">Items</div>
                  <div className="space-y-1.5">
                    {Array.isArray(selected.items) && selected.items.map((raw, i) => {
                      const item = normItem(raw);
                      return (
                        <div key={i} className="flex justify-between text-sm">
                          <span className="text-slate-300">{item.qty}× {item.name}</span>
                          <span className="text-slate-200">₹{item.lineTotal.toLocaleString("en-IN")}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Adjustments */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs text-slate-400 mb-1.5">Discount (%)</label>
                    <div className="relative">
                      <Percent size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                      <input type="number" min={0} max={100} value={discount}
                        onChange={e => setDiscount(Math.min(100, Math.max(0, Number(e.target.value))))}
                        className="input-dark pl-9" />
                    </div>
                  </div>
                  <div className="flex items-end pb-1.5">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input type="checkbox" checked={includeService} onChange={e => setIncludeService(e.target.checked)}
                        className="w-4 h-4 accent-emerald-500" />
                      <span className="text-sm text-slate-300">Service charge (5%)</span>
                    </label>
                  </div>
                </div>

                {/* Bill Summary */}
                {bill && (
                  <div className="bg-slate-700/30 rounded-lg p-4 space-y-2">
                    <div className="flex justify-between text-sm text-slate-400"><span>Subtotal</span><span>₹{bill.subtotal.toFixed(2)}</span></div>
                    <div className="flex justify-between text-sm text-slate-400"><span>CGST (9%)</span><span>₹{bill.cgst.toFixed(2)}</span></div>
                    <div className="flex justify-between text-sm text-slate-400"><span>SGST (9%)</span><span>₹{bill.sgst.toFixed(2)}</span></div>
                    {bill.serviceCharge > 0 && <div className="flex justify-between text-sm text-slate-400"><span>Service Charge</span><span>₹{bill.serviceCharge.toFixed(2)}</span></div>}
                    {bill.discount > 0 && <div className="flex justify-between text-sm text-emerald-400"><span>Discount</span><span>-₹{bill.discount.toFixed(2)}</span></div>}
                    <div className="border-t border-slate-600 pt-2 flex justify-between font-bold text-base">
                      <span className="text-slate-100">Grand Total</span>
                      <span className="text-emerald-400">₹{bill.grandTotal.toFixed(2)}</span>
                    </div>
                  </div>
                )}

                {/* Payment Method */}
                <div>
                  <label className="block text-xs text-slate-400 mb-2 uppercase tracking-wide font-semibold">Payment Method</label>
                  <div className="grid grid-cols-3 gap-2">
                    {(["cash", "card", "upi"] as const).map(m => (
                      <button key={m} onClick={() => setPaymentMethod(m)}
                        className={`py-2.5 rounded-lg text-sm font-semibold capitalize transition-colors border ${paymentMethod === m ? "bg-emerald-500 text-slate-900 border-emerald-500" : "bg-slate-700/50 text-slate-400 border-slate-600 hover:border-slate-500"}`}>
                        {m === "upi" ? "UPI" : m.charAt(0).toUpperCase() + m.slice(1)}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="flex gap-3">
                  <button className="btn-secondary flex-1 justify-center">
                    <Printer size={16} /> Print Invoice
                  </button>
                  <button onClick={handlePayment} disabled={processing}
                    className="btn-primary flex-1 justify-center disabled:opacity-60">
                    <CheckCircle2 size={16} />
                    {processing ? "Processing..." : "Collect Payment"}
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
}
