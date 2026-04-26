import { Link, useLocation } from "react-router-dom";
import { ShieldCheck, Users, Store, BarChart3, LogOut } from "lucide-react";

export const AdminHeader = () => {
  const { pathname } = useLocation();

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-slate-900 text-white shadow-lg">
      <div className="container flex h-16 items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="grid h-9 w-9 place-items-center rounded-lg bg-primary text-primary-foreground shadow-pop">
            <ShieldCheck className="h-5 w-5" />
          </div>
          <span className="font-display text-xl font-bold tracking-tight">
            SuperAdmin
          </span>
        </div>

        <nav className="flex items-center gap-8">
          <Link
            to="/admin/dashboard"
            className={`flex items-center gap-2 text-sm font-semibold transition ${
              pathname === "/admin/dashboard" ? "text-primary" : "text-slate-300 hover:text-white"
            }`}
          >
            <Store className="h-4 w-4" />
            Vendors
          </Link>
          <Link
            to="/admin/analytics"
            className={`flex items-center gap-2 text-sm font-semibold transition ${
              pathname.includes("/admin/analytics") ? "text-primary" : "text-slate-300 hover:text-white"
            }`}
          >
            <BarChart3 className="h-4 w-4" />
            Analytics
          </Link>
          <Link
            to="/admin/users"
            className={`flex items-center gap-2 text-sm font-semibold transition ${
              pathname.includes("/admin/users") ? "text-primary" : "text-slate-300 hover:text-white"
            }`}
          >
            <Users className="h-4 w-4" />
            Users
          </Link>
        </nav>

        <Link 
          to="/" 
          className="flex items-center gap-2 text-sm font-bold text-slate-400 hover:text-white transition"
        >
          <LogOut className="h-4 w-4" />
          Switch to Customer View
        </Link>
      </div>
    </header>
  );
};
