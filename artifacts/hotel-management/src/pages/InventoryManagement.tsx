import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useListInventory, useCreateInventoryItem, useUpdateInventoryItem, useDeleteInventoryItem, useListLowStockItems, getListInventoryQueryKey, getListLowStockItemsQueryKey, InventoryItem } from "@workspace/api-client-react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { useToast } from "@/hooks/use-toast";
import { Plus, Pencil, Trash2, AlertTriangle } from "lucide-react";

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
      <div className="space-y-5">
        {lowStock.length > 0 && (
          <div className="bg-rose-50 border border-rose-200 rounded-xl p-4">
            <div className="flex items-center gap-2 mb-3">
              <AlertTriangle className="w-4 h-4 text-rose-600" />
              <span className="font-semibold text-rose-700 text-sm">{lowStock.length} item(s) running low</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {lowStock.map((item) => (
                <span key={item.id} className="text-xs bg-rose-100 text-rose-700 px-2 py-1 rounded-full font-medium">{item.name} — {item.quantity} {item.unit}</span>
              ))}
            </div>
          </div>
        )}

        <div className="flex justify-between items-center">
          <div className="text-sm text-muted-foreground">{items.length} items total</div>
          <Button onClick={openCreate} data-testid="button-add-item"><Plus className="w-4 h-4 mr-2" />Add Item</Button>
        </div>

        <div className="bg-card border border-border rounded-xl overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border bg-secondary/30">
                <th className="text-left px-4 py-3 text-sm font-medium text-muted-foreground">Item</th>
                <th className="text-right px-4 py-3 text-sm font-medium text-muted-foreground">Quantity</th>
                <th className="text-left px-4 py-3 text-sm font-medium text-muted-foreground">Unit</th>
                <th className="text-right px-4 py-3 text-sm font-medium text-muted-foreground">Threshold</th>
                <th className="text-center px-4 py-3 text-sm font-medium text-muted-foreground">Status</th>
                <th className="text-right px-4 py-3 text-sm font-medium text-muted-foreground">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {isLoading ? (
                <tr><td colSpan={6} className="text-center py-10 text-muted-foreground">Loading...</td></tr>
              ) : items.length === 0 ? (
                <tr><td colSpan={6} className="text-center py-10 text-muted-foreground">No inventory items</td></tr>
              ) : items.map((item) => (
                <tr key={item.id} data-testid={`row-inventory-${item.id}`} className="hover:bg-secondary/20 transition-colors">
                  <td className="px-4 py-3 font-medium">{item.name}</td>
                  <td className="px-4 py-3 text-right font-semibold">{item.quantity}</td>
                  <td className="px-4 py-3 text-muted-foreground">{item.unit}</td>
                  <td className="px-4 py-3 text-right text-muted-foreground">{item.lowStockThreshold}</td>
                  <td className="px-4 py-3 text-center">
                    <Badge variant={item.isLowStock ? "destructive" : "secondary"}>{item.isLowStock ? "Low Stock" : "OK"}</Badge>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Button variant="ghost" size="icon" onClick={() => openEdit(item)} data-testid={`button-edit-${item.id}`}><Pencil className="w-4 h-4" /></Button>
                      <AlertDialog>
                        <AlertDialogTrigger asChild><Button variant="ghost" size="icon" className="text-destructive hover:text-destructive" data-testid={`button-delete-${item.id}`}><Trash2 className="w-4 h-4" /></Button></AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader><AlertDialogTitle>Delete {item.name}?</AlertDialogTitle><AlertDialogDescription>This action cannot be undone.</AlertDialogDescription></AlertDialogHeader>
                          <AlertDialogFooter><AlertDialogCancel>Cancel</AlertDialogCancel><AlertDialogAction onClick={() => handleDelete(item.id)} className="bg-destructive hover:bg-destructive/90">Delete</AlertDialogAction></AlertDialogFooter>
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

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader><DialogTitle>{editing ? "Edit Item" : "Add Inventory Item"}</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2"><Label>Name *</Label><Input value={form.name} onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))} placeholder="Chicken" data-testid="input-name" /></div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2"><Label>Quantity *</Label><Input type="number" min="0" step="0.1" value={form.quantity} onChange={(e) => setForm((p) => ({ ...p, quantity: e.target.value }))} placeholder="10" data-testid="input-quantity" /></div>
              <div className="space-y-2"><Label>Unit *</Label><Input value={form.unit} onChange={(e) => setForm((p) => ({ ...p, unit: e.target.value }))} placeholder="kg, liters..." data-testid="input-unit" /></div>
            </div>
            <div className="space-y-2"><Label>Low Stock Threshold *</Label><Input type="number" min="0" step="0.1" value={form.lowStockThreshold} onChange={(e) => setForm((p) => ({ ...p, lowStockThreshold: e.target.value }))} placeholder="5" data-testid="input-threshold" /></div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleSubmit} disabled={createItem.isPending || updateItem.isPending} data-testid="button-save">{editing ? "Save Changes" : "Add Item"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
}
