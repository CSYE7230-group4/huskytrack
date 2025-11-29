// src/layouts/MainLayout.tsx

import { Outlet, useNavigate, NavLink } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
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
      navigate("/auth/login");
    }
  };

  return (
    <div className="min-h-screen flex bg-background">

      {/* Sidebar */}
      <SidebarLayout />

      {/* Right Section */}
      <div className="flex-1 flex flex-col">

        {/* Top Navbar */}
        <header className="bg-white/90 backdrop-blur shadow-sm">
          <div className="max-w-6xl mx-auto flex items-center justify-between px-6 py-3">

            {/* Brand */}
            <div className="flex items-center gap-2">
              <img
                src="src/assets/NewLogoHuskyTrack.svg"
                alt="Husky logo"
                className="h-10 w-auto"
              />
              <span className="text-xl font-semibold text-primary tracking-tight">
                HuskyTrack
              </span>
            </div>

            {/* User Section */}
            {user && (
              <div className="flex items-center gap-4">

                {/* Optional: Organizer Shortcut */}
                <NavLink
                  to="/app/organizer"
                  className={({ isActive }) =>
                    `text-sm px-3 py-2 rounded-lg transition ${
                      isActive
                        ? "bg-indigo-50 text-indigo-700 border border-indigo-200"
                        : "text-gray-600 hover:bg-gray-50"
                    }`
                  }
                >
                  Organizer
                </NavLink>

                {/* User Info */}
                <div className="text-right">
                  <p className="text-sm font-medium text-gray-900">
                    {user.firstName} {user.lastName}
                  </p>
                  <p className="text-xs text-gray-500">{user.email}</p>
                </div>

                {/* Logout */}
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

        {/* Main Content */}
        <main className="max-w-6xl mx-auto px-6 py-8">
          <Outlet />
        </main>

        <Footer />
      </div>
    </div>
  );
}
