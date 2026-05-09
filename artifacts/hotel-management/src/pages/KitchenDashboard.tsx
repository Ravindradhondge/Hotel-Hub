import { useEffect, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useListActiveOrders, useUpdateOrder, getListActiveOrdersQueryKey, Order } from "@workspace/api-client-react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { io } from "socket.io-client";
import { Clock, CheckCircle2, ChefHat, Flame, Timer } from "lucide-react";

function useOrderTimer(createdAt: string) {
  const [elapsed, setElapsed] = useState(0);
  useEffect(() => {
    const start = new Date(createdAt).getTime();
    const tick = () => setElapsed(Math.floor((Date.now() - start) / 1000));
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [createdAt]);
  return elapsed;
}

function formatTime(seconds: number) {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${s.toString().padStart(2, "0")}`;
}

const STATUS_CONFIG = {
  pending:   { border: "border-orange-300", header: "bg-orange-50 border-orange-200", dot: "bg-orange-500", label: "Pending",   labelCls: "text-orange-700 bg-orange-100" },
  preparing: { border: "border-amber-400",  header: "bg-amber-50 border-amber-200",   dot: "bg-amber-500",  label: "Preparing", labelCls: "text-amber-700 bg-amber-100" },
  ready:     { border: "border-violet-400", header: "bg-violet-50 border-violet-200", dot: "bg-violet-500", label: "Ready",     labelCls: "text-violet-700 bg-violet-100" },
};

function OrderTicket({ order, onUpdate }: { order: Order; onUpdate: () => void }) {
  const elapsed = useOrderTimer(order.createdAt);
  const updateOrder = useUpdateOrder();
  const { toast } = useToast();
  const isUrgent = elapsed > 900;
  const cfg = STATUS_CONFIG[order.status as keyof typeof STATUS_CONFIG] ?? STATUS_CONFIG.pending;

  const handleStatus = (status: "preparing" | "ready") => {
    updateOrder.mutate(
      { id: order.id, data: { status } },
      {
        onSuccess: () => {
          toast({ title: status === "preparing" ? "Order is being prepared" : "Order is ready!" });
          onUpdate();
        },
      }
    );
  };

  return (
    <div
      data-testid={`card-order-${order.id}`}
      className={`bg-card border-2 rounded-2xl overflow-hidden flex flex-col transition-all card-shadow-md ${isUrgent ? "border-rose-400" : cfg.border} ${isUrgent ? "shadow-rose-100" : ""}`}
    >
      {/* Ticket header */}
      <div className={`px-4 py-3 border-b flex items-center justify-between ${isUrgent ? "bg-rose-50 border-rose-200" : cfg.header}`}>
        <div className="flex items-center gap-3">
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-lg font-extrabold text-white ${isUrgent ? "bg-rose-500" : "bg-primary"}`}>
            {order.tableNumber}
          </div>
          <div>
            <div className="font-bold text-sm leading-none">Table {order.tableNumber}</div>
            <div className="text-xs text-muted-foreground mt-0.5">{order.waiterName}</div>
          </div>
        </div>
        <div className="flex flex-col items-end gap-1.5">
          <div className={`flex items-center gap-1 text-xs font-bold font-mono px-2.5 py-1 rounded-lg ${isUrgent ? "bg-rose-100 text-rose-700" : "bg-secondary text-foreground"}`}>
            <Timer className="w-3 h-3" />
            {formatTime(elapsed)}
            {isUrgent && <span className="ml-1 text-rose-500 animate-pulse">!</span>}
          </div>
          <span className={`text-[10px] font-bold uppercase tracking-wide px-2 py-0.5 rounded-full ${cfg.labelCls}`}>
            {cfg.label}
          </span>
        </div>
      </div>

      {/* Items */}
      <div className="flex-1 p-4 space-y-2.5">
        {order.items.map((item) => (
          <div key={item.id} className="flex items-start gap-3">
            <div className="w-7 h-7 rounded-lg bg-primary text-primary-foreground flex items-center justify-center text-xs font-bold shrink-0">
              {item.quantity}
            </div>
            <div className="flex-1 min-w-0">
              <div className="font-semibold text-sm leading-tight">{item.menuItemName}</div>
              {item.notes && (
                <div className="text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded px-2 py-0.5 mt-1 italic">
                  {item.notes}
                </div>
              )}
            </div>
          </div>
        ))}
        {order.notes && (
          <div className="mt-1 p-2.5 bg-accent/60 border border-accent rounded-xl text-xs text-accent-foreground">
            <span className="font-bold">Note: </span>{order.notes}
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="px-4 pb-4 flex gap-2 mt-auto">
        {order.status === "pending" && (
          <Button
            className="flex-1 rounded-xl h-10 bg-amber-500 hover:bg-amber-600 text-white border-0 font-semibold"
            onClick={() => handleStatus("preparing")}
            disabled={updateOrder.isPending}
            data-testid={`button-preparing-${order.id}`}
          >
            <Flame className="w-4 h-4 mr-1.5" /> Start Cooking
          </Button>
        )}
        {(order.status === "pending" || order.status === "preparing") && (
          <Button
            className="flex-1 rounded-xl h-10 font-semibold"
            onClick={() => handleStatus("ready")}
            disabled={updateOrder.isPending}
            data-testid={`button-ready-${order.id}`}
          >
            <CheckCircle2 className="w-4 h-4 mr-1.5" /> Mark Ready
          </Button>
        )}
        {order.status === "ready" && (
          <div className="flex-1 text-center text-sm font-semibold text-violet-700 bg-violet-100 border border-violet-300 rounded-xl py-2.5 flex items-center justify-center gap-1.5">
            <CheckCircle2 className="w-4 h-4" /> Food Ready — Notify Waiter
          </div>
        )}
      </div>
    </div>
  );
}

export default function KitchenDashboard() {
  const queryClient = useQueryClient();
  const { data: orders = [], isLoading } = useListActiveOrders();

  useEffect(() => {
    const socket = io();
    socket.on("order:new",     () => queryClient.invalidateQueries({ queryKey: getListActiveOrdersQueryKey() }));
    socket.on("order:updated", () => queryClient.invalidateQueries({ queryKey: getListActiveOrdersQueryKey() }));
    return () => { socket.disconnect(); };
  }, [queryClient]);

  const pending   = orders.filter((o) => o.status === "pending");
  const preparing = orders.filter((o) => o.status === "preparing");
  const ready     = orders.filter((o) => o.status === "ready");
  const refresh   = () => queryClient.invalidateQueries({ queryKey: getListActiveOrdersQueryKey() });

  return (
    <DashboardLayout title="Kitchen Tickets">
      <div className="space-y-5">

        {/* Stats */}
        <div className="grid grid-cols-3 gap-3">
          {[
            { label: "Pending",   count: pending.length,   dot: "bg-orange-500", num: "text-orange-600", card: pending.length > 0 ? "border-orange-200 bg-orange-50" : "" },
            { label: "Preparing", count: preparing.length, dot: "bg-amber-500",  num: "text-amber-600",  card: preparing.length > 0 ? "border-amber-200 bg-amber-50" : "" },
            { label: "Ready",     count: ready.length,     dot: "bg-violet-500", num: "text-violet-600", card: ready.length > 0 ? "border-violet-200 bg-violet-50" : "" },
          ].map((s) => (
            <div key={s.label} className={`border rounded-2xl p-4 text-center card-shadow transition-all ${s.card || "bg-card border-border"}`}>
              <div className={`text-3xl font-extrabold ${s.num}`}>{s.count}</div>
              <div className="flex items-center justify-center gap-1.5 mt-1">
                <span className={`w-2 h-2 rounded-full ${s.dot}`} />
                <span className="text-xs text-muted-foreground font-medium">{s.label}</span>
              </div>
            </div>
          ))}
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-48 rounded-2xl bg-secondary/50 animate-pulse" />
            ))}
          </div>
        ) : orders.length === 0 ? (
          <div className="text-center py-20 text-muted-foreground">
            <div className="w-20 h-20 rounded-full bg-secondary flex items-center justify-center mx-auto mb-4">
              <ChefHat className="w-9 h-9 opacity-40" />
            </div>
            <p className="text-lg font-semibold">Kitchen is quiet</p>
            <p className="text-sm mt-1">New orders will appear here in real-time</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[...pending, ...preparing, ...ready].map((order) => (
              <OrderTicket key={order.id} order={order} onUpdate={refresh} />
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
