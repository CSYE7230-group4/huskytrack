// src/layouts/MainLayout.tsx
import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import HuskyLogo from "../assets/husky-logo.png";
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
    <div className="min-h-screen bg-background">
      {/* Top bar */}
      <header className="bg-white/90 backdrop-blur shadow-sm">
        <div className="max-w-6xl mx-auto flex items-center justify-between px-6 py-3">
          {/* Brand */}
          <div className="flex items-center gap-2">
            <img src={HuskyLogo} alt="Husky logo" className="h-7 w-auto" />
            <span className="text-lg font-semibold text-primary tracking-tight">
              HuskyTrack
            </span>
          </div>

          {/* Nav links and user info */}
          <div className="flex items-center gap-6">
            <nav className="flex items-center gap-6 text-sm font-medium">
              <NavLink
                to="/"
                className={({ isActive }) =>
                  `hover:text-primary transition ${
                    isActive ? "text-primary" : "text-gray-600"
                  }`
                }
              >
                Dashboard
              </NavLink>
              <NavLink
                to="/events"
                className={({ isActive }) =>
                  `hover:text-primary transition ${
                    isActive ? "text-primary" : "text-gray-600"
                  }`
                }
              >
                Events
              </NavLink>
              <NavLink
                to="/profile"
                className={({ isActive }) =>
                  `hover:text-primary transition ${
                    isActive ? "text-primary" : "text-gray-600"
                  }`
                }
              >
                Profile
              </NavLink>
            </nav>

            {/* User info and logout */}
            <div className="flex items-center gap-4">
              {user && (
                <span className="text-sm text-gray-600">
                  {user.firstName} {user.lastName}
                </span>
              )}
              <Button variant="outline" onClick={handleLogout} className="text-sm">
                Logout
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Page content */}
      <main className="max-w-6xl mx-auto px-6 py-8">
        <Outlet />
      </main>
    </div>
  );
}
