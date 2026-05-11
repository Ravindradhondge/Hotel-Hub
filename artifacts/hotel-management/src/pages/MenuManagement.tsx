import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useListMenuItems, useCreateMenuItem, useUpdateMenuItem, useDeleteMenuItem, useListMenuCategories, getListMenuItemsQueryKey, MenuItem } from "@workspace/api-client-react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Plus, Pencil, Trash2, Search, Utensils } from "lucide-react";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";

interface MenuForm { name: string; category: string; price: string; description: string; available: boolean; }
const EMPTY_FORM: MenuForm = { name: "", category: "", price: "", description: "", available: true };

export default function MenuManagement() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [search, setSearch] = useState("");
  const [filterCat, setFilterCat] = useState("all");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<MenuItem | null>(null);
  const [form, setForm] = useState<MenuForm>(EMPTY_FORM);
  const [customCategory, setCustomCategory] = useState("");

  const { data: items = [], isLoading } = useListMenuItems();
  const { data: categories = [] } = useListMenuCategories();
  const createItem = useCreateMenuItem();
  const updateItem = useUpdateMenuItem();
  const deleteItem = useDeleteMenuItem();

  const filtered = items.filter(
    (i) => (filterCat === "all" || i.category === filterCat) && i.name.toLowerCase().includes(search.toLowerCase())
  );

  const openCreate = () => { setEditing(null); setForm(EMPTY_FORM); setCustomCategory(""); setDialogOpen(true); };
  const openEdit = (item: MenuItem) => { setEditing(item); setForm({ name: item.name, category: item.category, price: String(item.price), description: item.description ?? "", available: item.available }); setCustomCategory(""); setDialogOpen(true); };

  const handleSubmit = () => {
    const category = customCategory || form.category;
    const price = parseFloat(form.price);
    if (!form.name || !category || isNaN(price)) { toast({ title: "Please fill all required fields", variant: "destructive" }); return; }
    const data = { name: form.name, category, price, description: form.description || undefined, available: form.available };
    if (editing) {
      updateItem.mutate({ id: editing.id, data }, { onSuccess: () => { toast({ title: "Item updated" }); setDialogOpen(false); queryClient.invalidateQueries({ queryKey: getListMenuItemsQueryKey() }); }, onError: () => toast({ title: "Failed to update", variant: "destructive" }) });
    } else {
      createItem.mutate({ data }, { onSuccess: () => { toast({ title: "Item created" }); setDialogOpen(false); queryClient.invalidateQueries({ queryKey: getListMenuItemsQueryKey() }); }, onError: () => toast({ title: "Failed to create", variant: "destructive" }) });
    }
  };

  const handleDelete = (id: number) => {
    deleteItem.mutate({ id }, { onSuccess: () => { toast({ title: "Item deleted" }); queryClient.invalidateQueries({ queryKey: getListMenuItemsQueryKey() }); }, onError: () => toast({ title: "Failed to delete", variant: "destructive" }) });
  };

  const handleToggle = (item: MenuItem) => {
    updateItem.mutate({ id: item.id, data: { available: !item.available } }, { onSuccess: () => queryClient.invalidateQueries({ queryKey: getListMenuItemsQueryKey() }) });
  };

  return (
    <DashboardLayout title="Menu Management">
      <div className="space-y-4">
        {/* Toolbar */}
        <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
          <div className="flex gap-2 flex-1 flex-wrap w-full sm:w-auto">
            <div className="relative flex-1 min-w-0">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input className="pl-9 h-9 rounded-xl" placeholder="Search items…" value={search} onChange={(e) => setSearch(e.target.value)} />
            </div>
          </div>
          <Button onClick={openCreate} className="rounded-xl h-9 font-semibold w-full sm:w-auto">
            <Plus className="w-4 h-4 mr-1.5" /> Add Item
          </Button>
        </div>

        {/* Category chips */}
        <div className="flex gap-1.5 flex-wrap">
          {["all", ...categories].map((cat) => (
            <button key={cat} onClick={() => setFilterCat(cat)}
              className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-colors ${filterCat === cat ? "bg-primary text-primary-foreground" : "bg-secondary text-muted-foreground hover:bg-secondary/80"}`}>
              {cat === "all" ? "All" : cat}
            </button>
          ))}
        </div>

        <div className="text-xs text-muted-foreground">
          {filtered.length} of {items.length} items{filterCat !== "all" ? ` in "${filterCat}"` : ""}
          {" · "}{items.filter(i => i.available).length} available
        </div>

        {/* ── Mobile card list ── */}
        <div className="md:hidden space-y-2">
          {isLoading ? (
            [...Array(4)].map((_, i) => <div key={i} className="h-20 rounded-2xl bg-secondary animate-pulse" />)
          ) : filtered.length === 0 ? (
            <div className="text-center py-16 text-muted-foreground">
              <Utensils className="w-8 h-8 mx-auto mb-2 opacity-30" />
              <p className="font-medium">No items found</p>
            </div>
          ) : filtered.map((item) => (
            <div key={item.id} className="bg-card border border-border rounded-2xl p-4 card-shadow">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center text-sm font-bold shrink-0">
                  {item.name.charAt(0)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-semibold text-sm">{item.name}</div>
                  {item.description && <div className="text-xs text-muted-foreground mt-0.5 line-clamp-1">{item.description}</div>}
                  <div className="flex items-center gap-2 mt-1.5">
                    <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-secondary text-secondary-foreground">{item.category}</span>
                    <span className="text-sm font-extrabold text-primary">₹{item.price}</span>
                  </div>
                </div>
                <div className="flex flex-col items-end gap-2 shrink-0">
                  <Switch checked={item.available} onCheckedChange={() => handleToggle(item)} />
                  <div className="flex gap-1">
                    <Button variant="outline" size="icon" className="w-8 h-8 rounded-lg" onClick={() => openEdit(item)}>
                      <Pencil className="w-3.5 h-3.5" />
                    </Button>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="outline" size="icon" className="w-8 h-8 rounded-lg text-destructive border-destructive/30 hover:bg-destructive/10">
                          <Trash2 className="w-3.5 h-3.5" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent className="rounded-2xl mx-4">
                        <AlertDialogHeader><AlertDialogTitle>Delete "{item.name}"?</AlertDialogTitle><AlertDialogDescription>This action cannot be undone.</AlertDialogDescription></AlertDialogHeader>
                        <AlertDialogFooter><AlertDialogCancel className="rounded-xl">Cancel</AlertDialogCancel><AlertDialogAction onClick={() => handleDelete(item.id)} className="bg-destructive hover:bg-destructive/90 rounded-xl">Delete</AlertDialogAction></AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* ── Desktop table ── */}
        <div className="hidden md:block bg-card border border-border rounded-2xl overflow-hidden card-shadow">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border bg-secondary/40">
                  <th className="text-left px-4 py-3 text-xs font-bold text-muted-foreground uppercase tracking-wide">Item</th>
                  <th className="text-left px-4 py-3 text-xs font-bold text-muted-foreground uppercase tracking-wide">Category</th>
                  <th className="text-right px-4 py-3 text-xs font-bold text-muted-foreground uppercase tracking-wide">Price</th>
                  <th className="text-center px-4 py-3 text-xs font-bold text-muted-foreground uppercase tracking-wide">Available</th>
                  <th className="text-right px-4 py-3 text-xs font-bold text-muted-foreground uppercase tracking-wide">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {isLoading ? (
                  [...Array(4)].map((_, i) => (
                    <tr key={i}><td colSpan={5} className="px-4 py-3"><div className="h-8 rounded-lg bg-secondary/50 animate-pulse" /></td></tr>
                  ))
                ) : filtered.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="text-center py-16 text-muted-foreground">
                      <Utensils className="w-8 h-8 mx-auto mb-2 opacity-30" />
                      <p className="font-medium">No items found</p>
                    </td>
                  </tr>
                ) : filtered.map((item) => (
                  <tr key={item.id} className="hover:bg-secondary/20 transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center text-xs font-bold shrink-0">{item.name.charAt(0)}</div>
                        <div>
                          <div className="font-semibold text-sm">{item.name}</div>
                          {item.description && <div className="text-xs text-muted-foreground mt-0.5 max-w-xs truncate">{item.description}</div>}
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3"><span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-secondary text-secondary-foreground">{item.category}</span></td>
                    <td className="px-4 py-3 text-right font-extrabold text-primary">₹{item.price}</td>
                    <td className="px-4 py-3 text-center"><Switch checked={item.available} onCheckedChange={() => handleToggle(item)} /></td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Button variant="ghost" size="icon" className="w-8 h-8 rounded-lg" onClick={() => openEdit(item)}><Pencil className="w-3.5 h-3.5" /></Button>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button variant="ghost" size="icon" className="w-8 h-8 rounded-lg text-destructive hover:text-destructive"><Trash2 className="w-3.5 h-3.5" /></Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent className="rounded-2xl">
                            <AlertDialogHeader><AlertDialogTitle>Delete "{item.name}"?</AlertDialogTitle><AlertDialogDescription>This action cannot be undone.</AlertDialogDescription></AlertDialogHeader>
                            <AlertDialogFooter><AlertDialogCancel className="rounded-xl">Cancel</AlertDialogCancel><AlertDialogAction onClick={() => handleDelete(item.id)} className="bg-destructive hover:bg-destructive/90 rounded-xl">Delete</AlertDialogAction></AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Add/edit dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-md rounded-2xl mx-4">
          <DialogHeader><DialogTitle>{editing ? "Edit Item" : "Add Menu Item"}</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div className="space-y-1.5"><Label className="font-semibold text-sm">Name *</Label><Input value={form.name} onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))} placeholder="Butter Chicken" className="rounded-xl" /></div>
            <div className="space-y-1.5">
              <Label className="font-semibold text-sm">Category *</Label>
              <Select value={customCategory ? "__custom__" : form.category} onValueChange={(v) => { if (v === "__custom__") return; setForm((p) => ({ ...p, category: v })); setCustomCategory(""); }}>
                <SelectTrigger className="rounded-xl"><SelectValue placeholder="Select category" /></SelectTrigger>
                <SelectContent className="rounded-xl">
                  {categories.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                  <SelectItem value="__custom__">+ New category</SelectItem>
                </SelectContent>
              </Select>
              <Input placeholder="Or type new category…" value={customCategory} onChange={(e) => setCustomCategory(e.target.value)} className="rounded-xl mt-1" />
            </div>
            <div className="space-y-1.5"><Label className="font-semibold text-sm">Price (₹) *</Label><Input type="number" min="0" step="0.01" value={form.price} onChange={(e) => setForm((p) => ({ ...p, price: e.target.value }))} placeholder="250" className="rounded-xl" /></div>
            <div className="space-y-1.5"><Label className="font-semibold text-sm">Description</Label><Textarea value={form.description} onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))} placeholder="Optional description…" className="resize-none h-20 rounded-xl" /></div>
            <div className="flex items-center gap-3 bg-secondary/40 rounded-xl px-4 py-3">
              <Switch checked={form.available} onCheckedChange={(v) => setForm((p) => ({ ...p, available: v }))} />
              <Label className="text-sm font-medium cursor-pointer">Available for ordering</Label>
            </div>
          </div>
          <DialogFooter className="gap-2">
            <Button variant="outline" className="rounded-xl" onClick={() => setDialogOpen(false)}>Cancel</Button>
            <Button className="rounded-xl font-semibold" onClick={handleSubmit} disabled={createItem.isPending || updateItem.isPending}>
              {editing ? "Save Changes" : "Add Item"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
}
