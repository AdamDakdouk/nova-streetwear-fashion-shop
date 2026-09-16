import { createBrowserRouter } from "react-router-dom";
import { AppLayout } from "./components/layout/AppLayout";
import { ProtectedRoute } from "./components/layout/ProtectedRoute";
import { AdminRoute } from "./components/layout/AdminRoute";
import { LoginPage } from "./pages/LoginPage";
import { VerifyEmailPage } from "./pages/VerifyEmailPage";
import { ForgotPasswordPage } from "./pages/ForgotPasswordPage";
import { ResetPasswordPage } from "./pages/ResetPasswordPage";
import { ProductListPage } from "./pages/ProductListPage";
import { ProductDetailPage } from "./pages/ProductDetailPage";
import { CartPage } from "./pages/CartPage";
import { WishlistPage } from "./pages/WishlistPage";
import { CheckoutPage } from "./pages/CheckoutPage";
import { OrderConfirmationPage } from "./pages/OrderConfirmationPage";
import { NotFoundPage } from "./pages/NotFoundPage";
import { AccountPage } from "./pages/AccountPage";
import { LegalPage } from "./pages/LegalPage";
import { PRIVACY_POLICY, TERMS_AND_CONDITIONS, TERMS_OF_SERVICE } from "./lib/legalContent";
import { AdminLoginPage } from "./pages/admin/AdminLoginPage";
import { AdminDashboardPage } from "./pages/admin/AdminDashboardPage";
import { AdminProductFormPage } from "./pages/admin/AdminProductFormPage";
import { AdminHeroPage } from "./pages/admin/AdminHeroPage";

export const router = createBrowserRouter([
// Admin routes bypass AppLayout to omit storefront nav/headers. 
// Access is restricted to direct URLs and gated by auth/role checks.
  { path: "/admin/login", element: <AdminLoginPage /> },
  {
    path: "/admin",
    element: <AdminRoute />,
    children: [
      { index: true, element: <AdminDashboardPage /> },
      { path: "products/new", element: <AdminProductFormPage /> },
      { path: "products/:id/edit", element: <AdminProductFormPage /> },
      { path: "hero", element: <AdminHeroPage /> },
    ],
  },
  {
    element: <AppLayout />,
    children: [
      { path: "/login", element: <LoginPage /> },
      { path: "/verify-email", element: <VerifyEmailPage /> },
      { path: "/forgot-password", element: <ForgotPasswordPage /> },
      { path: "/reset-password", element: <ResetPasswordPage /> },
      { path: "/", element: <ProductListPage /> },
      { path: "/products/:id", element: <ProductDetailPage /> },
      { path: "/privacy-policy", element: <LegalPage document={PRIVACY_POLICY} /> },
      { path: "/terms-and-conditions", element: <LegalPage document={TERMS_AND_CONDITIONS} /> },
      { path: "/terms-of-service", element: <LegalPage document={TERMS_OF_SERVICE} /> },
      {
        element: <ProtectedRoute />,
        children: [
          { path: "/account", element: <AccountPage /> },
          { path: "/cart", element: <CartPage /> },
          { path: "/wishlist", element: <WishlistPage /> },
          { path: "/checkout", element: <CheckoutPage /> },
          { path: "/order-confirmation/:orderId", element: <OrderConfirmationPage /> },
        ],
      },
      { path: "*", element: <NotFoundPage /> },
    ],
  },
]);
