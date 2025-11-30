// src/layouts/MainLayout.tsx

import { Outlet, useNavigate, NavLink } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import SidebarLayout from "./SidebarLayout";
import Footer from "../components/common/Footer";
import Button from "../components/ui/Button";
import NotificationBell from "../components/notifications/NotificationBell";
import NotificationCenter from "../components/notifications/NotificationCenter";
import { useNotifications } from "../hooks/useNotifications";
import { NotificationProvider } from "../contexts/NotificationContext";
import { useRef } from "react";

export default function MainLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const bellRef = useRef<HTMLDivElement>(null);

  // Initialize notifications hook
  const {
    notifications,
    unreadCount,
    isLoading,
    isFetching,
    isLoadingMore,
    error,
    isOpen,
    pagination,
    markAsRead,
    markAllAsRead,
    loadMoreNotifications,
    toggleNotificationCenter,
    closeNotificationCenter,
    refreshNotifications,
  } = useNotifications({
    autoFetch: !!user, // Only fetch if user is authenticated
    pollingEnabled: !!user, // Only poll if user is authenticated
  });

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
    <NotificationProvider refreshNotifications={refreshNotifications}>
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

                {/* Notification Bell with Center */}
                <div ref={bellRef} className="relative inline-block">
                  <NotificationBell
                    unreadCount={unreadCount}
                    onClick={toggleNotificationCenter}
                  />
                  {isOpen && (
                    <NotificationCenter
                      isOpen={isOpen}
                      onClose={closeNotificationCenter}
                      notifications={notifications}
                      unreadCount={unreadCount}
                      isLoading={isLoading}
                      isFetching={isFetching}
                      isLoadingMore={isLoadingMore}
                      error={error}
                      pagination={pagination}
                      onMarkAsRead={markAsRead}
                      onMarkAllAsRead={markAllAsRead}
                      onLoadMore={loadMoreNotifications}
                      onRefresh={refreshNotifications}
                    />
                  )}
                </div>

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
    </NotificationProvider>
  );
}
