import { useEffect, useMemo, useState } from "react";
import { Link, Navigate } from "react-router-dom";
import { LogOut, Bike, MapPin, Package, CheckCircle2, Navigation } from "lucide-react";
import { useStore, type Order } from "@/store/useStore";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";

const DeliveryDashboard = () => {
  const currentDelivery = useStore((s) => s.currentDelivery);
  const logoutDelivery = useStore((s) => s.logoutDelivery);
  const orders = useStore((s) => s.orders) || [];
  const fetchDeliveryOrders = useStore((s) => s.fetchDeliveryOrders);
  const updateOrderStatus = useStore((s) => s.updateOrderStatus);

  useEffect(() => {
    if (currentDelivery) {
      fetchDeliveryOrders();
      const interval = setInterval(fetchDeliveryOrders, 5000);
      return () => clearInterval(interval);
    }
  }, [currentDelivery, fetchDeliveryOrders]);

  if (!currentDelivery) return <Navigate to="/delivery/login" replace />;

  const [activeTab, setActiveTab] = useState<"available" | "active" | "history">("available");

  const availableOrders = useMemo(
    () => orders.filter(
      (o) => (o.status === "Accepted" || o.status === "Preparing") && (!o.delivery_boy_name || o.delivery_boy_name === currentDelivery.name)
    ),
    [orders, currentDelivery.name]
  );

  const activeOrders = useMemo(
    () => orders.filter(
      (o) => o.status === "Out for Delivery" && o.delivery_boy_name === currentDelivery.name
    ),
    [orders, currentDelivery.name]
  );
  
  const historyOrders = useMemo(
    () => orders.filter(
      (o) => o.status === "Delivered" && o.delivery_boy_name === currentDelivery.name
    ),
    [orders, currentDelivery.name]
  );

  const handleAccept = async (order: Order) => {
    try {
      await updateOrderStatus(order.id, "Out for Delivery", {
        name: currentDelivery.name,
        phone: currentDelivery.phone
      });
      toast.success("Order accepted! Head to the shop.");
      setActiveTab("active");
    } catch {
      toast.error("Failed to accept order");
    }
  };

  const handleMarkDelivered = async (orderId: string) => {
    try {
      await updateOrderStatus(orderId, "Delivered");
      toast.success("Order marked as delivered!");
      setActiveTab("history");
    } catch {
      toast.error("Failed to complete order");
    }
  };

  return (
    <div className="min-h-screen bg-muted/20">
      <header className="sticky top-0 z-50 border-b border-border bg-card/80 p-4 backdrop-blur-md">
        <div className="container flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="grid h-10 w-10 place-items-center rounded-xl bg-gradient-hero text-primary-foreground">
              <Bike className="h-6 w-6" />
            </div>
            <div>
              <h1 className="font-display font-bold leading-tight tracking-tight">Delivery App</h1>
              <p className="text-xs font-semibold text-muted-foreground">{currentDelivery.name}</p>
            </div>
          </div>
          <button
            onClick={logoutDelivery}
            className="rounded-full bg-muted p-2 text-muted-foreground hover:text-foreground"
          >
            <LogOut className="h-5 w-5" />
          </button>
        </div>
      </header>

      <div className="container py-6">
        <div className="mb-6 flex overflow-x-auto rounded-xl bg-card p-1 shadow-sm md:mx-auto md:max-w-md">
          <button
            onClick={() => setActiveTab("available")}
            className={`flex-1 rounded-lg py-2 text-sm font-semibold transition ${
              activeTab === "available" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-muted/50"
            }`}
          >
            Available ({availableOrders.length})
          </button>
          <button
            onClick={() => setActiveTab("active")}
            className={`flex-1 rounded-lg py-2 text-sm font-semibold transition ${
              activeTab === "active" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-muted/50"
            }`}
          >
            Active ({activeOrders.length})
          </button>
          <button
            onClick={() => setActiveTab("history")}
            className={`flex-1 rounded-lg py-2 text-sm font-semibold transition ${
              activeTab === "history" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-muted/50"
            }`}
          >
            Delivered ({historyOrders.length})
          </button>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          <AnimatePresence mode="popLayout">
            {(activeTab === "available" ? availableOrders : activeTab === "active" ? activeOrders : historyOrders).map((order) => (
              <motion.div
                layout
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                key={order.id}
                className="overflow-hidden rounded-2xl border border-border bg-card shadow-soft"
              >
                <div className="flex items-start justify-between border-b border-border/40 p-4">
                  <div>
                    <div className="mb-1 text-xs font-bold text-muted-foreground">ORDER ID</div>
                    <div className="font-mono text-sm font-semibold">{order.id}</div>
                  </div>
                  <div className="rounded-full bg-secondary/10 px-3 py-1 text-xs font-bold text-secondary">
                    ₹{order.total}
                  </div>
                </div>

                <div className="p-4 space-y-4">
                  <div className="flex gap-3 relative">
                    <div className="absolute left-[11px] top-6 h-[calc(100%-2rem)] w-0.5 border-l-2 border-dashed border-border" />
                    
                    <div className="flex flex-col gap-4">
                      {/* Pickup */}
                      <div className="flex gap-3">
                        <div className="relative z-10 grid h-6 w-6 shrink-0 place-items-center rounded-full bg-muted ring-4 ring-card">
                          <Package className="h-3 w-3 text-muted-foreground" />
                        </div>
                        <div>
                          <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Pickup from</div>
                          <div className="font-semibold text-foreground">{order.shop_name}</div>
                          <Link to="#" className="mt-1 inline-flex items-center gap-1 text-xs font-bold text-primary hover:underline">
                            <Navigation className="h-3 w-3" /> Get Directions
                          </Link>
                        </div>
                      </div>
                      
                      {/* Dropoff */}
                      <div className="flex gap-3">
                        <div className="relative z-10 grid h-6 w-6 shrink-0 place-items-center rounded-full bg-secondary/20 ring-4 ring-card">
                          <MapPin className="h-3 w-3 text-secondary" />
                        </div>
                        <div>
                          <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Deliver to</div>
                          <div className="font-semibold text-foreground">{order.delivery_address}</div>
                          <Link to="#" className="mt-1 inline-flex items-center gap-1 text-xs font-bold text-primary hover:underline">
                            <Navigation className="h-3 w-3" /> View Map
                          </Link>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="rounded-xl border border-border/50 bg-muted/30 p-3">
                    <div className="mb-2 text-xs font-bold text-muted-foreground">ITEMS ({order.items?.length || 0})</div>
                    <div className="text-sm">
                      {order.items?.map((item: any, i: number) => (
                        <div key={i} className="mb-1 flex justify-between last:mb-0">
                          <span className="truncate">{item.qty}x {item.product.name}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {activeTab === "available" && (
                    <button
                      onClick={() => handleAccept(order)}
                      className="w-full rounded-xl bg-secondary py-3 font-bold text-secondary-foreground shadow-pop transition hover:scale-[1.02] active:scale-[0.98]"
                    >
                      Accept Order
                    </button>
                  )}

                  {activeTab === "active" && (
                    <button
                      onClick={() => handleMarkDelivered(order.id)}
                      className="w-full flex items-center justify-center gap-2 rounded-xl bg-success py-3 font-bold text-success-foreground shadow-pop transition hover:scale-[1.02] active:scale-[0.98]"
                    >
                      <CheckCircle2 className="h-5 w-5" /> Mark as Delivered
                    </button>
                  )}
                </div>
              </motion.div>
            ))}
          </AnimatePresence>

          {(activeTab === "available" && availableOrders.length === 0) && (
            <div className="col-span-full py-12 text-center">
              <div className="mx-auto mb-4 grid h-16 w-16 place-items-center rounded-full bg-muted/50">
                <Bike className="h-8 w-8 text-muted-foreground" />
              </div>
              <h3 className="font-display text-lg font-bold">No available orders</h3>
              <p className="text-sm text-muted-foreground">Take a break! We'll ping you when there are new orders.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DeliveryDashboard;
