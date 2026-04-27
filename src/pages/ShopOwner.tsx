import { VendorHeader } from "@/components/VendorHeader";
import { useStore, type OrderStatus } from "@/store/useStore";
import { type Product } from "@/data/seed";
import { useMemo, useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Plus, Trash2, Pencil, IndianRupee, Package, TrendingUp, Store as StoreIcon, FileUp, Download, Bike, LogOut } from "lucide-react";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import Papa from "papaparse";

const DELIVERY_BOYS = [
  { name: "Rahul Sharma", phone: "9876543210" },
  { name: "Amit Kumar", phone: "8765432109" },
  { name: "Suresh Singh", phone: "7654321098" },
];

const ShopOwner = () => {
  const [assigningId, setAssigningId] = useState<string | null>(null);
  const navigate = useNavigate();
  const currentVendor = useStore((s) => s.currentVendor);
  const logoutVendor = useStore((s) => s.logoutVendor);
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
  const bulkUpsert = useStore((s) => s.bulkUpsertProducts);
  const del = useStore((s) => s.deleteProduct);

  const handleBulkUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const emojiMap: Record<string, string> = {
      'milk': '🥛', 'paneer': '🧀', 'curd': '🥣', 'butter': '🧈', 'cheese': '🧀', 'egg': '🥚',
      'atta': '🌾', 'salt': '🧂', 'oil': '🛢️', 'rice': '🍚', 'dal': '🍲', 'sugar': '🍬',
      'soap': '🧼', 'shampoo': '🧴', 'brush': '🪥', 'paste': '🦷', 'detergent': '🧺',
      'maggi': '🍜', 'biscuit': '🍪', 'chips': '🥔', 'juice': '🧃', 'coke': '🥤',
      'bread': '🍞', 'bun': '🥯', 'cake': '🍰', 'cookies': '🍪',
      'tablet': '💊', 'syrup': '🧴', 'capsule': '💊', 'bandage': '🩹'
    };

    const imageMap: Record<string, string> = {
      'milk': 'https://images.unsplash.com/photo-1550583724-125581f35045?w=400&h=400&fit=crop',
      'bread': 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=400&h=400&fit=crop',
      'atta': 'https://images.unsplash.com/photo-1495147466023-ac5c588e2e94?w=400&h=400&fit=crop',
      'flour': 'https://images.unsplash.com/photo-1495147466023-ac5c588e2e94?w=400&h=400&fit=crop',
      'oil': 'https://images.unsplash.com/photo-1474979266404-7eaacbadcbaf?w=400&h=400&fit=crop',
      'soap': 'https://images.unsplash.com/photo-1600857062241-98e5dba7f214?w=400&h=400&fit=crop',
      'chips': 'https://images.unsplash.com/photo-1566478989037-eec170784d0b?w=400&h=400&fit=crop',
      'lays': 'https://images.unsplash.com/photo-1566478989037-eec170784d0b?w=400&h=400&fit=crop',
      'maggi': 'https://images.unsplash.com/photo-1612927608553-eb80f0749007?w=400&h=400&fit=crop',
      'noodles': 'https://images.unsplash.com/photo-1612927608553-eb80f0749007?w=400&h=400&fit=crop',
      'salt': 'https://images.unsplash.com/photo-1518110903478-2452176c141d?w=400&h=400&fit=crop',
      'sugar': 'https://images.unsplash.com/photo-1581441363689-1f3c3c414635?w=400&h=400&fit=crop',
      'honey': 'https://images.unsplash.com/photo-1587049352846-4a222e784d38?w=400&h=400&fit=crop',
      'spices': 'https://images.unsplash.com/photo-1532336414038-cf19250c5757?w=400&h=400&fit=crop',
      'masala': 'https://images.unsplash.com/photo-1532336414038-cf19250c5757?w=400&h=400&fit=crop',
      'toothpaste': 'https://images.unsplash.com/photo-1559594864-7c55bb23f31b?w=400&h=400&fit=crop',
      'brush': 'https://images.unsplash.com/photo-1559594864-7c55bb23f31b?w=400&h=400&fit=crop',
      'rice': 'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=400&h=400&fit=crop',
      'dal': 'https://images.unsplash.com/photo-1547592166-23ac45744acd?w=400&h=400&fit=crop',
      'biscuit': 'https://images.unsplash.com/photo-1558961363-fa8fdf82db35?w=400&h=400&fit=crop',
      'cookie': 'https://images.unsplash.com/photo-1558961363-fa8fdf82db35?w=400&h=400&fit=crop',
      'egg': 'https://images.unsplash.com/photo-1582722872445-44c5f7c3c8f7?w=400&h=400&fit=crop',
      'paneer': 'https://images.unsplash.com/photo-1599488615731-7e5c2823ff28?w=400&h=400&fit=crop',
      'curd': 'https://images.unsplash.com/photo-1584269600464-37b1b58a9fe7?w=400&h=400&fit=crop',
      'yogurt': 'https://images.unsplash.com/photo-1584269600464-37b1b58a9fe7?w=400&h=400&fit=crop',
      'butter': 'https://images.unsplash.com/photo-1589985270826-4b7bb135bc9d?w=400&h=400&fit=crop',
      'cheese': 'https://images.unsplash.com/photo-1485962391945-447a3a450881?w=400&h=400&fit=crop',
      'coke': 'https://images.unsplash.com/photo-1622483767028-3f66f32aef97?w=400&h=400&fit=crop',
      'pepsi': 'https://images.unsplash.com/photo-1622483767028-3f66f32aef97?w=400&h=400&fit=crop',
      'juice': 'https://images.unsplash.com/photo-1600271886301-ad92c5a3b23e?w=400&h=400&fit=crop',
      'water': 'https://images.unsplash.com/photo-1560023907-5f339617ea30?w=400&h=400&fit=crop',
      'chocolate': 'https://images.unsplash.com/photo-1548907040-4baa42d100fe?w=400&h=400&fit=crop',
      'coffee': 'https://images.unsplash.com/photo-1559056199-641a0ac8b55e?w=400&h=400&fit=crop',
      'tea': 'https://images.unsplash.com/photo-1544787210-22939d1c9cc0?w=400&h=400&fit=crop',
      'detergent': 'https://images.unsplash.com/photo-1610557892470-55d9e80c0bce?w=400&h=400&fit=crop',
      'shampoo': 'https://images.unsplash.com/photo-1535585209827-a15fcdbc4c2d?w=400&h=400&fit=crop',
      'sanitizer': 'https://images.unsplash.com/photo-1584483766114-2cea6facdf57?w=400&h=400&fit=crop',
    };

    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        const data = results.data as any[];
        const formatted = data.map((row, index) => {
          const name = (row.name || row.Name || row.product_name || "").toLowerCase();
          
          // Smart Emoji
          let emoji = row.emoji || row.Emoji;
          if (!emoji || emoji === '📦') {
            const key = Object.keys(emojiMap).find(k => name.includes(k));
            emoji = key ? emojiMap[key] : "📦";
          }

          // Smart Image - checking for multiple possible column names
          let image = row.image || row.Image || row.img || row.photo || row.url || row.image_url;
          
          if (!image) {
            const key = Object.keys(imageMap).find(k => name.includes(k));
            if (key) {
              image = imageMap[key];
            } else {
              // Diversified Fallbacks
              const fallbacks = [
                'https://images.unsplash.com/photo-1542838132-92c53300491e', // Grocery bag
                'https://images.unsplash.com/photo-1578916171728-46686eac8d58', // Supermarket aisle
                'https://images.unsplash.com/photo-1583258292688-d0213dc5a3a8', // Fruits/Veg
                'https://images.unsplash.com/photo-1506484334402-4c5b17b7f3c9', // Fresh produce
                'https://images.unsplash.com/photo-1601599561213-832382fd07ba', // Store shelves
                'https://images.unsplash.com/photo-1543083477-4f79cddaf3f2', // Market
                'https://images.unsplash.com/photo-1516594798947-e65505dbb29d', // Shopping cart
              ];
              const randomPhoto = fallbacks[index % fallbacks.length];
              image = `${randomPhoto}?w=400&h=400&fit=crop&q=80&sig=${index}`;
            }
          }

          return {
            name: row.name || row.Name || row.product_name,
            price: Number(row.price || row.Price || 0),
            category: (row.category || row.Category || "Grocery") as any,
            unit: row.unit || row.Unit || "1 pc",
            emoji: emoji,
            image: image,
            stock: Number(row.stock || row.Stock || 10),
          };
        });

        if (formatted.length > 0) {
          bulkUpsert(shopId, formatted);
          toast.success(`${formatted.length} products added/updated`);
        } else {
          toast.error("No valid products found in CSV");
        }
        e.target.value = "";
      },
      error: (error) => {
        toast.error("Failed to parse CSV: " + error.message);
      }
    });
  };

  const downloadSample = () => {
     const csv = Papa.unparse([
       { name: "Milk", price: 60, category: "Dairy", unit: "1L", emoji: "🥛", stock: 50, image_url: "https://images.unsplash.com/photo-1550583724-125581f35045?w=400&h=400&fit=crop" },
       { name: "Bread", price: 40, category: "Bakery", unit: "1 pkt", emoji: "🍞", stock: 30, image_url: "https://images.unsplash.com/photo-1509440159596-0249088772ff?w=400&h=400&fit=crop" },
       { name: "Maggi", price: 14, category: "Snacks", unit: "70g", emoji: "🍜", stock: 100, image_url: "https://images.unsplash.com/photo-1612927608553-eb80f0749007?w=400&h=400&fit=crop" },
     ]);
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'sample_products.csv';
    a.click();
    URL.revokeObjectURL(url);
  };
  const orders = useStore((s) => s.orders);
  const fetchVendorOrders = useStore((s) => s.fetchVendorOrders);
  const updateOrderStatus = useStore((s) => s.updateOrderStatus);

  // Fetch orders on load and every 10 seconds
  useEffect(() => {
    if (shopId) {
      fetchVendorOrders(shopId);
      const interval = setInterval(() => fetchVendorOrders(shopId), 10000);
      return () => clearInterval(interval);
    }
  }, [shopId, fetchVendorOrders]);

  const products = useMemo(() => shop?.products || [], [shop]);

  const totalEarnings = orders
    .filter((o) => o.status !== "Pending")
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

  const handleStatusChange = async (orderId: string, status: OrderStatus, deliveryData?: { name: string; phone: string }) => {
    try {
      await updateOrderStatus(orderId, status, deliveryData);
      toast.success(`Order ${orderId} updated to ${status}`);
    } catch (error) {
      toast.error("Failed to update status");
    }
  };

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
          <button
            onClick={logoutVendor}
            className="flex items-center gap-2 rounded-full bg-slate-800 px-4 py-2 text-sm font-bold text-white hover:bg-slate-900"
          >
            <LogOut className="h-4 w-4" /> Logout
          </button>
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
              {orders.map((o: any) => (
                <div key={o.id} className="rounded-2xl border border-border bg-card p-4 shadow-soft">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <div className="text-xs font-semibold text-muted-foreground">{o.id}</div>
                        <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold uppercase ${
                          o.status === 'Pending' ? 'bg-amber-100 text-amber-700' :
                          o.status === 'Accepted' ? 'bg-blue-100 text-blue-700' :
                          o.status === 'Delivered' ? 'bg-emerald-100 text-emerald-700' :
                          'bg-slate-100 text-slate-700'
                        }`}>
                          {o.status}
                        </span>
                      </div>
                      <div className="mt-1 font-display text-lg font-bold">₹{o.total}</div>
                      
                      {/* Customer Info */}
                      <div className="mt-2 rounded-xl bg-muted/50 p-2 text-xs">
                        <div className="font-bold text-foreground">{o.customer_name || 'Customer'}</div>
                        <div className="text-muted-foreground">{o.customer_phone}</div>
                        <div className="mt-1 line-clamp-1 italic text-muted-foreground">{o.delivery_address}</div>
                      </div>

                      {/* Delivery Boy Info */}
                      {o.delivery_boy_name && (
                        <div className="mt-2 flex items-center gap-2 rounded-xl bg-amber-50 p-2 text-xs text-amber-800">
                          <Bike className="h-3.5 w-3.5" />
                          <div>
                            <span className="font-bold">{o.delivery_boy_name}</span>
                            <span className="mx-1">·</span>
                            <span>{o.delivery_boy_phone}</span>
                          </div>
                        </div>
                      )}

                      <div className="mt-2 text-xs text-muted-foreground">
                        {o.items.map((i: any) => `${i.qty}× ${i.product.name}`).join(", ")}
                      </div>
                    </div>
                  </div>
                  
                  <div className="mt-4 space-y-2">
                    {assigningId === o.id ? (
                      <div className="rounded-xl border border-amber-200 bg-amber-50 p-3">
                        <div className="mb-2 flex items-center justify-between">
                          <span className="text-xs font-bold text-amber-900">Select Delivery Boy</span>
                          <button 
                            onClick={() => setAssigningId(null)}
                            className="text-xs text-amber-900/60 hover:text-amber-900"
                          >
                            Cancel
                          </button>
                        </div>
                        <div className="grid gap-2">
                          {DELIVERY_BOYS.map((boy) => (
                            <button
                              key={boy.phone}
                              onClick={() => {
                                handleStatusChange(o.id, 'Out for Delivery', boy);
                                setAssigningId(null);
                              }}
                              className="flex items-center justify-between rounded-lg bg-white p-2 text-xs shadow-sm transition hover:bg-amber-100"
                            >
                              <div className="font-semibold">{boy.name}</div>
                              <div className="text-muted-foreground">{boy.phone}</div>
                            </button>
                          ))}
                        </div>
                      </div>
                    ) : (
                      <div className="flex flex-wrap gap-2">
                        {o.status === 'Pending' && (
                          <>
                            <button
                              onClick={() => handleStatusChange(o.id, 'Accepted')}
                              className="flex-1 rounded-xl bg-primary px-3 py-2 text-xs font-bold text-primary-foreground shadow-sm transition hover:opacity-90"
                            >
                              Accept
                            </button>
                          </>
                        )}
                        {o.status === 'Accepted' && (
                          <button
                            onClick={() => handleStatusChange(o.id, 'Preparing')}
                            className="flex-1 rounded-xl bg-blue-600 px-3 py-2 text-xs font-bold text-white shadow-sm transition hover:opacity-90"
                          >
                            Start Preparing
                          </button>
                        )}
                        {o.status === 'Preparing' && (
                          <button
                            onClick={() => setAssigningId(o.id)}
                            className="flex-1 rounded-xl bg-amber-500 px-3 py-2 text-xs font-bold text-white shadow-sm transition hover:opacity-90"
                          >
                            Assign Delivery Boy
                          </button>
                        )}
                        {o.status === 'Out for Delivery' && (
                          <button
                            onClick={() => handleStatusChange(o.id, 'Delivered')}
                            className="flex-1 rounded-xl bg-emerald-600 px-3 py-2 text-xs font-bold text-white shadow-sm transition hover:opacity-90"
                          >
                            Mark Delivered
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Products */}
          <section>
            <div className="mb-4 flex items-center justify-between">
              <h2 className="font-display text-xl font-bold">Products</h2>
              <div className="flex items-center gap-2">
                <button
                  onClick={downloadSample}
                  title="Download Sample CSV"
                  className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-border bg-card text-muted-foreground transition hover:bg-muted hover:text-foreground"
                >
                  <Download className="h-4 w-4" />
                </button>
                <label className="inline-flex h-8 w-8 cursor-pointer items-center justify-center rounded-full border border-border bg-card text-muted-foreground transition hover:bg-muted hover:text-foreground">
                  <FileUp className="h-4 w-4" />
                  <input
                    type="file"
                    accept=".csv"
                    onChange={handleBulkUpload}
                    className="hidden"
                  />
                </label>
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
            </div>
            <div className="space-y-2">
              {products.map((p) => (
                <div key={p.id} className="flex items-center gap-3 rounded-2xl border border-border bg-card p-3 shadow-soft">
                  <div className="relative h-12 w-12 overflow-hidden rounded-xl bg-gradient-card">
                    {p.image ? (
                      <img 
                        src={p.image} 
                        alt={p.name} 
                        crossOrigin="anonymous"
                        className="h-full w-full object-cover" 
                      />
                    ) : (
                      <div className="grid h-full w-full place-items-center text-2xl">{p.emoji}</div>
                    )}
                  </div>
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
              <Field label="Image URL (Optional)">
                <input
                  value={draft.image ?? ""}
                  placeholder="https://images.unsplash.com/..."
                  onChange={(e) => setDraft({ ...draft, image: e.target.value })}
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
