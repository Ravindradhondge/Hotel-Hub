import React from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Link, useLocation } from "wouter";
import { LogOut, LayoutDashboard, Utensils, Users, Package, FileText } from "lucide-react";
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
      { name: "Overview", href: "/owner", icon: LayoutDashboard },
      { name: "Menu", href: "/owner/menu", icon: Utensils },
      { name: "Inventory", href: "/owner/inventory", icon: Package },
      { name: "Staff", href: "/owner/staff", icon: Users },
    ],
    waiter: [
      { name: "Tables", href: "/waiter", icon: LayoutDashboard },
    ],
    kitchen: [
      { name: "Tickets", href: "/kitchen", icon: FileText },
    ],
    accountant: [
      { name: "Billing", href: "/accountant", icon: FileText },
    ]
  };

  const links = user ? navigation[user.role as keyof typeof navigation] : [];

  return (
    <div className="min-h-screen bg-background flex flex-col md:flex-row">

      {/* ── Mobile top bar ── */}
      <header className="md:hidden bg-card border-b border-border sticky top-0 z-20">
        {/* Row 1: brand + user + sign out */}
        <div className="flex items-center justify-between px-4 py-3">
          <div>
            <p className="text-base font-serif font-bold text-primary leading-none">Shagun Tadka</p>
            <p className="text-xs text-muted-foreground capitalize mt-0.5">{user?.role} Portal</p>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-full bg-secondary flex items-center justify-center text-xs font-bold text-primary">
                {user?.name?.charAt(0).toUpperCase()}
              </div>
              <span className="text-sm font-medium max-w-[100px] truncate">{user?.name}</span>
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="text-destructive hover:text-destructive hover:bg-destructive/10 shrink-0"
              onClick={logout}
            >
              <LogOut className="w-4 h-4" />
            </Button>
          </div>
        </div>
        {/* Row 2: nav links (horizontal scroll) */}
        <div className="flex overflow-x-auto px-3 pb-2 gap-1 scrollbar-none">
          {links.map((link) => {
            const Icon = link.icon;
            const isActive = location === link.href;
            return (
              <Link key={link.href} href={link.href}>
                <span className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
                  isActive
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:bg-secondary hover:text-foreground"
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
      <aside className="hidden md:flex w-64 bg-card border-r border-border shrink-0 h-screen sticky top-0 flex-col">
        <div className="p-6 border-b border-border">
          <h1 className="text-xl font-serif font-bold text-primary">Shagun Tadka</h1>
          <p className="text-sm text-muted-foreground mt-1 capitalize">{user?.role} Portal</p>
        </div>
        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          {links.map((link) => {
            const Icon = link.icon;
            const isActive = location === link.href;
            return (
              <Link key={link.href} href={link.href}>
                <span className={`flex items-center gap-3 px-3 py-2.5 rounded-md transition-colors ${
                  isActive
                    ? "bg-primary text-primary-foreground font-medium shadow-sm"
                    : "text-muted-foreground hover:bg-secondary hover:text-foreground"
                }`}>
                  <Icon className="w-5 h-5" />
                  {link.name}
                </span>
              </Link>
            );
          })}
        </nav>
        <div className="p-4 border-t border-border">
          <div className="flex items-center gap-3 mb-4 px-2">
            <div className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center text-primary font-bold shrink-0">
              {user?.name?.charAt(0).toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{user?.name}</p>
              <p className="text-xs text-muted-foreground truncate">{user?.email}</p>
            </div>
          </div>
          <Button
            variant="outline"
            className="w-full justify-start text-destructive hover:text-destructive hover:bg-destructive/10"
            onClick={logout}
          >
            <LogOut className="w-4 h-4 mr-2" />
            Sign out
          </Button>
        </div>
      </aside>

      {/* ── Page content ── */}
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <header className="h-14 md:h-16 border-b border-border bg-card/50 backdrop-blur-sm flex items-center px-4 md:px-6 shrink-0 sticky top-0 z-10">
          <h2 className="text-base md:text-lg font-semibold">{title}</h2>
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
