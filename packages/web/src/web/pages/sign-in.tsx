import { useState } from "react";
import { Link, useLocation } from "wouter";
import { saveSession } from "../lib/auth";
import { toast } from "sonner";
import { Truck, Eye, EyeOff, Loader2 } from "lucide-react";

export default function SignInPage() {
  const [, navigate] = useLocation();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      toast.error("Please fill in all fields");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/auth/sign-in/email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (!res.ok || data.error || !data.token) {
        toast.error(data.error?.message || "Invalid credentials");
      } else {
        saveSession(data.token, data.user);
        const role = data.user?.role;
        if (role === "ADMIN") {
          navigate("/admin");
        } else {
          navigate("/dashboard");
        }
      }
    } catch (err) {
      toast.error("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Left side - brand */}
      <div className="hidden lg:flex flex-col w-1/2 relative overflow-hidden" style={{ background: "#0F1117" }}>
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 left-20 w-64 h-64 bg-orange-500 rounded-full blur-3xl" />
          <div className="absolute bottom-20 right-20 w-48 h-48 bg-orange-600 rounded-full blur-3xl" />
        </div>
        <div className="relative flex flex-col h-full p-12">
          <div className="flex items-center gap-3 mb-auto">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: "#F97316" }}>
              <Truck size={20} className="text-white" />
            </div>
            <span className="text-white font-bold text-xl">Ship2Aruba</span>
          </div>
          <div className="flex-1 flex flex-col justify-center">
            <h2 className="text-4xl font-bold text-white leading-tight mb-4">
              Fast, reliable<br />
              <span style={{ color: "#F97316" }}>shipment management</span>
            </h2>
            <p className="text-gray-400 text-lg max-w-sm">
              Track packages, manage invoices, and coordinate shipments from one unified platform.
            </p>
          </div>
          {/* Feature bullets */}
          <div className="space-y-3 mt-auto">
            {["Real-time package tracking", "Secure invoice management", "Role-based access control"].map((f) => (
              <div key={f} className="flex items-center gap-2">
                <div className="w-5 h-5 rounded-full flex items-center justify-center" style={{ background: "rgba(249,115,22,0.2)" }}>
                  <div className="w-2 h-2 rounded-full" style={{ background: "#F97316" }} />
                </div>
                <span className="text-gray-300 text-sm">{f}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right side - form */}
      <div className="flex-1 flex items-center justify-center p-8 bg-white">
        <div className="w-full max-w-sm animate-fade-up">
          {/* Mobile logo */}
          <div className="flex items-center gap-3 mb-8 lg:hidden">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: "#F97316" }}>
              <Truck size={18} className="text-white" />
            </div>
            <span className="font-bold text-xl text-gray-900">Ship2Aruba</span>
          </div>

          <h1 className="text-2xl font-bold text-gray-900 mb-1">Welcome back</h1>
          <p className="text-gray-500 text-sm mb-8">Sign in to your account</p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Email address</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="w-full px-4 py-3 text-sm border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Password</label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full px-4 py-3 text-sm border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all pr-12"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-xl text-sm font-semibold text-white flex items-center justify-center gap-2 transition-all hover:opacity-90 disabled:opacity-70 disabled:cursor-not-allowed"
              style={{ background: "#F97316" }}
            >
              {loading && <Loader2 size={16} className="animate-spin" />}
              {loading ? "Signing in..." : "Sign In"}
            </button>
          </form>

          <p className="text-center text-sm text-gray-500 mt-6">
            Don't have an account?{" "}
            <Link href="/sign-up">
              <a className="font-semibold" style={{ color: "#F97316" }}>Sign up</a>
            </Link>
          </p>

          {/* Demo credentials */}
          <div className="mt-8 p-4 bg-gray-50 rounded-xl border border-gray-100">
            <p className="text-xs font-semibold text-gray-500 mb-2 uppercase tracking-wide">Demo Accounts</p>
            <div className="space-y-1 text-xs text-gray-500">
              <p><span className="font-medium">Admin:</span> admin@ship2aruba.com / admin123</p>
              <p><span className="font-medium">Client:</span> client@ship2aruba.com / client123</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
