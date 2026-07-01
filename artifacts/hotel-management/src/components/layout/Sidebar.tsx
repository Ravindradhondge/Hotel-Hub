import { NavLink, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  LayoutDashboard, Table2, ShoppingBag, ChefHat,
  Receipt, Users, UtensilsCrossed, Package,
  BarChart3, Settings, LogOut, X,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

interface MenuItem {
  label: string;
  path: string;
  icon: React.ElementType;
  permission: string;
}

const menuItems: MenuItem[] = [
  { label: "Dashboard", path: "/", icon: LayoutDashboard, permission: "dashboard" },
  { label: "Tables", path: "/tables", icon: Table2, permission: "tables" },
  { label: "Orders", path: "/orders", icon: ShoppingBag, permission: "orders" },
  { label: "Kitchen", path: "/kitchen", icon: ChefHat, permission: "kitchen" },
  { label: "Billing", path: "/billing", icon: Receipt, permission: "billing" },
  { label: "Customers", path: "/customers", icon: Users, permission: "customers" },
  { label: "Menu", path: "/menu", icon: UtensilsCrossed, permission: "menu" },
  { label: "Inventory", path: "/inventory", icon: Package, permission: "inventory" },
  { label: "Reports", path: "/reports", icon: BarChart3, permission: "reports" },
  { label: "Settings", path: "/settings", icon: Settings, permission: "settings" },
];

interface SidebarProps {
  open: boolean;
  onClose: () => void;
}

export default function Sidebar({ open, onClose }: SidebarProps) {
  const { hasPermission, userProfile, logout } = useAuth();
  const navigate = useNavigate();

  const visibleItems = menuItems.filter((item) => hasPermission(item.permission));

  async function handleLogout() {
    try {
      await logout();
      navigate("/login");
      toast.success("Logged out successfully");
    } catch {
      toast.error("Failed to log out");
    }
  }

  const roleColors: Record<string, string> = {
    owner: "text-amber-400 bg-amber-400/10",
    manager: "text-blue-400 bg-blue-400/10",
    waiter: "text-emerald-400 bg-emerald-400/10",
    cashier: "text-purple-400 bg-purple-400/10",
  };

  const sidebarContent = (
    <div className="flex flex-col h-full bg-white dark:bg-slate-950 border-r border-slate-200 dark:border-slate-800">
      {/* Logo */}
      <div className="flex items-center justify-between px-4 py-5 border-b border-slate-200 dark:border-slate-800">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-emerald-500 rounded-lg flex items-center justify-center">
            <ChefHat size={20} className="text-white dark:text-slate-900" />
          </div>
          <div>
            <div className="text-sm font-bold text-slate-900 dark:text-slate-100">Hotel Sai Mahlar</div>
            <div className="text-xs text-slate-500">Management System</div>
          </div>
        </div>
        <button onClick={onClose} className="md:hidden text-slate-500 hover:text-slate-700 dark:hover:text-slate-700 dark:text-slate-300 p-1">
          <X size={18} />
        </button>
      </div>

      {/* User Info */}
      <div className="px-4 py-3 mx-3 mt-3 rounded-lg bg-slate-100 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/50">
        <div className="text-xs text-slate-500 dark:text-slate-400 mb-0.5">Logged in as</div>
        <div className="text-sm font-semibold text-slate-900 dark:text-slate-200 truncate">{userProfile?.name}</div>
        <span className={`mt-1 inline-block px-2 py-0.5 rounded-full text-xs font-semibold ${roleColors[userProfile?.role ?? "waiter"]}`}>
          {userProfile?.role?.charAt(0).toUpperCase()}{userProfile?.role?.slice(1)}
        </span>
      </div>

      {/* Nav Items */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {visibleItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            end={item.path === "/"}
            onClick={onClose}
            className={({ isActive }) =>
              `sidebar-link ${isActive ? "active" : ""}`
            }
          >
            <item.icon size={18} />
            <span>{item.label}</span>
          </NavLink>
        ))}
      </nav>

      {/* Logout */}
      <div className="px-3 py-4 border-t border-slate-200 dark:border-slate-800">
        <button
          onClick={handleLogout}
          className="sidebar-link w-full text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-500/10 hover:text-red-700 dark:hover:text-red-400"
        >
          <LogOut size={18} />
          <span>Logout</span>
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop sidebar */}
      <div className="hidden md:flex flex-col w-64 shrink-0 h-full">
        {sidebarContent}
      </div>

      {/* Mobile overlay */}
      {open && (
        <div className="md:hidden fixed inset-0 z-50 flex">
          <motion.div
            initial={{ x: -280 }}
            animate={{ x: 0 }}
            exit={{ x: -280 }}
            transition={{ type: "tween", duration: 0.25 }}
            className="w-64"
          >
            {sidebarContent}
          </motion.div>
          <div
            className="flex-1 bg-black/60 backdrop-blur-sm"
            onClick={onClose}
          />
        </div>
      )}
    </>
  );
}
