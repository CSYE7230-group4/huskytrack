import { createBrowserRouter, RouterProvider, Navigate } from "react-router-dom";

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
  // AUTH ROUTES
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
  // MAIN APP ROUTES
  // ==========================
  {
    path: "/",
    element: <MainLayout />,
    children: [
      { index: true, element: <Dashboard /> },
      { path: "events", element: <Events /> },
      { path: "profile", element: <Profile /> },
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
  return <RouterProvider router={router} />;
}
