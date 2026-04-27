import { Header } from "@/components/Header";
import { useStore } from "@/store/useStore";
import { Link } from "react-router-dom";
import { Clock } from "lucide-react";
import { useEffect } from "react";

const Orders = () => {
  const orders = useStore((s) => s.orders);
  const fetchOrders = useStore((s) => s.fetchOrders);

  useEffect(() => {
    fetchOrders();
    const interval = setInterval(fetchOrders, 10000);
    return () => clearInterval(interval);
  }, [fetchOrders]);
  return (
    <div className="min-h-screen">
      <Header />
      <div className="container max-w-3xl py-8">
        <h1 className="font-display text-3xl font-bold">Your orders</h1>
        <p className="text-sm text-muted-foreground">
          {orders.length} order{orders.length === 1 ? "" : "s"} so far
        </p>

        <div className="mt-6 space-y-3">
          {orders.length === 0 && (
            <div className="rounded-3xl border border-dashed border-border bg-card/50 p-10 text-center text-muted-foreground">
              No orders yet. <Link to="/" className="font-semibold text-primary">Place your first one →</Link>
            </div>
          )}
          {orders.map((o) => (
            <Link
              key={o.id}
              to={`/track/${o.id}`}
              className="flex items-center justify-between gap-4 rounded-2xl border border-border bg-gradient-card p-5 shadow-soft transition hover:-translate-y-0.5 hover:shadow-pop"
            >
              <div>
                <div className="text-xs font-semibold uppercase text-muted-foreground">
                  {o.id}
                </div>
                <div className="font-display text-lg font-bold">{o.shop_name}</div>
                <div className="text-sm text-muted-foreground">
                  {o.items.length} item{o.items.length === 1 ? "" : "s"} · ₹{o.total}
                </div>
              </div>
              <div className="text-right">
                <span
                  className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold ${
                    o.status === "Delivered"
                      ? "bg-success/10 text-success"
                      : "bg-primary/10 text-primary"
                  }`}
                >
                  {o.status !== "Delivered" && <Clock className="h-3 w-3" />}
                  {o.status}
                </span>
                <div className="mt-1 text-xs text-muted-foreground">
                  {new Date(o.created_at).toLocaleString()}
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Orders;
