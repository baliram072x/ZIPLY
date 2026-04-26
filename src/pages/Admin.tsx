import { AdminHeader } from "@/components/AdminHeader";
import { useStore, type VendorAccount } from "@/store/useStore";
import { useState } from "react";
import { motion } from "framer-motion";
import { Plus, Trash2, Store as StoreIcon, Star, MapPin, Clock, Palette, User, Key } from "lucide-react";
import { toast } from "sonner";
import type { Shop } from "@/data/seed";

const Admin = () => {
  const shops = useStore((s) => s.shops);
  const vendorAccounts = useStore((s) => s.vendorAccounts);
  const addShop = useStore((s) => s.addShop);
  const deleteShop = useStore((s) => s.deleteShop);
  const addVendorAccount = useStore((s) => s.addVendorAccount);

  const [isAdding, setIsAdding] = useState(false);
  const [newShop, setNewShop] = useState<Partial<Shop>>({
    name: "",
    tagline: "",
    type: "Kirana",
    rating: 4.5,
    distanceKm: 0.5,
    prepMinutes: 10,
    emoji: "🏪",
    color: "from-blue-500 to-cyan-400",
    products: [],
  });

  const [vendorCreds, setVendorCreds] = useState({
    email: "",
    password: "",
  });

  const handleAddShop = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newShop.name || !newShop.id || !vendorCreds.email || !vendorCreds.password) {
      toast.error("Please fill all fields including vendor credentials");
      return;
    }
    
    // Add Shop
    addShop(newShop as Shop);

    // Add Vendor Account
    addVendorAccount({
      email: vendorCreds.email,
      password: vendorCreds.password,
      shopId: newShop.id as string,
    });

    toast.success("Shop and Vendor account created");
    setIsAdding(false);
    setNewShop({
      name: "",
      tagline: "",
      type: "Kirana",
      rating: 4.5,
      distanceKm: 0.5,
      prepMinutes: 10,
      emoji: "🏪",
      color: "from-blue-500 to-cyan-400",
      products: [],
    });
    setVendorCreds({ email: "", password: "" });
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <AdminHeader />
      <div className="container py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="font-display text-3xl font-extrabold">Super Admin</h1>
            <p className="text-muted-foreground text-sm">Manage all vendors and shops on the platform</p>
          </div>
          <button
            onClick={() => setIsAdding(true)}
            className="inline-flex items-center gap-2 rounded-full bg-primary px-4 py-2 text-sm font-bold text-primary-foreground shadow-pop hover:scale-105 transition-transform"
          >
            <Plus className="h-4 w-4" /> Add Vendor
          </button>
        </div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {shops.map((shop) => {
            const vendor = vendorAccounts.find(v => v.shopId === shop.id);
            return (
              <motion.div
                key={shop.id}
                layout
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="group relative overflow-hidden rounded-3xl border border-border bg-card p-5 shadow-soft hover:shadow-md transition-all"
              >
                <div className="flex items-start justify-between">
                  <div className={`grid h-14 w-14 place-items-center rounded-2xl bg-gradient-to-br ${shop.color} text-3xl shadow-pop`}>
                    {shop.emoji}
                  </div>
                  <button
                    onClick={() => {
                      if (confirm(`Are you sure you want to delete ${shop.name}? This will also delete the vendor account.`)) {
                        deleteShop(shop.id);
                        toast.success("Shop deleted");
                      }
                    }}
                    className="p-2 text-muted-foreground hover:text-destructive transition-colors opacity-0 group-hover:opacity-100"
                  >
                    <Trash2 className="h-5 w-5" />
                  </button>
                </div>

                <div className="mt-4">
                  <h3 className="font-display text-xl font-bold">{shop.name}</h3>
                  <p className="text-sm text-muted-foreground line-clamp-1">{shop.tagline}</p>
                </div>

                <div className="mt-4 flex flex-wrap gap-3">
                  <div className="flex items-center gap-1 text-xs font-semibold text-amber-500">
                    <Star className="h-3 w-3 fill-current" /> {shop.rating}
                  </div>
                  <div className="flex items-center gap-1 text-xs font-semibold text-muted-foreground">
                    <MapPin className="h-3 w-3" /> {shop.distanceKm} km
                  </div>
                  <div className="flex items-center gap-1 text-xs font-semibold text-muted-foreground">
                    <Clock className="h-3 w-3" /> {shop.prepMinutes} min
                  </div>
                </div>

                {vendor && (
                  <div className="mt-4 rounded-xl bg-muted/50 p-3 border border-border/50">
                    <div className="flex items-center gap-2 text-xs font-bold text-muted-foreground uppercase mb-2">
                      <User className="h-3 w-3" /> Vendor Credentials
                    </div>
                    <div className="text-xs font-medium text-foreground truncate">Email: {vendor.email}</div>
                    <div className="text-xs font-medium text-foreground mt-1">Pass: {vendor.password}</div>
                  </div>
                )}

                <div className="mt-6 flex items-center justify-between border-t pt-4">
                  <div className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                    ID: <span className="text-foreground">{shop.id}</span>
                  </div>
                  <div className="text-xs font-bold px-2 py-1 rounded-full bg-secondary text-secondary-foreground">
                    {shop.type}
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* Add Shop Modal */}
      {isAdding && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-foreground/40 p-4 backdrop-blur" onClick={() => setIsAdding(false)}>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="w-full max-w-2xl rounded-3xl border border-border bg-card p-8 shadow-pop max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="font-display text-2xl font-bold mb-6">Add New Vendor</h2>
            <form onSubmit={handleAddShop} className="space-y-6">
              <div className="grid gap-6 md:grid-cols-2">
                {/* Shop Details */}
                <div className="space-y-4">
                  <h3 className="text-sm font-bold uppercase text-primary tracking-wider">Shop Details</h3>
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold uppercase text-muted-foreground">Shop Name</label>
                    <input
                      required
                      value={newShop.name}
                      onChange={(e) => setNewShop({ ...newShop, name: e.target.value })}
                      className="w-full rounded-xl border border-border bg-muted/50 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary/20"
                      placeholder="e.g. Fresh Mart"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold uppercase text-muted-foreground">Shop ID (unique)</label>
                    <input
                      required
                      value={newShop.id}
                      onChange={(e) => setNewShop({ ...newShop, id: e.target.value.toLowerCase().replace(/\s+/g, "-") })}
                      className="w-full rounded-xl border border-border bg-muted/50 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary/20"
                      placeholder="e.g. fresh-mart"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold uppercase text-muted-foreground">Type</label>
                    <select
                      value={newShop.type}
                      onChange={(e) => setNewShop({ ...newShop, type: e.target.value as any })}
                      className="w-full rounded-xl border border-border bg-muted/50 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary/20"
                    >
                      <option value="Kirana">Kirana</option>
                      <option value="Medical">Medical</option>
                      <option value="Bakery">Bakery</option>
                      <option value="Dairy">Dairy</option>
                    </select>
                  </div>
                </div>

                {/* Vendor Credentials */}
                <div className="space-y-4">
                  <h3 className="text-sm font-bold uppercase text-primary tracking-wider">Vendor Login</h3>
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold uppercase text-muted-foreground">Login Email</label>
                    <input
                      required
                      type="email"
                      value={vendorCreds.email}
                      onChange={(e) => setVendorCreds({ ...vendorCreds, email: e.target.value })}
                      className="w-full rounded-xl border border-border bg-muted/50 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary/20"
                      placeholder="vendor@ziply.com"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold uppercase text-muted-foreground">Temporary Password</label>
                    <input
                      required
                      type="text"
                      value={vendorCreds.password}
                      onChange={(e) => setVendorCreds({ ...vendorCreds, password: e.target.value })}
                      className="w-full rounded-xl border border-border bg-muted/50 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary/20"
                      placeholder="Set password"
                    />
                  </div>
                  <div className="space-y-1.5 pt-1">
                    <label className="text-xs font-bold uppercase text-muted-foreground">Shop Emoji</label>
                    <input
                      value={newShop.emoji}
                      onChange={(e) => setNewShop({ ...newShop, emoji: e.target.value })}
                      className="w-full rounded-xl border border-border bg-muted/50 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary/20"
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold uppercase text-muted-foreground">Tagline</label>
                <input
                  value={newShop.tagline}
                  onChange={(e) => setNewShop({ ...newShop, tagline: e.target.value })}
                  className="w-full rounded-xl border border-border bg-muted/50 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary/20"
                  placeholder="e.g. Best groceries in town"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold uppercase text-muted-foreground">Theme Color (Tailwind Gradient)</label>
                <input
                  value={newShop.color}
                  onChange={(e) => setNewShop({ ...newShop, color: e.target.value })}
                  className="w-full rounded-xl border border-border bg-muted/50 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary/20"
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setIsAdding(false)}
                  className="flex-1 rounded-xl border border-border bg-card py-3 font-bold transition hover:bg-muted"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 rounded-xl bg-primary py-3 font-bold text-primary-foreground shadow-pop transition hover:scale-[1.02]"
                >
                  Create Vendor
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default Admin;

