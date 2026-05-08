import { useState, useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import {
  useListTables, useGetTablesSummary, useListMenuItems, useListMenuCategories,
  useCreateOrder, useUpdateOrder, useListOrders,
  getListTablesQueryKey, getGetTablesSummaryQueryKey, getListOrdersQueryKey,
  Table, MenuItem, Order
} from "@workspace/api-client-react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { io } from "socket.io-client";
import { Plus, Minus, Search, X, Clock } from "lucide-react";

const STATUS_COLORS: Record<string, string> = {
  available: "bg-emerald-50 border-emerald-200 text-emerald-800",
  occupied: "bg-blue-50 border-blue-200 text-blue-800",
  cooking: "bg-amber-50 border-amber-200 text-amber-800",
  ready: "bg-violet-50 border-violet-200 text-violet-800",
  billing: "bg-rose-50 border-rose-200 text-rose-800",
};

const STATUS_DOTS: Record<string, string> = {
  available: "bg-emerald-500",
  occupied: "bg-blue-500",
  cooking: "bg-amber-500",
  ready: "bg-violet-500",
  billing: "bg-rose-500",
};

interface CartItem { menuItemId: number; name: string; price: number; quantity: number; notes: string; }

export default function WaiterDashboard() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const { data: tables = [], isLoading } = useListTables();
  const { data: summary } = useGetTablesSummary();
  const { data: allOrders = [] } = useListOrders({}, { query: { queryKey: getListOrdersQueryKey({}) } });
  const { data: menuItems = [] } = useListMenuItems();
  const { data: categories = [] } = useListMenuCategories();

  const createOrder = useCreateOrder();
  const updateOrder = useUpdateOrder();

  const [selectedTable, setSelectedTable] = useState<Table | null>(null);
  const [orderDialogOpen, setOrderDialogOpen] = useState(false);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [menuSearch, setMenuSearch] = useState("");
  const [menuCategory, setMenuCategory] = useState("all");
  const [orderNotes, setOrderNotes] = useState("");
  const [viewOrderTable, setViewOrderTable] = useState<Table | null>(null);

  useEffect(() => {
    const socket = io();
    socket.on("order:updated", () => {
      queryClient.invalidateQueries({ queryKey: getListTablesQueryKey() });
      queryClient.invalidateQueries({ queryKey: getGetTablesSummaryQueryKey() });
      queryClient.invalidateQueries({ queryKey: getListOrdersQueryKey({}) });
    });
    socket.on("order:new", () => {
      queryClient.invalidateQueries({ queryKey: getListTablesQueryKey() });
      queryClient.invalidateQueries({ queryKey: getGetTablesSummaryQueryKey() });
    });
    return () => { socket.disconnect(); };
  }, [queryClient]);

  const filteredMenu = menuItems.filter(
    (m) => m.available &&
      (menuCategory === "all" || m.category === menuCategory) &&
      m.name.toLowerCase().includes(menuSearch.toLowerCase())
  );

  const addToCart = (item: MenuItem) => {
    setCart((prev) => {
      const existing = prev.find((c) => c.menuItemId === item.id);
      if (existing) return prev.map((c) => c.menuItemId === item.id ? { ...c, quantity: c.quantity + 1 } : c);
      return [...prev, { menuItemId: item.id, name: item.name, price: item.price, quantity: 1, notes: "" }];
    });
  };

  const removeFromCart = (menuItemId: number) => {
    setCart((prev) => {
      const existing = prev.find((c) => c.menuItemId === menuItemId);
      if (existing && existing.quantity > 1) return prev.map((c) => c.menuItemId === menuItemId ? { ...c, quantity: c.quantity - 1 } : c);
      return prev.filter((c) => c.menuItemId !== menuItemId);
    });
  };

  const cartTotal = cart.reduce((sum, c) => sum + c.price * c.quantity, 0);

  const handleOpenOrder = (table: Table) => {
    setSelectedTable(table);
    setCart([]);
    setOrderNotes("");
    setMenuSearch("");
    setMenuCategory("all");
    setOrderDialogOpen(true);
  };

  const handleSendOrder = () => {
    if (!selectedTable || cart.length === 0) return;
    createOrder.mutate(
      { data: { tableId: selectedTable.id, items: cart.map((c) => ({ menuItemId: c.menuItemId, quantity: c.quantity, notes: c.notes || undefined })), notes: orderNotes || undefined } },
      {
        onSuccess: () => {
          toast({ title: "Order sent to kitchen" });
          setOrderDialogOpen(false);
          queryClient.invalidateQueries({ queryKey: getListTablesQueryKey() });
          queryClient.invalidateQueries({ queryKey: getGetTablesSummaryQueryKey() });
        },
        onError: () => toast({ title: "Failed to send order", variant: "destructive" }),
      }
    );
  };

  const handleRequestBill = (order: Order) => {
    updateOrder.mutate(
      { id: order.id, data: { status: "billing" } },
      {
        onSuccess: () => {
          toast({ title: "Bill requested" });
          queryClient.invalidateQueries({ queryKey: getListTablesQueryKey() });
          queryClient.invalidateQueries({ queryKey: getListOrdersQueryKey({}) });
        },
      }
    );
  };

  const getTableOrder = (tableId: number) => allOrders.find((o) => o.tableId === tableId && ["pending", "preparing", "ready", "billing"].includes(o.status));

  return (
    <DashboardLayout title="Table Management">
      <div className="space-y-6">
        {summary && (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            {[
              { label: "Available", count: summary.available, color: "text-emerald-600" },
              { label: "Occupied", count: summary.occupied, color: "text-blue-600" },
              { label: "Cooking", count: summary.cooking, color: "text-amber-600" },
              { label: "Ready", count: summary.ready, color: "text-violet-600" },
              { label: "Billing", count: summary.billing, color: "text-rose-600" },
              { label: "Total", count: summary.total, color: "text-foreground" },
            ].map((s) => (
              <div key={s.label} className="bg-card border border-border rounded-lg p-3 text-center">
                <div className={`text-2xl font-bold ${s.color}`}>{s.count}</div>
                <div className="text-xs text-muted-foreground mt-0.5">{s.label}</div>
              </div>
            ))}
          </div>
        )}

        {isLoading ? (
          <div className="text-center py-12 text-muted-foreground">Loading tables...</div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {tables.map((table) => {
              const order = getTableOrder(table.id);
              return (
                <div
                  key={table.id}
                  data-testid={`card-table-${table.id}`}
                  className={`relative border-2 rounded-xl p-4 cursor-pointer transition-all hover:shadow-md ${STATUS_COLORS[table.status]}`}
                  onClick={() => table.status === "available" ? handleOpenOrder(table) : setViewOrderTable(table)}
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="text-2xl font-bold">T{table.number}</div>
                    <div className={`w-2.5 h-2.5 rounded-full mt-1 ${STATUS_DOTS[table.status]}`} />
                  </div>
                  <div className="text-xs space-y-1">
                    <div className="font-medium capitalize">{table.status}</div>
                    <div className="opacity-70">{table.capacity} seats</div>
                    {order && <div className="opacity-70">{order.items.length} items</div>}
                  </div>
                  {table.status === "available" && (
                    <div className="mt-3 text-xs font-medium opacity-60">Tap to create order</div>
                  )}
                  {table.status === "ready" && (
                    <div className="mt-2 text-xs font-semibold animate-pulse">Food ready!</div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      <Dialog open={orderDialogOpen} onOpenChange={setOrderDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] flex flex-col p-0">
          <DialogHeader className="p-6 pb-0">
            <DialogTitle>New Order — Table {selectedTable?.number}</DialogTitle>
          </DialogHeader>
          <div className="flex flex-1 min-h-0 gap-0 overflow-hidden">
            <div className="flex-1 flex flex-col border-r border-border overflow-hidden">
              <div className="p-4 space-y-3 border-b border-border">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input className="pl-9" placeholder="Search menu..." value={menuSearch} onChange={(e) => setMenuSearch(e.target.value)} data-testid="input-menu-search" />
                </div>
                <div className="flex gap-2 overflow-x-auto pb-1">
                  <button onClick={() => setMenuCategory("all")} className={`px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap transition-colors ${menuCategory === "all" ? "bg-primary text-primary-foreground" : "bg-secondary text-secondary-foreground hover:bg-secondary/80"}`}>All</button>
                  {categories.map((cat) => (
                    <button key={cat} onClick={() => setMenuCategory(cat)} className={`px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap transition-colors ${menuCategory === cat ? "bg-primary text-primary-foreground" : "bg-secondary text-secondary-foreground hover:bg-secondary/80"}`}>{cat}</button>
                  ))}
                </div>
              </div>
              <div className="flex-1 overflow-y-auto p-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {filteredMenu.map((item) => {
                    const inCart = cart.find((c) => c.menuItemId === item.id);
                    return (
                      <div key={item.id} data-testid={`card-menu-${item.id}`} className="flex items-center justify-between p-3 bg-secondary/30 hover:bg-secondary/60 rounded-lg transition-colors">
                        <div className="flex-1 min-w-0">
                          <div className="font-medium text-sm truncate">{item.name}</div>
                          <div className="text-xs text-muted-foreground">{item.category}</div>
                          <div className="text-sm font-semibold text-primary mt-0.5">₹{item.price}</div>
                        </div>
                        {inCart ? (
                          <div className="flex items-center gap-2 ml-2">
                            <button onClick={() => removeFromCart(item.id)} className="w-7 h-7 rounded-full bg-primary/10 hover:bg-primary/20 flex items-center justify-center transition-colors"><Minus className="w-3.5 h-3.5" /></button>
                            <span className="w-5 text-center font-bold text-sm">{inCart.quantity}</span>
                            <button onClick={() => addToCart(item)} className="w-7 h-7 rounded-full bg-primary text-primary-foreground flex items-center justify-center hover:bg-primary/90 transition-colors"><Plus className="w-3.5 h-3.5" /></button>
                          </div>
                        ) : (
                          <button onClick={() => addToCart(item)} data-testid={`button-add-${item.id}`} className="ml-2 w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center hover:bg-primary/90 transition-colors"><Plus className="w-4 h-4" /></button>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            <div className="w-72 flex flex-col overflow-hidden">
              <div className="p-4 border-b border-border font-medium text-sm">Order Summary ({cart.length} items)</div>
              <div className="flex-1 overflow-y-auto p-4 space-y-2">
                {cart.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-8">Add items from the menu</p>
                ) : (
                  cart.map((item) => (
                    <div key={item.menuItemId} className="flex items-start gap-2">
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-medium truncate">{item.name}</div>
                        <div className="text-xs text-muted-foreground">₹{item.price} × {item.quantity} = ₹{item.price * item.quantity}</div>
                      </div>
                      <div className="flex items-center gap-1">
                        <button onClick={() => removeFromCart(item.menuItemId)} className="w-6 h-6 rounded-full border border-border flex items-center justify-center hover:bg-secondary"><Minus className="w-3 h-3" /></button>
                        <span className="w-4 text-center text-sm">{item.quantity}</span>
                        <button onClick={() => setCart((p) => p.map((c) => c.menuItemId === item.menuItemId ? { ...c, quantity: c.quantity + 1 } : c))} className="w-6 h-6 rounded-full border border-border flex items-center justify-center hover:bg-secondary"><Plus className="w-3 h-3" /></button>
                      </div>
                    </div>
                  ))
                )}
              </div>
              <div className="p-4 border-t border-border space-y-3">
                <Textarea placeholder="Order notes (optional)..." value={orderNotes} onChange={(e) => setOrderNotes(e.target.value)} className="text-sm resize-none h-20" />
                <div className="flex justify-between font-semibold"><span>Total</span><span>₹{cartTotal.toFixed(2)}</span></div>
              </div>
            </div>
          </div>
          <DialogFooter className="p-4 border-t border-border">
            <Button variant="outline" onClick={() => setOrderDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleSendOrder} disabled={cart.length === 0 || createOrder.isPending} data-testid="button-send-order">
              {createOrder.isPending ? "Sending..." : "Send to Kitchen"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={!!viewOrderTable} onOpenChange={() => setViewOrderTable(null)}>
        <DialogContent className="max-w-md">
          {viewOrderTable && (() => {
            const order = getTableOrder(viewOrderTable.id);
            return (
              <>
                <DialogHeader>
                  <DialogTitle>Table {viewOrderTable.number} — {viewOrderTable.status}</DialogTitle>
                </DialogHeader>
                {order ? (
                  <div className="space-y-4">
                    <div className="space-y-2">
                      {order.items.map((item) => (
                        <div key={item.id} className="flex justify-between text-sm">
                          <span>{item.quantity}x {item.menuItemName}</span>
                          <span>₹{item.subtotal.toFixed(2)}</span>
                        </div>
                      ))}
                      <div className="border-t border-border pt-2 flex justify-between font-semibold">
                        <span>Total</span><span>₹{order.totalAmount.toFixed(2)}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-muted-foreground" />
                      <span className="text-sm text-muted-foreground">Status: <span className="font-medium capitalize text-foreground">{order.status}</span></span>
                    </div>
                    {order.status === "ready" && (
                      <Button className="w-full" onClick={() => { handleRequestBill(order); setViewOrderTable(null); }} data-testid="button-request-bill">Request Bill</Button>
                    )}
                    {order.status === "billing" && (
                      <div className="text-center text-sm text-muted-foreground">Bill requested — waiting for payment</div>
                    )}
                  </div>
                ) : (
                  <p className="text-muted-foreground text-sm">No active order</p>
                )}
              </>
            );
          })()}
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
}
