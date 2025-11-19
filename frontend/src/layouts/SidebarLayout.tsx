import { Outlet, NavLink } from "react-router-dom";

export default function SidebarLayout() {
  return (
    <div className="flex min-h-screen bg-background">
      {/* Sidebar */}
      <aside className="w-64 bg-white shadow-soft px-6 py-8 hidden md:block">
        <h2 className="text-2xl font-bold text-primary mb-8">HuskyTrack</h2>

        <nav className="flex flex-col gap-4 text-dark">
          <NavLink
            to="/dashboard"
            className="hover:text-primary transition-colors"
          >
            Dashboard
          </NavLink>

          <NavLink
            to="/events"
            className="hover:text-primary transition-colors"
          >
            Events
          </NavLink>

          <NavLink
            to="/profile"
            className="hover:text-primary transition-colors"
          >
            Profile
          </NavLink>
        </nav>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Top Navbar */}
        <header className="bg-white shadow-soft py-4 px-6 flex justify-between items-center">
          <h1 className="text-xl font-semibold">HuskyTrack</h1>

          <div className="flex items-center gap-4">
            <div className="w-9 h-9 rounded-full bg-secondary/20 flex items-center justify-center text-secondary font-bold">
              A
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
