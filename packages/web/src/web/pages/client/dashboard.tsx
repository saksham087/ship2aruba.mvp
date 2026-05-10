import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { DashboardLayout } from "../../components/layout";
import { PageHeader } from "../../components/page-header";
import { StatsCard } from "../../components/stats-card";
import { StatusBadge } from "../../components/status-badge";
import { useSession } from "../../hooks/use-session";
import { api } from "../../lib/api";
import { formatDate } from "../../lib/utils";
import {
  Package,
  PackagePlus,
  CheckCircle,
  Truck,
  Clock,
  XCircle,
  ArrowRight,
} from "lucide-react";

export default function ClientDashboard() {
  const { data: session } = useSession();
  const user = session?.user;

  const { data, isLoading } = useQuery({
    queryKey: ["packages"],
    queryFn: async () => {
      const res = await api.packages.$get();
      return res.json();
    },
  });

  const packages = data?.packages ?? [];
  const pending = packages.filter((p: any) => p.status === "pending_review").length;
  const approved = packages.filter((p: any) => p.status === "approved").length;
  const shipped = packages.filter((p: any) => p.status === "shipped").length;
  const rejected = packages.filter((p: any) => p.status === "rejected").length;
  const recent = packages.slice(0, 5);

  return (
    <DashboardLayout>
      <PageHeader
        title={`Welcome back, ${user?.name?.split(" ")[0] || "there"}!`}
        description="Here's an overview of your shipment activity."
        action={
          <Link href="/upload-package">
            <a
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold text-white"
              style={{ background: "#F97316" }}
            >
              <PackagePlus size={16} />
              New Package
            </a>
          </Link>
        }
      />

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatsCard title="Total Packages" value={isLoading ? "—" : packages.length} icon={Package} color="orange" />
        <StatsCard title="Pending Review" value={isLoading ? "—" : pending} icon={Clock} color="amber" />
        <StatsCard title="Approved" value={isLoading ? "—" : approved} icon={CheckCircle} color="green" />
        <StatsCard title="Shipped" value={isLoading ? "—" : shipped} icon={Truck} color="teal" />
      </div>

      {/* Recent packages */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-50">
          <h2 className="font-semibold text-gray-900">Recent Packages</h2>
          <Link href="/packages">
            <a className="text-xs font-medium flex items-center gap-1" style={{ color: "#F97316" }}>
              View all <ArrowRight size={13} />
            </a>
          </Link>
        </div>
        <div className="divide-y divide-gray-50">
          {isLoading ? (
            [...Array(3)].map((_, i) => (
              <div key={i} className="px-6 py-4 animate-pulse">
                <div className="flex items-center gap-4">
                  <div className="w-9 h-9 bg-gray-100 rounded-lg" />
                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-gray-100 rounded w-1/3" />
                    <div className="h-3 bg-gray-100 rounded w-1/4" />
                  </div>
                  <div className="h-6 bg-gray-100 rounded-full w-24" />
                </div>
              </div>
            ))
          ) : recent.length === 0 ? (
            <div className="px-6 py-12 text-center">
              <Package size={36} className="text-gray-200 mx-auto mb-3" />
              <p className="text-sm text-gray-400 font-medium">No packages yet</p>
              <p className="text-xs text-gray-300 mt-1">Upload your first package to get started</p>
              <Link href="/upload-package">
                <a
                  className="inline-flex items-center gap-2 mt-4 px-4 py-2 rounded-lg text-sm font-semibold text-white"
                  style={{ background: "#F97316" }}
                >
                  <PackagePlus size={15} /> Upload Package
                </a>
              </Link>
            </div>
          ) : (
            recent.map((pkg: any) => (
              <Link key={pkg.id} href={`/packages/${pkg.id}`}>
                <a className="flex items-center gap-4 px-6 py-4 hover:bg-gray-50 transition-colors group">
                  <div className="w-9 h-9 rounded-lg flex items-center justify-center bg-orange-50 flex-shrink-0">
                    <Package size={17} className="text-orange-500" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-gray-900 truncate group-hover:text-orange-600 transition-colors">{pkg.title}</p>
                    <p className="text-xs text-gray-400 font-mono">{pkg.trackingNumber}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <StatusBadge status={pkg.status} />
                    <span className="text-xs text-gray-400 hidden sm:block">{formatDate(pkg.createdAt)}</span>
                    <ArrowRight size={14} className="text-gray-300 group-hover:text-orange-400 transition-colors" />
                  </div>
                </a>
              </Link>
            ))
          )}
        </div>
      </div>

      {/* Rejected packages alert */}
      {rejected > 0 && (
        <div className="mt-4 p-4 rounded-xl border border-red-100 bg-red-50 flex items-start gap-3">
          <XCircle size={18} className="text-red-500 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-semibold text-red-700">
              {rejected} package{rejected > 1 ? "s" : ""} rejected
            </p>
            <p className="text-xs text-red-600 mt-0.5">
              Please review and upload corrected invoices.{" "}
              <Link href="/packages">
                <a className="underline font-medium">View packages</a>
              </Link>
            </p>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
