// src/layouts/MainLayout.tsx
import { Outlet } from "react-router-dom";
import HuskyLogo from "../assets/husky-logo.png";
import SidebarLayout from "./SidebarLayout";
import Footer from "../components/common/Footer";

export default function MainLayout() {
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
