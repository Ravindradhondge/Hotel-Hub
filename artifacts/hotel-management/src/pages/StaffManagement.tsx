import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useListUsers, useCreateUser, useUpdateUser, useDeleteUser, getListUsersQueryKey, User } from "@workspace/api-client-react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Plus, Pencil, Trash2, Users } from "lucide-react";

const ROLE_STYLE: Record<string, string> = {
  owner:      "bg-violet-100 text-violet-700 border-violet-200",
  waiter:     "bg-sky-100 text-sky-700 border-sky-200",
  kitchen:    "bg-amber-100 text-amber-700 border-amber-200",
  accountant: "bg-emerald-100 text-emerald-700 border-emerald-200",
};

const ROLE_AVATAR: Record<string, string> = {
  owner:      "bg-violet-100 text-violet-700",
  waiter:     "bg-sky-100 text-sky-700",
  kitchen:    "bg-amber-100 text-amber-700",
  accountant: "bg-emerald-100 text-emerald-700",
};

interface StaffForm { name: string; email: string; role: string; password: string; }
const EMPTY: StaffForm = { name: "", email: "", role: "waiter", password: "" };

export default function StaffManagement() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<User | null>(null);
  const [form, setForm] = useState<StaffForm>(EMPTY);

  const { data: users = [], isLoading } = useListUsers();
  const createUser = useCreateUser();
  const updateUser = useUpdateUser();
  const deleteUser = useDeleteUser();

  const openCreate = () => { setEditing(null); setForm(EMPTY); setDialogOpen(true); };
  const openEdit = (user: User) => { setEditing(user); setForm({ name: user.name, email: user.email, role: user.role, password: "" }); setDialogOpen(true); };

  const handleSubmit = () => {
    if (!form.name || !form.email || !form.role) { toast({ title: "Please fill required fields", variant: "destructive" }); return; }
    if (editing) {
      const data: any = { name: form.name, email: form.email, role: form.role as any };
      if (form.password) data.password = form.password;
      updateUser.mutate({ id: editing.id, data }, { onSuccess: () => { toast({ title: "Staff updated" }); setDialogOpen(false); queryClient.invalidateQueries({ queryKey: getListUsersQueryKey() }); }, onError: () => toast({ title: "Failed to update", variant: "destructive" }) });
    } else {
      if (!form.password) { toast({ title: "Password is required for new staff", variant: "destructive" }); return; }
      createUser.mutate({ data: { name: form.name, email: form.email, role: form.role as any, password: form.password } }, { onSuccess: () => { toast({ title: "Staff added" }); setDialogOpen(false); queryClient.invalidateQueries({ queryKey: getListUsersQueryKey() }); }, onError: () => toast({ title: "Failed to create", variant: "destructive" }) });
    }
  };

  const handleDelete = (id: number) => {
    deleteUser.mutate({ id }, { onSuccess: () => { toast({ title: "Staff removed" }); queryClient.invalidateQueries({ queryKey: getListUsersQueryKey() }); } });
  };

  const byRole: Record<string, number> = { owner: 0, waiter: 0, kitchen: 0, accountant: 0 };
  users.forEach((u) => { if (byRole[u.role] !== undefined) byRole[u.role]++; });

  return (
    <DashboardLayout title="Staff Management">
      <div className="space-y-5">

        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="text-xs text-muted-foreground font-medium">{users.length} staff members</div>
          <Button onClick={openCreate} className="rounded-xl h-9 font-semibold">
            <Plus className="w-4 h-4 mr-1.5" /> Add Staff
          </Button>
        </div>

        {/* Role summary cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {(["owner", "waiter", "kitchen", "accountant"] as const).map((role) => (
            <div key={role} className={`border rounded-2xl p-4 card-shadow ${ROLE_STYLE[role]}`}>
              <div className="text-2xl font-extrabold">{byRole[role]}</div>
              <div className="text-xs font-semibold capitalize mt-0.5 opacity-70">{role}s</div>
            </div>
          ))}
        </div>

        {/* ── Mobile card list ── */}
        <div className="md:hidden space-y-2">
          {isLoading ? (
            [...Array(3)].map((_, i) => <div key={i} className="h-20 rounded-2xl bg-secondary animate-pulse" />)
          ) : users.length === 0 ? (
            <div className="text-center py-16 text-muted-foreground">
              <Users className="w-8 h-8 mx-auto mb-2 opacity-30" />
              <p className="font-medium">No staff members yet</p>
            </div>
          ) : users.map((user) => (
            <div key={user.id} className="bg-card border border-border rounded-2xl p-4 card-shadow flex items-center gap-3">
              <div className={`w-11 h-11 rounded-xl flex items-center justify-center text-base font-extrabold shrink-0 ${ROLE_AVATAR[user.role] ?? "bg-secondary text-primary"}`}>
                {user.name.charAt(0).toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-semibold text-sm truncate">{user.name}</div>
                <div className="text-xs text-muted-foreground truncate">{user.email}</div>
                <span className={`inline-block mt-1 text-[10px] font-bold uppercase tracking-wide px-2 py-0.5 rounded-full border ${ROLE_STYLE[user.role] ?? "bg-secondary"}`}>{user.role}</span>
              </div>
              <div className="flex items-center gap-1 shrink-0">
                <Button variant="outline" size="icon" className="w-9 h-9 rounded-xl" onClick={() => openEdit(user)}>
                  <Pencil className="w-4 h-4" />
                </Button>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="outline" size="icon" className="w-9 h-9 rounded-xl text-destructive border-destructive/30 hover:bg-destructive/10">
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent className="rounded-2xl mx-4">
                    <AlertDialogHeader><AlertDialogTitle>Remove {user.name}?</AlertDialogTitle><AlertDialogDescription>This will permanently remove this staff member.</AlertDialogDescription></AlertDialogHeader>
                    <AlertDialogFooter><AlertDialogCancel className="rounded-xl">Cancel</AlertDialogCancel><AlertDialogAction onClick={() => handleDelete(user.id)} className="bg-destructive hover:bg-destructive/90 rounded-xl">Remove</AlertDialogAction></AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            </div>
          ))}
        </div>

        {/* ── Desktop table ── */}
        <div className="hidden md:block bg-card border border-border rounded-2xl overflow-hidden card-shadow">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border bg-secondary/40">
                <th className="text-left px-4 py-3 text-xs font-bold text-muted-foreground uppercase tracking-wide">Name</th>
                <th className="text-left px-4 py-3 text-xs font-bold text-muted-foreground uppercase tracking-wide">Email</th>
                <th className="text-left px-4 py-3 text-xs font-bold text-muted-foreground uppercase tracking-wide">Role</th>
                <th className="text-left px-4 py-3 text-xs font-bold text-muted-foreground uppercase tracking-wide hidden lg:table-cell">Joined</th>
                <th className="text-right px-4 py-3 text-xs font-bold text-muted-foreground uppercase tracking-wide">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {isLoading ? (
                [...Array(3)].map((_, i) => (
                  <tr key={i}><td colSpan={5} className="px-4 py-3"><div className="h-8 rounded-lg bg-secondary/50 animate-pulse" /></td></tr>
                ))
              ) : users.length === 0 ? (
                <tr>
                  <td colSpan={5} className="text-center py-16 text-muted-foreground">
                    <Users className="w-8 h-8 mx-auto mb-2 opacity-30" />
                    <p className="font-medium">No staff members yet</p>
                  </td>
                </tr>
              ) : users.map((user) => (
                <tr key={user.id} className="hover:bg-secondary/20 transition-colors">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className={`w-9 h-9 rounded-xl flex items-center justify-center text-sm font-extrabold shrink-0 ${ROLE_AVATAR[user.role] ?? "bg-secondary text-primary"}`}>
                        {user.name.charAt(0).toUpperCase()}
                      </div>
                      <span className="font-semibold text-sm">{user.name}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground text-sm">{user.email}</td>
                  <td className="px-4 py-3">
                    <span className={`text-[10px] font-bold uppercase tracking-wide px-2.5 py-1 rounded-full border capitalize ${ROLE_STYLE[user.role] ?? "bg-secondary text-secondary-foreground"}`}>{user.role}</span>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground text-xs hidden lg:table-cell">{new Date(user.createdAt).toLocaleDateString("en-IN", { dateStyle: "medium" })}</td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <Button variant="ghost" size="icon" className="w-8 h-8 rounded-lg" onClick={() => openEdit(user)}><Pencil className="w-3.5 h-3.5" /></Button>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="ghost" size="icon" className="w-8 h-8 rounded-lg text-destructive hover:text-destructive"><Trash2 className="w-3.5 h-3.5" /></Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent className="rounded-2xl">
                          <AlertDialogHeader><AlertDialogTitle>Remove {user.name}?</AlertDialogTitle><AlertDialogDescription>This will permanently remove this staff member.</AlertDialogDescription></AlertDialogHeader>
                          <AlertDialogFooter><AlertDialogCancel className="rounded-xl">Cancel</AlertDialogCancel><AlertDialogAction onClick={() => handleDelete(user.id)} className="bg-destructive hover:bg-destructive/90 rounded-xl">Remove</AlertDialogAction></AlertDialogFooter>
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

      {/* Add/edit dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-sm rounded-2xl mx-4">
          <DialogHeader><DialogTitle>{editing ? "Edit Staff Member" : "Add Staff Member"}</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div className="space-y-1.5"><Label className="font-semibold text-sm">Full Name *</Label><Input value={form.name} onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))} placeholder="John Doe" className="rounded-xl" /></div>
            <div className="space-y-1.5"><Label className="font-semibold text-sm">Email *</Label><Input type="email" value={form.email} onChange={(e) => setForm((p) => ({ ...p, email: e.target.value }))} placeholder="john@hotel.com" className="rounded-xl" /></div>
            <div className="space-y-1.5">
              <Label className="font-semibold text-sm">Role *</Label>
              <Select value={form.role} onValueChange={(v) => setForm((p) => ({ ...p, role: v }))}>
                <SelectTrigger className="rounded-xl"><SelectValue /></SelectTrigger>
                <SelectContent className="rounded-xl">
                  <SelectItem value="waiter">Waiter</SelectItem>
                  <SelectItem value="kitchen">Kitchen Staff</SelectItem>
                  <SelectItem value="accountant">Accountant</SelectItem>
                  <SelectItem value="owner">Owner</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5"><Label className="font-semibold text-sm">{editing ? "New Password (leave blank to keep)" : "Password *"}</Label><Input type="password" value={form.password} onChange={(e) => setForm((p) => ({ ...p, password: e.target.value }))} placeholder="••••••••" className="rounded-xl" /></div>
          </div>
          <DialogFooter className="gap-2">
            <Button variant="outline" className="rounded-xl" onClick={() => setDialogOpen(false)}>Cancel</Button>
            <Button className="rounded-xl font-semibold" onClick={handleSubmit} disabled={createUser.isPending || updateUser.isPending}>{editing ? "Save Changes" : "Add Staff"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
}
