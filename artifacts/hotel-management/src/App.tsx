import { Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import DashboardLayout from "@/components/layout/DashboardLayout";
import LoginPage from "@/pages/LoginPage";
import DashboardPage from "@/pages/DashboardPage";
import TablesPage from "@/pages/TablesPage";
import OrdersPage from "@/pages/OrdersPage";
import KitchenPage from "@/pages/KitchenPage";
import BillingPage from "@/pages/BillingPage";
import CustomersPage from "@/pages/CustomersPage";
import MenuPage from "@/pages/MenuPage";
import InventoryPage from "@/pages/InventoryPage";
import ReportsPage from "@/pages/ReportsPage";
import SettingsPage from "@/pages/SettingsPage";

function ProtectedRoute({ children, permission }: { children: React.ReactNode; permission?: string }) {
  const { currentUser, loading, hasPermission } = useAuth();
  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-slate-950">
      <div className="w-10 h-10 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin" />
    </div>
  );
  if (!currentUser) return <Navigate to="/login" replace />;
  if (permission && !hasPermission(permission)) return <Navigate to="/" replace />;
  return <>{children}</>;
}

export default function App() {
  const { currentUser, loading } = useAuth();

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-slate-950">
      <div className="w-10 h-10 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin" />
    </div>
  );

  return (
    <Routes>
      <Route path="/login" element={currentUser ? <Navigate to="/" replace /> : <LoginPage />} />
      <Route
        path="/*"
        element={
          <ProtectedRoute>
            <DashboardLayout>
              <Routes>
                <Route path="/" element={<ProtectedRoute permission="dashboard"><DashboardPage /></ProtectedRoute>} />
                <Route path="/tables" element={<ProtectedRoute permission="tables"><TablesPage /></ProtectedRoute>} />
                <Route path="/orders" element={<ProtectedRoute permission="orders"><OrdersPage /></ProtectedRoute>} />
                <Route path="/kitchen" element={<ProtectedRoute permission="kitchen"><KitchenPage /></ProtectedRoute>} />
                <Route path="/billing" element={<ProtectedRoute permission="billing"><BillingPage /></ProtectedRoute>} />
                <Route path="/customers" element={<ProtectedRoute permission="customers"><CustomersPage /></ProtectedRoute>} />
                <Route path="/menu" element={<ProtectedRoute permission="menu"><MenuPage /></ProtectedRoute>} />
                <Route path="/inventory" element={<ProtectedRoute permission="inventory"><InventoryPage /></ProtectedRoute>} />
                <Route path="/reports" element={<ProtectedRoute permission="reports"><ReportsPage /></ProtectedRoute>} />
                <Route path="/settings" element={<ProtectedRoute permission="settings"><SettingsPage /></ProtectedRoute>} />
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </DashboardLayout>
          </ProtectedRoute>
        }
      />
    </Routes>
  );
}
