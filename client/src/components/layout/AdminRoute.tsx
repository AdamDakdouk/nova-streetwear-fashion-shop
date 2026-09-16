import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuthStore } from "../../store/authStore";
import { LogoutConfirmDialog } from "./LogoutConfirmDialog";

/**
 * Admin guard. Blocks non-admins (even logged-in shoppers) and signed-out users
 * from reaching the admin dashboard.
 */
export function AdminRoute() {
  const isAuthenticated = Boolean(useAuthStore((s) => s.token));
  const role = useAuthStore((s) => s.user?.role);
  const location = useLocation();

  if (!isAuthenticated || role !== "admin") {
    return <Navigate to="/admin/login" replace state={{ from: location }} />;
  }

  return (
    <>
      <Outlet />
      <LogoutConfirmDialog />
    </>
  );
}
