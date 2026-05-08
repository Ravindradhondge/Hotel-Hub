import { useEffect, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useListActiveOrders, useUpdateOrder, getListActiveOrdersQueryKey, Order } from "@workspace/api-client-react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { io } from "socket.io-client";
import { Clock, CheckCircle, ChefHat } from "lucide-react";

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

function OrderTicket({ order, onUpdate }: { order: Order; onUpdate: () => void }) {
  const elapsed = useOrderTimer(order.createdAt);
  const updateOrder = useUpdateOrder();
  const { toast } = useToast();
  const isUrgent = elapsed > 900;

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
    <div data-testid={`card-order-${order.id}`} className={`bg-card border-2 rounded-xl p-5 flex flex-col gap-4 transition-all ${isUrgent ? "border-rose-400 shadow-rose-100 shadow-lg" : order.status === "ready" ? "border-violet-400" : order.status === "preparing" ? "border-amber-400" : "border-border"}`}>
      <div className="flex items-start justify-between">
        <div>
          <div className="text-2xl font-bold">Table {order.tableNumber}</div>
          <div className="text-sm text-muted-foreground mt-0.5">{order.waiterName}</div>
        </div>
        <div className="flex flex-col items-end gap-2">
          <div className={`text-sm font-mono font-bold px-2 py-1 rounded ${isUrgent ? "bg-rose-100 text-rose-700" : "bg-secondary text-secondary-foreground"}`}>
            <Clock className="w-3 h-3 inline mr-1" />
            {formatTime(elapsed)}
          </div>
          <Badge variant={order.status === "ready" ? "default" : order.status === "preparing" ? "secondary" : "outline"} className="capitalize">{order.status}</Badge>
        </div>
      </div>

      <div className="space-y-2 flex-1">
        {order.items.map((item) => (
          <div key={item.id} className="flex items-start gap-3">
            <div className="w-7 h-7 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs font-bold shrink-0">{item.quantity}</div>
            <div className="flex-1 min-w-0">
              <div className="font-medium text-sm">{item.menuItemName}</div>
              {item.notes && <div className="text-xs text-muted-foreground italic mt-0.5">{item.notes}</div>}
            </div>
          </div>
        ))}
        {order.notes && (
          <div className="mt-2 p-2 bg-accent/50 rounded text-xs text-accent-foreground">
            <span className="font-semibold">Note: </span>{order.notes}
          </div>
        )}
      </div>

      <div className="flex gap-2 mt-auto">
        {order.status === "pending" && (
          <Button className="flex-1" variant="secondary" onClick={() => handleStatus("preparing")} disabled={updateOrder.isPending} data-testid={`button-preparing-${order.id}`}>
            <ChefHat className="w-4 h-4 mr-2" />Preparing
          </Button>
        )}
        {(order.status === "pending" || order.status === "preparing") && (
          <Button className="flex-1" onClick={() => handleStatus("ready")} disabled={updateOrder.isPending} data-testid={`button-ready-${order.id}`}>
            <CheckCircle className="w-4 h-4 mr-2" />Mark Ready
          </Button>
        )}
        {order.status === "ready" && (
          <div className="flex-1 text-center text-sm font-medium text-violet-700 bg-violet-50 border border-violet-200 rounded-md py-2">Food Ready — Notify Waiter</div>
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
    socket.on("order:new", () => queryClient.invalidateQueries({ queryKey: getListActiveOrdersQueryKey() }));
    socket.on("order:updated", () => queryClient.invalidateQueries({ queryKey: getListActiveOrdersQueryKey() }));
    return () => { socket.disconnect(); };
  }, [queryClient]);

  const pending = orders.filter((o) => o.status === "pending");
  const preparing = orders.filter((o) => o.status === "preparing");
  const ready = orders.filter((o) => o.status === "ready");

  const refresh = () => queryClient.invalidateQueries({ queryKey: getListActiveOrdersQueryKey() });

  return (
    <DashboardLayout title="Kitchen Tickets">
      <div className="space-y-6">
        <div className="grid grid-cols-3 gap-4">
          {[
            { label: "Pending", count: pending.length, color: "text-foreground" },
            { label: "Preparing", count: preparing.length, color: "text-amber-600" },
            { label: "Ready", count: ready.length, color: "text-violet-600" },
          ].map((s) => (
            <div key={s.label} className="bg-card border border-border rounded-lg p-4 text-center">
              <div className={`text-3xl font-bold ${s.color}`}>{s.count}</div>
              <div className="text-sm text-muted-foreground mt-1">{s.label}</div>
            </div>
          ))}
        </div>

        {isLoading ? (
          <div className="text-center py-12 text-muted-foreground">Loading orders...</div>
        ) : orders.length === 0 ? (
          <div className="text-center py-16 text-muted-foreground">
            <ChefHat className="w-12 h-12 mx-auto mb-3 opacity-30" />
            <p className="text-lg font-medium">No active orders</p>
            <p className="text-sm">New orders will appear here in real-time</p>
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
