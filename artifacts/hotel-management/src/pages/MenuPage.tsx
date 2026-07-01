import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Plus, Edit2, Trash2, UtensilsCrossed, Search } from "lucide-react";
import { collection, onSnapshot, addDoc, updateDoc, deleteDoc, doc, serverTimestamp } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { toast } from "sonner";

interface MenuItem {
  id: string;
  name: string;
  category: string;
  price: number;
  description?: string;
  available: boolean;
  isVeg: boolean;
}

const CATEGORIES = ["Starters","Main Course","Breads","Rice & Biryani","Desserts","Beverages","Soups","Snacks"];

const IMPORT_ITEMS = [
  // Breads (Veg)
  { name: "Tandoor Roti", price: 15, category: "Breads", isVeg: true, available: true, description: "" },
  { name: "Butter Roti", price: 20, category: "Breads", isVeg: true, available: true, description: "" },
  { name: "Special Tandoor Roti", price: 25, category: "Breads", isVeg: true, available: true, description: "" },
  { name: "Bajari Bhakar", price: 20, category: "Breads", isVeg: true, available: true, description: "" },
  { name: "Vit Roti", price: 15, category: "Breads", isVeg: true, available: true, description: "" },
  { name: "Butter Bazari Bhakri", price: 25, category: "Breads", isVeg: true, available: true, description: "" },
  { name: "Plain Nan", price: 40, category: "Breads", isVeg: true, available: true, description: "" },
  { name: "Butter Nan", price: 50, category: "Breads", isVeg: true, available: true, description: "" },
  { name: "Garlic Nan", price: 60, category: "Breads", isVeg: true, available: true, description: "" },
  { name: "Lachha Paratha Plain", price: 50, category: "Breads", isVeg: true, available: true, description: "" },
  { name: "Lachha Paratha Butter", price: 60, category: "Breads", isVeg: true, available: true, description: "" },
  { name: "Stuff Paratha", price: 40, category: "Breads", isVeg: true, available: true, description: "" },

  // Rice & Biryani (Veg)
  { name: "Jeera Rice", price: 60, category: "Rice & Biryani", isVeg: true, available: true, description: "" },
  { name: "Plain Rice", price: 60, category: "Rice & Biryani", isVeg: true, available: true, description: "" },
  { name: "Steem Rice", price: 70, category: "Rice & Biryani", isVeg: true, available: true, description: "" },
  { name: "Veg Biryani", price: 170, category: "Rice & Biryani", isVeg: true, available: true, description: "" },
  { name: "Veg Pulav", price: 170, category: "Rice & Biryani", isVeg: true, available: true, description: "" },
  { name: "Dal Khichadi", price: 130, category: "Rice & Biryani", isVeg: true, available: true, description: "" },
  { name: "Masala Rice", price: 80, category: "Rice & Biryani", isVeg: true, available: true, description: "" },

  // Rice & Biryani (Non-Veg)
  { name: "Chicken Biryani", price: 150, category: "Rice & Biryani", isVeg: false, available: true, description: "" },
  { name: "Anda Biryani", price: 140, category: "Rice & Biryani", isVeg: false, available: true, description: "" },

  // Starters (Veg)
  { name: "Masala Papad (Udid)", price: 30, category: "Starters", isVeg: true, available: true, description: "" },
  { name: "Masala Papad (Nagali)", price: 40, category: "Starters", isVeg: true, available: true, description: "" },
  { name: "Sadha Papad (Udid)", price: 20, category: "Starters", isVeg: true, available: true, description: "" },
  { name: "Sadha Papad (Nagali)", price: 20, category: "Starters", isVeg: true, available: true, description: "" },
  { name: "Fry Papad (Nagali)", price: 30, category: "Starters", isVeg: true, available: true, description: "" },
  { name: "Soyabeen Chilli", price: 110, category: "Starters", isVeg: true, available: true, description: "" },
  { name: "Soyabeen Tikka", price: 100, category: "Starters", isVeg: true, available: true, description: "" },
  { name: "Paneer Chilly", price: 170, category: "Starters", isVeg: true, available: true, description: "" },
  { name: "Paneer Tikka", price: 150, category: "Starters", isVeg: true, available: true, description: "" },
  { name: "Chana Kolivada", price: 110, category: "Starters", isVeg: true, available: true, description: "" },
  { name: "Chana Garlik", price: 130, category: "Starters", isVeg: true, available: true, description: "" },
  { name: "Garlik Fry", price: 150, category: "Starters", isVeg: true, available: true, description: "" },
  { name: "Green Pis Fry", price: 130, category: "Starters", isVeg: true, available: true, description: "" },
  { name: "Green Pis Latpat", price: 120, category: "Starters", isVeg: true, available: true, description: "" },
  { name: "Kothabir Vadi", price: 150, category: "Starters", isVeg: true, available: true, description: "" },
  { name: "Boil Shendana", price: 30, category: "Starters", isVeg: true, available: true, description: "" },
  { name: "Plen Chana", price: 50, category: "Starters", isVeg: true, available: true, description: "" },
  { name: "Shevga Masala Fry", price: 150, category: "Starters", isVeg: true, available: true, description: "" },
  { name: "Shevga Latpat", price: 140, category: "Starters", isVeg: true, available: true, description: "" },

  // Main Course (Veg)
  { name: "Special Thali", price: 200, category: "Main Course", isVeg: true, available: true, description: "" },
  { name: "Veg Thali (Full)", price: 180, category: "Main Course", isVeg: true, available: true, description: "" },
  { name: "Veg Thali (Mini)", price: 150, category: "Main Course", isVeg: true, available: true, description: "" },
  { name: "Paneer Masala", price: 170, category: "Main Course", isVeg: true, available: true, description: "" },
  { name: "Kaju Paneer Masala", price: 190, category: "Main Course", isVeg: true, available: true, description: "" },
  { name: "Muter Paneer", price: 160, category: "Main Course", isVeg: true, available: true, description: "" },
  { name: "Paneer Kadai", price: 200, category: "Main Course", isVeg: true, available: true, description: "" },
  { name: "Paneer Korma", price: 200, category: "Main Course", isVeg: true, available: true, description: "" },
  { name: "Paneer Angara", price: 270, category: "Main Course", isVeg: true, available: true, description: "" },
  { name: "Paneer Tikka Masala", price: 220, category: "Main Course", isVeg: true, available: true, description: "" },
  { name: "Paneer Buter Masala", price: 200, category: "Main Course", isVeg: true, available: true, description: "" },
  { name: "Kaju Masala", price: 180, category: "Main Course", isVeg: true, available: true, description: "" },
  { name: "Kaju Kari", price: 180, category: "Main Course", isVeg: true, available: true, description: "" },
  { name: "Shevbhaji", price: 100, category: "Main Course", isVeg: true, available: true, description: "" },
  { name: "Milk Shevbhaji", price: 120, category: "Main Course", isVeg: true, available: true, description: "" },
  { name: "Dalfry", price: 100, category: "Main Course", isVeg: true, available: true, description: "" },
  { name: "Dal Tadka", price: 110, category: "Main Course", isVeg: true, available: true, description: "" },
  { name: "Mix Veg", price: 170, category: "Main Course", isVeg: true, available: true, description: "" },
  { name: "Veg Maratha", price: 220, category: "Main Course", isVeg: true, available: true, description: "" },
  { name: "Veg Kolhapuri", price: 170, category: "Main Course", isVeg: true, available: true, description: "" },
  { name: "Baingan Masala", price: 120, category: "Main Course", isVeg: true, available: true, description: "" },
  { name: "Soyabeen Masala", price: 100, category: "Main Course", isVeg: true, available: true, description: "" },
  { name: "Matki Masala", price: 100, category: "Main Course", isVeg: true, available: true, description: "" },
  { name: "Chana Masala", price: 100, category: "Main Course", isVeg: true, available: true, description: "" },
  { name: "Garlik Methi", price: 200, category: "Main Course", isVeg: true, available: true, description: "" },
  { name: "Malai Methi", price: 220, category: "Main Course", isVeg: true, available: true, description: "" },
  { name: "Veg Tiranga", price: 250, category: "Main Course", isVeg: true, available: true, description: "" },
  { name: "Veg Kopta", price: 130, category: "Main Course", isVeg: true, available: true, description: "" },
  { name: "Green Pis Masala", price: 140, category: "Main Course", isVeg: true, available: true, description: "" },
  { name: "Shevga Masala", price: 150, category: "Main Course", isVeg: true, available: true, description: "" },
  { name: "Pithala", price: 100, category: "Main Course", isVeg: true, available: true, description: "" },
  { name: "Thecha", price: 100, category: "Main Course", isVeg: true, available: true, description: "" },

  // Main Course (Non-Veg)
  { name: "Chicken Masala", price: 140, category: "Main Course", isVeg: false, available: true, description: "" },
  { name: "Chicken Kari", price: 140, category: "Main Course", isVeg: false, available: true, description: "" },
  { name: "Butter Chicken", price: 220, category: "Main Course", isVeg: false, available: true, description: "" },
  { name: "Chicken Angara", price: 280, category: "Main Course", isVeg: false, available: true, description: "" },
  { name: "Chicken Maharaja", price: 270, category: "Main Course", isVeg: false, available: true, description: "" },
  { name: "Chicken Handi Full", price: 600, category: "Main Course", isVeg: false, available: true, description: "" },
  { name: "Chicken Handi Half", price: 350, category: "Main Course", isVeg: false, available: true, description: "" },
  { name: "Andakari (Egg Curry)", price: 120, category: "Main Course", isVeg: false, available: true, description: "" },
  { name: "Anda Masala (Egg Masala)", price: 150, category: "Main Course", isVeg: false, available: true, description: "" },
  { name: "Bombil Masala", price: 130, category: "Main Course", isVeg: false, available: true, description: "" }
];

export default function MenuPage() {
  const [items, setItems] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterCat, setFilterCat] = useState("All");
  const [search, setSearch] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<MenuItem | null>(null);
  const [form, setForm] = useState({ name: "", category: CATEGORIES[0], price: "", description: "", isVeg: true, available: true });
  const [isImporting, setIsImporting] = useState(false);

  useEffect(() => {
    const unsub = onSnapshot(collection(db, "menu"), (snap) => {
      setItems(snap.docs.map(d => ({ id: d.id, ...d.data() } as MenuItem)));
      setLoading(false);
    });
    return unsub;
  }, []);

  const categories = ["All", ...Array.from(new Set(items.map(i => i.category)))];

  const filtered = items.filter(i => {
    const matchCat = filterCat === "All" || i.category === filterCat;
    const matchSearch = !search || i.name.toLowerCase().includes(search.toLowerCase());
    return matchCat && matchSearch;
  });

  const groupedItems = filtered.reduce((acc, item) => {
    if (!acc[item.category]) acc[item.category] = [];
    acc[item.category].push(item);
    return acc;
  }, {} as Record<string, MenuItem[]>);

  function openAdd() {
    setEditing(null);
    setForm({ name: "", category: CATEGORIES[0], price: "", description: "", isVeg: true, available: true });
    setShowModal(true);
  }

  function openEdit(item: MenuItem) {
    setEditing(item);
    setForm({ name: item.name, category: item.category, price: String(item.price), description: item.description || "", isVeg: item.isVeg, available: item.available });
    setShowModal(true);
  }

  async function handleSave() {
    if (!form.name || !form.price) { toast.error("Name and price are required"); return; }
    try {
      const data = { name: form.name, category: form.category, price: Number(form.price), description: form.description, isVeg: form.isVeg, available: form.available };
      if (editing) {
        await updateDoc(doc(db, "menu", editing.id), data);
        toast.success("Item updated");
      } else {
        await addDoc(collection(db, "menu"), { ...data, createdAt: serverTimestamp() });
        toast.success("Item added");
      }
      setShowModal(false);
    } catch {
      toast.error("Failed to save item");
    }
  }

  async function handleDelete(item: MenuItem) {
    if (!confirm(`Delete "${item.name}"?`)) return;
    try {
      await deleteDoc(doc(db, "menu", item.id));
      toast.success("Item deleted");
    } catch {
      toast.error("Failed to delete");
    }
  }

  async function toggleAvailability(item: MenuItem) {
    try {
      await updateDoc(doc(db, "menu", item.id), { available: !item.available });
      toast.success(item.available ? `${item.name} marked unavailable` : `${item.name} now available`);
    } catch {
      toast.error("Failed to update availability");
    }
  }

  async function handleImportMenu() {
    if (!confirm(`Are you sure you want to import ${IMPORT_ITEMS.length} menu items? This cannot be undone.`)) return;
    setIsImporting(true);
    toast.loading("Importing menu items...");
    try {
      for (const item of IMPORT_ITEMS) {
        await addDoc(collection(db, "menu"), { ...item, createdAt: serverTimestamp() });
      }
      toast.success("All items imported successfully!");
    } catch (e) {
      toast.error("Failed to import some items.");
      console.error(e);
    } finally {
      setIsImporting(false);
    }
  }

  return (
    <div className="page-container">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-xl font-bold text-slate-900 dark:text-slate-100">Menu Management</h1>
          <p className="text-sm text-slate-500 mt-0.5">{items.length} items · {items.filter(i => i.available).length} available</p>
        </div>
        <div className="flex gap-2">
          {items.length === 0 && (
            <button onClick={handleImportMenu} disabled={isImporting} className="btn-secondary">
              {isImporting ? "Importing..." : "Seed Menu from Images"}
            </button>
          )}
          <button onClick={openAdd} className="btn-primary"><Plus size={16} /> Add Item</button>
        </div>
      </div>

      <div className="flex flex-wrap gap-3 items-center">
        <div className="relative flex-1 min-w-[180px]">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search menu..." className="input-dark pl-9 py-2" />
        </div>
        <div className="flex gap-1.5 flex-wrap">
          {categories.map(cat => (
            <button key={cat} onClick={() => setFilterCat(cat)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${filterCat === cat ? "bg-emerald-500 text-slate-900" : "bg-white dark:bg-slate-800 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:text-slate-200"}`}>
              {cat}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="flex flex-col gap-3">
          {[...Array(6)].map((_, i) => <div key={i} className="h-28 bg-white dark:bg-slate-800 rounded-xl animate-pulse" />)}
        </div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-slate-500">
          <UtensilsCrossed size={40} className="mb-3 opacity-40" />
          <p className="text-sm">No menu items found</p>
        </div>
      ) : (
        <div className="flex flex-col gap-8">
          {Object.entries(groupedItems).map(([category, catItems]) => (
            <div key={category} className="space-y-3">
              <h2 className="text-lg font-bold text-slate-700 dark:text-slate-300 border-b border-slate-200 dark:border-slate-700 pb-2 mb-4">{category}</h2>
              <div className="flex flex-col gap-3">
                {catItems.map((item, i) => (
            <motion.div key={item.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }}
              className={`card-dark p-4 rounded-xl transition-opacity ${!item.available ? "opacity-50" : ""}`}>
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className={`w-3 h-3 rounded-full shrink-0 ${item.isVeg ? "bg-emerald-500" : "bg-red-500"}`} />
                    <span className="font-semibold text-slate-900 dark:text-slate-100 truncate">{item.name}</span>
                  </div>
                  <div className="text-xs text-slate-500 mt-0.5 ml-5">{item.category}</div>
                  {item.description && <div className="text-xs text-slate-600 mt-1 ml-5 line-clamp-2">{item.description}</div>}
                </div>
                <div className="text-right shrink-0">
                  <div className="text-emerald-400 font-bold">₹{item.price}</div>
                  <div className="flex gap-1.5 mt-2">
                    <button onClick={() => openEdit(item)} className="text-slate-500 hover:text-slate-900 dark:text-slate-200 p-1 rounded"><Edit2 size={13} /></button>
                    <button onClick={() => handleDelete(item)} className="text-slate-500 hover:text-red-400 p-1 rounded"><Trash2 size={13} /></button>
                  </div>
                </div>
              </div>
              <div className="mt-3 pt-2 border-t border-slate-200 dark:border-slate-700/50 flex items-center justify-between">
                <span className={`text-xs font-semibold ${item.available ? "text-emerald-400" : "text-slate-500"}`}>
                  {item.available ? "Available" : "Unavailable"}
                </span>
                <button onClick={() => toggleAvailability(item)}
                  className={`text-xs px-2 py-1 rounded-lg border transition-colors ${item.available ? "border-red-500/30 text-red-400 hover:bg-red-500/10" : "border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/10"}`}>
                  {item.available ? "Mark Unavailable" : "Mark Available"}
                </button>
              </div>
            </motion.div>
          ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {showModal && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
            className="card-dark w-full max-w-md p-6 rounded-xl max-h-[90vh] overflow-y-auto">
            <h3 className="font-bold text-slate-900 dark:text-slate-100 mb-5">{editing ? "Edit Item" : "Add Menu Item"}</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-xs text-slate-500 dark:text-slate-400 mb-1.5">Item Name *</label>
                <input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} className="input-dark" placeholder="e.g. Dal Makhani" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs text-slate-500 dark:text-slate-400 mb-1.5">Category</label>
                  <select value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))} className="input-dark">
                    {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs text-slate-500 dark:text-slate-400 mb-1.5">Price (₹) *</label>
                  <input type="number" value={form.price} onChange={e => setForm(f => ({ ...f, price: e.target.value }))} className="input-dark" placeholder="150" />
                </div>
              </div>
              <div>
                <label className="block text-xs text-slate-500 dark:text-slate-400 mb-1.5">Description</label>
                <textarea value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} className="input-dark resize-none" rows={2} placeholder="Brief description..." />
              </div>
              <div className="flex gap-4">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" checked={form.isVeg} onChange={e => setForm(f => ({ ...f, isVeg: e.target.checked }))} className="w-4 h-4 accent-emerald-500" />
                  <span className="text-sm text-slate-700 dark:text-slate-300">Vegetarian</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" checked={form.available} onChange={e => setForm(f => ({ ...f, available: e.target.checked }))} className="w-4 h-4 accent-emerald-500" />
                  <span className="text-sm text-slate-700 dark:text-slate-300">Available</span>
                </label>
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button onClick={() => setShowModal(false)} className="btn-secondary flex-1 justify-center">Cancel</button>
              <button onClick={handleSave} className="btn-primary flex-1 justify-center">Save Item</button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
