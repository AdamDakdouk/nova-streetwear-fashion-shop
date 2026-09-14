import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuthStore } from "../../store/authStore";

/** Gates the admin dashboard behind both authentication and role — a signed-in
 * shopper who isn't an admin is bounced just as hard as a signed-out visitor. */
export function AdminRoute() {
  const isAuthenticated = Boolean(useAuthStore((s) => s.token));
  const role = useAuthStore((s) => s.user?.role);
  const location = useLocation();

  if (!isAuthenticated || role !== "admin") {
    return <Navigate to="/admin/login" replace state={{ from: location }} />;
  }

  return <Outlet />;
}
