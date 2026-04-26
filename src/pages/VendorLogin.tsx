import { useState } from "react";
import { useStore } from "@/store/useStore";
import { useNavigate, Link } from "react-router-dom";
import { Store, Mail, Lock, ArrowRight, Zap } from "lucide-react";
import { toast } from "sonner";
import { motion } from "framer-motion";

const VendorLogin = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const loginVendor = useStore((s) => s.loginVendor);
  const navigate = useNavigate();

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    const success = loginVendor(email, password);
    if (success) {
      toast.success("Login successful!");
      navigate("/vendor/dashboard");
    } else {
      toast.error("Invalid email or password");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
      <Link to="/" className="absolute top-8 left-8 flex items-center gap-2">
        <div className="grid h-8 w-8 place-items-center rounded-lg bg-primary text-primary-foreground shadow-pop">
          <Zap className="h-4 w-4" />
        </div>
        <span className="font-display text-xl font-extrabold">Ziply</span>
      </Link>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md bg-card rounded-3xl border border-border p-8 shadow-pop"
      >
        <div className="text-center mb-8">
          <div className="inline-grid h-16 w-16 place-items-center rounded-2xl bg-primary/10 text-primary mb-4">
            <Store className="h-8 w-8" />
          </div>
          <h1 className="font-display text-2xl font-bold">Vendor Login</h1>
          <p className="text-muted-foreground mt-2">Manage your shop and orders</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-5">
          <div className="space-y-1.5">
            <label className="text-xs font-bold uppercase text-muted-foreground px-1">Email Address</label>
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <input
                required
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-xl border border-border bg-muted/30 px-11 py-3 focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                placeholder="vendor@example.com"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold uppercase text-muted-foreground px-1">Password</label>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <input
                required
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full rounded-xl border border-border bg-muted/30 px-11 py-3 focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                placeholder="••••••••"
              />
            </div>
          </div>

          <button
            type="submit"
            className="w-full group flex items-center justify-center gap-2 rounded-xl bg-primary py-4 font-bold text-primary-foreground shadow-pop transition hover:scale-[1.02] active:scale-[0.98]"
          >
            Login to Dashboard
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
          </button>
        </form>

        <div className="mt-8 pt-6 border-t border-border text-center">
          <p className="text-sm text-muted-foreground">
            Want to join Ziply? Contact the administrator to get your vendor credentials.
          </p>
        </div>
      </motion.div>
    </div>
  );
};

export default VendorLogin;
