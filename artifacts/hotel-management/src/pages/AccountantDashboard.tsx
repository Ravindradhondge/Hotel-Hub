import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import {
  useListOrders, useGetOrder, useCreatePayment, useGetDailyReport,
  getListOrdersQueryKey, getGetDailyReportQueryKey, Order
} from "@workspace/api-client-react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { FileText, CreditCard, Banknote, Smartphone, TrendingUp } from "lucide-react";

const TAX_RATE = 0.05;

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

  const subtotal = selectedOrder?.totalAmount ?? 0;
  const tax = subtotal * TAX_RATE;
  const discountAmt = parseFloat(discount) || 0;
  const total = subtotal + tax - discountAmt;

  const handlePayment = () => {
    if (!selectedOrder) return;
    createPayment.mutate(
      { data: { orderId: selectedOrder.id, discount: discountAmt, method: paymentMethod, taxRate: TAX_RATE } },
      {
        onSuccess: (payment) => {
          toast({ title: "Payment completed" });
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

  const METHOD_ICONS = { cash: <Banknote className="w-4 h-4" />, upi: <Smartphone className="w-4 h-4" />, card: <CreditCard className="w-4 h-4" /> };

  return (
    <DashboardLayout title="Billing & Payments">
      <div className="space-y-6">
        {report && (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { label: "Today's Revenue", value: `₹${report.totalRevenue.toFixed(2)}`, icon: TrendingUp, color: "text-emerald-600" },
              { label: "Orders", value: report.totalOrders, icon: FileText, color: "text-blue-600" },
              { label: "Avg. Order", value: `₹${report.avgOrderValue.toFixed(2)}`, icon: CreditCard, color: "text-violet-600" },
              { label: "Pending Bills", value: billingOrders.length, icon: FileText, color: "text-rose-600" },
            ].map((stat) => (
              <div key={stat.label} className="bg-card border border-border rounded-xl p-4">
                <div className={`${stat.color} mb-2`}><stat.icon className="w-5 h-5" /></div>
                <div className={`text-2xl font-bold ${stat.color}`}>{stat.value}</div>
                <div className="text-sm text-muted-foreground mt-1">{stat.label}</div>
              </div>
            ))}
          </div>
        )}

        <div className="bg-card border border-border rounded-xl overflow-hidden">
          <div className="p-4 border-b border-border flex items-center justify-between">
            <h3 className="font-semibold">Pending Bills ({billingOrders.length})</h3>
          </div>
          {billingOrders.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <FileText className="w-10 h-10 mx-auto mb-2 opacity-30" />
              <p>No pending bills</p>
            </div>
          ) : (
            <div className="divide-y divide-border">
              {billingOrders.map((order) => (
                <div key={order.id} data-testid={`row-order-${order.id}`} className="flex items-center gap-4 p-4 hover:bg-secondary/30 transition-colors">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3">
                      <span className="font-semibold">Table {order.tableNumber}</span>
                      <Badge variant="outline" className="text-xs">{order.items.length} items</Badge>
                    </div>
                    <div className="text-sm text-muted-foreground mt-0.5">{order.waiterName} • {new Date(order.createdAt).toLocaleTimeString()}</div>
                  </div>
                  <div className="text-right">
                    <div className="font-bold text-lg">₹{order.totalAmount.toFixed(2)}</div>
                    <div className="text-xs text-muted-foreground">+ GST</div>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={() => setInvoiceOrder(order)} data-testid={`button-view-${order.id}`}>View</Button>
                    <Button size="sm" onClick={() => { setSelectedOrder(order); setDiscount("0"); }} data-testid={`button-pay-${order.id}`}>Pay</Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {report && (
          <div className="bg-card border border-border rounded-xl p-5">
            <h3 className="font-semibold mb-4">Today's Payment Breakdown</h3>
            <div className="grid grid-cols-3 gap-4">
              {[
                { label: "Cash", value: report.cashRevenue, icon: <Banknote className="w-4 h-4" /> },
                { label: "UPI", value: report.upiRevenue, icon: <Smartphone className="w-4 h-4" /> },
                { label: "Card", value: report.cardRevenue, icon: <CreditCard className="w-4 h-4" /> },
              ].map((m) => (
                <div key={m.label} className="text-center p-3 bg-secondary/40 rounded-lg">
                  <div className="flex justify-center text-muted-foreground mb-1">{m.icon}</div>
                  <div className="font-bold">₹{m.value.toFixed(2)}</div>
                  <div className="text-xs text-muted-foreground">{m.label}</div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      <Dialog open={!!selectedOrder} onOpenChange={() => setSelectedOrder(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader><DialogTitle>Generate Bill — Table {selectedOrder?.tableNumber}</DialogTitle></DialogHeader>
          {selectedOrder && (
            <div className="space-y-4">
              <div className="space-y-2">
                {selectedOrder.items.map((item) => (
                  <div key={item.id} className="flex justify-between text-sm">
                    <span>{item.quantity}x {item.menuItemName}</span>
                    <span>₹{item.subtotal.toFixed(2)}</span>
                  </div>
                ))}
                <Separator />
                <div className="flex justify-between text-sm"><span>Subtotal</span><span>₹{subtotal.toFixed(2)}</span></div>
                <div className="flex justify-between text-sm text-muted-foreground"><span>GST (5%)</span><span>₹{tax.toFixed(2)}</span></div>
                {discountAmt > 0 && <div className="flex justify-between text-sm text-emerald-600"><span>Discount</span><span>-₹{discountAmt.toFixed(2)}</span></div>}
                <Separator />
                <div className="flex justify-between font-bold text-lg"><span>Total</span><span>₹{total.toFixed(2)}</span></div>
              </div>
              <div className="space-y-2">
                <Label>Discount (₹)</Label>
                <Input type="number" min="0" value={discount} onChange={(e) => setDiscount(e.target.value)} placeholder="0" data-testid="input-discount" />
              </div>
              <div className="space-y-2">
                <Label>Payment Method</Label>
                <div className="grid grid-cols-3 gap-2">
                  {(["cash", "upi", "card"] as const).map((m) => (
                    <button key={m} onClick={() => setPaymentMethod(m)} data-testid={`button-method-${m}`} className={`flex items-center justify-center gap-2 py-2.5 px-3 rounded-lg border-2 transition-all text-sm font-medium ${paymentMethod === m ? "border-primary bg-primary/5 text-primary" : "border-border hover:border-primary/30"}`}>
                      {METHOD_ICONS[m]} <span className="capitalize">{m}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setSelectedOrder(null)}>Cancel</Button>
            <Button onClick={handlePayment} disabled={createPayment.isPending} data-testid="button-complete-payment">
              {createPayment.isPending ? "Processing..." : "Complete Payment"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={!!invoiceOrder} onOpenChange={() => setInvoiceOrder(null)}>
        <DialogContent className="max-w-sm">
          <DialogHeader><DialogTitle>Invoice — Table {invoiceOrder?.tableNumber}</DialogTitle></DialogHeader>
          {invoiceOrder && (
            <div className="space-y-3 font-mono text-sm">
              <div className="text-center border-b border-dashed border-border pb-3">
                <p className="font-bold text-lg">LE GRAND</p>
                <p className="text-muted-foreground text-xs">{new Date().toLocaleDateString()}</p>
                <p className="text-xs">Table: {invoiceOrder.tableNumber} | Waiter: {invoiceOrder.waiterName}</p>
              </div>
              {invoiceOrder.items.map((item) => (
                <div key={item.id} className="flex justify-between">
                  <span>{item.quantity}x {item.menuItemName}</span>
                  <span>₹{item.subtotal.toFixed(2)}</span>
                </div>
              ))}
              <div className="border-t border-dashed border-border pt-2 space-y-1">
                <div className="flex justify-between"><span>Subtotal</span><span>₹{invoiceOrder.totalAmount.toFixed(2)}</span></div>
                <div className="flex justify-between text-muted-foreground"><span>GST 5%</span><span>₹{(invoiceOrder.totalAmount * 0.05).toFixed(2)}</span></div>
                <div className="flex justify-between font-bold border-t border-dashed border-border pt-1"><span>TOTAL</span><span>₹{(invoiceOrder.totalAmount * 1.05).toFixed(2)}</span></div>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button className="w-full" onClick={() => window.print()} data-testid="button-print">Print Invoice</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={!!paymentResult} onOpenChange={() => setPaymentResult(null)}>
        <DialogContent className="max-w-sm text-center">
          <div className="w-16 h-16 rounded-full bg-emerald-100 flex items-center justify-center mx-auto">
            <CheckCircle className="w-8 h-8 text-emerald-600" />
          </div>
          <DialogHeader><DialogTitle>Payment Successful</DialogTitle></DialogHeader>
          {paymentResult && (
            <div className="space-y-2 text-sm">
              <p className="text-muted-foreground">Table {paymentResult.order.tableNumber}</p>
              <p className="text-2xl font-bold">₹{paymentResult.payment.totalAmount.toFixed(2)}</p>
              <p className="capitalize text-muted-foreground">{paymentResult.payment.method}</p>
            </div>
          )}
          <Button onClick={() => setPaymentResult(null)} className="w-full">Done</Button>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
}

function CheckCircle({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" /><polyline points="22 4 12 14.01 9 11.01" />
    </svg>
  );
}
