import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useListMenuItems, useCreateMenuItem, useUpdateMenuItem, useDeleteMenuItem, useListMenuCategories, getListMenuItemsQueryKey, MenuItem } from "@workspace/api-client-react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Plus, Pencil, Trash2, Search } from "lucide-react";
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
        <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
          <div className="flex gap-3 flex-1">
            <div className="relative flex-1 max-w-xs">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input className="pl-9" placeholder="Search items..." value={search} onChange={(e) => setSearch(e.target.value)} data-testid="input-search" />
            </div>
            <Select value={filterCat} onValueChange={setFilterCat}>
              <SelectTrigger className="w-40" data-testid="select-category-filter"><SelectValue placeholder="All categories" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All categories</SelectItem>
                {categories.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <Button onClick={openCreate} data-testid="button-create-item"><Plus className="w-4 h-4 mr-2" />Add Item</Button>
        </div>

        <div className="bg-card border border-border rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border bg-secondary/30">
                  <th className="text-left px-4 py-3 text-sm font-medium text-muted-foreground">Item</th>
                  <th className="text-left px-4 py-3 text-sm font-medium text-muted-foreground">Category</th>
                  <th className="text-right px-4 py-3 text-sm font-medium text-muted-foreground">Price</th>
                  <th className="text-center px-4 py-3 text-sm font-medium text-muted-foreground">Available</th>
                  <th className="text-right px-4 py-3 text-sm font-medium text-muted-foreground">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {isLoading ? (
                  <tr><td colSpan={5} className="text-center py-12 text-muted-foreground">Loading...</td></tr>
                ) : filtered.length === 0 ? (
                  <tr><td colSpan={5} className="text-center py-12 text-muted-foreground">No items found</td></tr>
                ) : filtered.map((item) => (
                  <tr key={item.id} data-testid={`row-item-${item.id}`} className="hover:bg-secondary/20 transition-colors">
                    <td className="px-4 py-3">
                      <div className="font-medium">{item.name}</div>
                      {item.description && <div className="text-xs text-muted-foreground mt-0.5 max-w-xs truncate">{item.description}</div>}
                    </td>
                    <td className="px-4 py-3"><Badge variant="secondary">{item.category}</Badge></td>
                    <td className="px-4 py-3 text-right font-semibold">₹{item.price}</td>
                    <td className="px-4 py-3 text-center">
                      <Switch checked={item.available} onCheckedChange={() => handleToggle(item)} data-testid={`switch-available-${item.id}`} />
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
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader><DialogTitle>{editing ? "Edit Item" : "Add Menu Item"}</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2"><Label>Name *</Label><Input value={form.name} onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))} placeholder="Butter Chicken" data-testid="input-name" /></div>
            <div className="space-y-2">
              <Label>Category *</Label>
              <Select value={customCategory ? "__custom__" : form.category} onValueChange={(v) => { if (v === "__custom__") return; setForm((p) => ({ ...p, category: v })); setCustomCategory(""); }}>
                <SelectTrigger data-testid="select-category"><SelectValue placeholder="Select category" /></SelectTrigger>
                <SelectContent>
                  {categories.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                  <SelectItem value="__custom__">+ New category</SelectItem>
                </SelectContent>
              </Select>
              <Input placeholder="Or type new category..." value={customCategory} onChange={(e) => setCustomCategory(e.target.value)} className="mt-1" data-testid="input-custom-category" />
            </div>
            <div className="space-y-2"><Label>Price (₹) *</Label><Input type="number" min="0" step="0.01" value={form.price} onChange={(e) => setForm((p) => ({ ...p, price: e.target.value }))} placeholder="250" data-testid="input-price" /></div>
            <div className="space-y-2"><Label>Description</Label><Textarea value={form.description} onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))} placeholder="Optional description..." className="resize-none h-20" data-testid="input-description" /></div>
            <div className="flex items-center gap-3"><Switch checked={form.available} onCheckedChange={(v) => setForm((p) => ({ ...p, available: v }))} data-testid="switch-available-form" /><Label>Available for order</Label></div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleSubmit} disabled={createItem.isPending || updateItem.isPending} data-testid="button-save-item">
              {editing ? "Save Changes" : "Add Item"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
}
