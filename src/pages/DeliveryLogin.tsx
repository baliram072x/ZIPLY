import { useState } from "react";
import { Header } from "@/components/Header";
import { useStore } from "@/store/useStore";
import { Navigate } from "react-router-dom";
import { ArrowRight, Bike } from "lucide-react";
import { toast } from "sonner";

const DeliveryLogin = () => {
  const currentDelivery = useStore((s) => s.currentDelivery);
  const loginDelivery = useStore((s) => s.loginDelivery);
  const [phone, setPhone] = useState("");
  const [pass, setPass] = useState("");

  if (currentDelivery) return <Navigate to="/delivery/dashboard" replace />;

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    const ok = loginDelivery(phone, pass);
    if (!ok) {
      toast.error("Invalid phone or password");
    } else {
      toast.success("Welcome back, partner!");
    }
  };

  return (
    <div className="min-h-screen bg-muted/30">
      <Header />
      <div className="container py-12 md:py-20 lg:max-w-md">
        <div className="rounded-3xl border border-border bg-card p-6 shadow-pop md:p-8 text-center text-card-foreground">
          <div className="mx-auto mb-4 grid h-16 w-16 place-items-center rounded-2xl bg-gradient-hero text-white shadow-soft">
            <Bike className="h-8 w-8" />
          </div>
          <h1 className="font-display text-2xl font-bold">Delivery Partner Login</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Sign in to view and accept your deliveries
          </p>

          <form onSubmit={handleLogin} className="mt-8 space-y-4 text-left">
            <div>
              <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-muted-foreground">
                Phone Number
              </label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                required
                placeholder="Ex. 9999999999"
                className="w-full rounded-xl border border-border bg-muted/50 px-4 py-2.5 outline-none transition focus:border-primary focus:ring-1 focus:ring-primary"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-muted-foreground">
                Password
              </label>
              <input
                type="password"
                value={pass}
                onChange={(e) => setPass(e.target.value)}
                required
                placeholder="••••••"
                className="w-full rounded-xl border border-border bg-muted/50 px-4 py-2.5 outline-none transition focus:border-primary focus:ring-1 focus:ring-primary"
              />
            </div>
            <button
              type="submit"
              className="group mt-2 w-full inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-4 py-3 font-display font-bold text-primary-foreground shadow-pop transition hover:scale-[1.02] active:scale-[0.98]"
            >
              Sign In
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </button>
          </form>

          <div className="mt-6 rounded-xl bg-muted/50 p-4 text-xs font-medium text-muted-foreground">
            <div className="mb-1 font-bold text-foreground">Demo Accounts:</div>
            <div>Phone: 9999999999 | Pass: 123 (Ramesh)</div>
            <div>Phone: 8888888888 | Pass: 123 (Suresh)</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DeliveryLogin;
