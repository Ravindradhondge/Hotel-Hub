import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import {
  useListOrders, useCreatePayment, useGetDailyReport,
  getListOrdersQueryKey, getGetDailyReportQueryKey, Order
} from "@workspace/api-client-react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { FileText, CreditCard, Banknote, Smartphone, TrendingUp, CheckCircle2, Receipt, IndianRupee } from "lucide-react";

const TAX_RATE = 0.05;
const HOTEL_NAME = import.meta.env.VITE_HOTEL_NAME || "Shagun Tadka";

export default function AccountantDashboard() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const today = new Date().toISOString().slice(0, 10);

  const { data: billingOrders = [] } = useListOrders({ status: "billing" }, { query: { queryKey: getListOrdersQueryKey({ status: "billing" }) } });
  const { data: report } = useGetDailyReport({ date: today }, { query: { queryKey: getGetDailyReportQueryKey({ date: today }) } });
  const createPayment = useCreatePayment();

  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<"cash" | "upi" | "card">("cash");
  const [discount, setDiscount] = useState("0");
  const [invoiceOrder, setInvoiceOrder] = useState<Order | null>(null);
  const [paymentResult, setPaymentResult] = useState<any>(null);

  const subtotal    = selectedOrder?.totalAmount ?? 0;
  const tax         = subtotal * TAX_RATE;
  const discountAmt = parseFloat(discount) || 0;
  const total       = subtotal + tax - discountAmt;

  const handlePayment = () => {
    if (!selectedOrder) return;
    createPayment.mutate(
      { data: { orderId: selectedOrder.id, discount: discountAmt, method: paymentMethod, taxRate: TAX_RATE } },
      {
        onSuccess: (payment) => {
          toast({ title: "Payment completed!" });
          setPaymentResult({ payment, order: selectedOrder });
          setSelectedOrder(null);
          setDiscount("0");
          queryClient.invalidateQueries({ queryKey: getListOrdersQueryKey({ status: "billing" }) });
          queryClient.invalidateQueries({ queryKey: getGetDailyReportQueryKey({ date: today }) });
        },
        onError: () => toast({ title: "Payment failed", variant: "destructive" }),
      }
    );
  };

  const METHOD_CONFIG = {
    cash: { icon: Banknote,   label: "Cash", color: "text-emerald-600 bg-emerald-50 border-emerald-300" },
    upi:  { icon: Smartphone, label: "UPI",  color: "text-violet-600 bg-violet-50 border-violet-300" },
    card: { icon: CreditCard, label: "Card", color: "text-sky-600 bg-sky-50 border-sky-300" },
  };

  return (
    <DashboardLayout title="Billing & Payments">
      <div className="space-y-5">

        {/* Stats row */}
        {report && (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            {[
              { label: "Today's Revenue",  value: `₹${report.totalRevenue.toFixed(0)}`,  icon: IndianRupee, from: "from-emerald-500", to: "to-emerald-600" },
              { label: "Orders Completed", value: report.totalOrders,                      icon: FileText,    from: "from-sky-500",     to: "to-sky-600" },
              { label: "Avg. Order Value", value: `₹${report.avgOrderValue.toFixed(0)}`,  icon: TrendingUp,  from: "from-violet-500",  to: "to-violet-600" },
              { label: "Pending Bills",    value: billingOrders.length,                    icon: Receipt,     from: "from-rose-500",    to: "to-rose-600" },
            ].map((stat) => (
              <div key={stat.label} className="bg-card border border-border rounded-2xl p-4 card-shadow overflow-hidden relative">
                <div className={`absolute right-0 top-0 w-20 h-20 rounded-full bg-gradient-to-br ${stat.from} ${stat.to} opacity-8 translate-x-6 -translate-y-6`} />
                <div className={`w-9 h-9 rounded-xl bg-gradient-to-br ${stat.from} ${stat.to} flex items-center justify-center mb-3`}>
                  <stat.icon className="w-4 h-4 text-white" />
                </div>
                <div className="text-2xl font-extrabold">{stat.value}</div>
                <div className="text-xs text-muted-foreground mt-0.5 font-medium">{stat.label}</div>
              </div>
            ))}
          </div>
        )}

        {/* Pending bills */}
        <div className="bg-card border border-border rounded-2xl overflow-hidden card-shadow">
          <div className="px-5 py-4 border-b border-border flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Receipt className="w-4 h-4 text-muted-foreground" />
              <h3 className="font-bold text-sm">Pending Bills</h3>
              {billingOrders.length > 0 && (
                <span className="text-xs bg-rose-100 text-rose-700 font-bold px-2 py-0.5 rounded-full">{billingOrders.length}</span>
              )}
            </div>
          </div>
          {billingOrders.length === 0 ? (
            <div className="text-center py-14 text-muted-foreground">
              <div className="w-14 h-14 rounded-full bg-secondary flex items-center justify-center mx-auto mb-3">
                <FileText className="w-6 h-6 opacity-40" />
              </div>
              <p className="font-medium">No pending bills</p>
              <p className="text-xs mt-0.5">All payments are settled</p>
            </div>
          ) : (
            <div className="divide-y divide-border">
              {billingOrders.map((order) => (
                <div key={order.id} data-testid={`row-order-${order.id}`} className="px-4 py-4 hover:bg-secondary/30 transition-colors">
                  {/* Top row: icon + info + price */}
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center font-extrabold text-base shrink-0">
                      {order.tableNumber}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-bold">Table {order.tableNumber}</span>
                        <span className="text-[10px] bg-secondary text-muted-foreground px-2 py-0.5 rounded-full">{order.items.length} items</span>
                      </div>
                      <div className="text-xs text-muted-foreground mt-0.5 truncate">{order.waiterName} · {new Date(order.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</div>
                    </div>
                    <div className="text-right shrink-0">
                      <div className="font-extrabold text-lg">₹{order.totalAmount.toFixed(0)}</div>
                      <div className="text-[10px] text-muted-foreground">+ 5% GST</div>
                    </div>
                  </div>
                  {/* Bottom row: action buttons full-width on mobile */}
                  <div className="flex gap-2 mt-3">
                    <Button variant="outline" size="sm" className="flex-1 rounded-xl h-9 text-sm" onClick={() => setInvoiceOrder(order)} data-testid={`button-view-${order.id}`}>
                      View Bill
                    </Button>
                    <Button size="sm" className="flex-1 rounded-xl h-9 text-sm font-semibold" onClick={() => { setSelectedOrder(order); setDiscount("0"); }} data-testid={`button-pay-${order.id}`}>
                      Collect Payment
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Payment breakdown */}
        {report && (
          <div className="bg-card border border-border rounded-2xl p-5 card-shadow">
            <h3 className="font-bold text-sm mb-4">Today's Payment Breakdown</h3>
            <div className="grid grid-cols-3 gap-3">
              {[
                { label: "Cash",  value: report.cashRevenue, icon: Banknote,   cls: "text-emerald-600 bg-emerald-50 border-emerald-200" },
                { label: "UPI",   value: report.upiRevenue,  icon: Smartphone, cls: "text-violet-600 bg-violet-50 border-violet-200" },
                { label: "Card",  value: report.cardRevenue, icon: CreditCard, cls: "text-sky-600 bg-sky-50 border-sky-200" },
              ].map((m) => (
                <div key={m.label} className={`text-center p-4 border rounded-2xl ${m.cls}`}>
                  <m.icon className="w-5 h-5 mx-auto mb-2 opacity-70" />
                  <div className="font-extrabold text-lg">₹{m.value.toFixed(0)}</div>
                  <div className="text-xs font-semibold mt-0.5 opacity-70">{m.label}</div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* ── Payment dialog ── */}
      <Dialog open={!!selectedOrder} onOpenChange={() => setSelectedOrder(null)}>
        <DialogContent className="max-w-md w-[calc(100vw-2rem)] rounded-2xl max-h-[90vh] flex flex-col p-0 gap-0">
          <DialogHeader className="px-5 pt-5 pb-4 border-b border-border shrink-0">
            <DialogTitle className="flex items-center gap-2">
              <Receipt className="w-4 h-4 text-primary" />
              Bill — Table {selectedOrder?.tableNumber}
            </DialogTitle>
          </DialogHeader>

          {/* Scrollable body */}
          <div className="overflow-y-auto flex-1 px-5 py-4 space-y-4">
            {selectedOrder && (
              <>
                {/* Items breakdown */}
                <div className="bg-secondary/40 rounded-xl p-4 space-y-2">
                  {selectedOrder.items.map((item) => (
                    <div key={item.id} className="flex justify-between text-sm">
                      <span className="text-muted-foreground">{item.quantity}× {item.menuItemName}</span>
                      <span className="font-semibold">₹{item.subtotal.toFixed(0)}</span>
                    </div>
                  ))}
                  <Separator className="my-1" />
                  <div className="flex justify-between text-sm"><span className="text-muted-foreground">Subtotal</span><span>₹{subtotal.toFixed(0)}</span></div>
                  <div className="flex justify-between text-sm text-muted-foreground"><span>GST (5%)</span><span>₹{tax.toFixed(0)}</span></div>
                  {discountAmt > 0 && (
                    <div className="flex justify-between text-sm text-emerald-600"><span>Discount</span><span>-₹{discountAmt.toFixed(0)}</span></div>
                  )}
                  <Separator className="my-1" />
                  <div className="flex justify-between font-extrabold text-lg"><span>Total</span><span className="text-primary">₹{total.toFixed(0)}</span></div>
                </div>

                {/* Discount */}
                <div className="space-y-1.5">
                  <Label className="text-sm font-semibold">Discount (₹)</Label>
                  <Input type="number" min="0" value={discount} onChange={(e) => setDiscount(e.target.value)} placeholder="0" className="rounded-xl" data-testid="input-discount" />
                </div>

                {/* Payment method */}
                <div className="space-y-2">
                  <Label className="text-sm font-semibold">Payment Method</Label>
                  <div className="grid grid-cols-3 gap-2">
                    {(["cash", "upi", "card"] as const).map((m) => {
                      const cfg = METHOD_CONFIG[m];
                      return (
                        <button
                          key={m}
                          onClick={() => setPaymentMethod(m)}
                          data-testid={`button-method-${m}`}
                          className={`flex flex-col items-center gap-1.5 py-3 rounded-xl border-2 transition-all text-sm font-semibold ${paymentMethod === m ? cfg.color + " ring-2 ring-primary/30" : "border-border hover:border-primary/30 bg-card"}`}
                        >
                          <cfg.icon className="w-5 h-5" />
                          <span className="text-xs">{cfg.label}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </>
            )}
          </div>

          {/* Sticky footer */}
          <DialogFooter className="px-5 py-4 border-t border-border shrink-0 gap-2 flex-row">
            <Button variant="outline" className="flex-1 rounded-xl" onClick={() => setSelectedOrder(null)}>Cancel</Button>
            <Button className="flex-1 rounded-xl font-semibold" onClick={handlePayment} disabled={createPayment.isPending} data-testid="button-complete-payment">
              {createPayment.isPending ? "Processing…" : "Complete Payment"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ── Invoice dialog ── */}
      <Dialog open={!!invoiceOrder} onOpenChange={() => setInvoiceOrder(null)}>
        <DialogContent className="max-w-sm w-[calc(100vw-2rem)] rounded-2xl max-h-[90vh] flex flex-col p-0 gap-0">
          <DialogHeader className="px-5 pt-5 pb-4 border-b border-border shrink-0">
            <DialogTitle>Invoice Preview</DialogTitle>
          </DialogHeader>

          {/* Scrollable invoice body */}
          <div className="overflow-y-auto flex-1 px-5 py-4">
            {invoiceOrder && (
              <div className="bg-secondary/30 rounded-xl p-4 space-y-3 font-mono text-sm">
                <div className="text-center border-b border-dashed border-border pb-3">
                  <p className="font-extrabold text-lg font-serif">{HOTEL_NAME}</p>
                  <p className="text-muted-foreground text-xs">{new Date().toLocaleDateString("en-IN", { dateStyle: "medium" })}</p>
                  <p className="text-xs mt-1">Table: {invoiceOrder.tableNumber} | Served by: {invoiceOrder.waiterName}</p>
                </div>
                {invoiceOrder.items.map((item) => (
                  <div key={item.id} className="flex justify-between">
                    <span>{item.quantity}× {item.menuItemName}</span>
                    <span>₹{item.subtotal.toFixed(0)}</span>
                  </div>
                ))}
                <div className="border-t border-dashed border-border pt-2 space-y-1">
                  <div className="flex justify-between text-muted-foreground"><span>Subtotal</span><span>₹{invoiceOrder.totalAmount.toFixed(0)}</span></div>
                  <div className="flex justify-between text-muted-foreground"><span>GST 5%</span><span>₹{(invoiceOrder.totalAmount * 0.05).toFixed(0)}</span></div>
                  <div className="flex justify-between font-extrabold border-t border-dashed border-border pt-1 text-base"><span>TOTAL</span><span>₹{(invoiceOrder.totalAmount * 1.05).toFixed(0)}</span></div>
                </div>
                <p className="text-center text-xs text-muted-foreground pt-1">Thank you for visiting {HOTEL_NAME}!</p>
              </div>
            )}
          </div>

          <DialogFooter className="px-5 py-4 border-t border-border shrink-0">
            <Button className="w-full rounded-xl font-semibold" onClick={() => window.print()} data-testid="button-print">Print Invoice</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ── Payment success dialog ── */}
      <Dialog open={!!paymentResult} onOpenChange={() => setPaymentResult(null)}>
        <DialogContent className="max-w-xs w-[calc(100vw-2rem)] text-center rounded-2xl">
          <div className="w-16 h-16 rounded-full bg-emerald-100 flex items-center justify-center mx-auto mt-2">
            <CheckCircle2 className="w-8 h-8 text-emerald-600" />
          </div>
          <DialogHeader>
            <DialogTitle className="mt-2">Payment Successful!</DialogTitle>
          </DialogHeader>
          {paymentResult && (
            <div className="space-y-1 pb-2">
              <p className="text-muted-foreground text-sm">Table {paymentResult.order.tableNumber}</p>
              <p className="text-3xl font-extrabold text-primary">₹{paymentResult.payment.totalAmount.toFixed(0)}</p>
              <p className="capitalize text-sm text-muted-foreground">{paymentResult.payment.method}</p>
            </div>
          )}
          <Button className="w-full rounded-xl font-semibold" onClick={() => setPaymentResult(null)}>Done</Button>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
}
