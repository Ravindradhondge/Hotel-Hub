import React from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Link, useLocation } from "wouter";
import { LogOut, LayoutDashboard, Utensils, Users, Package, FileText, ChefHat, Table2, CalendarCheck, LogIn, LogOut as LogOutIcon, Wallet } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useGetMyTodayAttendance, useCheckIn, useCheckOut } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { getGetMyTodayAttendanceQueryKey } from "@workspace/api-client-react";
import { useToast } from "@/hooks/use-toast";

const HOTEL_NAME = import.meta.env.VITE_HOTEL_NAME || "Shagun Tadka";

interface DashboardLayoutProps {
  children: React.ReactNode;
  title: string;
}

function useAttendanceActions() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const { data: record, isLoading } = useGetMyTodayAttendance({ query: { retry: false, queryKey: getGetMyTodayAttendanceQueryKey() } });
  const checkIn  = useCheckIn();
  const checkOut = useCheckOut();

  const refresh = () => queryClient.invalidateQueries({ queryKey: getGetMyTodayAttendanceQueryKey() });

  const handleCheckIn = () => {
    checkIn.mutate(undefined, {
      onSuccess: () => { toast({ title: "Checked in ✓" }); refresh(); },
      onError: (e: any) => toast({ title: e?.response?.data?.error ?? "Check-in failed", variant: "destructive" }),
    });
  };

  const handleCheckOut = () => {
    checkOut.mutate(undefined, {
      onSuccess: () => { toast({ title: "Checked out ✓" }); refresh(); },
      onError: (e: any) => toast({ title: e?.response?.data?.error ?? "Check-out failed", variant: "destructive" }),
    });
  };

  return { record, isLoading, handleCheckIn, handleCheckOut, checkInPending: checkIn.isPending, checkOutPending: checkOut.isPending };
}

function AttendanceButton({ role }: { role: string }) {
  const { record, isLoading, handleCheckIn, handleCheckOut, checkInPending, checkOutPending } = useAttendanceActions();

  if (role === "owner") return null;
  if (isLoading) return <div className="h-9 rounded-xl bg-secondary animate-pulse" />;

  if (!record) {
    return (
      <Button variant="outline" className="w-full justify-start rounded-xl h-9 text-sm text-emerald-600 border-emerald-200 hover:bg-emerald-50 hover:text-emerald-700" onClick={handleCheckIn} disabled={checkInPending}>
        <LogIn className="w-4 h-4 mr-2" />
        Check In
      </Button>
    );
  }

  if (!record.checkOut) {
    return (
      <Button variant="outline" className="w-full justify-start rounded-xl h-9 text-sm text-amber-600 border-amber-200 hover:bg-amber-50 hover:text-amber-700" onClick={handleCheckOut} disabled={checkOutPending}>
        <LogOutIcon className="w-4 h-4 mr-2" />
        Check Out
      </Button>
    );
  }

  return (
    <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-secondary/60 text-xs text-muted-foreground">
      <CalendarCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
      <span>Done for today</span>
    </div>
  );
}

function MobileAttendanceBar({ role }: { role: string }) {
  const { record, isLoading, handleCheckIn, handleCheckOut, checkInPending, checkOutPending } = useAttendanceActions();

  if (role === "owner") return null;
  if (isLoading) return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 z-30 bg-card border-t border-border px-4 py-3">
      <div className="h-11 rounded-xl bg-secondary animate-pulse" />
    </div>
  );

  if (!record) {
    return (
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-30 bg-card border-t border-border px-4 py-3 shadow-lg">
        <Button className="w-full h-11 rounded-xl font-semibold bg-emerald-600 hover:bg-emerald-700 text-white" onClick={handleCheckIn} disabled={checkInPending}>
          <LogIn className="w-4 h-4 mr-2" />
          {checkInPending ? "Checking in…" : "Check In"}
        </Button>
      </div>
    );
  }

  if (!record.checkOut) {
    return (
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-30 bg-card border-t border-border px-4 py-3 shadow-lg">
        <Button variant="outline" className="w-full h-11 rounded-xl font-semibold text-amber-600 border-amber-300 hover:bg-amber-50" onClick={handleCheckOut} disabled={checkOutPending}>
          <LogOutIcon className="w-4 h-4 mr-2" />
          {checkOutPending ? "Checking out…" : "Check Out"}
        </Button>
      </div>
    );
  }

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 z-30 bg-card border-t border-border px-4 py-3 shadow-lg">
      <div className="flex items-center justify-center gap-2 h-11 rounded-xl bg-secondary/60 text-sm text-muted-foreground font-medium">
        <CalendarCheck className="w-4 h-4 text-emerald-600" />
        Done for today
      </div>
    </div>
  );
}

export function DashboardLayout({ children, title }: DashboardLayoutProps) {
  const { user, logout } = useAuth();
  const [location] = useLocation();

  const navigation = {
    owner: [
      { name: "Overview",   href: "/owner",             icon: LayoutDashboard },
      { name: "Menu",       href: "/owner/menu",         icon: Utensils },
      { name: "Inventory",  href: "/owner/inventory",    icon: Package },
      { name: "Tables",     href: "/owner/tables",       icon: Table2 },
      { name: "Staff",      href: "/owner/staff",        icon: Users },
      { name: "Attendance", href: "/owner/attendance",   icon: CalendarCheck },
      { name: "Expenses",   href: "/owner/expenses",     icon: Wallet },
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

  const isNonOwner = user && user.role !== "owner";

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
              <p className="text-sm font-serif font-bold text-foreground leading-none">{HOTEL_NAME}</p>
              <p className="text-[10px] text-muted-foreground capitalize mt-0.5">{user?.role} Portal</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${roleAccent}`}>
              {user?.name?.charAt(0).toUpperCase()}
            </div>
            <span className="text-sm font-medium max-w-[80px] truncate">{user?.name}</span>
            <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive hover:bg-destructive/10 shrink-0 w-8 h-8" onClick={logout}>
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
              <h1 className="text-base font-serif font-bold text-foreground leading-none">{HOTEL_NAME}</h1>
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
                  isActive ? "bg-primary text-primary-foreground font-semibold shadow-sm" : "text-muted-foreground hover:bg-secondary hover:text-foreground"
                }`}>
                  <Icon className="w-4 h-4" />
                  {link.name}
                </span>
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-border space-y-2">
          {isNonOwner && <AttendanceButton role={user!.role} />}
          <div className="flex items-center gap-3 px-1">
            <div className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-sm shrink-0 ${roleAccent}`}>
              {user?.name?.charAt(0).toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold truncate">{user?.name}</p>
              <p className="text-xs text-muted-foreground truncate">{user?.email}</p>
            </div>
          </div>
          <Button variant="outline" className="w-full justify-start text-destructive hover:text-destructive hover:bg-destructive/10 rounded-xl h-9 text-sm" onClick={logout}>
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
        {/* Extra bottom padding on mobile so content isn't hidden behind the sticky attendance bar */}
        <div className={`flex-1 p-4 md:p-6 overflow-y-auto ${isNonOwner ? "pb-24 md:pb-6" : ""}`}>
          <div className="max-w-6xl mx-auto">
            {children}
          </div>
        </div>
      </main>

      {/* ── Mobile sticky attendance bar (non-owner only) ── */}
      {isNonOwner && <MobileAttendanceBar role={user!.role} />}
    </div>
  );
}
