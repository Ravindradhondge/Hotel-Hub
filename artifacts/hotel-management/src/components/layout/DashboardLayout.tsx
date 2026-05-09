import React from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Link, useLocation } from "wouter";
import { LogOut, LayoutDashboard, Utensils, Users, Package, FileText, ChefHat } from "lucide-react";
import { Button } from "@/components/ui/button";

interface DashboardLayoutProps {
  children: React.ReactNode;
  title: string;
}

export function DashboardLayout({ children, title }: DashboardLayoutProps) {
  const { user, logout } = useAuth();
  const [location] = useLocation();

  const navigation = {
    owner: [
      { name: "Overview",   href: "/owner",           icon: LayoutDashboard },
      { name: "Menu",       href: "/owner/menu",       icon: Utensils },
      { name: "Inventory",  href: "/owner/inventory",  icon: Package },
      { name: "Staff",      href: "/owner/staff",      icon: Users },
    ],
    waiter:     [{ name: "Tables",  href: "/waiter",     icon: LayoutDashboard }],
    kitchen:    [{ name: "Tickets", href: "/kitchen",    icon: FileText }],
    accountant: [{ name: "Billing", href: "/accountant", icon: FileText }],
  };

  const links = user ? navigation[user.role as keyof typeof navigation] ?? [] : [];

  const ROLE_ACCENT: Record<string, string> = {
    owner:      "text-violet-600 bg-violet-50",
    waiter:     "text-sky-600 bg-sky-50",
    kitchen:    "text-amber-600 bg-amber-50",
    accountant: "text-emerald-600 bg-emerald-50",
  };
  const roleAccent = user ? ROLE_ACCENT[user.role] ?? "text-primary bg-secondary" : "text-primary bg-secondary";

  return (
    <div className="min-h-screen bg-background flex flex-col md:flex-row">

      {/* ── Mobile top bar ── */}
      <header className="md:hidden bg-card border-b border-border sticky top-0 z-20 card-shadow">
        <div className="flex items-center justify-between px-4 py-2.5">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center shrink-0">
              <ChefHat className="w-4 h-4 text-white" />
            </div>
            <div>
              <p className="text-sm font-serif font-bold text-foreground leading-none">Shagun Tadka</p>
              <p className="text-[10px] text-muted-foreground capitalize mt-0.5">{user?.role} Portal</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-2">
              <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${roleAccent}`}>
                {user?.name?.charAt(0).toUpperCase()}
              </div>
              <span className="text-sm font-medium max-w-[90px] truncate">{user?.name}</span>
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="text-destructive hover:text-destructive hover:bg-destructive/10 shrink-0 w-8 h-8"
              onClick={logout}
            >
              <LogOut className="w-4 h-4" />
            </Button>
          </div>
        </div>
        <div className="flex overflow-x-auto px-3 pb-2 gap-1 scrollbar-none">
          {links.map((link) => {
            const Icon = link.icon;
            const isActive = location === link.href;
            return (
              <Link key={link.href} href={link.href}>
                <span className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-colors ${
                  isActive ? "bg-primary text-primary-foreground shadow-sm" : "text-muted-foreground hover:bg-secondary hover:text-foreground"
                }`}>
                  <Icon className="w-3.5 h-3.5" />
                  {link.name}
                </span>
              </Link>
            );
          })}
        </div>
      </header>

      {/* ── Desktop sidebar ── */}
      <aside className="hidden md:flex w-64 bg-card border-r border-border shrink-0 h-screen sticky top-0 flex-col card-shadow">
        <div className="p-5 border-b border-border">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-primary flex items-center justify-center shrink-0">
              <ChefHat className="w-4.5 h-4.5 text-white" />
            </div>
            <div>
              <h1 className="text-base font-serif font-bold text-foreground leading-none">Shagun Tadka</h1>
              <p className="text-xs text-muted-foreground capitalize mt-0.5">{user?.role} Portal</p>
            </div>
          </div>
        </div>

        <nav className="flex-1 p-3 space-y-0.5 overflow-y-auto">
          {links.map((link) => {
            const Icon = link.icon;
            const isActive = location === link.href;
            return (
              <Link key={link.href} href={link.href}>
                <span className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all text-sm ${
                  isActive
                    ? "bg-primary text-primary-foreground font-semibold shadow-sm"
                    : "text-muted-foreground hover:bg-secondary hover:text-foreground"
                }`}>
                  <Icon className="w-4 h-4" />
                  {link.name}
                </span>
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-border">
          <div className="flex items-center gap-3 mb-3 px-1">
            <div className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-sm shrink-0 ${roleAccent}`}>
              {user?.name?.charAt(0).toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold truncate">{user?.name}</p>
              <p className="text-xs text-muted-foreground truncate">{user?.email}</p>
            </div>
          </div>
          <Button
            variant="outline"
            className="w-full justify-start text-destructive hover:text-destructive hover:bg-destructive/10 rounded-xl h-9 text-sm"
            onClick={logout}
          >
            <LogOut className="w-4 h-4 mr-2" />
            Sign out
          </Button>
        </div>
      </aside>

      {/* ── Page content ── */}
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <header className="h-13 border-b border-border bg-card/80 backdrop-blur-sm flex items-center px-4 md:px-6 shrink-0 sticky top-0 z-10">
          <h2 className="text-base md:text-lg font-bold text-foreground">{title}</h2>
        </header>
        <div className="flex-1 p-4 md:p-6 overflow-y-auto">
          <div className="max-w-6xl mx-auto">
            {children}
          </div>
        </div>
      </main>
    </div>
  );
}
