// src/layouts/MainLayout.tsx
import { Outlet, useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import HuskyLogo from "../assets/husky-logo.png";
import SidebarLayout from "./SidebarLayout";
import Footer from "../components/common/Footer";
import Button from "../components/ui/Button";

export default function MainLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await logout();
      navigate("/auth/login");
    } catch (error) {
      console.error("Logout error:", error);
      // Still navigate to login even if logout API call fails
      navigate("/auth/login");
    }
  };

  return (
    <div className="min-h-screen flex bg-background">

      {/* Sidebar (desktop only) */}
      <SidebarLayout />

      {/* Right Section */}
      <div className="flex-1 flex flex-col">

        {/* Top Navbar */}
        <header className="bg-white/90 backdrop-blur shadow-sm">
          <div className="max-w-6xl mx-auto flex items-center justify-between px-6 py-3">

            {/* Brand */}
            <div className="flex items-center gap-2">
              <img src={HuskyLogo} alt="Husky logo" className="h-7 w-auto" />
              <span className="text-lg font-semibold text-primary tracking-tight">
                HuskyTrack
              </span>
            </div>

            {/* User Section */}
            {user && (
              <div className="flex items-center gap-4">
                <div className="text-right">
                  <p className="text-sm font-medium text-gray-900">
                    {user.firstName} {user.lastName}
                  </p>
                  <p className="text-xs text-gray-500">{user.email}</p>
                </div>
                <Button
                  onClick={handleLogout}
                  variant="outline"
                  className="text-sm"
                >
                  Logout
                </Button>
              </div>
            )}

          </div>
        </header>

        {/* Main Page Content */}
        <main className="max-w-6xl mx-auto px-6 py-8">
          <Outlet />
        </main>

        <Footer />


      </div>
    </div>
  );
}
