import { useState } from "react";
import { useLocation } from "wouter";
import { useLogin } from "@workspace/api-client-react";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";

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

  return (
    <div className="min-h-screen flex bg-background">
      <div className="hidden lg:flex lg:w-1/2 bg-primary flex-col justify-between p-12">
        <div>
          <h1 className="text-4xl font-serif font-bold text-primary-foreground">Shagun Tadka</h1>
          <p className="text-primary-foreground/70 mt-2 text-lg">Hotel Management System</p>
        </div>
        <div className="space-y-6">
          {[
            { role: "Owner", desc: "Full analytics, menu & staff control" },
            { role: "Waiter", desc: "Table management & order creation" },
            { role: "Kitchen", desc: "Live order tickets & status updates" },
            { role: "Accountant", desc: "Billing, payments & daily reports" },
          ].map((item) => (
            <div key={item.role} className="flex items-start gap-3">
              <div className="w-2 h-2 rounded-full bg-primary-foreground/50 mt-2 shrink-0" />
              <div>
                <p className="text-primary-foreground font-medium">{item.role}</p>
                <p className="text-primary-foreground/60 text-sm">{item.desc}</p>
              </div>
            </div>
          ))}
        </div>
        <div className="text-primary-foreground/40 text-sm">
          &copy; {new Date().getFullYear()} Shagun Tadka
        </div>
      </div>

      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-md">
          <div className="mb-8">
            <h2 className="text-3xl font-serif font-bold text-foreground">Sign in</h2>
            <p className="text-muted-foreground mt-2">Enter your credentials to access your dashboard</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5" data-testid="login-form">
            <div className="space-y-2">
              <Label htmlFor="email">Email address</Label>
              <Input
                id="email"
                type="email"
                placeholder="you@hotel.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                data-testid="input-email"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                data-testid="input-password"
              />
            </div>
            <Button
              type="submit"
              className="w-full"
              disabled={loginMutation.isPending}
              data-testid="button-signin"
            >
              {loginMutation.isPending ? "Signing in..." : "Sign in"}
            </Button>
          </form>

        </div>
      </div>
    </div>
  );
}
