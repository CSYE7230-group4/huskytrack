import { createBrowserRouter, RouterProvider, Navigate } from "react-router-dom";
import { AuthProvider } from "../contexts/AuthContext";
import PrivateRoute from "../components/PrivateRoute";

// MAIN LAYOUTS
import MainLayout from "../layouts/MainLayout";
import AuthLayout from "../layouts/AuthLayout";

// MAIN APP PAGES
import Dashboard from "../pages/Dashboard";
import Events from "../pages/Events";
import Profile from "../pages/Profile";

// AUTH PAGES (new flattened structure)
import Login from "../pages/Login";
import Register from "../pages/Register";
import ForgotPassword from "../pages/ForgotPassword";
import ResetPassword from "../pages/ResetPassword";
import ResetSuccess from "../pages/ResetSuccess";

const router = createBrowserRouter([
  // ==========================
  // AUTH ROUTES (Public)
  // ==========================
  {
    path: "/auth",
    element: <AuthLayout />,
    children: [
      { index: true, element: <Navigate to="login" /> },
      { path: "login", element: <Login /> },
      { path: "register", element: <Register /> },
      { path: "forgot-password", element: <ForgotPassword /> },
      { path: "reset-password", element: <ResetPassword /> },
      { path: "reset-success", element: <ResetSuccess /> },
    ],
  },

  // ==========================
  // MAIN APP ROUTES (Protected)
  // ==========================
  {
    path: "/",
    element: (
      <PrivateRoute>
        <MainLayout />
      </PrivateRoute>
    ),
    children: [
      { index: true, element: <Dashboard /> },
      { path: "events", element: <Events /> },
      { path: "profile", element: <Profile /> },
    ],
  },

  // ==========================
  // ROLE-BASED ROUTES
  // ==========================
  // Admin-only routes
  {
    path: "/admin",
    element: (
      <PrivateRoute requiredRole="ADMIN">
        <MainLayout />
      </PrivateRoute>
    ),
    children: [
      { index: true, element: <Dashboard /> },
      // Add admin-specific pages here
    ],
  },

  // Organizer and Admin routes
  {
    path: "/organizer",
    element: (
      <PrivateRoute requiredRole={["ORGANIZER", "ADMIN"]}>
        <MainLayout />
      </PrivateRoute>
    ),
    children: [
      { index: true, element: <Dashboard /> },
      // Add organizer-specific pages here
    ],
  },

  // Student routes (all authenticated users can access)
  {
    path: "/student",
    element: (
      <PrivateRoute requiredRole="STUDENT">
        <MainLayout />
      </PrivateRoute>
    ),
    children: [
      { index: true, element: <Dashboard /> },
      // Add student-specific pages here
    ],
  },

  // ==========================
  // FALLBACK ROUTE
  // ==========================
  {
    path: "*",
    element: <Navigate to="/auth/login" replace />,
  },
]);

export default function AppRouter() {
  return (
    <AuthProvider>
      <RouterProvider router={router} />
    </AuthProvider>
  );
}
