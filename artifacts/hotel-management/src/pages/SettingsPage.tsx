import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Settings, UserPlus, Shield, Trash2, Users } from "lucide-react";
import {
  collection, onSnapshot, addDoc, updateDoc, deleteDoc, doc, serverTimestamp, query, orderBy,
} from "firebase/firestore";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { auth, db } from "@/lib/firebase";
import { useAuth, UserRole } from "@/contexts/AuthContext";
import { toast } from "sonner";

interface StaffUser {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  createdAt: string;
}

const ROLES: { value: UserRole; label: string; color: string }[] = [
  { value: "owner", label: "Owner", color: "badge-yellow" },
  { value: "manager", label: "Manager", color: "badge-blue" },
  { value: "waiter", label: "Waiter", color: "badge-green" },
  { value: "cashier", label: "Cashier", color: "badge-purple" },
];

export default function SettingsPage() {
  const { userProfile } = useAuth();
  const [staff, setStaff] = useState<StaffUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ name: "", email: "", password: "", role: "waiter" as UserRole });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const unsub = onSnapshot(
      query(collection(db, "users"), orderBy("createdAt", "desc")),
      (snap) => { setStaff(snap.docs.map(d => ({ id: d.id, ...d.data() } as StaffUser))); setLoading(false); }
    );
    return unsub;
  }, []);

  async function handleAddStaff() {
    if (!form.name || !form.email || !form.password) { toast.error("All fields are required"); return; }
    if (form.password.length < 6) { toast.error("Password must be at least 6 characters"); return; }
    setSaving(true);
    try {
      const result = await createUserWithEmailAndPassword(auth, form.email, form.password);
      await addDoc(collection(db, "users"), {
        uid: result.user.uid,
        name: form.name,
        email: form.email,
        role: form.role,
        createdAt: serverTimestamp(),
      });
      toast.success(`${form.name} added as ${form.role}`);
      setShowModal(false);
      setForm({ name: "", email: "", password: "", role: "waiter" });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "";
      if (msg.includes("email-already-in-use")) toast.error("Email already in use");
      else toast.error("Failed to add staff member");
    } finally {
      setSaving(false);
    }
  }

  async function handleRoleChange(staffId: string, newRole: UserRole) {
    try {
      await updateDoc(doc(db, "users", staffId), { role: newRole });
      toast.success("Role updated");
    } catch {
      toast.error("Failed to update role");
    }
  }

  async function handleDelete(s: StaffUser) {
    if (s.id === userProfile?.uid) { toast.error("Cannot delete your own account"); return; }
    if (!confirm(`Remove ${s.name} from staff?`)) return;
    try {
      await deleteDoc(doc(db, "users", s.id));
      toast.success("Staff member removed");
    } catch {
      toast.error("Failed to remove staff");
    }
  }

  return (
    <div className="page-container">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-xl font-bold text-slate-100">Settings</h1>
          <p className="text-sm text-slate-500 mt-0.5">Manage staff and permissions</p>
        </div>
        <button onClick={() => setShowModal(true)} className="btn-primary">
          <UserPlus size={16} /> Add Staff
        </button>
      </div>

      {/* Hotel Info */}
      <div className="card-dark rounded-xl p-5">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-9 h-9 bg-emerald-500/10 rounded-lg flex items-center justify-center">
            <Settings size={18} className="text-emerald-400" />
          </div>
          <h2 className="section-title">Hotel Information</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs text-slate-400 mb-1.5">Hotel Name</label>
            <input defaultValue="Shagun Tadka" className="input-dark" readOnly />
          </div>
          <div>
            <label className="block text-xs text-slate-400 mb-1.5">Firebase Project</label>
            <input defaultValue={import.meta.env.VITE_FIREBASE_PROJECT_ID || "hotel-hub-hms"} className="input-dark" readOnly />
          </div>
        </div>
      </div>

      {/* Staff Management */}
      <div className="card-dark rounded-xl overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-700/50 flex items-center gap-3">
          <div className="w-8 h-8 bg-blue-500/10 rounded-lg flex items-center justify-center">
            <Users size={16} className="text-blue-400" />
          </div>
          <h2 className="section-title">Staff Members ({staff.length})</h2>
        </div>

        {loading ? (
          <div className="p-5 space-y-3">{[...Array(4)].map((_, i) => <div key={i} className="h-14 bg-slate-700/50 rounded animate-pulse" />)}</div>
        ) : staff.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-slate-500">
            <Shield size={32} className="mb-3 opacity-40" />
            <p className="text-sm">No staff members yet</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-700/50">
            {staff.map((s, i) => {
              const roleConfig = ROLES.find(r => r.value === s.role);
              return (
                <motion.div key={s.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.04 }}
                  className="flex items-center gap-4 px-5 py-3.5 hover:bg-slate-800/30 transition-colors">
                  <div className="w-9 h-9 bg-slate-700 rounded-full flex items-center justify-center shrink-0">
                    <span className="text-sm font-bold text-slate-300">{s.name?.charAt(0).toUpperCase()}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-semibold text-slate-200 truncate flex items-center gap-2">
                      {s.name}
                      {s.id === userProfile?.uid && <span className="text-xs text-emerald-400 font-normal">(you)</span>}
                    </div>
                    <div className="text-xs text-slate-500 truncate">{s.email}</div>
                  </div>
                  <div className="flex items-center gap-3">
                    <select value={s.role} onChange={e => handleRoleChange(s.id, e.target.value as UserRole)}
                      disabled={s.id === userProfile?.uid}
                      className="text-xs bg-slate-700/50 border border-slate-600 rounded-lg px-2 py-1 text-slate-300 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed">
                      {ROLES.map(r => <option key={r.value} value={r.value}>{r.label}</option>)}
                    </select>
                    <button onClick={() => handleDelete(s)}
                      disabled={s.id === userProfile?.uid}
                      className="text-slate-500 hover:text-red-400 p-1.5 rounded-lg hover:bg-red-500/10 transition-colors disabled:opacity-30 disabled:cursor-not-allowed">
                      <Trash2 size={14} />
                    </button>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>

      {/* Add Staff Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
            className="card-dark w-full max-w-sm p-6 rounded-xl">
            <h3 className="font-bold text-slate-100 mb-5">Add Staff Member</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-xs text-slate-400 mb-1.5">Full Name *</label>
                <input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} className="input-dark" placeholder="Staff name" />
              </div>
              <div>
                <label className="block text-xs text-slate-400 mb-1.5">Email *</label>
                <input type="email" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} className="input-dark" placeholder="email@example.com" />
              </div>
              <div>
                <label className="block text-xs text-slate-400 mb-1.5">Password *</label>
                <input type="password" value={form.password} onChange={e => setForm(f => ({ ...f, password: e.target.value }))} className="input-dark" placeholder="Min 6 characters" />
              </div>
              <div>
                <label className="block text-xs text-slate-400 mb-1.5">Role *</label>
                <select value={form.role} onChange={e => setForm(f => ({ ...f, role: e.target.value as UserRole }))} className="input-dark">
                  {ROLES.map(r => <option key={r.value} value={r.value}>{r.label}</option>)}
                </select>
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button onClick={() => setShowModal(false)} className="btn-secondary flex-1 justify-center">Cancel</button>
              <button onClick={handleAddStaff} disabled={saving} className="btn-primary flex-1 justify-center disabled:opacity-60">
                {saving ? "Adding..." : "Add Staff"}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
