import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import {
  useListExpenses, useCreateExpense, useUpdateExpense, useDeleteExpense,
  getListExpensesQueryKey, Expense,
} from "@workspace/api-client-react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { useToast } from "@/hooks/use-toast";
import { Plus, Pencil, Trash2, Wallet, TrendingDown, ChevronLeft, ChevronRight, Tag } from "lucide-react";

const CATEGORIES = ["Food & Beverage", "Utilities", "Salary", "Maintenance", "Marketing", "Equipment", "Other"];

const CATEGORY_STYLE: Record<string, string> = {
  "Food & Beverage": "bg-amber-100 text-amber-700",
  "Utilities":       "bg-sky-100 text-sky-700",
  "Salary":          "bg-violet-100 text-violet-700",
  "Maintenance":     "bg-orange-100 text-orange-700",
  "Marketing":       "bg-pink-100 text-pink-700",
  "Equipment":       "bg-teal-100 text-teal-700",
  "Other":           "bg-secondary text-muted-foreground",
};

interface ExpenseForm { description: string; amount: string; category: string; date: string; }
const today = () => new Date().toISOString().slice(0, 10);
const EMPTY: ExpenseForm = { description: "", amount: "", category: "Other", date: today() };

export default function ExpenseManagement() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const now = new Date();
  const [month, setMonth] = useState(now.getMonth() + 1);
  const [year, setYear]   = useState(now.getFullYear());

  const { data: expenses = [], isLoading } = useListExpenses(
    { month, year },
    { query: { queryKey: getListExpensesQueryKey({ month, year }) } }
  );

  const createExpense = useCreateExpense();
  const updateExpense = useUpdateExpense();
  const deleteExpense = useDeleteExpense();

  const [dialogOpen, setDialogOpen]  = useState(false);
  const [editing, setEditing]        = useState<Expense | null>(null);
  const [form, setForm]              = useState<ExpenseForm>(EMPTY);

  const totalAmount = expenses.reduce((sum, e) => sum + e.amount, 0);

  const monthLabel = new Date(year, month - 1, 1).toLocaleString("en-IN", { month: "long", year: "numeric" });

  const prevMonth = () => {
    if (month === 1) { setMonth(12); setYear((y) => y - 1); }
    else setMonth((m) => m - 1);
  };
  const nextMonth = () => {
    if (month === 12) { setMonth(1); setYear((y) => y + 1); }
    else setMonth((m) => m + 1);
  };

  const invalidate = () => queryClient.invalidateQueries({ queryKey: getListExpensesQueryKey({ month, year }) });

  const openCreate = () => { setEditing(null); setForm(EMPTY); setDialogOpen(true); };
  const openEdit   = (e: Expense) => {
    setEditing(e);
    setForm({ description: e.description, amount: String(e.amount), category: e.category, date: e.date });
    setDialogOpen(true);
  };

  const handleSubmit = () => {
    const amount = parseFloat(form.amount);
    if (!form.description.trim() || !form.category || !form.date || isNaN(amount) || amount <= 0) {
      toast({ title: "Please fill all fields with valid values", variant: "destructive" });
      return;
    }
    const data = { description: form.description.trim(), amount, category: form.category, date: form.date };
    if (editing) {
      updateExpense.mutate({ id: editing.id, data }, {
        onSuccess: () => { toast({ title: "Expense updated" }); setDialogOpen(false); invalidate(); },
        onError:   () => toast({ title: "Failed to update expense", variant: "destructive" }),
      });
    } else {
      createExpense.mutate({ data }, {
        onSuccess: () => { toast({ title: "Expense added" }); setDialogOpen(false); invalidate(); },
        onError:   () => toast({ title: "Failed to add expense", variant: "destructive" }),
      });
    }
  };

  const handleDelete = (id: number) => {
    deleteExpense.mutate({ id }, {
      onSuccess: () => { toast({ title: "Expense deleted" }); invalidate(); },
      onError:   () => toast({ title: "Failed to delete expense", variant: "destructive" }),
    });
  };

  const byCategory = CATEGORIES.map((cat) => ({
    cat,
    total: expenses.filter((e) => e.category === cat).reduce((s, e) => s + e.amount, 0),
  })).filter((c) => c.total > 0);

  return (
    <DashboardLayout title="Expense Management">
      <div className="space-y-5">

        {/* Month navigator + Add button */}
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-1 bg-card border border-border rounded-2xl p-1">
            <button onClick={prevMonth} className="p-2 rounded-xl hover:bg-secondary transition-colors">
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="text-sm font-semibold px-2 min-w-[130px] text-center">{monthLabel}</span>
            <button onClick={nextMonth} className="p-2 rounded-xl hover:bg-secondary transition-colors">
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
          <Button size="sm" className="rounded-xl h-9 gap-1.5 shrink-0" onClick={openCreate}>
            <Plus className="w-4 h-4" /> Add Expense
          </Button>
        </div>

        {/* Summary card */}
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-card border border-border rounded-2xl p-4 card-shadow">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-rose-500 to-rose-600 flex items-center justify-center mb-3">
              <TrendingDown className="w-4 h-4 text-white" />
            </div>
            <div className="text-2xl font-extrabold">₹{totalAmount.toFixed(0)}</div>
            <div className="text-xs text-muted-foreground mt-0.5 font-medium">Total Expenses</div>
          </div>
          <div className="bg-card border border-border rounded-2xl p-4 card-shadow">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-amber-500 to-amber-600 flex items-center justify-center mb-3">
              <Wallet className="w-4 h-4 text-white" />
            </div>
            <div className="text-2xl font-extrabold">{expenses.length}</div>
            <div className="text-xs text-muted-foreground mt-0.5 font-medium">Transactions</div>
          </div>
        </div>

        {/* Category breakdown (only if data) */}
        {byCategory.length > 0 && (
          <div className="bg-card border border-border rounded-2xl p-4 card-shadow">
            <h3 className="text-sm font-bold mb-3 flex items-center gap-2">
              <Tag className="w-4 h-4 text-muted-foreground" /> By Category
            </h3>
            <div className="space-y-2.5">
              {byCategory.sort((a, b) => b.total - a.total).map(({ cat, total }) => {
                const pct = Math.round((total / totalAmount) * 100);
                return (
                  <div key={cat}>
                    <div className="flex items-center justify-between mb-1">
                      <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${CATEGORY_STYLE[cat] ?? CATEGORY_STYLE.Other}`}>{cat}</span>
                      <span className="text-xs font-bold">₹{total.toFixed(0)} <span className="text-muted-foreground font-normal">({pct}%)</span></span>
                    </div>
                    <div className="h-1.5 rounded-full bg-secondary overflow-hidden">
                      <div className="h-full rounded-full bg-primary transition-all" style={{ width: `${pct}%` }} />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Expense list */}
        <div className="bg-card border border-border rounded-2xl overflow-hidden card-shadow">
          <div className="px-5 py-4 border-b border-border flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Wallet className="w-4 h-4 text-muted-foreground" />
              <h3 className="font-bold text-sm">Expenses</h3>
              {expenses.length > 0 && (
                <span className="text-xs bg-secondary text-muted-foreground font-bold px-2 py-0.5 rounded-full">{expenses.length}</span>
              )}
            </div>
          </div>

          {isLoading ? (
            <div className="divide-y divide-border">
              {[1, 2, 3].map((i) => (
                <div key={i} className="px-4 py-4">
                  <div className="h-4 bg-secondary rounded animate-pulse w-2/3 mb-2" />
                  <div className="h-3 bg-secondary rounded animate-pulse w-1/3" />
                </div>
              ))}
            </div>
          ) : expenses.length === 0 ? (
            <div className="text-center py-14 text-muted-foreground">
              <div className="w-14 h-14 rounded-full bg-secondary flex items-center justify-center mx-auto mb-3">
                <Wallet className="w-6 h-6 opacity-40" />
              </div>
              <p className="font-medium">No expenses recorded</p>
              <p className="text-xs mt-0.5">Tap "Add Expense" to log one</p>
            </div>
          ) : (
            <div className="divide-y divide-border">
              {expenses.map((expense) => (
                <div key={expense.id} className="px-4 py-4">
                  {/* Top: description + amount */}
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-sm truncate">{expense.description}</p>
                      <div className="flex items-center gap-2 mt-1 flex-wrap">
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${CATEGORY_STYLE[expense.category] ?? CATEGORY_STYLE.Other}`}>
                          {expense.category}
                        </span>
                        <span className="text-[10px] text-muted-foreground">
                          {new Date(expense.date).toLocaleDateString("en-IN", { dateStyle: "medium" })}
                        </span>
                      </div>
                    </div>
                    <div className="font-extrabold text-lg text-rose-600 shrink-0">₹{expense.amount.toFixed(0)}</div>
                  </div>
                  {/* Bottom: action buttons */}
                  <div className="flex gap-2 mt-3">
                    <Button variant="outline" size="sm" className="flex-1 rounded-xl h-9 text-sm gap-1.5" onClick={() => openEdit(expense)}>
                      <Pencil className="w-3.5 h-3.5" /> Edit
                    </Button>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="outline" size="sm" className="rounded-xl h-9 px-3 text-destructive border-destructive/30 hover:bg-destructive/10 hover:text-destructive">
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent className="mx-4 rounded-2xl">
                        <AlertDialogHeader>
                          <AlertDialogTitle>Delete Expense?</AlertDialogTitle>
                          <AlertDialogDescription>
                            "{expense.description}" for ₹{expense.amount.toFixed(0)} will be permanently deleted.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel className="rounded-xl">Cancel</AlertDialogCancel>
                          <AlertDialogAction className="rounded-xl bg-destructive hover:bg-destructive/90" onClick={() => handleDelete(expense.id)}>
                            Delete
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Add / Edit dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-sm w-[calc(100vw-2rem)] rounded-2xl max-h-[90vh] flex flex-col p-0 gap-0">
          <DialogHeader className="px-5 pt-5 pb-4 border-b border-border shrink-0">
            <DialogTitle>{editing ? "Edit Expense" : "Add New Expense"}</DialogTitle>
          </DialogHeader>
          <div className="overflow-y-auto flex-1 px-5 py-4 space-y-4">
            <div className="space-y-1.5">
              <Label className="text-sm font-semibold">Description</Label>
              <Input
                placeholder="e.g. Vegetable stock purchase"
                value={form.description}
                onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                className="rounded-xl"
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-sm font-semibold">Amount (₹)</Label>
              <Input
                type="number"
                min="0"
                step="0.01"
                placeholder="e.g. 1500"
                value={form.amount}
                onChange={(e) => setForm((f) => ({ ...f, amount: e.target.value }))}
                className="rounded-xl"
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-sm font-semibold">Category</Label>
              <div className="grid grid-cols-2 gap-2">
                {CATEGORIES.map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setForm((f) => ({ ...f, category: cat }))}
                    className={`text-xs font-semibold px-3 py-2.5 rounded-xl border-2 transition-all text-left ${
                      form.category === cat
                        ? `${CATEGORY_STYLE[cat] ?? ""} border-current/30 ring-2 ring-primary/20`
                        : "border-border hover:border-primary/30 bg-card text-foreground"
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>
            <div className="space-y-1.5">
              <Label className="text-sm font-semibold">Date</Label>
              <Input
                type="date"
                value={form.date}
                onChange={(e) => setForm((f) => ({ ...f, date: e.target.value }))}
                className="rounded-xl"
              />
            </div>
          </div>
          <DialogFooter className="px-5 py-4 border-t border-border shrink-0 gap-2 flex-row">
            <Button variant="outline" className="flex-1 rounded-xl" onClick={() => setDialogOpen(false)}>Cancel</Button>
            <Button className="flex-1 rounded-xl font-semibold" onClick={handleSubmit} disabled={createExpense.isPending || updateExpense.isPending}>
              {editing ? "Save Changes" : "Add Expense"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
}
