import { useState } from "react";
import { useLocation } from "wouter";
import { useLogin } from "@workspace/api-client-react";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { LayoutDashboard, UtensilsCrossed, ChefHat, Receipt } from "lucide-react";

const ROLES = [
  { role: "owner",      label: "Owner",      icon: LayoutDashboard, email: "owner@hotel.com",      desc: "Analytics & management",   color: "text-violet-600 bg-violet-50 border-violet-200 hover:border-violet-400" },
  { role: "waiter",     label: "Waiter",      icon: UtensilsCrossed, email: "waiter@hotel.com",     desc: "Tables & orders",           color: "text-sky-600 bg-sky-50 border-sky-200 hover:border-sky-400" },
  { role: "kitchen",    label: "Kitchen",     icon: ChefHat,         email: "kitchen@hotel.com",    desc: "Order tickets & status",    color: "text-amber-600 bg-amber-50 border-amber-200 hover:border-amber-400" },
  { role: "accountant", label: "Accountant",  icon: Receipt,         email: "accountant@hotel.com", desc: "Billing & payments",        color: "text-emerald-600 bg-emerald-50 border-emerald-200 hover:border-emerald-400" },
];

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const { login } = useAuth();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const loginMutation = useLogin();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    loginMutation.mutate(
      { data: { email, password } },
      {
        onSuccess: (data) => {
          login(data.token, data.user);
          setLocation(`/${data.user.role}`);
        },
        onError: () => {
          toast({ title: "Login failed", description: "Invalid email or password.", variant: "destructive" });
        },
      }
    );
  };

  const quickLogin = (roleEmail: string) => {
    setEmail(roleEmail);
    setPassword("password123");
  };

  return (
    <div className="min-h-screen flex bg-background">
      {/* ── Left brand panel ── */}
      <div className="hidden lg:flex lg:w-[44%] bg-primary relative overflow-hidden flex-col justify-between p-12">
        <div className="absolute inset-0 opacity-10"
          style={{ backgroundImage: "radial-gradient(circle at 20% 50%, white 1px, transparent 1px), radial-gradient(circle at 80% 20%, white 1px, transparent 1px)", backgroundSize: "40px 40px" }}
        />
        <div className="relative">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center">
              <ChefHat className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-serif font-bold text-white leading-none">Shagun Tadka</h1>
              <p className="text-white/60 text-xs mt-0.5">Restaurant Management</p>
            </div>
          </div>
        </div>

        <div className="relative space-y-3">
          <p className="text-white/60 text-xs uppercase tracking-widest font-semibold mb-4">Quick login</p>
          {ROLES.map((r) => {
            const Icon = r.icon;
            return (
              <button
                key={r.role}
                onClick={() => quickLogin(r.email)}
                className="w-full flex items-center gap-4 px-4 py-3 rounded-xl bg-white/10 hover:bg-white/20 transition-all text-left group"
              >
                <div className="w-9 h-9 rounded-lg bg-white/15 flex items-center justify-center shrink-0 group-hover:bg-white/25 transition-colors">
                  <Icon className="w-4 h-4 text-white" />
                </div>
                <div>
                  <p className="text-white font-semibold text-sm leading-none">{r.label}</p>
                  <p className="text-white/55 text-xs mt-0.5">{r.desc}</p>
                </div>
                <span className="ml-auto text-white/30 text-xs group-hover:text-white/60 transition-colors">→</span>
              </button>
            );
          })}
        </div>

        <p className="relative text-white/30 text-xs">&copy; {new Date().getFullYear()} Shagun Tadka</p>
      </div>

      {/* ── Right login form ── */}
      <div className="flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-sm">
          <div className="lg:hidden flex items-center gap-3 mb-8">
            <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center">
              <ChefHat className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-serif font-bold text-foreground leading-none">Shagun Tadka</h1>
              <p className="text-muted-foreground text-xs mt-0.5">Restaurant Management</p>
            </div>
          </div>

          <div className="mb-8">
            <h2 className="text-3xl font-serif font-bold text-foreground">Welcome back</h2>
            <p className="text-muted-foreground mt-1.5">Sign in to your dashboard</p>
          </div>

          {/* Mobile role pills */}
          <div className="lg:hidden grid grid-cols-2 gap-2 mb-6">
            {ROLES.map((r) => {
              const Icon = r.icon;
              return (
                <button
                  key={r.role}
                  onClick={() => quickLogin(r.email)}
                  className={`flex items-center gap-2 px-3 py-2.5 rounded-xl border-2 transition-all text-left ${r.color} ${email === r.email ? "ring-2 ring-primary/30" : ""}`}
                >
                  <Icon className="w-4 h-4 shrink-0" />
                  <span className="font-semibold text-xs">{r.label}</span>
                </button>
              );
            })}
          </div>

          <form onSubmit={handleSubmit} className="space-y-4" data-testid="login-form">
            <div className="space-y-1.5">
              <Label htmlFor="email" className="text-sm font-medium">Email address</Label>
              <Input
                id="email"
                type="email"
                placeholder="you@hotel.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="h-11"
                data-testid="input-email"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="password" className="text-sm font-medium">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="h-11"
                data-testid="input-password"
              />
            </div>
            <Button
              type="submit"
              className="w-full h-11 font-semibold rounded-xl mt-2"
              disabled={loginMutation.isPending}
              data-testid="button-signin"
            >
              {loginMutation.isPending ? "Signing in…" : "Sign in"}
            </Button>
          </form>

          <p className="mt-6 text-center text-xs text-muted-foreground">
            Demo password: <span className="font-mono font-semibold">password123</span>
          </p>
        </div>
      </div>
    </div>
  );
}
