import { Switch, Route, Router as WouterRouter, Redirect } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import LoginPage from "@/pages/LoginPage";
import WaiterDashboard from "@/pages/WaiterDashboard";
import KitchenDashboard from "@/pages/KitchenDashboard";
import AccountantDashboard from "@/pages/AccountantDashboard";
import OwnerDashboard from "@/pages/OwnerDashboard";
import MenuManagement from "@/pages/MenuManagement";
import InventoryManagement from "@/pages/InventoryManagement";
import StaffManagement from "@/pages/StaffManagement";
import TableManagement from "@/pages/TableManagement";
import NotFound from "@/pages/not-found";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { retry: 1, staleTime: 30_000 },
  },
});

function RoleRedirect() {
  const { user, isLoading } = useAuth();
  if (isLoading) return <div className="min-h-screen flex items-center justify-center bg-background"><div className="text-muted-foreground">Loading...</div></div>;
  if (!user) return <Redirect to="/login" />;
  return <Redirect to={`/${user.role}`} />;
}

function AppRouter() {
  return (
    <Switch>
      <Route path="/login" component={LoginPage} />
      <Route path="/waiter">
        <ProtectedRoute allowedRoles={["waiter"]}><WaiterDashboard /></ProtectedRoute>
      </Route>
      <Route path="/kitchen">
        <ProtectedRoute allowedRoles={["kitchen"]}><KitchenDashboard /></ProtectedRoute>
      </Route>
      <Route path="/accountant">
        <ProtectedRoute allowedRoles={["accountant"]}><AccountantDashboard /></ProtectedRoute>
      </Route>
      <Route path="/owner">
        <ProtectedRoute allowedRoles={["owner"]}><OwnerDashboard /></ProtectedRoute>
      </Route>
      <Route path="/owner/menu">
        <ProtectedRoute allowedRoles={["owner"]}><MenuManagement /></ProtectedRoute>
      </Route>
      <Route path="/owner/inventory">
        <ProtectedRoute allowedRoles={["owner"]}><InventoryManagement /></ProtectedRoute>
      </Route>
      <Route path="/owner/staff">
        <ProtectedRoute allowedRoles={["owner"]}><StaffManagement /></ProtectedRoute>
      </Route>
      <Route path="/owner/tables">
        <ProtectedRoute allowedRoles={["owner"]}><TableManagement /></ProtectedRoute>
      </Route>
      <Route path="/" component={RoleRedirect} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
          <AuthProvider>
            <AppRouter />
          </AuthProvider>
        </WouterRouter>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
