import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useListInventory, useCreateInventoryItem, useUpdateInventoryItem, useDeleteInventoryItem, useListLowStockItems, getListInventoryQueryKey, getListLowStockItemsQueryKey, InventoryItem } from "@workspace/api-client-react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { useToast } from "@/hooks/use-toast";
import { Plus, Pencil, Trash2, AlertTriangle, Package } from "lucide-react";

interface InvForm { name: string; quantity: string; unit: string; lowStockThreshold: string; }
const EMPTY: InvForm = { name: "", quantity: "", unit: "", lowStockThreshold: "" };

export default function InventoryManagement() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<InventoryItem | null>(null);
  const [form, setForm] = useState<InvForm>(EMPTY);

  const { data: items = [], isLoading } = useListInventory();
  const { data: lowStock = [] } = useListLowStockItems();
  const createItem = useCreateInventoryItem();
  const updateItem = useUpdateInventoryItem();
  const deleteItem = useDeleteInventoryItem();

  const openCreate = () => { setEditing(null); setForm(EMPTY); setDialogOpen(true); };
  const openEdit = (item: InventoryItem) => { setEditing(item); setForm({ name: item.name, quantity: String(item.quantity), unit: item.unit, lowStockThreshold: String(item.lowStockThreshold) }); setDialogOpen(true); };

  const handleSubmit = () => {
    const data = { name: form.name, quantity: parseFloat(form.quantity), unit: form.unit, lowStockThreshold: parseFloat(form.lowStockThreshold) };
    if (!form.name || isNaN(data.quantity) || !form.unit || isNaN(data.lowStockThreshold)) { toast({ title: "Please fill all fields", variant: "destructive" }); return; }
    if (editing) {
      updateItem.mutate({ id: editing.id, data }, { onSuccess: () => { toast({ title: "Updated" }); setDialogOpen(false); queryClient.invalidateQueries({ queryKey: getListInventoryQueryKey() }); queryClient.invalidateQueries({ queryKey: getListLowStockItemsQueryKey() }); } });
    } else {
      createItem.mutate({ data }, { onSuccess: () => { toast({ title: "Item added" }); setDialogOpen(false); queryClient.invalidateQueries({ queryKey: getListInventoryQueryKey() }); queryClient.invalidateQueries({ queryKey: getListLowStockItemsQueryKey() }); } });
    }
  };

  const handleDelete = (id: number) => {
    deleteItem.mutate({ id }, { onSuccess: () => { toast({ title: "Deleted" }); queryClient.invalidateQueries({ queryKey: getListInventoryQueryKey() }); queryClient.invalidateQueries({ queryKey: getListLowStockItemsQueryKey() }); } });
  };

  return (
    <DashboardLayout title="Inventory Management">
      <div className="space-y-4">

        {/* Low-stock alert */}
        {lowStock.length > 0 && (
          <div className="bg-rose-50 border border-rose-200 rounded-2xl p-4">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-7 h-7 rounded-full bg-rose-100 flex items-center justify-center">
                <AlertTriangle className="w-4 h-4 text-rose-600" />
              </div>
              <span className="font-bold text-rose-700 text-sm">{lowStock.length} item{lowStock.length !== 1 ? "s" : ""} running low</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {lowStock.map((item) => (
                <span key={item.id} className="text-xs bg-rose-100 text-rose-700 border border-rose-200 px-2.5 py-1 rounded-full font-semibold">
                  {item.name} — {item.quantity} {item.unit}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="text-xs text-muted-foreground font-medium">{items.length} items · {lowStock.length} low stock</div>
          <Button onClick={openCreate} className="rounded-xl h-9 font-semibold">
            <Plus className="w-4 h-4 mr-1.5" /> Add Item
          </Button>
        </div>

        {/* ── Mobile card list ── */}
        <div className="md:hidden space-y-2">
          {isLoading ? (
            [...Array(4)].map((_, i) => <div key={i} className="h-20 rounded-2xl bg-secondary animate-pulse" />)
          ) : items.length === 0 ? (
            <div className="text-center py-16 text-muted-foreground">
              <Package className="w-8 h-8 mx-auto mb-2 opacity-30" />
              <p className="font-medium">No inventory items</p>
            </div>
          ) : items.map((item) => {
            const pct = Math.min(100, Math.round((item.quantity / (item.lowStockThreshold * 3)) * 100));
            return (
              <div key={item.id} className="bg-card border border-border rounded-2xl p-4 card-shadow">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${item.isLowStock ? "bg-rose-100 text-rose-600" : "bg-emerald-50 text-emerald-700"}`}>
                    <Package className="w-5 h-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-sm">{item.name}</span>
                      <span className={`text-[10px] font-bold uppercase tracking-wide px-2 py-0.5 rounded-full ${item.isLowStock ? "bg-rose-100 text-rose-700" : "bg-emerald-100 text-emerald-700"}`}>
                        {item.isLowStock ? "Low" : "OK"}
                      </span>
                    </div>
                    <div className="text-sm font-bold mt-0.5">{item.quantity} <span className="text-xs text-muted-foreground font-normal">{item.unit}</span></div>
                    <div className="flex items-center gap-2 mt-1.5">
                      <div className="flex-1 h-1.5 rounded-full bg-secondary overflow-hidden">
                        <div className={`h-full rounded-full transition-all ${pct <= 33 ? "bg-rose-500" : pct <= 66 ? "bg-amber-500" : "bg-emerald-500"}`} style={{ width: `${pct}%` }} />
                      </div>
                      <span className="text-[10px] text-muted-foreground w-8 text-right">{pct}%</span>
                    </div>
                  </div>
                  <div className="flex gap-1 shrink-0">
                    <Button variant="outline" size="icon" className="w-9 h-9 rounded-xl" onClick={() => openEdit(item)}>
                      <Pencil className="w-4 h-4" />
                    </Button>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="outline" size="icon" className="w-9 h-9 rounded-xl text-destructive border-destructive/30 hover:bg-destructive/10">
                          <Trash2 className="w-4 h-4" />
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
            );
          })}
        </div>

        {/* ── Desktop table ── */}
        <div className="hidden md:block bg-card border border-border rounded-2xl overflow-hidden card-shadow">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border bg-secondary/40">
                  <th className="text-left px-4 py-3 text-xs font-bold text-muted-foreground uppercase tracking-wide">Item</th>
                  <th className="text-right px-4 py-3 text-xs font-bold text-muted-foreground uppercase tracking-wide">Stock</th>
                  <th className="text-left px-4 py-3 text-xs font-bold text-muted-foreground uppercase tracking-wide">Level</th>
                  <th className="text-center px-4 py-3 text-xs font-bold text-muted-foreground uppercase tracking-wide">Status</th>
                  <th className="text-right px-4 py-3 text-xs font-bold text-muted-foreground uppercase tracking-wide">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {isLoading ? (
                  [...Array(4)].map((_, i) => (
                    <tr key={i}><td colSpan={5} className="px-4 py-3"><div className="h-8 rounded-lg bg-secondary/50 animate-pulse" /></td></tr>
                  ))
                ) : items.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="text-center py-16 text-muted-foreground">
                      <Package className="w-8 h-8 mx-auto mb-2 opacity-30" />
                      <p className="font-medium">No inventory items</p>
                    </td>
                  </tr>
                ) : items.map((item) => {
                  const pct = Math.min(100, Math.round((item.quantity / (item.lowStockThreshold * 3)) * 100));
                  return (
                    <tr key={item.id} className="hover:bg-secondary/20 transition-colors">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${item.isLowStock ? "bg-rose-100 text-rose-600" : "bg-emerald-50 text-emerald-700"}`}>
                            <Package className="w-4 h-4" />
                          </div>
                          <span className="font-semibold text-sm">{item.name}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <span className="font-extrabold">{item.quantity}</span>
                        <span className="text-xs text-muted-foreground ml-1">{item.unit}</span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2 max-w-[120px]">
                          <div className="flex-1 h-1.5 rounded-full bg-secondary overflow-hidden">
                            <div className={`h-full rounded-full transition-all ${pct <= 33 ? "bg-rose-500" : pct <= 66 ? "bg-amber-500" : "bg-emerald-500"}`} style={{ width: `${pct}%` }} />
                          </div>
                          <span className="text-[10px] text-muted-foreground w-8 text-right">{pct}%</span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <span className={`text-[10px] font-bold uppercase tracking-wide px-2.5 py-1 rounded-full ${item.isLowStock ? "bg-rose-100 text-rose-700" : "bg-emerald-100 text-emerald-700"}`}>
                          {item.isLowStock ? "Low" : "OK"}
                        </span>
                      </td>
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
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Add/edit dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-sm rounded-2xl mx-4">
          <DialogHeader><DialogTitle>{editing ? "Edit Item" : "Add Inventory Item"}</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div className="space-y-1.5"><Label className="font-semibold text-sm">Name *</Label><Input value={form.name} onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))} placeholder="Chicken" className="rounded-xl" /></div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5"><Label className="font-semibold text-sm">Quantity *</Label><Input type="number" min="0" step="0.1" value={form.quantity} onChange={(e) => setForm((p) => ({ ...p, quantity: e.target.value }))} placeholder="10" className="rounded-xl" /></div>
              <div className="space-y-1.5"><Label className="font-semibold text-sm">Unit *</Label><Input value={form.unit} onChange={(e) => setForm((p) => ({ ...p, unit: e.target.value }))} placeholder="kg" className="rounded-xl" /></div>
            </div>
            <div className="space-y-1.5"><Label className="font-semibold text-sm">Low Stock Threshold *</Label><Input type="number" min="0" step="0.1" value={form.lowStockThreshold} onChange={(e) => setForm((p) => ({ ...p, lowStockThreshold: e.target.value }))} placeholder="5" className="rounded-xl" /></div>
          </div>
          <DialogFooter className="gap-2">
            <Button variant="outline" className="rounded-xl" onClick={() => setDialogOpen(false)}>Cancel</Button>
            <Button className="rounded-xl font-semibold" onClick={handleSubmit} disabled={createItem.isPending || updateItem.isPending}>{editing ? "Save Changes" : "Add Item"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
}
