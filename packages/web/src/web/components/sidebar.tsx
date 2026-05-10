import { Link, useLocation } from "wouter";
import { cn } from "../lib/utils";
import { useSession } from "../hooks/use-session";
import { clearSession } from "../lib/auth";
import {
  LayoutDashboard,
  Package,
  PackagePlus,
  Bell,
  Users,
  ClipboardList,
  Truck,
  LogOut,
  ChevronRight,
  Boxes,
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { api } from "../lib/api";

const clientNav = [
  { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { label: "Upload Package", href: "/upload-package", icon: PackagePlus },
  { label: "My Packages", href: "/packages", icon: Package },
  { label: "Notifications", href: "/notifications", icon: Bell },
];

const adminNav = [
  { label: "Dashboard", href: "/admin", icon: LayoutDashboard },
  { label: "Pending Reviews", href: "/admin/pending", icon: ClipboardList },
  { label: "All Packages", href: "/admin/packages", icon: Boxes },
  { label: "Shipment Requests", href: "/admin/shipments", icon: Truck },
  { label: "Clients", href: "/admin/clients", icon: Users },
];

export function Sidebar() {
  const { data: session } = useSession();
  const [location] = useLocation();
  const user = session?.user;
  const isAdmin = user?.role === "ADMIN";
  const navItems = isAdmin ? adminNav : clientNav;

  const { data: notifData } = useQuery({
    queryKey: ["notifications"],
    queryFn: async () => {
      const res = await api.notifications.$get();
      return res.json();
    },
    enabled: !!session,
    refetchInterval: 30_000,
  });

  const unreadCount = notifData?.notifications?.filter((n: any) => !n.read).length ?? 0;

  const handleSignOut = async () => {
    clearSession();
    window.location.href = "/sign-in";
  };

  return (
    <aside className="fixed left-0 top-0 h-screen w-60 flex flex-col z-40" style={{ background: "#0F1117", borderRight: "1px solid #1E2130" }}>
      {/* Logo */}
      <div className="flex items-center gap-3 px-6 py-5 border-b" style={{ borderColor: "#1E2130" }}>
        <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: "#F97316" }}>
          <Truck size={16} className="text-white" />
        </div>
        <div>
          <div className="text-white font-bold text-sm leading-tight">Ship2Aruba</div>
          <div className="text-xs" style={{ color: "#6B7280" }}>
            {isAdmin ? "Admin Portal" : "Client Portal"}
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 py-4 px-3 space-y-0.5 overflow-y-auto sidebar-nav">
        <div className="px-3 pb-2">
          <span className="text-xs font-semibold uppercase tracking-wider" style={{ color: "#4B5563" }}>
            {isAdmin ? "Administration" : "My Account"}
          </span>
        </div>
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = location === item.href || (item.href !== "/" && location.startsWith(item.href));
          return (
            <Link key={item.href} href={item.href}>
              <a
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all relative group",
                  isActive
                    ? "text-white"
                    : "text-gray-400 hover:text-white hover:bg-white/5"
                )}
                style={isActive ? { background: "rgba(249,115,22,0.15)", color: "#FFFFFF" } : {}}
              >
                {isActive && (
                  <span
                    className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-5 rounded-full"
                    style={{ background: "#F97316" }}
                  />
                )}
                <Icon
                  size={17}
                  className={cn(isActive ? "" : "text-gray-500 group-hover:text-gray-300")}
                  style={isActive ? { color: "#F97316" } : {}}
                />
                <span className="flex-1">{item.label}</span>
                {item.label === "Notifications" && unreadCount > 0 && (
                  <span className="flex items-center justify-center w-5 h-5 text-xs font-semibold text-white rounded-full" style={{ background: "#F97316" }}>
                    {unreadCount > 9 ? "9+" : unreadCount}
                  </span>
                )}
                {isActive && <ChevronRight size={14} className="text-gray-500" />}
              </a>
            </Link>
          );
        })}
      </nav>

      {/* User */}
      <div className="p-3 border-t" style={{ borderColor: "#1E2130" }}>
        <div className="flex items-center gap-3 px-3 py-2 rounded-lg" style={{ background: "#1A1D2E" }}>
          <div
            className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0"
            style={{ background: "#F97316" }}
          >
            {user?.name?.charAt(0)?.toUpperCase() || "U"}
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-sm font-medium text-white truncate">{user?.name || "User"}</div>
            <div className="text-xs truncate" style={{ color: "#6B7280" }}>{user?.email}</div>
          </div>
          <button
            onClick={handleSignOut}
            className="text-gray-500 hover:text-red-400 transition-colors"
            title="Sign out"
          >
            <LogOut size={15} />
          </button>
        </div>
      </div>
    </aside>
  );
}
