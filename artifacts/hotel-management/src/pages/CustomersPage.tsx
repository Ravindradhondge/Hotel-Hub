import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Plus, Search, Users, Phone, Calendar } from "lucide-react";
import { collection, onSnapshot, addDoc, serverTimestamp, query, orderBy } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { toast } from "sonner";

interface Customer {
  id: string;
  name: string;
  mobile: string;
  email?: string;
  visits: number;
  lastVisit?: string;
  totalSpend?: number;
  createdAt: { toDate: () => Date } | string;
}

export default function CustomersPage() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ name: "", mobile: "", email: "" });

  useEffect(() => {
    const unsub = onSnapshot(
      query(collection(db, "customers"), orderBy("createdAt", "desc")),
      (snap) => { setCustomers(snap.docs.map(d => ({ id: d.id, ...d.data() } as Customer))); setLoading(false); }
    );
    return unsub;
  }, []);

  const filtered = customers.filter(c =>
    !search || c.name.toLowerCase().includes(search.toLowerCase()) || c.mobile.includes(search)
  );

  async function handleSave() {
    if (!form.name || !form.mobile) { toast.error("Name and mobile are required"); return; }
    try {
      await addDoc(collection(db, "customers"), {
        name: form.name,
        mobile: form.mobile,
        email: form.email,
        visits: 0,
        totalSpend: 0,
        createdAt: serverTimestamp(),
      });
      toast.success("Customer added");
      setShowModal(false);
      setForm({ name: "", mobile: "", email: "" });
    } catch {
      toast.error("Failed to add customer");
    }
  }

  return (
    <div className="page-container">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-xl font-bold text-slate-100">Customers</h1>
          <p className="text-sm text-slate-500 mt-0.5">{customers.length} registered customers</p>
        </div>
        <button onClick={() => setShowModal(true)} className="btn-primary">
          <Plus size={16} /> Add Customer
        </button>
      </div>

      <div className="relative max-w-sm">
        <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
        <input value={search} onChange={e => setSearch(e.target.value)}
          placeholder="Search by name or mobile..." className="input-dark pl-9" />
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => <div key={i} className="h-28 bg-slate-800 rounded-xl animate-pulse" />)}
        </div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-slate-500">
          <Users size={40} className="mb-3 opacity-40" />
          <p className="text-sm">{search ? "No customers found" : "No customers yet"}</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {filtered.map((c, i) => (
            <motion.div key={c.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}
              className="card-dark p-4 rounded-xl">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 bg-emerald-500/10 rounded-full flex items-center justify-center shrink-0">
                  <span className="text-emerald-400 font-bold text-sm">{c.name.charAt(0).toUpperCase()}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-semibold text-slate-100 truncate">{c.name}</div>
                  <div className="flex items-center gap-1 text-xs text-slate-500 mt-0.5">
                    <Phone size={11} />
                    <span>{c.mobile}</span>
                  </div>
                  {c.email && <div className="text-xs text-slate-600 mt-0.5 truncate">{c.email}</div>}
                </div>
              </div>
              <div className="mt-3 pt-3 border-t border-slate-700/50 grid grid-cols-2 gap-2">
                <div className="text-center">
                  <div className="text-lg font-bold text-blue-400">{c.visits}</div>
                  <div className="text-xs text-slate-500">Visits</div>
                </div>
                <div className="text-center">
                  <div className="text-lg font-bold text-emerald-400">₹{(c.totalSpend || 0).toLocaleString("en-IN")}</div>
                  <div className="text-xs text-slate-500">Total Spent</div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {showModal && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
            className="card-dark w-full max-w-sm p-6 rounded-xl">
            <h3 className="font-bold text-slate-100 mb-5">Add Customer</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-xs text-slate-400 mb-1.5">Full Name *</label>
                <input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} className="input-dark" placeholder="Customer name" />
              </div>
              <div>
                <label className="block text-xs text-slate-400 mb-1.5">Mobile Number *</label>
                <input value={form.mobile} onChange={e => setForm(f => ({ ...f, mobile: e.target.value }))} className="input-dark" placeholder="+91 00000 00000" />
              </div>
              <div>
                <label className="block text-xs text-slate-400 mb-1.5">Email (optional)</label>
                <input type="email" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} className="input-dark" placeholder="email@example.com" />
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button onClick={() => setShowModal(false)} className="btn-secondary flex-1 justify-center">Cancel</button>
              <button onClick={handleSave} className="btn-primary flex-1 justify-center">Add Customer</button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
