import { useState } from "react";
import { Link, useLocation } from "wouter";
import { saveSession } from "../lib/auth";
import { toast } from "sonner";
import { Truck, Eye, EyeOff, Loader2 } from "lucide-react";

export default function SignUpPage() {
  const [, navigate] = useLocation();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email || !password) {
      toast.error("Please fill in all fields");
      return;
    }
    if (password.length < 8) {
      toast.error("Password must be at least 8 characters");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/auth/sign-up/email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ name, email, password, role: "CLIENT" }),
      });
      const data = await res.json();
      if (!res.ok || data.error) {
        toast.error(data.error?.message || "Failed to create account");
      } else {
        // Sign in immediately after sign-up to get a session token
        const signInRes = await fetch("/api/auth/sign-in/email", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({ email, password }),
        });
        const signInData = await signInRes.json();
        if (signInData.token) {
          saveSession(signInData.token, signInData.user);
        }
        toast.success("Account created! Welcome to Ship2Aruba.");
        navigate("/dashboard");
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
              Start shipping<br />
              <span style={{ color: "#F97316" }}>with confidence</span>
            </h2>
            <p className="text-gray-400 text-lg max-w-sm">
              Join hundreds of customers who trust Ship2Aruba for reliable package delivery.
            </p>
          </div>
        </div>
      </div>

      {/* Right side - form */}
      <div className="flex-1 flex items-center justify-center p-8 bg-white">
        <div className="w-full max-w-sm animate-fade-up">
          <div className="flex items-center gap-3 mb-8 lg:hidden">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: "#F97316" }}>
              <Truck size={18} className="text-white" />
            </div>
            <span className="font-bold text-xl text-gray-900">Ship2Aruba</span>
          </div>

          <h1 className="text-2xl font-bold text-gray-900 mb-1">Create account</h1>
          <p className="text-gray-500 text-sm mb-8">Start managing your shipments today</p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Full name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="John Doe"
                className="w-full px-4 py-3 text-sm border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all"
                required
              />
            </div>
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
                  placeholder="Min. 8 characters"
                  className="w-full px-4 py-3 text-sm border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all pr-12"
                  required
                  minLength={8}
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
              {loading ? "Creating account..." : "Create Account"}
            </button>
          </form>

          <p className="text-center text-sm text-gray-500 mt-6">
            Already have an account?{" "}
            <Link href="/sign-in">
              <a className="font-semibold" style={{ color: "#F97316" }}>Sign in</a>
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
