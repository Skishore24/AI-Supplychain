import { BrowserRouter, Routes, Route, Navigate, useLocation } from "react-router-dom";
import { CartProvider } from "./context/CartContext";
import { AdminAuthProvider } from "./context/AdminAuthContext";
import AdminProtectedRoute from "./components/admin/AdminProtectedRoute";
import { useEffect, useRef } from "react";

// Customer Pages
import Home from "./pages/user/Home";
import Shop from "./pages/user/Shop";
import ProductDetails from "./pages/user/ProductDetails";
import Cart from "./pages/user/Cart";
import Orders from "./pages/user/Orders";
import Profile from "./pages/user/Profile";
import Login from "./pages/user/Login";

// Admin Supply Chain Pages
import AdminLogin from "./pages/admin/AdminLogin";
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminProducts from "./pages/admin/AdminProducts";
import AdminSuppliers from "./pages/admin/AdminSuppliers";
import AdminInventory from "./pages/admin/AdminInventory";
import AdminSales from "./pages/admin/AdminSales";
import AdminAIAgents from "./pages/admin/AdminAIAgents";

// Smooth page transition wrapper — triggers fade+slide animation on every route change
function PageTransition({ children }) {
  const location = useLocation();
  const ref = useRef(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    // Re-trigger animation on each navigation
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
        {/* Customer E-Commerce Routes */}
        <Route path="/" element={<Home />} />
        <Route path="/shop" element={<Shop />} />
        <Route path="/product/:id" element={<ProductDetails />} />
        <Route path="/cart" element={<Cart />} />
        <Route path="/orders" element={<Orders />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/login" element={<Login />} />

        {/* Admin Gateway Login (Public Entry to Admin Domain) */}
        <Route path="/admin/login" element={<AdminLogin />} />

        {/* Protected Admin Supply Chain Hub Routes (Requires Verified Admin Session) */}
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
          path="/admin/suppliers"
          element={
            <AdminProtectedRoute>
              <AdminSuppliers />
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