// src/layouts/SidebarLayout.tsx
import { NavLink } from "react-router-dom";
import { Menu, Home, Calendar, User } from "lucide-react";

export default function SidebarLayout() {
  return (
    <aside className="hidden md:flex flex-col w-60 min-h-screen bg-white border-r border-gray-200 p-6">

      {/* Top Section */}
      <div className="flex items-center gap-2 mb-10">
        <Menu className="h-5 w-5 text-primary" />
        <h2 className="text-lg font-semibold text-gray-800">Navigation</h2>
      </div>

      {/* Nav Links */}
      <nav className="flex flex-col gap-3 text-gray-700 text-sm font-medium">

        <NavLink
          to="/app"
          className={({ isActive }) =>
            `flex items-center gap-3 px-3 py-2 rounded-lg transition ${
              isActive ? "bg-primary/10 text-primary" : "hover:bg-gray-100"
            }`
          }
        >
          <Home className="w-4 h-4" />
          Dashboard
        </NavLink>

        <NavLink
          to="/app/events"
          className={({ isActive }) =>
            `flex items-center gap-3 px-3 py-2 rounded-lg transition ${
              isActive ? "bg-primary/10 text-primary" : "hover:bg-gray-100"
            }`
          }
        >
          <Calendar className="w-4 h-4" />
          Events
        </NavLink>

        <NavLink
          to="/app/profile"
          className={({ isActive }) =>
            `flex items-center gap-3 px-3 py-2 rounded-lg transition ${
              isActive ? "bg-primary/10 text-primary" : "hover:bg-gray-100"
            }`
          }
        >
          <User className="w-4 h-4" />
          Profile
        </NavLink>
                <NavLink
          to="/app/ui-guide"
          className={({ isActive }) =>
            `flex items-center gap-3 px-3 py-2 rounded-lg transition ${
              isActive ? "bg-primary/10 text-primary" : "hover:bg-gray-100"
            }`
          }
        >
          {/* No icon needed, but you can add one if you want */}
          UI Guide
        </NavLink>
      </nav>
    </aside>
  );
}
