import { useParams, Link, Navigate } from "react-router-dom";
import { Header } from "@/components/Header";
import { ProductCard } from "@/components/ProductCard";
import { etaMinutes, getDistance, type Category } from "@/data/seed";
import { ArrowLeft, Clock, MapPin, Star } from "lucide-react";
import { useMemo, useState } from "react";
import { useStore } from "@/store/useStore";

const ShopView = () => {
  const { id } = useParams();
  const shops = useStore((s) => s.shops);
  const coords = useStore((s) => s.coords);
  const shop = shops.find((s) => s.id === id);
  const cats = useMemo(() => {
    if (!shop) return [] as Category[];
    return Array.from(new Set(shop.products.map((p) => p.category))) as Category[];
  }, [shop]);
  const [active, setActive] = useState<Category | "All">("All");

  if (!shop) return <Navigate to="/" replace />;
  const eta = etaMinutes(shop, coords || undefined);
  const distance = getDistance(shop, coords || undefined);
  const filtered =
    active === "All" ? shop.products : shop.products.filter((p) => p.category === active);

  return (
    <div className="min-h-screen">
      <Header />
      <div className={`bg-gradient-to-br ${shop.color} text-white`}>
        <div className="container py-8">
          <Link to="/" className="inline-flex items-center gap-1 text-sm text-white/90 hover:text-white">
            <ArrowLeft className="h-4 w-4" /> Back
          </Link>
          <div className="mt-4 flex items-start gap-4">
            <div className="grid h-20 w-20 place-items-center rounded-2xl bg-white/20 text-5xl backdrop-blur">
              {shop.emoji}
            </div>
            <div>
              <h1 className="font-display text-3xl font-extrabold leading-tight">
                {shop.name}
              </h1>
              <div className="text-white/85">{shop.tagline}</div>
              <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-sm font-medium">
                <span className="flex items-center gap-1">
                  <Star className="h-4 w-4 fill-current" /> {shop.rating}
                </span>
                <span className="flex items-center gap-1">
                  <Clock className="h-4 w-4" /> {eta} min
                </span>
                <span className="flex items-center gap-1">
                  <MapPin className="h-4 w-4" /> {distance} km away
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="container py-6">
        <div className="mb-5 flex flex-wrap gap-2">
          <button
            onClick={() => setActive("All")}
            className={`rounded-full border px-4 py-1.5 text-sm font-semibold transition ${
              active === "All"
                ? "border-primary bg-primary text-primary-foreground"
                : "border-border bg-card hover:border-primary/50"
            }`}
          >
            All
          </button>
          {cats.map((c) => (
            <button
              key={c}
              onClick={() => setActive(c)}
              className={`rounded-full border px-4 py-1.5 text-sm font-semibold transition ${
                active === c
                  ? "border-primary bg-primary text-primary-foreground"
                  : "border-border bg-card hover:border-primary/50"
              }`}
            >
              {c}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
            {filtered.map((p) => (
              <ProductCard key={p.id} product={p} shop={shop} />
            ))}
          </div>
      </div>
    </div>
  );
};

export default ShopView;
