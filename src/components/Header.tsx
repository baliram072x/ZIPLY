import { Link, useLocation, useNavigate } from "react-router-dom";
import { ShoppingBag, Search, MapPin, ChevronDown, User, ArrowRight } from "lucide-react";
import { useStore } from "@/store/useStore";
import { useState, useMemo } from "react";

export const Header = () => {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const cartCount = useStore((s) => s.cartCount());
  const location = useStore((s) => s.location);
  const user = useStore((s) => s.user);
  const shops = useStore((s) => s.shops);
  const logoutUser = useStore((s) => s.logoutUser);
  const [query, setQuery] = useState("");

  const allProducts = useMemo(() => 
    shops.flatMap((s) => s.products.map((p) => ({ ...p, shopId: s.id, shopName: s.name }))),
    [shops]
  );

  const results = useMemo(() => {
    if (!query.trim()) return [];
    const q = query.toLowerCase();
    return allProducts.filter((p) => p.name.toLowerCase().includes(q)).slice(0, 6);
  }, [query, allProducts]);

  return (
    <header className="sticky top-0 z-50 border-b border-border/60 bg-card/80 backdrop-blur-md">
      <div className="container flex h-16 items-center gap-4 md:gap-8">
        <Link to="/" className="flex items-center gap-2 transition hover:opacity-90">
          <div className="grid h-10 w-10 place-items-center rounded-xl bg-primary text-primary-foreground shadow-pop">
            <span className="font-display text-2xl font-black italic tracking-tighter">Z</span>
          </div>
          <span className="hidden font-display text-2xl font-black tracking-tighter sm:block">
            ZIPLY
          </span>
        </Link>

        <button 
          onClick={() => !user && navigate("/auth")}
          className="flex flex-1 flex-col items-start justify-center gap-0.5 overflow-hidden text-left transition hover:opacity-80 md:flex-initial"
        >
          <div className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-widest text-primary">
            <MapPin className="h-3 w-3" />
            {user ? "Delivering to" : "Select Location"}
          </div>
          <div className="flex w-full items-center gap-1 font-display font-bold">
            <span className="truncate">{location}</span>
            <ChevronDown className="h-4 w-4 shrink-0 text-muted-foreground" />
          </div>
        </button>

        <div className="hidden flex-1 items-center md:flex">
          <div className="relative w-full max-w-md">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search for groceries..."
              className="h-10 w-full rounded-full border border-border bg-muted/50 pl-10 pr-4 text-sm transition focus:border-primary/50 focus:bg-card focus:outline-none"
            />
            {results.length > 0 && (
              <div className="absolute left-0 right-0 top-full z-50 mt-2 overflow-hidden rounded-2xl border border-border bg-card text-foreground shadow-pop">
                {results.map((r) => (
                  <Link
                    key={`${r.shopId}-${r.id}`}
                    to={`/shop-view/${r.shopId}`}
                    onClick={() => setQuery("")}
                    className="flex items-center gap-3 border-b border-border/60 px-4 py-3 transition last:border-b-0 hover:bg-muted"
                  >
                    <span className="text-xl">{r.emoji}</span>
                    <div className="flex-1">
                      <div className="text-sm font-semibold">{r.name}</div>
                      <div className="text-xs text-muted-foreground">
                        {r.shopName} · ₹{r.price}
                      </div>
                    </div>
                    <ArrowRight className="h-4 w-4 text-muted-foreground" />
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2 md:gap-4">
          {user ? (
            <div className="flex items-center gap-3">
              <Link to="/orders" className="hidden items-center gap-2 rounded-full border border-border bg-muted/50 px-4 py-2 text-sm font-bold transition hover:bg-muted md:flex">
                <ShoppingBag className="h-4 w-4" />
                Orders
              </Link>
              <button 
                onClick={() => logoutUser()}
                className="flex items-center gap-2 rounded-full bg-primary/10 px-4 py-2 text-sm font-bold text-primary transition hover:bg-primary/20"
              >
                <User className="h-4 w-4" />
                <span className="hidden sm:inline">{user.name.split(' ')[0]}</span>
              </button>
            </div>
          ) : (
            <button 
              onClick={() => navigate("/auth")}
              className="rounded-full bg-primary px-6 py-2 text-sm font-bold text-primary-foreground shadow-pop transition hover:scale-105 active:scale-95"
            >
              Login
            </button>
          )}

          <Link
            to="/cart"
            className="relative grid h-10 w-10 place-items-center rounded-full bg-muted/50 transition hover:bg-muted"
          >
            <ShoppingBag className="h-5 w-5" />
            {cartCount > 0 && (
              <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-primary-foreground ring-2 ring-card">
                {cartCount}
              </span>
            )}
          </Link>
        </div>
      </div>
    </header>
  );
};