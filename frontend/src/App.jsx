import { BrowserRouter, Routes, Route, Navigate, useLocation } from "react-router-dom";
import { useEffect, useRef } from "react";
import { CartProvider } from "./context/CartContext";
import { AdminAuthProvider } from "./context/AdminAuthContext";
import AdminProtectedRoute from "./components/admin/AdminProtectedRoute";

// Layouts
import MarketingLayout from "./layouts/MarketingLayout";
import AppLayout from "./layouts/AppLayout";

// Public Marketing & SEO Pages
import LandingPage from "./pages/public/LandingPage";
import AboutPage from "./pages/public/AboutPage";
import FeaturesPage from "./pages/public/FeaturesPage";
import SolutionsPage from "./pages/public/SolutionsPage";
import PricingPage from "./pages/public/PricingPage";
import DocumentationPage from "./pages/public/DocumentationPage";
import ContactPage from "./pages/public/ContactPage";
import BlogPage from "./pages/public/BlogPage";
import BlogPostPage from "./pages/public/BlogPostPage";
import PrivacyPage from "./pages/public/PrivacyPage";
import TermsPage from "./pages/public/TermsPage";

// Auth Pages
import Login from "./pages/user/Login";
import Register from "./pages/auth/Register";
import ForgotPassword from "./pages/auth/ForgotPassword";
import ResetPassword from "./pages/auth/ResetPassword";
import VerifyEmail from "./pages/auth/VerifyEmail";
import AdminLogin from "./pages/admin/AdminLogin";

// Tenant App Workspace Pages
import AppTeam from "./pages/app/AppTeam";

// Operations & Intelligence Pages (used in both /app and /admin)
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminProducts from "./pages/admin/AdminProducts";
import AdminProductDetails from "./pages/admin/AdminProductDetails";
import AdminInventory from "./pages/admin/AdminInventory";
import AdminSuppliers from "./pages/admin/AdminSuppliers";
import AdminPurchaseOrders from "./pages/admin/AdminPurchaseOrders";
import AdminSales from "./pages/admin/AdminSales";
import AdminAICenter from "./pages/admin/AdminAICenter";
import AdminAISettings from "./pages/admin/AdminAISettings";
import AdminKnowledge from "./pages/admin/AdminKnowledge";
import AdminForecasting from "./pages/admin/AdminForecasting";
import AdminRisk from "./pages/admin/AdminRisk";
import AdminRecommendations from "./pages/admin/AdminRecommendations";
import AdminAnalytics from "./pages/admin/AdminAnalytics";
import AdminUsers from "./pages/admin/AdminUsers";
import AdminNotifications from "./pages/admin/AdminNotifications";
import AdminAuditLogs from "./pages/admin/AdminAuditLogs";
import AdminSettings from "./pages/admin/AdminSettings";
import AdminOrganizations from "./pages/admin/AdminOrganizations";
import AdminJobs from "./pages/admin/AdminJobs";

// Customer Storefront Pages (Preserved for zero regression)
import Shop from "./pages/user/Shop";
import ProductDetails from "./pages/user/ProductDetails";
import Cart from "./pages/user/Cart";
import Orders from "./pages/user/Orders";
import Profile from "./pages/user/Profile";

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
        {/* Public SaaS Marketing Website */}
        <Route element={<MarketingLayout />}>
          <Route path="/" element={<LandingPage />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="/features" element={<FeaturesPage />} />
          <Route path="/solutions" element={<SolutionsPage />} />
          <Route path="/ai-agents" element={<FeaturesPage />} />
          <Route path="/forecasting" element={<FeaturesPage />} />
          <Route path="/inventory" element={<FeaturesPage />} />
          <Route path="/procurement" element={<FeaturesPage />} />
          <Route path="/supplier-intelligence" element={<FeaturesPage />} />
          <Route path="/risk-management" element={<FeaturesPage />} />
          <Route path="/analytics" element={<FeaturesPage />} />
          <Route path="/pricing" element={<PricingPage />} />
          <Route path="/documentation" element={<DocumentationPage />} />
          <Route path="/contact" element={<ContactPage />} />
          <Route path="/blog" element={<BlogPage />} />
          <Route path="/blog/:slug" element={<BlogPostPage />} />
          <Route path="/privacy" element={<PrivacyPage />} />
          <Route path="/terms" element={<TermsPage />} />
        </Route>

        {/* Authentication Routes */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route path="/verify-email" element={<VerifyEmail />} />
        <Route path="/admin/login" element={<AdminLogin />} />

        {/* Customer Storefront Routes (Preserved 100%) */}
        <Route path="/shop" element={<Shop />} />
        <Route path="/product/:id" element={<ProductDetails />} />
        <Route path="/cart" element={<Cart />} />
        <Route path="/orders" element={<Orders />} />
        <Route path="/profile" element={<Profile />} />

        {/* Tenant Application Workspace Routes (/app/*) */}
        <Route
          path="/app"
          element={
            <AdminProtectedRoute>
              <AppLayout />
            </AdminProtectedRoute>
          }
        >
          <Route index element={<Navigate to="/app/dashboard" replace />} />
          <Route path="dashboard" element={<AdminDashboard />} />
          <Route path="inventory" element={<AdminInventory />} />
          <Route path="forecasting" element={<AdminForecasting />} />
          <Route path="procurement" element={<AdminPurchaseOrders />} />
          <Route path="purchase-orders" element={<AdminPurchaseOrders />} />
          <Route path="suppliers" element={<AdminSuppliers />} />
          <Route path="risk" element={<AdminRisk />} />
          <Route path="sales" element={<AdminSales />} />
          <Route path="analytics" element={<AdminAnalytics />} />
          <Route path="ai-assistant" element={<AdminAICenter />} />
          <Route path="documents" element={<AdminKnowledge />} />
          <Route path="knowledge" element={<AdminKnowledge />} />
          <Route path="alerts" element={<AdminRisk />} />
          <Route path="team" element={<AppTeam />} />
          <Route path="settings" element={<AdminSettings />} />
        </Route>

        {/* Platform Admin Console Routes (/admin/*) */}
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
          path="/admin/ai"
          element={
            <AdminProtectedRoute>
              <AdminAICenter />
            </AdminProtectedRoute>
          }
        />
        <Route
          path="/admin/ai/settings"
          element={
            <AdminProtectedRoute>
              <AdminAISettings />
            </AdminProtectedRoute>
          }
        />
        <Route
          path="/admin/knowledge"
          element={
            <AdminProtectedRoute>
              <AdminKnowledge />
            </AdminProtectedRoute>
          }
        />
        <Route
          path="/admin/recommendations"
          element={
            <AdminProtectedRoute>
              <AdminRecommendations />
            </AdminProtectedRoute>
          }
        />
        <Route
          path="/admin/forecasting"
          element={
            <AdminProtectedRoute>
              <AdminForecasting />
            </AdminProtectedRoute>
          }
        />
        <Route
          path="/admin/risk"
          element={
            <AdminProtectedRoute>
              <AdminRisk />
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
          path="/admin/organizations"
          element={
            <AdminProtectedRoute>
              <AdminOrganizations />
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
          path="/admin/jobs"
          element={
            <AdminProtectedRoute>
              <AdminJobs />
            </AdminProtectedRoute>
          }
        />
        <Route
          path="/admin/monitoring"
          element={
            <AdminProtectedRoute>
              <AdminAICenter />
            </AdminProtectedRoute>
          }
        />
        <Route
          path="/admin/feature-flags"
          element={
            <AdminProtectedRoute>
              <AdminSettings />
            </AdminProtectedRoute>
          }
        />
        <Route
          path="/admin/system"
          element={
            <AdminProtectedRoute>
              <AdminSettings />
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

        {/* Catch-all route */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </PageTransition>
  );
}

export default function App() {
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