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
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { io } from "socket.io-client";
import { Plus, Minus, Search, Clock, ShoppingBag, Flame, CheckCircle2, Receipt, UtensilsCrossed, ChevronRight } from "lucide-react";

const TABLE_STATUS_STYLE: Record<string, { card: string; dot: string; label: string }> = {
  available: { card: "bg-emerald-50 border-emerald-300 hover:border-emerald-400", dot: "bg-emerald-500", label: "text-emerald-700" },
  occupied:  { card: "bg-sky-50 border-sky-300 hover:border-sky-400",             dot: "bg-sky-500",     label: "text-sky-700" },
  cooking:   { card: "bg-amber-50 border-amber-300 hover:border-amber-400",        dot: "bg-amber-500",   label: "text-amber-700" },
  ready:     { card: "bg-violet-50 border-violet-300 hover:border-violet-400",     dot: "bg-violet-500",  label: "text-violet-700" },
  billing:   { card: "bg-rose-50 border-rose-300 hover:border-rose-400",           dot: "bg-rose-500",    label: "text-rose-700" },
};

const TABLE_STATUS_ICON: Record<string, JSX.Element> = {
  available:  <UtensilsCrossed className="w-4 h-4 opacity-40" />,
  occupied:   <Clock className="w-4 h-4 opacity-60" />,
  cooking:    <Flame className="w-4 h-4 opacity-70" />,
  ready:      <CheckCircle2 className="w-4 h-4 opacity-80" />,
  billing:    <Receipt className="w-4 h-4 opacity-80" />,
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
  const [activeTab, setActiveTab] = useState<"menu" | "cart">("menu");

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
  const cartCount = cart.reduce((sum, c) => sum + c.quantity, 0);

  const handleOpenOrder = (table: Table) => {
    setSelectedTable(table);
    setCart([]);
    setOrderNotes("");
    setMenuSearch("");
    setMenuCategory("all");
    setActiveTab("menu");
    setOrderDialogOpen(true);
  };

  const handleSendOrder = () => {
    if (!selectedTable || cart.length === 0) return;
    createOrder.mutate(
      { data: { tableId: selectedTable.id, items: cart.map((c) => ({ menuItemId: c.menuItemId, quantity: c.quantity, notes: c.notes || undefined })), notes: orderNotes || undefined } },
      {
        onSuccess: () => {
          toast({ title: "Order sent to kitchen!" });
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

  const getTableOrder = (tableId: number) =>
    allOrders.find((o) => o.tableId === tableId && ["pending", "preparing", "ready", "billing"].includes(o.status));

  return (
    <DashboardLayout title="Table Management">
      <div className="space-y-5">

        {/* ── Summary bar ── */}
        {summary && (
          <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
            {[
              { label: "Available", count: summary.available, dot: "bg-emerald-500" },
              { label: "Occupied",  count: summary.occupied,  dot: "bg-sky-500" },
              { label: "Cooking",   count: summary.cooking,   dot: "bg-amber-500" },
              { label: "Ready",     count: summary.ready,     dot: "bg-violet-500" },
              { label: "Billing",   count: summary.billing,   dot: "bg-rose-500" },
              { label: "Total",     count: summary.total,     dot: "bg-slate-400" },
            ].map((s) => (
              <div key={s.label} className="bg-card border border-border rounded-xl p-3 text-center flex flex-col items-center gap-1">
                <div className={`w-2 h-2 rounded-full ${s.dot}`} />
                <div className="text-xl font-bold leading-none">{s.count}</div>
                <div className="text-[10px] text-muted-foreground uppercase tracking-wide">{s.label}</div>
              </div>
            ))}
          </div>
        )}

        {/* ── Table grid ── */}
        {isLoading ? (
          <div className="text-center py-12 text-muted-foreground">Loading tables…</div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
            {tables.map((table) => {
              const order = getTableOrder(table.id);
              const style = TABLE_STATUS_STYLE[table.status] ?? TABLE_STATUS_STYLE.available;
              return (
                <div
                  key={table.id}
                  data-testid={`card-table-${table.id}`}
                  className={`relative border-2 rounded-2xl p-4 cursor-pointer transition-all active:scale-95 select-none ${style.card}`}
                  onClick={() => table.status === "available" ? handleOpenOrder(table) : setViewOrderTable(table)}
                >
                  <div className="flex items-start justify-between mb-2">
                    <span className="text-2xl font-extrabold tracking-tight">T{table.number}</span>
                    <span className={`flex items-center gap-1 text-[10px] font-semibold uppercase tracking-wide ${style.label}`}>
                      {TABLE_STATUS_ICON[table.status]}
                    </span>
                  </div>
                  <div className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wide mb-2 ${style.label} bg-white/60`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${style.dot}`} />
                    {table.status}
                  </div>
                  <div className="text-xs text-muted-foreground space-y-0.5">
                    <div>{table.capacity} seats</div>
                    {order && <div className="font-medium">{order.items.length} item{order.items.length !== 1 ? "s" : ""}</div>}
                  </div>
                  {table.status === "available" && (
                    <div className="mt-2 flex items-center gap-1 text-[10px] font-medium text-emerald-600">
                      <Plus className="w-3 h-3" /> New order
                    </div>
                  )}
                  {table.status === "ready" && (
                    <div className="mt-2 text-[10px] font-bold text-violet-600 animate-pulse">🍽 Food ready!</div>
                  )}
                  {table.status !== "available" && (
                    <div className="mt-2 flex items-center gap-0.5 text-[10px] text-muted-foreground">
                      View <ChevronRight className="w-3 h-3" />
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* ── Order creation dialog ── */}
      <Dialog open={orderDialogOpen} onOpenChange={setOrderDialogOpen}>
        <DialogContent className="max-w-4xl w-full h-[92vh] sm:h-[88vh] flex flex-col p-0 gap-0 overflow-hidden rounded-2xl">

          {/* Header */}
          <DialogHeader className="px-5 pt-5 pb-3 border-b border-border shrink-0">
            <DialogTitle className="text-base font-bold flex items-center gap-2">
              <UtensilsCrossed className="w-4 h-4 text-primary" />
              New Order — Table {selectedTable?.number}
            </DialogTitle>
            {/* Mobile tabs */}
            <div className="flex sm:hidden gap-1 mt-3">
              <button
                onClick={() => setActiveTab("menu")}
                className={`flex-1 py-2 rounded-xl text-sm font-semibold transition-colors ${activeTab === "menu" ? "bg-primary text-primary-foreground" : "bg-secondary text-muted-foreground"}`}
              >
                Menu
              </button>
              <button
                onClick={() => setActiveTab("cart")}
                className={`flex-1 py-2 rounded-xl text-sm font-semibold transition-colors relative ${activeTab === "cart" ? "bg-primary text-primary-foreground" : "bg-secondary text-muted-foreground"}`}
              >
                Cart
                {cartCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-rose-500 text-white text-[10px] font-bold flex items-center justify-center">
                    {cartCount}
                  </span>
                )}
              </button>
            </div>
          </DialogHeader>

          {/* Body */}
          <div className="flex flex-1 min-h-0 overflow-hidden">

            {/* ── Menu panel (always visible on desktop, tab-controlled on mobile) ── */}
            <div className={`flex flex-col flex-1 min-w-0 overflow-hidden ${activeTab === "cart" ? "hidden sm:flex" : "flex"}`}>
              {/* Search + category */}
              <div className="px-4 pt-3 pb-2 space-y-2 shrink-0 border-b border-border bg-card/50">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input className="pl-9 h-9 text-sm" placeholder="Search dishes…" value={menuSearch} onChange={(e) => setMenuSearch(e.target.value)} data-testid="input-menu-search" />
                </div>
                <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-none">
                  {["all", ...categories].map((cat) => (
                    <button
                      key={cat}
                      onClick={() => setMenuCategory(cat)}
                      className={`px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap transition-colors shrink-0 ${menuCategory === cat ? "bg-primary text-primary-foreground shadow-sm" : "bg-muted text-muted-foreground hover:bg-secondary"}`}
                    >
                      {cat === "all" ? "All" : cat}
                    </button>
                  ))}
                </div>
              </div>

              {/* Menu items */}
              <div className="flex-1 overflow-y-auto p-3">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {filteredMenu.length === 0 && (
                    <p className="col-span-2 text-center text-sm text-muted-foreground py-10">No items found</p>
                  )}
                  {filteredMenu.map((item) => {
                    const inCart = cart.find((c) => c.menuItemId === item.id);
                    return (
                      <div
                        key={item.id}
                        data-testid={`card-menu-${item.id}`}
                        className="flex items-center gap-3 p-3 bg-card border border-border rounded-xl hover:border-primary/40 hover:shadow-sm transition-all"
                      >
                        {/* Veg/Non-veg indicator dot */}
                        <div className="shrink-0 w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center text-primary font-bold text-sm">
                          {item.name.charAt(0).toUpperCase()}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="font-semibold text-sm leading-tight truncate">{item.name}</div>
                          <div className="text-[10px] text-muted-foreground uppercase tracking-wide mt-0.5">{item.category}</div>
                          <div className="text-sm font-bold text-primary mt-0.5">₹{item.price}</div>
                        </div>
                        {inCart ? (
                          <div className="flex items-center gap-1.5 shrink-0">
                            <button
                              onClick={() => removeFromCart(item.id)}
                              className="w-7 h-7 rounded-full border-2 border-primary/30 bg-primary/5 hover:bg-primary/15 flex items-center justify-center transition-colors"
                            >
                              <Minus className="w-3 h-3 text-primary" />
                            </button>
                            <span className="w-6 text-center font-bold text-sm text-primary">{inCart.quantity}</span>
                            <button
                              onClick={() => addToCart(item)}
                              className="w-7 h-7 rounded-full bg-primary text-primary-foreground flex items-center justify-center hover:bg-primary/90 transition-colors"
                            >
                              <Plus className="w-3 h-3" />
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={() => addToCart(item)}
                            data-testid={`button-add-${item.id}`}
                            className="shrink-0 w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center hover:bg-primary/90 active:scale-95 transition-all"
                          >
                            <Plus className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Mobile: floating cart button at bottom of menu tab */}
              {cartCount > 0 && activeTab === "menu" && (
                <div className="sm:hidden px-4 py-3 border-t border-border bg-card shrink-0">
                  <button
                    onClick={() => setActiveTab("cart")}
                    className="w-full flex items-center justify-between bg-primary text-primary-foreground px-4 py-3 rounded-xl font-semibold text-sm active:scale-95 transition-all"
                  >
                    <div className="flex items-center gap-2">
                      <ShoppingBag className="w-4 h-4" />
                      <span>{cartCount} item{cartCount !== 1 ? "s" : ""} added</span>
                    </div>
                    <span>₹{cartTotal.toFixed(0)} →</span>
                  </button>
                </div>
              )}
            </div>

            {/* ── Cart panel ── */}
            <div className={`flex flex-col sm:w-72 w-full shrink-0 border-l border-border overflow-hidden ${activeTab === "menu" ? "hidden sm:flex" : "flex"}`}>
              <div className="px-4 py-3 border-b border-border shrink-0 flex items-center gap-2">
                <ShoppingBag className="w-4 h-4 text-muted-foreground" />
                <span className="font-semibold text-sm">Order ({cartCount} items)</span>
              </div>
              <div className="flex-1 overflow-y-auto p-3 space-y-2">
                {cart.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-12 text-muted-foreground gap-2">
                    <ShoppingBag className="w-8 h-8 opacity-30" />
                    <p className="text-sm">Your cart is empty</p>
                    <p className="text-xs">Add items from the menu</p>
                  </div>
                ) : (
                  cart.map((item) => (
                    <div key={item.menuItemId} className="flex items-center gap-2 p-2.5 bg-secondary/40 rounded-xl">
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-semibold truncate">{item.name}</div>
                        <div className="text-xs text-muted-foreground">₹{item.price} × {item.quantity} = <span className="font-semibold text-foreground">₹{item.price * item.quantity}</span></div>
                      </div>
                      <div className="flex items-center gap-1 shrink-0">
                        <button onClick={() => removeFromCart(item.menuItemId)} className="w-6 h-6 rounded-full border border-border bg-background flex items-center justify-center hover:bg-destructive/10 transition-colors"><Minus className="w-3 h-3" /></button>
                        <span className="w-5 text-center text-sm font-bold">{item.quantity}</span>
                        <button onClick={() => setCart((p) => p.map((c) => c.menuItemId === item.menuItemId ? { ...c, quantity: c.quantity + 1 } : c))} className="w-6 h-6 rounded-full border border-border bg-background flex items-center justify-center hover:bg-primary/10 transition-colors"><Plus className="w-3 h-3" /></button>
                      </div>
                    </div>
                  ))
                )}
              </div>
              <div className="p-4 border-t border-border space-y-3 shrink-0 bg-card/50">
                <Textarea
                  placeholder="Special instructions…"
                  value={orderNotes}
                  onChange={(e) => setOrderNotes(e.target.value)}
                  className="text-sm resize-none h-16 rounded-xl"
                />
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Total</span>
                  <span className="text-lg font-bold text-primary">₹{cartTotal.toFixed(0)}</span>
                </div>
                <Button
                  onClick={handleSendOrder}
                  disabled={cart.length === 0 || createOrder.isPending}
                  className="w-full rounded-xl h-11 font-semibold"
                  data-testid="button-send-order"
                >
                  {createOrder.isPending ? "Sending…" : "🍳 Send to Kitchen"}
                </Button>
                <Button variant="outline" className="w-full rounded-xl" onClick={() => setOrderDialogOpen(false)}>Cancel</Button>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* ── View existing order dialog ── */}
      <Dialog open={!!viewOrderTable} onOpenChange={() => setViewOrderTable(null)}>
        <DialogContent className="max-w-sm rounded-2xl">
          {viewOrderTable && (() => {
            const order = getTableOrder(viewOrderTable.id);
            const style = TABLE_STATUS_STYLE[viewOrderTable.status] ?? TABLE_STATUS_STYLE.available;
            return (
              <>
                <DialogHeader>
                  <DialogTitle className="flex items-center gap-2">
                    Table {viewOrderTable.number}
                    <span className={`ml-1 inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold ${style.label} bg-white border border-current/20`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${style.dot}`} />
                      {viewOrderTable.status}
                    </span>
                  </DialogTitle>
                </DialogHeader>
                {order ? (
                  <div className="space-y-4 mt-1">
                    <div className="bg-secondary/40 rounded-xl p-3 space-y-2">
                      {order.items.map((item) => (
                        <div key={item.id} className="flex justify-between text-sm">
                          <span className="text-muted-foreground">{item.quantity}× {item.menuItemName}</span>
                          <span className="font-semibold">₹{item.subtotal.toFixed(0)}</span>
                        </div>
                      ))}
                      <div className="border-t border-border pt-2 flex justify-between font-bold">
                        <span>Total</span><span className="text-primary">₹{order.totalAmount.toFixed(0)}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Clock className="w-4 h-4" />
                      Status: <span className={`font-semibold capitalize ${style.label}`}>{order.status}</span>
                    </div>
                    {order.status === "ready" && (
                      <Button className="w-full rounded-xl h-11 font-semibold" onClick={() => { handleRequestBill(order); setViewOrderTable(null); }} data-testid="button-request-bill">
                        <Receipt className="w-4 h-4 mr-2" /> Request Bill
                      </Button>
                    )}
                    {order.status === "billing" && (
                      <div className="text-center text-sm text-muted-foreground bg-secondary/40 rounded-xl py-3">
                        Bill requested — awaiting payment
                      </div>
                    )}
                  </div>
                ) : (
                  <p className="text-muted-foreground text-sm mt-2">No active order for this table.</p>
                )}
              </>
            );
          })()}
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
}
