import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes, Navigate } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import ShopView from "./pages/ShopView";
import Cart from "./pages/Cart";
import Track from "./pages/Track";
import Orders from "./pages/Orders";
import ShopOwner from "./pages/ShopOwner";
import Admin from "./pages/Admin";
import VendorLogin from "./pages/VendorLogin";
import Auth from "./pages/Auth";
import { useStore } from "@/store/useStore";
import { useEffect } from "react";

const queryClient = new QueryClient();

const App = () => {
  const checkSession = useStore((s) => s.checkSession);

  useEffect(() => {
    checkSession();
  }, [checkSession]);

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/auth" element={<Auth />} />
            <Route path="/shop-view/:id" element={<ShopView />} />
            <Route path="/cart" element={<Cart />} />
            <Route path="/orders" element={<Orders />} />
            <Route path="/track/:id" element={<Track />} />
            
            {/* Vendor Routes */}
            <Route path="/vendor/login" element={<VendorLogin />} />
            <Route path="/vendor/dashboard" element={<ShopOwner />} />
            
            {/* Admin Routes */}
            <Route path="/admin/dashboard" element={<Admin />} />
            
            {/* Redirect old routes */}
            <Route path="/shop" element={<Navigate to="/vendor/login" replace />} />
            <Route path="/admin" element={<Navigate to="/admin/dashboard" replace />} />
            
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
