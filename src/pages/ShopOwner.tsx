import { VendorHeader } from "@/components/VendorHeader";
import { useStore, type OrderStatus } from "@/store/useStore";
import { type Product } from "@/data/seed";
import { useMemo, useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Plus, Trash2, Pencil, IndianRupee, Package, TrendingUp, Store as StoreIcon } from "lucide-react";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";

const ShopOwner = () => {
  const navigate = useNavigate();
  const currentVendor = useStore((s) => s.currentVendor);
  const shops = useStore((s) => s.shops);
  
  // Protect route
  useEffect(() => {
    if (!currentVendor) {
      navigate("/vendor/login");
    }
  }, [currentVendor, navigate]);

  const shopId = currentVendor?.shopId || "";
  const shop = useMemo(() => shops.find((s) => s.id === shopId), [shops, shopId]);
  
  const upsert = useStore((s) => s.upsertProduct);
  const del = useStore((s) => s.deleteProduct);
  const allOrders = useStore((s) => s.orders);
  const orders = useMemo(() => allOrders.filter((o) => o.shopId === shopId), [allOrders, shopId]);
  const setStatus = useStore((s) => s.setOrderStatus);

  const products = useMemo(() => shop?.products || [], [shop]);

  const totalEarnings = orders
    .filter((o) => o.status !== "Placed")
    .reduce((s, o) => s + o.total, 0);

  const [draft, setDraft] = useState<Partial<Product> | null>(null);

  if (!currentVendor) return null;

  if (!shop) return (
    <div className="min-h-screen">
      <VendorHeader shopName="No Shop Assigned" />
      <div className="container py-8 text-center">
        <h1 className="text-2xl font-bold">No shop is assigned to your account.</h1>
        <p className="text-muted-foreground mt-2">Please contact the administrator.</p>
      </div>
    </div>
  );

  const stats = [
    { label: "Today's orders", value: orders.length, icon: Package, tone: "from-pink-500 to-rose-400" },
    { label: "Earnings", value: `₹${totalEarnings}`, icon: IndianRupee, tone: "from-emerald-500 to-teal-400" },
    { label: "Live products", value: products.length, icon: TrendingUp, tone: "from-amber-500 to-orange-400" },
  ];

  return (
    <div className="min-h-screen bg-slate-50/50">
      <VendorHeader shopName={shop.name} />
      <div className="container py-8">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full bg-secondary/30 px-3 py-1 text-xs font-semibold">
              <StoreIcon className="h-3.5 w-3.5" /> Shop Owner Dashboard
            </div>
            <h1 className="mt-2 font-display text-3xl font-extrabold">{shop.name}</h1>
            <p className="text-sm text-muted-foreground">{shop.tagline}</p>
          </div>
        </div>

        <div className="mt-6 grid gap-4 sm:grid-cols-3">
          {stats.map((s) => (
            <motion.div
              key={s.label}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              className="overflow-hidden rounded-3xl border border-border bg-card p-5 shadow-soft"
            >
              <div className="flex items-center justify-between">
                <div className="text-sm font-medium text-muted-foreground">{s.label}</div>
                <div className={`grid h-10 w-10 place-items-center rounded-xl bg-gradient-to-br ${s.tone} text-white shadow-pop`}>
                  <s.icon className="h-5 w-5" />
                </div>
              </div>
              <div className="mt-2 font-display text-3xl font-extrabold">{s.value}</div>
            </motion.div>
          ))}
        </div>

        <div className="mt-8 grid gap-6 lg:grid-cols-[1fr_1fr]">
          {/* Orders */}
          <section>
            <div className="mb-4 flex items-center justify-between">
              <h2 className="font-display text-xl font-bold">Incoming orders</h2>
              <span className="text-xs text-muted-foreground">
                {orders.filter((o) => o.status !== "Delivered").length} active
              </span>
            </div>
            <div className="space-y-3">
              {orders.length === 0 && (
                <div className="rounded-2xl border border-dashed border-border bg-card/50 p-8 text-center text-sm text-muted-foreground">
                  No orders yet. Place one from the customer side to see it here.
                </div>
              )}
              {orders.map((o) => (
                <div key={o.id} className="rounded-2xl border border-border bg-card p-4 shadow-soft">
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="text-xs font-semibold text-muted-foreground">{o.id}</div>
                      <div className="font-display font-bold">₹{o.total} · {o.items.length} items</div>
                      <div className="mt-1 text-xs text-muted-foreground line-clamp-1">
                        {o.items.map((i) => `${i.qty}× ${i.product.name}`).join(", ")}
                      </div>
                    </div>
                    <span className="rounded-full bg-primary/10 px-2.5 py-1 text-xs font-semibold text-primary">
                      {o.status}
                    </span>
                  </div>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {(["Accepted", "Preparing", "Out for Delivery", "Delivered"] as OrderStatus[]).map((st) => (
                      <button
                        key={st}
                        onClick={() => {
                          setStatus(o.id, st);
                          toast.success(`Order ${o.id} → ${st}`);
                        }}
                        className={`rounded-full border px-3 py-1 text-xs font-semibold transition ${
                          o.status === st
                            ? "border-primary bg-primary text-primary-foreground"
                            : "border-border bg-card hover:border-primary/50"
                        }`}
                      >
                        {st}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Products */}
          <section>
            <div className="mb-4 flex items-center justify-between">
              <h2 className="font-display text-xl font-bold">Products</h2>
              <button
                onClick={() =>
                  setDraft({
                    id: "new-" + Math.random().toString(36).slice(2, 6),
                    name: "",
                    price: 0,
                    unit: "1 pc",
                    category: "Grocery",
                    emoji: "📦",
                    stock: 10,
                  })
                }
                className="inline-flex items-center gap-1 rounded-full bg-gradient-hero px-3 py-1.5 text-xs font-bold text-primary-foreground shadow-pop"
              >
                <Plus className="h-3.5 w-3.5" /> Add product
              </button>
            </div>
            <div className="space-y-2">
              {products.map((p) => (
                <div key={p.id} className="flex items-center gap-3 rounded-2xl border border-border bg-card p-3 shadow-soft">
                  <div className="grid h-12 w-12 place-items-center rounded-xl bg-gradient-card text-2xl">{p.emoji}</div>
                  <div className="flex-1">
                    <div className="font-semibold">{p.name}</div>
                    <div className="text-xs text-muted-foreground">{p.category} · {p.unit} · stock {p.stock}</div>
                  </div>
                  <div className="font-display font-bold">₹{p.price}</div>
                  <button
                    onClick={() => setDraft(p)}
                    className="grid h-8 w-8 place-items-center rounded-full hover:bg-muted"
                  >
                    <Pencil className="h-3.5 w-3.5" />
                  </button>
                  <button
                    onClick={() => {
                      del(shopId, p.id);
                      toast("Product removed");
                    }}
                    className="grid h-8 w-8 place-items-center rounded-full text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              ))}
            </div>
          </section>
        </div>
      </div>

      {/* Edit dialog */}
      {draft && (
        <div
          className="fixed inset-0 z-50 grid place-items-center bg-foreground/40 p-4 backdrop-blur"
          onClick={() => setDraft(null)}
        >
          <div
            className="w-full max-w-md rounded-3xl border border-border bg-card p-6 shadow-pop"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="font-display text-xl font-bold">
              {products.some((p) => p.id === draft.id) ? "Edit product" : "Add product"}
            </h3>
            <div className="mt-4 space-y-3">
              <Field label="Name">
                <input
                  value={draft.name ?? ""}
                  onChange={(e) => setDraft({ ...draft, name: e.target.value })}
                  className="w-full rounded-xl border border-border bg-background px-3 py-2 outline-none focus:border-primary"
                />
              </Field>
              <div className="grid grid-cols-2 gap-3">
                <Field label="Price ₹">
                  <input
                    type="number"
                    value={draft.price ?? 0}
                    onChange={(e) => setDraft({ ...draft, price: Number(e.target.value) })}
                    className="w-full rounded-xl border border-border bg-background px-3 py-2 outline-none focus:border-primary"
                  />
                </Field>
                <Field label="Unit">
                  <input
                    value={draft.unit ?? ""}
                    onChange={(e) => setDraft({ ...draft, unit: e.target.value })}
                    className="w-full rounded-xl border border-border bg-background px-3 py-2 outline-none focus:border-primary"
                  />
                </Field>
                <Field label="Stock">
                  <input
                    type="number"
                    value={draft.stock ?? 0}
                    onChange={(e) => setDraft({ ...draft, stock: Number(e.target.value) })}
                    className="w-full rounded-xl border border-border bg-background px-3 py-2 outline-none focus:border-primary"
                  />
                </Field>
                <Field label="Emoji">
                  <input
                    value={draft.emoji ?? ""}
                    onChange={(e) => setDraft({ ...draft, emoji: e.target.value })}
                    className="w-full rounded-xl border border-border bg-background px-3 py-2 text-2xl outline-none focus:border-primary"
                  />
                </Field>
              </div>
              <Field label="Category">
                <select
                  value={draft.category ?? "Grocery"}
                  onChange={(e) => setDraft({ ...draft, category: e.target.value as Product["category"] })}
                  className="w-full rounded-xl border border-border bg-background px-3 py-2 outline-none focus:border-primary"
                >
                  {["Grocery", "Medicine", "Dairy", "Bakery", "Snacks", "Personal Care"].map((c) => (
                    <option key={c}>{c}</option>
                  ))}
                </select>
              </Field>
            </div>
            <div className="mt-5 flex gap-2">
              <button
                onClick={() => setDraft(null)}
                className="flex-1 rounded-xl border border-border bg-card py-2 text-sm font-semibold"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  if (!draft.name) return toast.error("Name is required");
                  upsert(shopId, draft as Product);
                  toast.success("Saved");
                  setDraft(null);
                }}
                className="flex-1 rounded-xl bg-gradient-hero py-2 text-sm font-bold text-primary-foreground shadow-pop"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const Field = ({ label, children }: { label: string; children: React.ReactNode }) => (
  <label className="block">
    <div className="mb-1 text-xs font-semibold uppercase text-muted-foreground">{label}</div>
    {children}
  </label>
);

export default ShopOwner;
