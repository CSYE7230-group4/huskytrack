import { createBrowserRouter, RouterProvider, Navigate } from "react-router-dom";
import { AuthProvider } from "../contexts/AuthContext";
import PrivateRoute from "../components/PrivateRoute";

// Layouts
import MainLayout from "../layouts/MainLayout";
import AuthLayout from "../layouts/AuthLayout";

// Pages
import LandingPage from "../pages/LandingPage";
import Dashboard from "../pages/Dashboard";
import Events from "../pages/Events";
import EventDetails from "../pages/EventDetails";
import Profile from "../pages/Profile";

// Auth pages
import Login from "../pages/Login";
import Register from "../pages/Register";
import ForgotPassword from "../pages/ForgotPassword";
import ResetPassword from "../pages/ResetPassword";
import ResetSuccess from "../pages/ResetSuccess";

import UiGuide from "../pages/UiGuide";


const router = createBrowserRouter([
  // =================================
  // PUBLIC ROUTES (Landing Page)
  // =================================
  {
    path: "/",
    element: <LandingPage />,
  },

  // =================================
  // AUTH ROUTES
  // =================================
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

  // =================================
  // APP ROUTES (Main Layout)
  // =================================
  {
    path: "/app",
    element: (
      <PrivateRoute>
        <MainLayout />
      </PrivateRoute>
    ),
    children: [
      { index: true, element: <Dashboard /> },
      { path: "events", element: <Events /> },
      { path: "events/:id", element: <EventDetails /> },
      { path: "profile", element: <Profile /> },
      { path: "ui-guide", element: <UiGuide /> },
    ],
  },

  {
    path: "/profile",
    element: <Navigate to="/app/profile" replace />,
  },


  // =================================
  // UNKNOWN ROUTES
  // =================================
  {
    path: "*",
    element: <Navigate to="/" replace />,
  },
]);

export default function AppRouter() {
  return (
    <AuthProvider>
      <RouterProvider router={router} />
    </AuthProvider>
  );
}