import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Plus, Edit2, Trash2, Table2 } from "lucide-react";
import { collection, onSnapshot, addDoc, updateDoc, deleteDoc, doc, serverTimestamp } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { toast } from "sonner";

interface TableDoc {
  id: string;
  number: number;
  capacity: number;
  status: "available" | "occupied" | "reserved";
  floor?: string;
}

const statusColors = {
  available: "border-emerald-500/40 bg-emerald-500/10 text-emerald-400",
  occupied: "border-red-500/40 bg-red-500/10 text-red-400",
  reserved: "border-amber-500/40 bg-amber-500/10 text-amber-400",
};

export default function TablesPage() {
  const [tables, setTables] = useState<TableDoc[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<TableDoc | null>(null);
  const [form, setForm] = useState({ number: "", capacity: "4", floor: "Ground" });

  useEffect(() => {
    const unsub = onSnapshot(collection(db, "tables"), (snap) => {
      const data = snap.docs.map((d) => ({ id: d.id, ...d.data() } as TableDoc));
      data.sort((a, b) => a.number - b.number);
      setTables(data);
      setLoading(false);
    });
    return unsub;
  }, []);

  function openAdd() {
    setEditing(null);
    setForm({ number: "", capacity: "4", floor: "Ground" });
    setShowModal(true);
  }

  function openEdit(t: TableDoc) {
    setEditing(t);
    setForm({ number: String(t.number), capacity: String(t.capacity), floor: t.floor || "Ground" });
    setShowModal(true);
  }

  async function handleSave() {
    if (!form.number) return toast.error("Table number is required");
    try {
      if (editing) {
        await updateDoc(doc(db, "tables", editing.id), {
          number: Number(form.number),
          capacity: Number(form.capacity),
          floor: form.floor,
        });
        toast.success("Table updated");
      } else {
        await addDoc(collection(db, "tables"), {
          number: Number(form.number),
          capacity: Number(form.capacity),
          floor: form.floor,
          status: "available",
          createdAt: serverTimestamp(),
        });
        toast.success("Table added");
      }
      setShowModal(false);
    } catch {
      toast.error("Failed to save table");
    }
  }

  async function handleDelete(t: TableDoc) {
    if (!confirm(`Delete Table ${t.number}?`)) return;
    try {
      await deleteDoc(doc(db, "tables", t.id));
      toast.success("Table deleted");
    } catch {
      toast.error("Failed to delete table");
    }
  }

  async function changeStatus(t: TableDoc, status: TableDoc["status"]) {
    try {
      await updateDoc(doc(db, "tables", t.id), { status });
      toast.success(`Table ${t.number} → ${status}`);
    } catch {
      toast.error("Failed to update status");
    }
  }

  return (
    <div className="page-container">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-slate-100">Table Management</h1>
          <p className="text-sm text-slate-500 mt-0.5">{tables.length} tables · {tables.filter(t => t.status === "available").length} available</p>
        </div>
        <button onClick={openAdd} className="btn-primary">
          <Plus size={16} /> Add Table
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: "Available", count: tables.filter(t => t.status === "available").length, color: "text-emerald-400" },
          { label: "Occupied", count: tables.filter(t => t.status === "occupied").length, color: "text-red-400" },
          { label: "Reserved", count: tables.filter(t => t.status === "reserved").length, color: "text-amber-400" },
        ].map(s => (
          <div key={s.label} className="stat-card text-center">
            <div className={`text-3xl font-bold ${s.color}`}>{s.count}</div>
            <div className="text-xs text-slate-500 mt-1">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Grid */}
      {loading ? (
        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-3">
          {[...Array(12)].map((_, i) => <div key={i} className="h-32 bg-slate-800 rounded-xl animate-pulse" />)}
        </div>
      ) : tables.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-slate-500">
          <Table2 size={40} className="mb-3 opacity-40" />
          <p className="text-sm">No tables yet. Add your first table.</p>
        </div>
      ) : (
        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-3">
          {tables.map((t, i) => (
            <motion.div
              key={t.id}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.03 }}
              className={`card-dark border-2 ${statusColors[t.status]} rounded-xl p-3 flex flex-col gap-2`}
            >
              <div className="flex items-center justify-between">
                <span className="font-bold text-lg">T{t.number}</span>
                <div className="flex gap-1">
                  <button onClick={() => openEdit(t)} className="text-slate-500 hover:text-slate-200 p-0.5">
                    <Edit2 size={12} />
                  </button>
                  <button onClick={() => handleDelete(t)} className="text-slate-500 hover:text-red-400 p-0.5">
                    <Trash2 size={12} />
                  </button>
                </div>
              </div>
              <div className="text-xs text-slate-500">{t.capacity} seats · {t.floor}</div>
              <select
                value={t.status}
                onChange={(e) => changeStatus(t, e.target.value as TableDoc["status"])}
                className="text-xs bg-slate-900/50 border border-slate-700 rounded px-1 py-0.5 text-slate-300 cursor-pointer"
              >
                <option value="available">Available</option>
                <option value="occupied">Occupied</option>
                <option value="reserved">Reserved</option>
              </select>
            </motion.div>
          ))}
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="card-dark w-full max-w-sm p-6"
          >
            <h3 className="text-base font-bold text-slate-100 mb-5">{editing ? "Edit Table" : "Add Table"}</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-xs text-slate-400 mb-1.5">Table Number</label>
                <input type="number" value={form.number} onChange={e => setForm(f => ({ ...f, number: e.target.value }))}
                  className="input-dark" placeholder="e.g. 1" />
              </div>
              <div>
                <label className="block text-xs text-slate-400 mb-1.5">Capacity (seats)</label>
                <input type="number" value={form.capacity} onChange={e => setForm(f => ({ ...f, capacity: e.target.value }))}
                  className="input-dark" placeholder="e.g. 4" />
              </div>
              <div>
                <label className="block text-xs text-slate-400 mb-1.5">Floor / Section</label>
                <input type="text" value={form.floor} onChange={e => setForm(f => ({ ...f, floor: e.target.value }))}
                  className="input-dark" placeholder="e.g. Ground Floor" />
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
