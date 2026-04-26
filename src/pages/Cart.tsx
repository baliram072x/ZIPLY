import { Header } from "@/components/Header";
import { useStore } from "@/store/useStore";
import { Minus, Plus, Trash2, ShoppingBag, MapPin, AlertCircle } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { SHOPS, etaMinutes } from "@/data/seed";
import { motion } from "framer-motion";
import { toast } from "sonner";

const Cart = () => {
  const cart = useStore((s) => s.cart);
  const add = useStore((s) => s.addToCart);
  const dec = useStore((s) => s.decrement);
  const remove = useStore((s) => s.removeFromCart);
  const total = useStore((s) => s.cartTotal());
  const placeOrder = useStore((s) => s.placeOrder);
  const location = useStore((s) => s.location);
  const user = useStore((s) => s.user);
  const navigate = useNavigate();

  const shop = cart[0] ? SHOPS.find((s) => s.id === cart[0].shopId) : null;
  const eta = shop ? etaMinutes(shop) : 10;
  const delivery = total > 0 ? (total >= 199 ? 0 : 19) : 0;
  const grand = total + delivery;

  const handlePlaceOrder = () => {
    if (!user) {
      navigate("/auth");
      toast.info("Please login to place your order", {
        icon: <AlertCircle className="h-4 w-4" />
      });
      return;
    }

    const order = placeOrder(eta, user.address);
    if (order) {
      toast.success("Order placed successfully!", { 
        description: `Delivering to ${user.name} in ${eta} min` 
      });
      navigate(`/track/${order.id}`);
    }
  };

  if (cart.length === 0) {
    return (
      <div className="min-h-screen">
        <Header />
        <div className="container grid place-items-center py-24 text-center">
          <div className="grid h-24 w-24 place-items-center rounded-full bg-gradient-card text-5xl shadow-soft">
            🛒
          </div>
          <h2 className="mt-6 font-display text-3xl font-bold">Your cart is empty</h2>
          <p className="mt-2 text-muted-foreground">
            Browse local shops and add some essentials.
          </p>
          <Link
            to="/"
            className="mt-6 inline-flex items-center gap-2 rounded-full bg-gradient-hero px-6 py-3 font-semibold text-primary-foreground shadow-pop"
          >
            <ShoppingBag className="h-4 w-4" /> Start shopping
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <Header />
      <div className="container grid gap-6 py-8 lg:grid-cols-[1fr_380px]">
        <div>
          <h1 className="font-display text-3xl font-bold">Your cart</h1>
          <p className="text-sm text-muted-foreground">
            From <span className="font-semibold text-foreground">{cart[0].shopName}</span> · ETA {eta} min
          </p>

          <div className="mt-6 space-y-3">
            {cart.map((c) => (
              <motion.div
                layout
                key={c.product.id}
                className="flex items-center gap-4 rounded-2xl border border-border bg-card p-4 shadow-soft"
              >
                <div className="grid h-14 w-14 place-items-center rounded-xl bg-gradient-card text-3xl">
                  {c.product.emoji}
                </div>
                <div className="flex-1">
                  <div className="font-semibold">{c.product.name}</div>
                  <div className="text-xs text-muted-foreground">
                    {c.product.unit} · ₹{c.product.price}
                  </div>
                </div>
                <div className="flex items-center gap-2 rounded-full bg-primary text-primary-foreground">
                  <button onClick={() => dec(c.product.id)} className="grid h-8 w-8 place-items-center rounded-full hover:bg-primary-glow">
                    <Minus className="h-3.5 w-3.5" />
                  </button>
                  <span className="min-w-4 text-center text-sm font-bold">{c.qty}</span>
                  <button onClick={() => shop && add(c.product, shop)} className="grid h-8 w-8 place-items-center rounded-full hover:bg-primary-glow">
                    <Plus className="h-3.5 w-3.5" />
                  </button>
                </div>
                <div className="w-16 text-right font-display font-bold">
                  ₹{c.qty * c.product.price}
                </div>
                <button
                  onClick={() => remove(c.product.id)}
                  className="grid h-8 w-8 place-items-center rounded-full text-muted-foreground transition hover:bg-destructive/10 hover:text-destructive"
                  aria-label="Remove"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </motion.div>
            ))}
          </div>
        </div>

        <aside className="h-fit space-y-4 rounded-3xl border border-border bg-gradient-card p-6 shadow-soft lg:sticky lg:top-20">
          <h3 className="font-display text-xl font-bold">Bill summary</h3>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Items total</span>
              <span className="font-medium">₹{total}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Delivery fee</span>
              <span className="font-medium">
                {delivery === 0 ? <span className="text-success">FREE</span> : `₹${delivery}`}
              </span>
            </div>
            {delivery > 0 && (
              <div className="rounded-lg bg-secondary/40 p-2 text-xs text-foreground/80">
                Add ₹{199 - total} more for free delivery 🎉
              </div>
            )}
          </div>
          <div className="flex items-center justify-between border-t border-border pt-3">
            <span className="font-semibold">To pay</span>
            <span className="font-display text-2xl font-extrabold">₹{grand}</span>
          </div>

          <div className="rounded-xl bg-card p-3 text-sm">
            <div className="flex items-center gap-2 text-xs font-semibold uppercase text-muted-foreground">
              <MapPin className="h-3 w-3" />
              {user ? "Deliver to" : "Delivery Address"}
            </div>
            <div className="mt-1 font-medium text-foreground">
              {user ? (
                <div>
                  <div className="text-sm font-bold">{user.name}</div>
                  <div className="text-xs text-muted-foreground line-clamp-1">{user.address}</div>
                </div>
              ) : (
                <button 
                  onClick={() => navigate("/auth")}
                  className="text-primary hover:underline"
                >
                  Login to add address
                </button>
              )}
            </div>
          </div>

          <button
            onClick={handlePlaceOrder}
            className="w-full rounded-2xl bg-gradient-hero px-6 py-4 font-display text-lg font-bold text-primary-foreground shadow-pop transition hover:scale-[1.02]"
          >
            {user ? `Place order · ₹${grand}` : "Login to Checkout"}
          </button>
        </aside>
      </div>
    </div>
  );
};

export default Cart;
