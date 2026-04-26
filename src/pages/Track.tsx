import { Header } from "@/components/Header";
import { useStore, type OrderStatus } from "@/store/useStore";
import { useParams, Link, Navigate } from "react-router-dom";
import { Check, Package, ChefHat, Bike, Home, PartyPopper } from "lucide-react";
import { motion } from "framer-motion";
import { useEffect, useMemo } from "react";

const STEPS: { key: OrderStatus; label: string; icon: typeof Check }[] = [
  { key: "Placed", label: "Order placed", icon: Package },
  { key: "Accepted", label: "Shop accepted", icon: Check },
  { key: "Preparing", label: "Preparing items", icon: ChefHat },
  { key: "Out for Delivery", label: "Out for delivery", icon: Bike },
  { key: "Delivered", label: "Delivered", icon: Home },
];

const Track = () => {
  const { id } = useParams();
  const orders = useStore((s) => s.orders);
  const order = useMemo(() => orders.find((o) => o.id === id), [orders, id]);
  const advance = useStore((s) => s.advanceOrder);

  // auto-progress every ~6s for live demo feel
  useEffect(() => {
    if (!order || order.status === "Delivered") return;
    const t = setTimeout(() => advance(order.id), 6000);
    return () => clearTimeout(t);
  }, [order, advance]);

  if (!order) return <Navigate to="/orders" replace />;
  const activeIdx = STEPS.findIndex((s) => s.key === order.status);
  const progress = ((activeIdx + 1) / STEPS.length) * 100;
  const done = order.status === "Delivered";

  return (
    <div className="min-h-screen">
      <Header />
      <div className="container max-w-3xl py-8">
        <div className="overflow-hidden rounded-3xl border border-border bg-gradient-card p-6 shadow-soft md:p-8">
          <div className="flex items-start justify-between gap-4">
            <div>
              <div className="text-xs font-semibold uppercase text-muted-foreground">
                Order {order.id}
              </div>
              <h1 className="mt-1 font-display text-3xl font-extrabold">
                {done ? "Delivered 🎉" : `Arriving in ~${order.etaMin || 15} min`}
              </h1>
              <div className="mt-1 text-sm text-muted-foreground">
                From <span className="font-semibold text-foreground">{order.shop_name}</span>
              </div>
            </div>
            <div className="grid h-16 w-16 place-items-center rounded-2xl bg-gradient-hero text-3xl text-primary-foreground shadow-pop">
              {done ? <PartyPopper className="h-7 w-7" /> : <Bike className="h-7 w-7" />}
            </div>
          </div>

          {/* progress bar */}
          <div className="mt-6 h-2.5 w-full overflow-hidden rounded-full bg-muted">
            <motion.div
              className="h-full bg-gradient-hero"
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.6 }}
            />
          </div>

          {/* steps */}
          <ol className="mt-8 space-y-5">
            {STEPS.map((step, i) => {
              const reached = i <= activeIdx;
              const current = i === activeIdx && !done;
              const Icon = step.icon;
              return (
                <li key={step.key} className="flex items-center gap-4">
                  <div
                    className={`relative grid h-11 w-11 place-items-center rounded-full transition ${
                      reached
                        ? "bg-gradient-hero text-primary-foreground shadow-pop"
                        : "bg-muted text-muted-foreground"
                    } ${current ? "animate-pulse-glow" : ""}`}
                  >
                    <Icon className="h-5 w-5" />
                  </div>
                  <div className="flex-1">
                    <div className={`font-semibold ${reached ? "" : "text-muted-foreground"}`}>
                      {step.label}
                    </div>
                    {current && (
                      <div className="text-xs text-primary">In progress…</div>
                    )}
                  </div>
                </li>
              );
            })}
          </ol>

          <div className="mt-8 rounded-2xl bg-card p-4">
            <div className="mb-2 text-sm font-semibold">Order summary</div>
            <div className="space-y-1 text-sm">
              {order.items.map((it) => (
                <div key={it.product.id} className="flex justify-between">
                  <span>
                    {it.qty} × {it.product.name}
                  </span>
                  <span className="text-muted-foreground">
                    ₹{it.qty * it.product.price}
                  </span>
                </div>
              ))}
            </div>
            <div className="mt-2 flex justify-between border-t border-border pt-2 text-sm font-bold">
              <span>Total paid</span>
              <span>₹{order.total}</span>
            </div>
          </div>

          <div className="mt-6 flex gap-3">
            <Link
              to="/orders"
              className="flex-1 rounded-2xl border border-border bg-card py-3 text-center text-sm font-semibold transition hover:border-primary"
            >
              All orders
            </Link>
            <Link
              to="/"
              className="flex-1 rounded-2xl bg-foreground py-3 text-center text-sm font-semibold text-background transition hover:opacity-90"
            >
              Order again
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Track;
