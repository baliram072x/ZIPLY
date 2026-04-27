import { AdminHeader } from "@/components/AdminHeader";
import { BarChart3, TrendingUp, Users, ShoppingBag, Loader2 } from "lucide-react";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { api } from "@/lib/api";

const AdminAnalytics = () => {
  const [analytics, setAnalytics] = useState({
    totalRevenue: 0,
    totalOrders: 0,
    activeUsers: 0,
    avgDeliveryTime: "14 min"
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const data = await api.get('/admin/analytics');
        setAnalytics(data);
      } catch (err) {
        console.error("Failed to fetch analytics");
      } finally {
        setLoading(false);
      }
    };
    fetchAnalytics();
  }, []);

  return (
    <div className="min-h-screen bg-slate-50">
      <AdminHeader />
      <div className="container py-8">
        <div className="mb-8 items-center justify-between flex">
          <div>
            <h1 className="font-display text-3xl font-extrabold">Analytics Overview</h1>
            <p className="text-muted-foreground text-sm">Platform performance and key metrics</p>
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="h-10 w-10 animate-spin text-primary" />
          </div>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="rounded-3xl border border-border bg-card p-6 shadow-soft">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                <TrendingUp className="h-6 w-6" />
              </div>
              <h3 className="mt-4 text-3xl font-bold">₹{analytics.totalRevenue.toLocaleString()}</h3>
              <p className="text-sm font-semibold text-muted-foreground">Total Revenue</p>
            </motion.div>
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="rounded-3xl border border-border bg-card p-6 shadow-soft">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-secondary/10 text-secondary">
                <ShoppingBag className="h-6 w-6" />
              </div>
              <h3 className="mt-4 text-3xl font-bold">{analytics.totalOrders.toLocaleString()}</h3>
              <p className="text-sm font-semibold text-muted-foreground">Total Orders</p>
            </motion.div>
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="rounded-3xl border border-border bg-card p-6 shadow-soft">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-500/10 text-amber-500">
                <Users className="h-6 w-6" />
              </div>
              <h3 className="mt-4 text-3xl font-bold">{analytics.activeUsers.toLocaleString()}</h3>
              <p className="text-sm font-semibold text-muted-foreground">Active Users</p>
            </motion.div>
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="rounded-3xl border border-border bg-card p-6 shadow-soft">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-500/10 text-indigo-500">
                <BarChart3 className="h-6 w-6" />
              </div>
              <h3 className="mt-4 text-3xl font-bold">{analytics.avgDeliveryTime}</h3>
              <p className="text-sm font-semibold text-muted-foreground">Avg. Delivery Time</p>
            </motion.div>
          </div>
        )}

        <div className="mt-8 rounded-3xl border border-border bg-card p-8 shadow-soft flex items-center justify-center h-64 text-muted-foreground font-semibold flex-col gap-2">
           <BarChart3 className="h-10 w-10 text-muted-foreground/30" />
           Sales Chart Coming Soon
        </div>
      </div>
    </div>
  );
};
export default AdminAnalytics;
