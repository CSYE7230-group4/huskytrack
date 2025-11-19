import { createBrowserRouter, RouterProvider, Navigate } from "react-router-dom";

import MainLayout from "../layouts/MainLayout";
import Dashboard from "../pages/Dashboard";
import Events from "../pages/Events";
import Profile from "../pages/Profile";

import AuthLayout from "../layouts/AuthLayout";

// AUTH PAGES (from /pages/auth/)
import Login from "../pages/auth/Login";
import Register from "../pages/auth/Register";
import ForgotPassword from "../pages/auth/ForgotPassword";
import ResetPassword from "../pages/auth/ResetPassword";
import ResetSuccess from "../pages/ResetSuccess";

const router = createBrowserRouter([
  // AUTH ROUTES
  {
    path: "/auth",
    element: <AuthLayout />, // wraps ALL auth screens
    children: [
      { index: true, element: <Navigate to="login" /> },
      { path: "login", element: <Login /> },
      { path: "register", element: <Register /> },
      { path: "forgot-password", element: <ForgotPassword /> },
      { path: "reset-password", element: <ResetPassword /> },
      { path: "reset-success", element: <ResetSuccess /> },
    ],
  },

  // MAIN APP ROUTES
  {
    path: "/",
    element: <MainLayout />,
    children: [
      { index: true, element: <Dashboard /> },
      { path: "events", element: <Events /> },
      { path: "profile", element: <Profile /> },
    ],
  },

  // ANY UNKNOWN ROUTE REDIRECTS TO LOGIN
  {
    path: "*",
    element: <Navigate to="/auth/login" replace />,
  },
]);

export default function AppRouter() {
  return <RouterProvider router={router} />;
}
