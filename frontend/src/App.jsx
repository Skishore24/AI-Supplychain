import { BrowserRouter, Routes, Route, Navigate, useLocation } from "react-router-dom";
import { CartProvider } from "./context/CartContext";
import { AdminAuthProvider } from "./context/AdminAuthContext";
import AdminProtectedRoute from "./components/admin/AdminProtectedRoute";
import { useEffect, useRef } from "react";

// Customer Storefront Pages
import Home from "./pages/user/Home";
import Shop from "./pages/user/Shop";
import ProductDetails from "./pages/user/ProductDetails";
import Cart from "./pages/user/Cart";
import Orders from "./pages/user/Orders";
import Profile from "./pages/user/Profile";
import Login from "./pages/user/Login";

// Admin Supply Chain Operations Pages
import AdminLogin from "./pages/admin/AdminLogin";
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminProducts from "./pages/admin/AdminProducts";
import AdminProductDetails from "./pages/admin/AdminProductDetails";
import AdminInventory from "./pages/admin/AdminInventory";
import AdminSuppliers from "./pages/admin/AdminSuppliers";
import AdminPurchaseOrders from "./pages/admin/AdminPurchaseOrders";
import AdminSales from "./pages/admin/AdminSales";
import AdminAIAgents from "./pages/admin/AdminAIAgents";
import AdminDemandForecasting from "./pages/admin/AdminDemandForecasting";
import AdminRiskAlerts from "./pages/admin/AdminRiskAlerts";
import AdminAnalytics from "./pages/admin/AdminAnalytics";
import AdminUsers from "./pages/admin/AdminUsers";
import AdminNotifications from "./pages/admin/AdminNotifications";
import AdminAuditLogs from "./pages/admin/AdminAuditLogs";
import AdminSettings from "./pages/admin/AdminSettings";

// Smooth page transition wrapper
function PageTransition({ children }) {
  const location = useLocation();
  const ref = useRef(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    el.classList.remove("page-enter");
    void el.offsetWidth; // reflow
    el.classList.add("page-enter");
  }, [location.pathname]);

  return (
    <div ref={ref} className="page-enter">
      {children}
    </div>
  );
}

function AppRoutes() {
  return (
    <PageTransition>
      <Routes>
        {/* Customer Storefront Routes */}
        <Route path="/" element={<Home />} />
        <Route path="/shop" element={<Shop />} />
        <Route path="/product/:id" element={<ProductDetails />} />
        <Route path="/cart" element={<Cart />} />
        <Route path="/orders" element={<Orders />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/login" element={<Login />} />

        {/* Admin Gateway Login */}
        <Route path="/admin/login" element={<AdminLogin />} />

        {/* Protected Admin Operations Hub Routes */}
        <Route
          path="/admin"
          element={
            <AdminProtectedRoute>
              <AdminDashboard />
            </AdminProtectedRoute>
          }
        />
        <Route
          path="/admin/products"
          element={
            <AdminProtectedRoute>
              <AdminProducts />
            </AdminProtectedRoute>
          }
        />
        <Route
          path="/admin/products/:id"
          element={
            <AdminProtectedRoute>
              <AdminProductDetails />
            </AdminProtectedRoute>
          }
        />
        <Route
          path="/admin/inventory"
          element={
            <AdminProtectedRoute>
              <AdminInventory />
            </AdminProtectedRoute>
          }
        />
        <Route
          path="/admin/suppliers"
          element={
            <AdminProtectedRoute>
              <AdminSuppliers />
            </AdminProtectedRoute>
          }
        />
        <Route
          path="/admin/purchase-orders"
          element={
            <AdminProtectedRoute>
              <AdminPurchaseOrders />
            </AdminProtectedRoute>
          }
        />
        <Route
          path="/admin/sales"
          element={
            <AdminProtectedRoute>
              <AdminSales />
            </AdminProtectedRoute>
          }
        />
        <Route
          path="/admin/ai-agents"
          element={
            <AdminProtectedRoute>
              <AdminAIAgents />
            </AdminProtectedRoute>
          }
        />
        <Route
          path="/admin/demand-forecasting"
          element={
            <AdminProtectedRoute>
              <AdminDemandForecasting />
            </AdminProtectedRoute>
          }
        />
        <Route
          path="/admin/alerts"
          element={
            <AdminProtectedRoute>
              <AdminRiskAlerts />
            </AdminProtectedRoute>
          }
        />
        <Route
          path="/admin/analytics"
          element={
            <AdminProtectedRoute>
              <AdminAnalytics />
            </AdminProtectedRoute>
          }
        />
        <Route
          path="/admin/users"
          element={
            <AdminProtectedRoute>
              <AdminUsers />
            </AdminProtectedRoute>
          }
        />
        <Route
          path="/admin/notifications"
          element={
            <AdminProtectedRoute>
              <AdminNotifications />
            </AdminProtectedRoute>
          }
        />
        <Route
          path="/admin/audit-logs"
          element={
            <AdminProtectedRoute>
              <AdminAuditLogs />
            </AdminProtectedRoute>
          }
        />
        <Route
          path="/admin/settings"
          element={
            <AdminProtectedRoute>
              <AdminSettings />
            </AdminProtectedRoute>
          }
        />

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </PageTransition>
  );
}

function App() {
  return (
    <AdminAuthProvider>
      <CartProvider>
        <BrowserRouter>
          <AppRoutes />
        </BrowserRouter>
      </CartProvider>
    </AdminAuthProvider>
  );
}

export default App;