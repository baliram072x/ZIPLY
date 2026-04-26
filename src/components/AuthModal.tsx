import { useState, useEffect } from "react";
import { useStore, type UserProfile } from "@/store/useStore";
import { useNavigate, useLocation } from "react-router-dom";
import { Phone, User, MapPin, ArrowRight, Zap, X } from "lucide-react";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";

export const AuthModal = ({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) => {
  const [step, setStep] = useState<"phone" | "profile">("phone");
  const [phone, setPhone] = useState("");
  const [name, setName] = useState("");
  const [address, setAddress] = useState("");
  
  const loginUser = useStore((s) => s.loginUser);

  // Disable body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  const handlePhoneSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (phone.length < 10) {
      toast.error("Please enter a valid phone number");
      return;
    }
    setStep("profile");
  };

  const handleProfileSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !address) {
      toast.error("Please fill all details");
      return;
    }

    const profile: UserProfile = {
      id: "USR" + Math.random().toString(36).slice(2, 7),
      phone,
      name,
      address
    };

    loginUser(profile);
    toast.success(`Welcome, ${name}!`);
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div 
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm" 
          onClick={onClose}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="relative w-full max-w-[420px] max-h-[90vh] flex flex-col overflow-hidden rounded-[2.5rem] border border-border bg-card shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header with Close Button */}
            <div className="absolute right-6 top-6 z-10">
              <button 
                onClick={onClose}
                className="grid h-10 w-10 place-items-center rounded-full bg-muted/50 transition hover:bg-muted"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Scrollable Content Area */}
            <div className="flex-1 overflow-y-auto p-8 pt-12 custom-scrollbar">
              <div className="mb-8 text-center">
                <div className="inline-grid h-16 w-16 place-items-center rounded-2xl bg-primary/10 text-primary mb-4">
                  <Zap className="h-8 w-8 fill-current" />
                </div>
                <h2 className="font-display text-2xl font-extrabold">Login to Ziply</h2>
                <p className="text-muted-foreground mt-2">Groceries in 10 minutes flat</p>
              </div>

              {step === "phone" ? (
                <form onSubmit={handlePhoneSubmit} className="space-y-6">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold uppercase text-muted-foreground px-1">Phone Number</label>
                    <div className="relative">
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 font-bold text-muted-foreground">+91</span>
                      <input
                        autoFocus
                        required
                        type="tel"
                        maxLength={10}
                        value={phone}
                        onChange={(e) => setPhone(e.target.value.replace(/\D/g, ""))}
                        className="w-full rounded-2xl border border-border bg-muted/30 pl-14 pr-4 py-4 font-bold outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                        placeholder="98765 43210"
                      />
                    </div>
                  </div>
                  <button
                    type="submit"
                    className="w-full group flex items-center justify-center gap-2 rounded-2xl bg-primary py-4 font-bold text-primary-foreground shadow-pop transition hover:scale-[1.02] active:scale-[0.98]"
                  >
                    Continue
                    <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
                  </button>
                </form>
              ) : (
                <form onSubmit={handleProfileSubmit} className="space-y-5">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold uppercase text-muted-foreground px-1">Full Name</label>
                    <div className="relative">
                      <User className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                      <input
                        autoFocus
                        required
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="w-full rounded-2xl border border-border bg-muted/30 pl-12 pr-4 py-4 font-bold outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                        placeholder="John Doe"
                      />
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold uppercase text-muted-foreground px-1">Delivery Address</label>
                    <div className="relative">
                      <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                      <input
                        required
                        value={address}
                        onChange={(e) => setAddress(e.target.value)}
                        className="w-full rounded-2xl border border-border bg-muted/30 pl-12 pr-4 py-4 font-bold outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                        placeholder="Flat, Floor, Building Name"
                      />
                    </div>
                  </div>
                  <button
                    type="submit"
                    className="w-full group flex items-center justify-center gap-2 rounded-2xl bg-primary py-4 font-bold text-primary-foreground shadow-pop transition hover:scale-[1.02] active:scale-[0.98]"
                  >
                    Complete Profile
                    <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
                  </button>
                  <button 
                    type="button" 
                    onClick={() => setStep("phone")}
                    className="w-full text-sm font-bold text-muted-foreground hover:text-foreground transition"
                  >
                    Change phone number
                  </button>
                </form>
              )}
              
              <p className="mt-8 text-center text-[10px] text-muted-foreground leading-relaxed uppercase tracking-widest font-bold">
                By continuing, you agree to our <br/> Terms of Service & Privacy Policy
              </p>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
