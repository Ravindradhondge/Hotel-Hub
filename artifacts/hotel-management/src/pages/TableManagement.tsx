import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import {
  useListTables,
  useCreateTable,
  useUpdateTable,
  useDeleteTable,
  getListTablesQueryKey,
  Table,
} from "@workspace/api-client-react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { useToast } from "@/hooks/use-toast";
import { Plus, Pencil, Trash2, Users, Table2 } from "lucide-react";

interface TableForm { number: string; capacity: string; }
const EMPTY_FORM: TableForm = { number: "", capacity: "" };

const STATUS_STYLES: Record<string, { bg: string; text: string; label: string }> = {
  available: { bg: "bg-emerald-100", text: "text-emerald-700", label: "Available" },
  occupied:  { bg: "bg-sky-100",     text: "text-sky-700",     label: "Occupied" },
  cooking:   { bg: "bg-amber-100",   text: "text-amber-700",   label: "Cooking" },
  ready:     { bg: "bg-violet-100",  text: "text-violet-700",  label: "Ready" },
  billing:   { bg: "bg-rose-100",    text: "text-rose-700",    label: "Billing" },
};

export default function TableManagement() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Table | null>(null);
  const [form, setForm] = useState<TableForm>(EMPTY_FORM);

  const { data: tables = [], isLoading } = useListTables();
  const createTable = useCreateTable();
  const updateTable = useUpdateTable();
  const deleteTable = useDeleteTable();

  const openCreate = () => {
    setEditing(null);
    setForm(EMPTY_FORM);
    setDialogOpen(true);
  };

  const openEdit = (table: Table) => {
    setEditing(table);
    setForm({ number: String(table.number), capacity: String(table.capacity) });
    setDialogOpen(true);
  };

  const handleSubmit = () => {
    const number = parseInt(form.number);
    const capacity = parseInt(form.capacity);
    if (!form.number || !form.capacity || isNaN(number) || isNaN(capacity) || number < 1 || capacity < 1) {
      toast({ title: "Enter valid table number and capacity (≥ 1)", variant: "destructive" });
      return;
    }
    if (editing) {
      updateTable.mutate(
        { id: editing.id, data: { number, capacity } },
        {
          onSuccess: () => {
            toast({ title: "Table updated" });
            setDialogOpen(false);
            queryClient.invalidateQueries({ queryKey: getListTablesQueryKey() });
          },
          onError: () => toast({ title: "Failed to update table", variant: "destructive" }),
        }
      );
    } else {
      createTable.mutate(
        { data: { number, capacity } },
        {
          onSuccess: () => {
            toast({ title: "Table created" });
            setDialogOpen(false);
            queryClient.invalidateQueries({ queryKey: getListTablesQueryKey() });
          },
          onError: () => toast({ title: "Failed to create table — number may already exist", variant: "destructive" }),
        }
      );
    }
  };

  const handleDelete = (id: number) => {
    deleteTable.mutate(
      { id },
      {
        onSuccess: () => {
          toast({ title: "Table deleted" });
          queryClient.invalidateQueries({ queryKey: getListTablesQueryKey() });
        },
        onError: () => toast({ title: "Failed to delete table", variant: "destructive" }),
      }
    );
  };

  const sorted = [...tables].sort((a, b) => a.number - b.number);

  const statusCounts = tables.reduce<Record<string, number>>((acc, t) => {
    acc[t.status] = (acc[t.status] ?? 0) + 1;
    return acc;
  }, {});

  return (
    <DashboardLayout title="Table Management">
      <div className="space-y-5">
        {/* Summary chips */}
        <div className="flex flex-wrap gap-2">
          {Object.entries(STATUS_STYLES).map(([status, s]) => (
            <div key={status} className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold ${s.bg} ${s.text}`}>
              <span>{s.label}</span>
              <span className="font-extrabold">{statusCounts[status] ?? 0}</span>
            </div>
          ))}
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-secondary text-muted-foreground ml-auto">
            Total <span className="font-extrabold">{tables.length}</span>
          </div>
        </div>

        {/* Toolbar */}
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold text-muted-foreground">All Tables</h3>
          <Button size="sm" className="rounded-xl h-9 gap-1.5" onClick={openCreate}>
            <Plus className="w-4 h-4" />
            Add Table
          </Button>
        </div>

        {/* Table grid */}
        {isLoading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="bg-secondary rounded-2xl h-36 animate-pulse" />
            ))}
          </div>
        ) : sorted.length === 0 ? (
          <div className="text-center py-16 text-muted-foreground">
            <Table2 className="w-10 h-10 mx-auto mb-3 opacity-30" />
            <p className="font-medium">No tables yet</p>
            <p className="text-xs mt-1">Add your first table to get started</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
            {sorted.map((table) => {
              const s = STATUS_STYLES[table.status] ?? STATUS_STYLES.available;
              return (
                <div key={table.id} className="bg-card border border-border rounded-2xl p-4 card-shadow flex flex-col gap-3 relative group">
                  {/* Status badge */}
                  <span className={`absolute top-3 right-3 px-2 py-0.5 rounded-full text-[10px] font-bold ${s.bg} ${s.text}`}>
                    {s.label}
                  </span>

                  <div className="flex flex-col gap-1">
                    <div className="text-3xl font-extrabold text-foreground leading-none">
                      T{table.number}
                    </div>
                    <div className="flex items-center gap-1 text-muted-foreground text-xs">
                      <Users className="w-3.5 h-3.5" />
                      <span>{table.capacity} seats</span>
                    </div>
                  </div>

                  <div className="flex gap-2 mt-auto">
                    <Button
                      size="sm"
                      variant="outline"
                      className="flex-1 h-8 rounded-lg text-xs gap-1"
                      onClick={() => openEdit(table)}
                    >
                      <Pencil className="w-3 h-3" />
                      Edit
                    </Button>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button
                          size="sm"
                          variant="outline"
                          className="h-8 w-8 rounded-lg p-0 text-destructive hover:bg-destructive/10 hover:text-destructive border-destructive/30"
                          disabled={table.status !== "available"}
                          title={table.status !== "available" ? "Cannot delete an occupied table" : "Delete table"}
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Delete Table {table.number}?</AlertDialogTitle>
                          <AlertDialogDescription>
                            This will permanently remove Table {table.number} ({table.capacity} seats). This cannot be undone.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction
                            className="bg-destructive hover:bg-destructive/90"
                            onClick={() => handleDelete(table.id)}
                          >
                            Delete
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Create / Edit dialog */}
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogContent className="max-w-sm w-[calc(100vw-2rem)] rounded-2xl">
            <DialogHeader>
              <DialogTitle>{editing ? `Edit Table ${editing.number}` : "Add New Table"}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-2">
              <div className="space-y-1.5">
                <Label htmlFor="tbl-number">Table Number</Label>
                <Input
                  id="tbl-number"
                  type="number"
                  min={1}
                  placeholder="e.g. 7"
                  value={form.number}
                  onChange={(e) => setForm((f) => ({ ...f, number: e.target.value }))}
                  className="rounded-xl"
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="tbl-capacity">Seating Capacity</Label>
                <Input
                  id="tbl-capacity"
                  type="number"
                  min={1}
                  placeholder="e.g. 4"
                  value={form.capacity}
                  onChange={(e) => setForm((f) => ({ ...f, capacity: e.target.value }))}
                  className="rounded-xl"
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" className="rounded-xl" onClick={() => setDialogOpen(false)}>
                Cancel
              </Button>
              <Button
                className="rounded-xl"
                onClick={handleSubmit}
                disabled={createTable.isPending || updateTable.isPending}
              >
                {editing ? "Save Changes" : "Add Table"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
}
