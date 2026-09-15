import { Outlet } from "react-router-dom";
import { Header } from "./Header";
import { Footer } from "./Footer";
import { LogoutConfirmDialog } from "./LogoutConfirmDialog";
import { AuthRequiredDialog } from "./AuthRequiredDialog";
import { ScrollManager } from "./ScrollManager";

export function AppLayout() {
  return (
    <div className="flex min-h-dvh flex-col bg-background">
      <ScrollManager />
      <Header />
      <main className="flex-1">
        <Outlet />
      </main>
      <Footer />
      <LogoutConfirmDialog />
      <AuthRequiredDialog />
    </div>
  );
}
