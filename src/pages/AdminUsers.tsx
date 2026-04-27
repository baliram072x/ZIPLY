import { AdminHeader } from "@/components/AdminHeader";
import { User, Loader2 } from "lucide-react";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { api } from "@/lib/api";

const AdminUsers = () => {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const data = await api.get('/admin/users');
        setUsers(data);
      } catch (err) {
        console.error("Failed to fetch users");
      } finally {
        setLoading(false);
      }
    };
    fetchUsers();
  }, []);

  return (
    <div className="min-h-screen bg-slate-50">
      <AdminHeader />
      <div className="container py-8">
        <div className="mb-8">
          <h1 className="font-display text-3xl font-extrabold">Registered Users</h1>
          <p className="text-muted-foreground text-sm">Manage customers and platform users</p>
        </div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="overflow-hidden rounded-3xl border border-border bg-card shadow-soft">
          <div className="p-4 border-b border-border bg-muted/20">
            <h3 className="font-bold text-sm text-muted-foreground uppercase tracking-wider">User List</h3>
          </div>
          <div className="p-6">
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : users.length === 0 ? (
              <div className="py-12 text-center text-muted-foreground font-semibold">
                No users registered yet.
              </div>
            ) : (
              <div className="space-y-4">
                {users.map((u, i) => (
                  <div key={i} className="flex items-center justify-between rounded-xl border border-border/50 p-4 transition hover:bg-muted/30">
                    <div className="flex items-center gap-4">
                      <div className="grid h-10 w-10 place-items-center rounded-full bg-secondary/20 text-secondary shrink-0">
                        <User className="h-5 w-5" />
                      </div>
                      <div className="min-w-0">
                        <div className="font-bold truncate">{u.name}</div>
                        <div className="text-xs text-muted-foreground font-medium truncate">{u.phone}</div>
                        <div className="text-xs text-muted-foreground truncate">{u.address}</div>
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      <div className="text-sm font-bold text-primary">{u.orders_count || 0} Orders</div>
                      <div className="text-xs text-muted-foreground">Active Customer</div>
                    </div>
                  </div>
                ))}
              </div>
            )}
            
            <div className="mt-8 text-center pt-6 border-t border-border/50">
               <p className="text-sm font-semibold text-muted-foreground">Showing real-time data from database</p>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};
export default AdminUsers;
