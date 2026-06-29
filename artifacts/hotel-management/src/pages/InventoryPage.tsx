import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Plus, Edit2, AlertTriangle, Package } from "lucide-react";
import { collection, onSnapshot, addDoc, updateDoc, doc, serverTimestamp } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { toast } from "sonner";

interface InventoryItem {
  id: string;
  name: string;
  category: string;
  quantity: number;
  unit: string;
  minStock: number;
  costPerUnit: number;
  supplier?: string;
  lastUpdated?: string;
}

const CATEGORIES = ["Vegetables","Spices","Dairy","Grains","Meat","Beverages","Cleaning","Packaging","Other"];
const UNITS = ["kg","g","L","mL","pcs","dozen","bag","box"];

export default function InventoryPage() {
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<InventoryItem | null>(null);
  const [form, setForm] = useState({ name: "", category: CATEGORIES[0], quantity: "", unit: UNITS[0], minStock: "5", costPerUnit: "", supplier: "" });
  const [showLowOnly, setShowLowOnly] = useState(false);

  useEffect(() => {
    const unsub = onSnapshot(collection(db, "inventory"), (snap) => {
      setItems(snap.docs.map(d => ({ id: d.id, ...d.data() } as InventoryItem)));
      setLoading(false);
    });
    return unsub;
  }, []);

  const lowStockItems = items.filter(i => i.quantity <= i.minStock);
  const displayed = showLowOnly ? lowStockItems : items;

  function openAdd() {
    setEditing(null);
    setForm({ name: "", category: CATEGORIES[0], quantity: "", unit: UNITS[0], minStock: "5", costPerUnit: "", supplier: "" });
    setShowModal(true);
  }

  function openEdit(item: InventoryItem) {
    setEditing(item);
    setForm({ name: item.name, category: item.category, quantity: String(item.quantity), unit: item.unit, minStock: String(item.minStock), costPerUnit: String(item.costPerUnit), supplier: item.supplier || "" });
    setShowModal(true);
  }

  async function handleSave() {
    if (!form.name || !form.quantity) { toast.error("Name and quantity are required"); return; }
    try {
      const data = { name: form.name, category: form.category, quantity: Number(form.quantity), unit: form.unit, minStock: Number(form.minStock), costPerUnit: Number(form.costPerUnit), supplier: form.supplier, lastUpdated: new Date().toISOString() };
      if (editing) {
        await updateDoc(doc(db, "inventory", editing.id), data);
        toast.success("Stock updated");
      } else {
        await addDoc(collection(db, "inventory"), { ...data, createdAt: serverTimestamp() });
        toast.success("Item added to inventory");
      }
      setShowModal(false);
    } catch {
      toast.error("Failed to save");
    }
  }

  return (
    <div className="page-container">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-xl font-bold text-slate-100">Inventory</h1>
          <p className="text-sm text-slate-500 mt-0.5">{items.length} items · <span className="text-amber-400">{lowStockItems.length} low stock</span></p>
        </div>
        <div className="flex gap-2">
          <button onClick={() => setShowLowOnly(!showLowOnly)}
            className={`btn-secondary ${showLowOnly ? "!bg-amber-500/10 !text-amber-400 !border !border-amber-500/30" : ""}`}>
            <AlertTriangle size={16} /> Low Stock {showLowOnly ? "(on)" : ""}
          </button>
          <button onClick={openAdd} className="btn-primary"><Plus size={16} /> Add Item</button>
        </div>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-3 gap-4">
        <div className="stat-card">
          <div className="text-2xl font-bold text-slate-100">{items.length}</div>
          <div className="text-xs text-slate-500 mt-1">Total Items</div>
        </div>
        <div className="stat-card">
          <div className="text-2xl font-bold text-amber-400">{lowStockItems.length}</div>
          <div className="text-xs text-slate-500 mt-1">Low Stock Alerts</div>
        </div>
        <div className="stat-card">
          <div className="text-2xl font-bold text-emerald-400">
            ₹{items.reduce((s, i) => s + (i.quantity * i.costPerUnit), 0).toLocaleString("en-IN")}
          </div>
          <div className="text-xs text-slate-500 mt-1">Stock Value</div>
        </div>
      </div>

      {loading ? (
        <div className="space-y-2">{[...Array(6)].map((_, i) => <div key={i} className="h-16 bg-slate-800 rounded-xl animate-pulse" />)}</div>
      ) : displayed.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-slate-500">
          <Package size={40} className="mb-3 opacity-40" />
          <p className="text-sm">No items found</p>
        </div>
      ) : (
        <div className="card-dark rounded-xl overflow-hidden">
          <table className="w-full data-table">
            <thead>
              <tr>
                <th className="text-left">Item</th>
                <th className="text-left">Category</th>
                <th className="text-center">Quantity</th>
                <th className="text-center">Min Stock</th>
                <th className="text-right">Cost/Unit</th>
                <th className="text-center">Status</th>
                <th className="text-center">Action</th>
              </tr>
            </thead>
            <tbody>
              {displayed.map((item, i) => {
                const isLow = item.quantity <= item.minStock;
                return (
                  <motion.tr key={item.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.02 }}
                    className="hover:bg-slate-800/30 transition-colors">
                    <td>
                      <div className="font-medium text-slate-200">{item.name}</div>
                      {item.supplier && <div className="text-xs text-slate-500">{item.supplier}</div>}
                    </td>
                    <td className="text-slate-400">{item.category}</td>
                    <td className="text-center font-semibold text-slate-200">{item.quantity} {item.unit}</td>
                    <td className="text-center text-slate-500">{item.minStock} {item.unit}</td>
                    <td className="text-right text-slate-300">₹{item.costPerUnit}</td>
                    <td className="text-center">
                      <span className={`badge ${isLow ? "badge-red" : "badge-green"}`}>
                        {isLow ? "Low" : "OK"}
                      </span>
                    </td>
                    <td className="text-center">
                      <button onClick={() => openEdit(item)} className="text-slate-500 hover:text-slate-200 p-1.5 rounded-lg hover:bg-slate-700/50">
                        <Edit2 size={14} />
                      </button>
                    </td>
                  </motion.tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {showModal && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
            className="card-dark w-full max-w-md p-6 rounded-xl">
            <h3 className="font-bold text-slate-100 mb-5">{editing ? "Update Stock" : "Add Inventory Item"}</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-xs text-slate-400 mb-1.5">Item Name *</label>
                <input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} className="input-dark" placeholder="e.g. Tomatoes" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs text-slate-400 mb-1.5">Category</label>
                  <select value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))} className="input-dark">
                    {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs text-slate-400 mb-1.5">Unit</label>
                  <select value={form.unit} onChange={e => setForm(f => ({ ...f, unit: e.target.value }))} className="input-dark">
                    {UNITS.map(u => <option key={u} value={u}>{u}</option>)}
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs text-slate-400 mb-1.5">Quantity *</label>
                  <input type="number" value={form.quantity} onChange={e => setForm(f => ({ ...f, quantity: e.target.value }))} className="input-dark" />
                </div>
                <div>
                  <label className="block text-xs text-slate-400 mb-1.5">Min Stock Alert</label>
                  <input type="number" value={form.minStock} onChange={e => setForm(f => ({ ...f, minStock: e.target.value }))} className="input-dark" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs text-slate-400 mb-1.5">Cost per Unit (₹)</label>
                  <input type="number" value={form.costPerUnit} onChange={e => setForm(f => ({ ...f, costPerUnit: e.target.value }))} className="input-dark" />
                </div>
                <div>
                  <label className="block text-xs text-slate-400 mb-1.5">Supplier</label>
                  <input value={form.supplier} onChange={e => setForm(f => ({ ...f, supplier: e.target.value }))} className="input-dark" placeholder="Optional" />
                </div>
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button onClick={() => setShowModal(false)} className="btn-secondary flex-1 justify-center">Cancel</button>
              <button onClick={handleSave} className="btn-primary flex-1 justify-center">Save</button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
