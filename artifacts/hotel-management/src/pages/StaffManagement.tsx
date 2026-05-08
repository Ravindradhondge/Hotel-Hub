import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useListUsers, useCreateUser, useUpdateUser, useDeleteUser, getListUsersQueryKey, User } from "@workspace/api-client-react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Plus, Pencil, Trash2 } from "lucide-react";

const ROLE_COLORS: Record<string, string> = {
  owner: "bg-primary/10 text-primary border-primary/20",
  waiter: "bg-blue-100 text-blue-700 border-blue-200",
  kitchen: "bg-amber-100 text-amber-700 border-amber-200",
  accountant: "bg-violet-100 text-violet-700 border-violet-200",
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

  const byRole = ["owner", "waiter", "kitchen", "accountant"].reduce((acc, role) => {
    acc[role] = users.filter((u) => u.role === role);
    return acc;
  }, {} as Record<string, User[]>);

  return (
    <DashboardLayout title="Staff Management">
      <div className="space-y-5">
        <div className="flex justify-between items-center">
          <div className="text-sm text-muted-foreground">{users.length} staff members</div>
          <Button onClick={openCreate} data-testid="button-add-staff"><Plus className="w-4 h-4 mr-2" />Add Staff</Button>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {["owner", "waiter", "kitchen", "accountant"].map((role) => (
            <div key={role} className="bg-card border border-border rounded-xl p-4 text-center">
              <div className="text-2xl font-bold">{byRole[role]?.length ?? 0}</div>
              <div className="text-sm text-muted-foreground mt-1 capitalize">{role}s</div>
            </div>
          ))}
        </div>

        <div className="bg-card border border-border rounded-xl overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border bg-secondary/30">
                <th className="text-left px-4 py-3 text-sm font-medium text-muted-foreground">Name</th>
                <th className="text-left px-4 py-3 text-sm font-medium text-muted-foreground">Email</th>
                <th className="text-left px-4 py-3 text-sm font-medium text-muted-foreground">Role</th>
                <th className="text-left px-4 py-3 text-sm font-medium text-muted-foreground">Joined</th>
                <th className="text-right px-4 py-3 text-sm font-medium text-muted-foreground">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {isLoading ? (
                <tr><td colSpan={5} className="text-center py-10 text-muted-foreground">Loading...</td></tr>
              ) : users.length === 0 ? (
                <tr><td colSpan={5} className="text-center py-10 text-muted-foreground">No staff found</td></tr>
              ) : users.map((user) => (
                <tr key={user.id} data-testid={`row-user-${user.id}`} className="hover:bg-secondary/20 transition-colors">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center text-sm font-bold text-primary">{user.name.charAt(0).toUpperCase()}</div>
                      <span className="font-medium">{user.name}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground text-sm">{user.email}</td>
                  <td className="px-4 py-3">
                    <span className={`text-xs font-medium px-2.5 py-1 rounded-full border capitalize ${ROLE_COLORS[user.role]}`}>{user.role}</span>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground text-sm">{new Date(user.createdAt).toLocaleDateString()}</td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Button variant="ghost" size="icon" onClick={() => openEdit(user)} data-testid={`button-edit-${user.id}`}><Pencil className="w-4 h-4" /></Button>
                      <AlertDialog>
                        <AlertDialogTrigger asChild><Button variant="ghost" size="icon" className="text-destructive hover:text-destructive" data-testid={`button-delete-${user.id}`}><Trash2 className="w-4 h-4" /></Button></AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader><AlertDialogTitle>Remove {user.name}?</AlertDialogTitle><AlertDialogDescription>This will permanently remove this staff member.</AlertDialogDescription></AlertDialogHeader>
                          <AlertDialogFooter><AlertDialogCancel>Cancel</AlertDialogCancel><AlertDialogAction onClick={() => handleDelete(user.id)} className="bg-destructive hover:bg-destructive/90">Remove</AlertDialogAction></AlertDialogFooter>
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
          <DialogHeader><DialogTitle>{editing ? "Edit Staff" : "Add Staff Member"}</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2"><Label>Full Name *</Label><Input value={form.name} onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))} placeholder="John Doe" data-testid="input-name" /></div>
            <div className="space-y-2"><Label>Email *</Label><Input type="email" value={form.email} onChange={(e) => setForm((p) => ({ ...p, email: e.target.value }))} placeholder="john@hotel.com" data-testid="input-email" /></div>
            <div className="space-y-2">
              <Label>Role *</Label>
              <Select value={form.role} onValueChange={(v) => setForm((p) => ({ ...p, role: v }))}>
                <SelectTrigger data-testid="select-role"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="waiter">Waiter</SelectItem>
                  <SelectItem value="kitchen">Kitchen Staff</SelectItem>
                  <SelectItem value="accountant">Accountant</SelectItem>
                  <SelectItem value="owner">Owner</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2"><Label>{editing ? "New Password (leave blank to keep)" : "Password *"}</Label><Input type="password" value={form.password} onChange={(e) => setForm((p) => ({ ...p, password: e.target.value }))} placeholder="••••••••" data-testid="input-password" /></div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleSubmit} disabled={createUser.isPending || updateUser.isPending} data-testid="button-save">{editing ? "Save Changes" : "Add Staff"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
}
