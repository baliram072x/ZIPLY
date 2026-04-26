import { Link, useLocation, useNavigate } from "react-router-dom";
import { LayoutDashboard, Package, ShoppingBag, Store, LogOut } from "lucide-react";
import { useStore } from "@/store/useStore";

export const VendorHeader = ({ shopName }: { shopName: string }) => {
  const { pathname } = useLocation();
  const logoutVendor = useStore((s) => s.logoutVendor);
  const navigate = useNavigate();

  const handleLogout = () => {
    logoutVendor();
    navigate("/vendor/login");
  };

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-card shadow-sm">
      <div className="container flex h-16 items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 font-display text-xl font-bold text-primary">
            <Store className="h-6 w-6" />
            <span>Vendor Central</span>
          </div>
          <div className="h-6 w-px bg-border mx-2" />
          <div className="font-semibold text-muted-foreground">{shopName}</div>
        </div>

        <nav className="flex items-center gap-6">
          <Link
            to="/vendor/dashboard"
            className={`flex items-center gap-2 text-sm font-medium transition ${
              pathname === "/vendor/dashboard" ? "text-primary" : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <LayoutDashboard className="h-4 w-4" />
            Dashboard
          </Link>
        </nav>

        <button 
          onClick={handleLogout}
          className="flex items-center gap-2 text-sm font-semibold text-muted-foreground hover:text-destructive transition"
        >
          <LogOut className="h-4 w-4" />
          Logout
        </button>
      </div>
    </header>
  );
};
