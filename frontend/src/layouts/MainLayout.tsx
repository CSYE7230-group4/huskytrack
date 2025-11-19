// src/layouts/MainLayout.tsx
import { NavLink, Outlet } from "react-router-dom";
import HuskyLogo from "../assets/husky-logo.png";

export default function MainLayout() {
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

          {/* Nav links */}
          <nav className="flex items-center gap-6 text-sm font-medium">
            <NavLink
              to="/dashboard"
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
        </div>
      </header>

      {/* Page content */}
      <main className="max-w-6xl mx-auto px-6 py-8">
        <Outlet />
      </main>
    </div>
  );
}
