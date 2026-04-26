import { useState } from "react";
import { useStore, type UserProfile } from "@/store/useStore";
import { useNavigate } from "react-router-dom";
import { User, MapPin, ArrowRight, Zap, ChevronLeft, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { motion } from "framer-motion";
import { api } from "@/lib/api";

export default function Auth() {
  const [step, setStep] = useState<"phone" | "otp" | "profile">("phone");
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [name, setName] = useState("");
  const [address, setAddress] = useState("");
  const [loading, setLoading] = useState(false);
  
  const loginUser = useStore((s) => s.loginUser);
  const navigate = useNavigate();

  const handlePhoneSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (phone.length < 10) {
      toast.error("Please enter a valid phone number");
      return;
    }
    
    setLoading(true);
    try {
      const data = await api.post('/auth/send-otp', { phone });
      toast.success(`OTP sent to ${phone} (Demo: ${data.otp})`);
      setStep("otp");
    } catch (err: any) {
      toast.error(err.message || "Failed to send OTP");
    } finally {
      setLoading(false);
    }
  };

  const handleOtpSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (otp.length < 4) {
      toast.error("Please enter 4-digit OTP");
      return;
    }

    setLoading(true);
    try {
      const data = await api.post('/auth/verify-otp', { phone, otp });
      if (data.exists) {
        loginUser(data.user, data.token);
        toast.success(`Welcome back, ${data.user.name}!`);
        navigate(-1);
      } else {
        setStep("profile");
      }
    } catch (err: any) {
      toast.error(err.message || "Invalid OTP");
    } finally {
      setLoading(false);
    }
  };

  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !address) {
      toast.error("Please fill all details");
      return;
    }

    setLoading(true);
    try {
      const data = await api.post('/auth/register', { name, phone, address });
      loginUser(data.user, data.token);
      toast.success(`Welcome, ${name}!`);
      navigate(-1);
    } catch (err: any) {
      toast.error(err.message || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-card flex flex-col">
      {/* Simple Header */}
      <div className="p-4 md:p-8">
        <button 
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition font-bold"
        >
          <ChevronLeft className="h-5 w-5" />
          Back
        </button>
      </div>

      <div className="flex-1 flex items-center justify-center p-4">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-md space-y-8"
        >
          <div className="text-center">
            <div className="inline-grid h-20 w-20 place-items-center rounded-3xl bg-primary text-primary-foreground shadow-pop mb-6">
              <Zap className="h-10 w-10 fill-current" />
            </div>
            <h1 className="font-display text-4xl font-black tracking-tight">
              {step === "phone" ? "Welcome to Ziply" : step === "otp" ? "Verify OTP" : "Complete Profile"}
            </h1>
            <p className="text-muted-foreground mt-3 text-lg">
              {step === "phone" 
                ? "Enter your phone number to continue" 
                : step === "otp"
                ? `Enter the 4-digit code sent to +91 ${phone}`
                : "Just a few more details to get started"}
            </p>
          </div>

          <div className="bg-muted/30 rounded-[2.5rem] border border-border p-8 md:p-10">
            {step === "phone" ? (
              <form onSubmit={handlePhoneSubmit} className="space-y-6">
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase text-muted-foreground px-1 tracking-widest">Phone Number</label>
                  <div className="relative">
                    <span className="absolute left-5 top-1/2 -translate-y-1/2 font-display text-xl font-bold text-muted-foreground">+91</span>
                    <input
                      autoFocus
                      required
                      disabled={loading}
                      type="tel"
                      maxLength={10}
                      value={phone}
                      onChange={(e) => setPhone(e.target.value.replace(/\D/g, ""))}
                      className="w-full rounded-2xl border border-border bg-card pl-16 pr-5 py-5 font-display text-xl font-bold outline-none focus:ring-4 focus:ring-primary/10 transition-all disabled:opacity-50"
                      placeholder="98765 43210"
                    />
                  </div>
                </div>
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full group flex items-center justify-center gap-3 rounded-2xl bg-primary py-5 font-display text-lg font-black text-primary-foreground shadow-pop transition hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50"
                >
                  {loading ? <Loader2 className="h-6 w-6 animate-spin" /> : "Send OTP"}
                  {!loading && <ArrowRight className="h-6 w-6 transition-transform group-hover:translate-x-1" />}
                </button>
              </form>
            ) : step === "otp" ? (
              <form onSubmit={handleOtpSubmit} className="space-y-6">
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase text-muted-foreground px-1 tracking-widest">Verification Code</label>
                  <div className="relative">
                    <input
                      autoFocus
                      required
                      disabled={loading}
                      type="text"
                      maxLength={4}
                      value={otp}
                      onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
                      className="w-full rounded-2xl border border-border bg-card px-5 py-5 text-center font-display text-3xl font-black tracking-[1em] outline-none focus:ring-4 focus:ring-primary/10 transition-all disabled:opacity-50"
                      placeholder="0000"
                    />
                  </div>
                </div>
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full group flex items-center justify-center gap-3 rounded-2xl bg-primary py-5 font-display text-lg font-black text-primary-foreground shadow-pop transition hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50"
                >
                  {loading ? <Loader2 className="h-6 w-6 animate-spin" /> : "Verify & Continue"}
                  {!loading && <ArrowRight className="h-6 w-6 transition-transform group-hover:translate-x-1" />}
                </button>
                <button 
                  type="button" 
                  onClick={() => setStep("phone")}
                  disabled={loading}
                  className="w-full text-sm font-bold text-muted-foreground hover:text-foreground transition disabled:opacity-50"
                >
                  Change phone number
                </button>
              </form>
            ) : (
              <form onSubmit={handleProfileSubmit} className="space-y-6">
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase text-muted-foreground px-1 tracking-widest">Full Name</label>
                  <div className="relative">
                    <User className="absolute left-5 top-1/2 -translate-y-1/2 h-6 w-6 text-muted-foreground" />
                    <input
                      autoFocus
                      required
                      disabled={loading}
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full rounded-2xl border border-border bg-card pl-14 pr-5 py-5 font-display text-lg font-bold outline-none focus:ring-4 focus:ring-primary/10 transition-all disabled:opacity-50"
                      placeholder="John Doe"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase text-muted-foreground px-1 tracking-widest">Delivery Address</label>
                  <div className="relative">
                    <MapPin className="absolute left-5 top-1/2 -translate-y-1/2 h-6 w-6 text-muted-foreground" />
                    <input
                      required
                      disabled={loading}
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                      className="w-full rounded-2xl border border-border bg-card pl-14 pr-5 py-5 font-display text-lg font-bold outline-none focus:ring-4 focus:ring-primary/10 transition-all disabled:opacity-50"
                      placeholder="Flat, Floor, Building Name"
                    />
                  </div>
                </div>
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full group flex items-center justify-center gap-3 rounded-2xl bg-primary py-5 font-display text-lg font-black text-primary-foreground shadow-pop transition hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50"
                >
                  {loading ? <Loader2 className="h-6 w-6 animate-spin" /> : "Start Shopping"}
                  {!loading && <ArrowRight className="h-6 w-6 transition-transform group-hover:translate-x-1" />}
                </button>
                <button 
                  type="button" 
                  onClick={() => setStep("phone")}
                  disabled={loading}
                  className="w-full text-sm font-bold text-muted-foreground hover:text-foreground transition disabled:opacity-50"
                >
                  Change phone number
                </button>
              </form>
            )}
          </div>

          <p className="text-center text-xs text-muted-foreground leading-relaxed uppercase tracking-widest font-bold opacity-60">
            By continuing, you agree to our <br/> Terms of Service & Privacy Policy
          </p>
        </motion.div>
      </div>
    </div>
  );
}
