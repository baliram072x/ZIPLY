import { Header } from "@/components/Header";
import { ShopCard } from "@/components/ShopCard";
import { CATEGORIES, bestShop } from "@/data/seed";
import { useStore } from "@/store/useStore";
import { motion, AnimatePresence } from "framer-motion";
import { Search, Zap, ArrowRight, Timer, Bike, ChevronRight, Clock } from "lucide-react";
import { Link } from "react-router-dom";
import { useMemo, useState, useEffect } from "react";

const Index = () => {
  const location = useStore((s) => s.location);
  const coords = useStore((s) => s.coords);
  const shops = useStore((s) => s.shops);
  const orders = useStore((s) => s.orders);
  const fetchOrders = useStore((s) => s.fetchOrders);
  const fetchShops = useStore((s) => s.fetchShops);
  const [query, setQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  
  useEffect(() => {
    fetchOrders();
    fetchShops();
    const interval = setInterval(() => {
      fetchOrders();
      fetchShops();
    }, 10000);
    return () => clearInterval(interval);
  }, [fetchOrders, fetchShops]);

  const activeOrder = useMemo(() => 
    orders.find(o => o.status !== "Delivered"),
    [orders]
  );
  
  const allProducts = useMemo(() => 
    shops.flatMap((s) => s.products.map((p) => ({ ...p, shopId: s.id, shopName: s.name }))),
    [shops]
  );

  const best = useMemo(() => bestShop(shops, coords || undefined), [shops, coords]);
  
  const results = useMemo(() => {
    if (!query.trim()) return [];
    const q = query.toLowerCase();
    return allProducts.filter((p) => p.name.toLowerCase().includes(q)).slice(0, 8);
  }, [query, allProducts]);

  const displayProducts = useMemo(() => {
    if (activeCategory) {
      return allProducts.filter((p) => p.category === activeCategory);
    }
    return allProducts.filter((p) => p.popular).slice(0, 6);
  }, [allProducts, activeCategory]);

  return (
    <div className="min-h-screen">
      <Header />
      {/* Rest of the component remains the same, but using shops instead of SHOPS */}

      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 -z-10 bg-gradient-hero opacity-95" />
        <div
          className="absolute inset-0 -z-10 opacity-30"
          style={{
            backgroundImage:
              "radial-gradient(circle at 20% 20%, hsl(48 100% 60% / 0.6) 0, transparent 40%), radial-gradient(circle at 80% 70%, hsl(322 90% 70% / 0.7) 0, transparent 40%)",
          }}
        />
        <div className="container relative py-14 text-primary-foreground md:py-20">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="max-w-2xl"
          >
            <span className="inline-flex items-center gap-2 rounded-full bg-white/15 px-3 py-1 text-xs font-semibold backdrop-blur">
              <Zap className="h-3.5 w-3.5 fill-secondary text-secondary" />
              Delivering to {location}
            </span>
            <h1 className="mt-4 font-display text-4xl font-extrabold leading-[1.05] md:text-6xl">
              Groceries & medicines.
              <br />
              <span className="bg-gradient-sun bg-clip-text text-transparent">
                In 10 minutes flat.
              </span>
            </h1>
            <p className="mt-4 max-w-lg text-white/80 md:text-lg">
              Ziply connects you to your favourite local kirana, pharmacy and
              bakery — so the corner shop is just a tap away.
            </p>

            <div className="relative mt-8 max-w-xl">
              <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder='Try "milk", "paracetamol", "atta"…'
                className="h-14 w-full rounded-2xl border-0 bg-card pl-12 pr-4 font-medium text-foreground shadow-pop outline-none ring-0 placeholder:text-muted-foreground focus:ring-2 focus:ring-secondary"
              />
              {results.length > 0 && (
                <div className="absolute left-0 right-0 top-full z-30 mt-2 overflow-hidden rounded-2xl border border-border bg-card text-foreground shadow-pop">
                  {results.map((r) => (
                    <Link
                      key={r.id}
                      to={`/shop-view/${r.shopId}`}
                      onClick={() => setQuery("")}
                      className="flex items-center gap-3 border-b border-border/60 px-4 py-3 transition last:border-b-0 hover:bg-muted"
                    >
                      <div className="h-10 w-10 shrink-0 overflow-hidden rounded-lg bg-muted">
                        {r.image ? (
                          <img src={r.image} alt={r.name} crossOrigin="anonymous" className="h-full w-full object-cover" />
                        ) : (
                          <div className="grid h-full w-full place-items-center text-xl">{r.emoji}</div>
                        )}
                      </div>
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

            <div className="mt-6 flex flex-wrap items-center gap-4 text-sm text-white/85">
              <span className="flex items-center gap-1.5">
                <Timer className="h-4 w-4" /> Avg. 9 min ETA
              </span>
              <span>·</span>
              <span>{shops.length} nearby shops live now</span>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Categories */}
      <section className="container py-10">
        <div className="mb-5 flex items-end justify-between">
          <h2 className="font-display text-2xl font-bold">Shop by category</h2>
        </div>
        <div className="grid grid-cols-3 gap-3 md:grid-cols-6">
          {CATEGORIES.map((c, i) => (
            <motion.div
              key={c.name}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              onClick={() => {
                setActiveCategory(activeCategory === c.name ? null : c.name);
                document.getElementById('products-section')?.scrollIntoView({ behavior: 'smooth' });
              }}
              className={`cursor-pointer rounded-2xl border p-4 text-center transition hover:-translate-y-1 hover:shadow-pop ${
                activeCategory === c.name 
                  ? "border-primary bg-primary/10 shadow-soft" 
                  : "border-border bg-gradient-card"
              }`}
            >
              <div className="mb-1 text-3xl">{c.emoji}</div>
              <div className="text-xs font-semibold">{c.name}</div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Nearby shops */}
      <section className="container py-6">
        <div className="mb-5 flex items-end justify-between">
          <div>
            <h2 className="font-display text-2xl font-bold">Nearby shops</h2>
            <p className="text-sm text-muted-foreground">
              Sorted by distance & ETA · best pick highlighted
            </p>
          </div>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[...shops]
            .sort((a, b) => {
               // Dynamic sorting if we have coords, though getDistance is private to seed.ts, let's just sort by bestShop approximation
               // We will update seed.ts to export getDistance
               return a.distanceKm - b.distanceKm
             })
            .map((s) => (
              <ShopCard key={s.id} shop={s} best={s.id === best.id} userCoords={coords || undefined} />
            ))}
        </div>
      </section>

      {/* Products */}
      <section id="products-section" className="container py-10">
        <div className="mb-5 flex items-center justify-between">
          <h2 className="font-display text-2xl font-bold">
            {activeCategory ? `${activeCategory}` : "Popular near you 🔥"}
          </h2>
          {activeCategory && (
            <button 
              onClick={() => setActiveCategory(null)}
              className="text-sm font-semibold text-primary hover:underline"
            >
              Clear filter
            </button>
          )}
        </div>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-6 mt-4">
          {displayProducts.map((p) => (
            <Link
              key={p.id}
              to={`/shop-view/${p.shopId}`}
              className="group rounded-2xl border border-border bg-card p-3 text-center transition hover:-translate-y-1 hover:shadow-pop"
            >
              <div className="relative mb-2 aspect-square overflow-hidden rounded-xl bg-gradient-card">
                {p.image ? (
                  <img src={p.image} alt={p.name} crossOrigin="anonymous" className="h-full w-full object-cover transition group-hover:scale-110" />
                ) : (
                  <div className="grid h-full w-full place-items-center text-4xl">{p.emoji}</div>
                )}
              </div>
              <div className="text-xs font-semibold leading-tight">{p.name}</div>
              <div className="mt-1 text-sm font-bold text-primary">₹{p.price}</div>
            </Link>
          ))}
        </div>
      </section>

      <footer className="border-t border-border/60 py-6 text-center text-xs text-muted-foreground">
        Ziply · Hyperlocal delivery prototype · Built for demo
      </footer>

      {/* Active Order Tracking Bar */}
      <AnimatePresence>
        {activeOrder && (
          <motion.div
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 100, opacity: 0 }}
            className="fixed bottom-4 left-4 right-4 z-50"
          >
            <Link
              to={`/track/${activeOrder.id}`}
              className="flex items-center justify-between overflow-hidden rounded-2xl bg-gradient-hero p-4 text-primary-foreground shadow-pop-lg"
            >
              <div className="flex items-center gap-3">
                <div className="grid h-10 w-10 place-items-center rounded-xl bg-white/20 backdrop-blur">
                  <Bike className="h-6 w-6" />
                </div>
                <div>
                  <div className="text-xs font-bold uppercase tracking-wider opacity-80">
                    Active Order · {activeOrder.status}
                  </div>
                  <div className="font-display font-extrabold">
                    {activeOrder.shop_name}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2 rounded-full bg-white/20 px-3 py-1.5 text-xs font-bold backdrop-blur">
                <Clock className="h-3.5 w-3.5" />
                Track <ChevronRight className="h-3.5 w-3.5" />
              </div>
            </Link>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Index;
