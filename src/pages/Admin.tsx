import { AdminHeader } from "@/components/AdminHeader";
import { useStore, type VendorAccount } from "@/store/useStore";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Trash2, Store as StoreIcon, Star, MapPin, Clock, Palette, User, Key, Bike } from "lucide-react";
import { toast } from "sonner";
import type { Shop } from "@/data/seed";

const Admin = () => {
  const shops = useStore((s) => s.shops);
  const vendorAccounts = useStore((s) => s.vendorAccounts);
  const addShop = useStore((s) => s.addShop);
  const deleteShop = useStore((s) => s.deleteShop);
  const addVendorAccount = useStore((s) => s.addVendorAccount);
  
  const deliveryAccounts = useStore((s) => s.deliveryAccounts);
  const addDeliveryAccount = useStore((s) => s.addDeliveryAccount);
  const removeDeliveryAccount = useStore((s) => s.removeDeliveryAccount);

  const [activeTab, setActiveTab] = useState<"vendors" | "delivery">("vendors");

  const [isAddingVendor, setIsAddingVendor] = useState(false);
  const [newShop, setNewShop] = useState<Partial<Shop>>({
    name: "", tagline: "", type: "Kirana", rating: 4.5,
    distanceKm: 0.5, prepMinutes: 10, emoji: "🏪",
    color: "from-blue-500 to-cyan-400", products: [],
  });

  const [vendorCreds, setVendorCreds] = useState({ email: "", password: "" });

  const [isAddingDelivery, setIsAddingDelivery] = useState(false);
  const [deliveryData, setDeliveryData] = useState({ name: "", phone: "", password: "" });

  const handleAddShop = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newShop.name || !newShop.id || !vendorCreds.email || !vendorCreds.password) {
      toast.error("Please fill all fields including vendor credentials");
      return;
    }
    addShop(newShop as Shop);
    addVendorAccount({
      email: vendorCreds.email,
      password: vendorCreds.password,
      shopId: newShop.id as string,
    });
    toast.success("Shop and Vendor account created");
    setIsAddingVendor(false);
    setNewShop({
      name: "", tagline: "", type: "Kirana", rating: 4.5,
      distanceKm: 0.5, prepMinutes: 10, emoji: "🏪",
      color: "from-blue-500 to-cyan-400", products: [],
    });
    setVendorCreds({ email: "", password: "" });
  };

  const handleAddDelivery = (e: React.FormEvent) => {
    e.preventDefault();
    if (!deliveryData.name || !deliveryData.phone || !deliveryData.password) {
      toast.error("Please fill all fields");
      return;
    }
    if (deliveryAccounts.find(d => d.phone === deliveryData.phone)) {
      toast.error("Phone number already exists");
      return;
    }
    addDeliveryAccount(deliveryData);
    toast.success("Delivery partner added");
    setIsAddingDelivery(false);
    setDeliveryData({ name: "", phone: "", password: "" });
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <AdminHeader />
      <div className="container py-8">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between mb-8">
          <div>
            <h1 className="font-display text-3xl font-extrabold">Super Admin</h1>
            <p className="text-muted-foreground text-sm">Manage all vendors and delivery partners</p>
          </div>
          <div className="flex items-center gap-2">
            {activeTab === "vendors" ? (
              <button
                onClick={() => setIsAddingVendor(true)}
                className="inline-flex items-center gap-2 rounded-full bg-primary px-4 py-2 text-sm font-bold text-primary-foreground shadow-pop hover:scale-105 transition-transform"
              >
                <Plus className="h-4 w-4" /> Add Vendor
              </button>
            ) : (
              <button
                onClick={() => setIsAddingDelivery(true)}
                className="inline-flex items-center gap-2 rounded-full bg-primary px-4 py-2 text-sm font-bold text-primary-foreground shadow-pop hover:scale-105 transition-transform"
              >
                <Plus className="h-4 w-4" /> Add Delivery Partner
              </button>
            )}
          </div>
        </div>

        <div className="mb-6 flex overflow-x-auto rounded-xl bg-card p-1 shadow-sm md:max-w-xs">
          <button
            onClick={() => setActiveTab("vendors")}
            className={`flex-1 rounded-lg py-2 text-sm font-semibold transition ${
              activeTab === "vendors" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-muted/50"
            }`}
          >
            Vendors ({shops.length})
          </button>
          <button
            onClick={() => setActiveTab("delivery")}
            className={`flex-1 rounded-lg py-2 text-sm font-semibold transition ${
              activeTab === "delivery" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-muted/50"
            }`}
          >
            Delivery ({deliveryAccounts.length})
          </button>
        </div>

        {activeTab === "vendors" && (
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
        )}

        {activeTab === "delivery" && (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {deliveryAccounts.map((account) => (
              <motion.div
                key={account.phone}
                layout
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="group relative overflow-hidden rounded-3xl border border-border bg-card p-5 shadow-soft hover:shadow-md transition-all flex flex-col items-center text-center"
              >
                <div className="absolute right-4 top-4">
                  <button
                    onClick={() => {
                      if (confirm(`Remove delivery partner ${account.name}?`)) {
                        removeDeliveryAccount(account.phone);
                        toast.success("Delivery partner removed");
                      }
                    }}
                    className="p-2 text-muted-foreground hover:text-destructive transition-colors opacity-0 group-hover:opacity-100"
                  >
                    <Trash2 className="h-5 w-5" />
                  </button>
                </div>
                <div className="grid h-16 w-16 place-items-center rounded-full bg-gradient-hero text-3xl text-white shadow-pop">
                  <Bike className="h-8 w-8" />
                </div>
                <h3 className="font-display text-lg font-bold mt-4">{account.name}</h3>
                <div className="mt-3 w-full rounded-xl bg-muted/50 p-3 text-left border border-border/50">
                  <div className="flex items-center gap-2 text-xs font-bold text-muted-foreground uppercase mb-1">
                    <Key className="h-3 w-3" /> Login Credentials
                  </div>
                  <div className="text-xs font-medium text-foreground mb-1">Phone: {account.phone}</div>
                  <div className="text-xs font-medium text-foreground">Pass: {account.password}</div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* Add Vendor Modal */}
      {isAddingVendor && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-foreground/40 p-4 backdrop-blur" onClick={() => setIsAddingVendor(false)}>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="w-full max-w-2xl rounded-3xl border border-border bg-card p-8 shadow-pop max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="font-display text-2xl font-bold mb-6">Add New Vendor</h2>
            <form onSubmit={handleAddShop} className="space-y-6">
              <div className="grid gap-6 md:grid-cols-2">
                <div className="space-y-4">
                  <h3 className="text-sm font-bold uppercase text-primary tracking-wider">Shop Details</h3>
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold uppercase text-muted-foreground">Shop Name</label>
                    <input required value={newShop.name} onChange={(e) => setNewShop({ ...newShop, name: e.target.value })} className="w-full rounded-xl border border-border bg-muted/50 px-4 py-2" />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold uppercase text-muted-foreground">Shop ID</label>
                    <input required value={newShop.id} onChange={(e) => setNewShop({ ...newShop, id: e.target.value.toLowerCase().replace(/\s+/g, "-") })} className="w-full rounded-xl border border-border bg-muted/50 px-4 py-2" />
                  </div>
                </div>
                <div className="space-y-4">
                  <h3 className="text-sm font-bold uppercase text-primary tracking-wider">Vendor Login</h3>
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold uppercase text-muted-foreground">Login Email</label>
                    <input required type="email" value={vendorCreds.email} onChange={(e) => setVendorCreds({ ...vendorCreds, email: e.target.value })} className="w-full rounded-xl border border-border bg-muted/50 px-4 py-2" />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold uppercase text-muted-foreground">Temporary Password</label>
                    <input required value={vendorCreds.password} onChange={(e) => setVendorCreds({ ...vendorCreds, password: e.target.value })} className="w-full rounded-xl border border-border bg-muted/50 px-4 py-2" />
                  </div>
                </div>
              </div>
              <div className="flex gap-3 pt-4">
                <button type="button" onClick={() => setIsAddingVendor(false)} className="flex-1 rounded-xl border bg-card py-3 font-bold transition hover:bg-muted">Cancel</button>
                <button type="submit" className="flex-1 rounded-xl bg-primary py-3 font-bold text-primary-foreground">Create Vendor</button>
              </div>
            </form>
          </motion.div>
        </div>
      )}

      {/* Add Delivery Partner Modal */}
      {isAddingDelivery && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-foreground/40 p-4 backdrop-blur" onClick={() => setIsAddingDelivery(false)}>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="w-full max-w-md rounded-3xl border border-border bg-card p-8 shadow-pop max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="font-display text-2xl font-bold mb-6">Add Delivery Partner</h2>
            <form onSubmit={handleAddDelivery} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold uppercase text-muted-foreground">Full Name</label>
                <input required value={deliveryData.name} onChange={(e) => setDeliveryData({ ...deliveryData, name: e.target.value })} className="w-full rounded-xl border border-border bg-muted/50 px-4 py-2" placeholder="Ex. Ajay Kumar" />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-bold uppercase text-muted-foreground">Phone Number (Login ID)</label>
                <input required type="tel" value={deliveryData.phone} onChange={(e) => setDeliveryData({ ...deliveryData, phone: e.target.value })} className="w-full rounded-xl border border-border bg-muted/50 px-4 py-2" placeholder="Ex. 9876543210" />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-bold uppercase text-muted-foreground">Temporary Password</label>
                <input required value={deliveryData.password} onChange={(e) => setDeliveryData({ ...deliveryData, password: e.target.value })} className="w-full rounded-xl border border-border bg-muted/50 px-4 py-2" placeholder="Set password" />
              </div>
              <div className="flex gap-3 pt-4">
                <button type="button" onClick={() => setIsAddingDelivery(false)} className="flex-1 rounded-xl border bg-card py-3 font-bold transition hover:bg-muted">Cancel</button>
                <button type="submit" className="flex-1 rounded-xl bg-primary py-3 font-bold text-primary-foreground">Add Partner</button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default Admin;

