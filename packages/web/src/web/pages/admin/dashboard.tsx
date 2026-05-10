import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { DashboardLayout } from "../../components/layout";
import { PageHeader } from "../../components/page-header";
import { StatsCard } from "../../components/stats-card";
import { StatusBadge } from "../../components/status-badge";
import { api } from "../../lib/api";
import { formatDate } from "../../lib/utils";
import {
  Package, Users, Clock, CheckCircle, XCircle, Truck,
  Send, ArrowRight, Activity
} from "lucide-react";
import type { PackageStatus } from "../../lib/utils";

export default function AdminDashboard() {
  const { data: statsData, isLoading: statsLoading } = useQuery({
    queryKey: ["admin-stats"],
    queryFn: async () => {
      const res = await (api.admin as any).stats.$get();
      return res.json();
    },
  });

  const { data: packagesData, isLoading: pkgsLoading } = useQuery({
    queryKey: ["packages"],
    queryFn: async () => {
      const res = await api.packages.$get();
      return res.json();
    },
  });

  const stats = statsData?.stats;
  const recentPkgs = (packagesData?.packages ?? []).slice(0, 6);

  return (
    <DashboardLayout>
      <PageHeader
        title="Admin Dashboard"
        description="Overview of all shipment activity across all clients"
        action={
          <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-green-50 border border-green-100">
            <Activity size={14} className="text-green-600" />
            <span className="text-xs font-semibold text-green-700">All systems operational</span>
          </div>
        }
      />

      {/* Stats grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
        <StatsCard title="Total Packages" value={statsLoading ? "—" : stats?.totalPackages ?? 0} icon={Package} color="orange" />
        <StatsCard title="Pending Review" value={statsLoading ? "—" : stats?.pendingReview ?? 0} icon={Clock} color="amber" description="Awaiting admin review" />
        <StatsCard title="Total Clients" value={statsLoading ? "—" : stats?.totalClients ?? 0} icon={Users} color="blue" />
        <StatsCard title="Shipped" value={statsLoading ? "—" : stats?.shipped ?? 0} icon={Truck} color="teal" />
      </div>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatsCard title="Approved" value={statsLoading ? "—" : stats?.approved ?? 0} icon={CheckCircle} color="green" />
        <StatsCard title="Rejected" value={statsLoading ? "—" : stats?.rejected ?? 0} icon={XCircle} color="red" />
        <StatsCard title="Shipment Requested" value={statsLoading ? "—" : stats?.shipmentRequested ?? 0} icon={Send} color="purple" />
        <StatsCard title="Pending Shipments" value={statsLoading ? "—" : stats?.pendingShipments ?? 0} icon={Truck} color="orange" description="Awaiting dispatch" />
      </div>

      {/* Recent packages */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-50">
          <h2 className="font-semibold text-gray-900">Recent Packages</h2>
          <Link href="/admin/packages">
            <a className="text-xs font-medium flex items-center gap-1" style={{ color: "#F97316" }}>
              View all <ArrowRight size={13} />
            </a>
          </Link>
        </div>
        <div className="table-container overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-50">
                <th className="text-left px-6 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wide">Package</th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wide">Client</th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wide">Status</th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wide">Date</th>
                <th className="px-6 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {pkgsLoading ? (
                [...Array(4)].map((_, i) => (
                  <tr key={i} className="animate-pulse">
                    <td className="px-6 py-4"><div className="h-4 bg-gray-100 rounded w-32" /></td>
                    <td className="px-6 py-4"><div className="h-4 bg-gray-100 rounded w-24" /></td>
                    <td className="px-6 py-4"><div className="h-6 bg-gray-100 rounded-full w-28" /></td>
                    <td className="px-6 py-4"><div className="h-4 bg-gray-100 rounded w-20" /></td>
                    <td className="px-6 py-4" />
                  </tr>
                ))
              ) : recentPkgs.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-gray-400 text-sm">No packages yet</td>
                </tr>
              ) : (
                recentPkgs.map((pkg: any) => (
                  <tr key={pkg.id} className="hover:bg-gray-50/70 transition-colors group">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-orange-50 rounded-lg flex items-center justify-center flex-shrink-0">
                          <Package size={14} className="text-orange-500" />
                        </div>
                        <div>
                          <p className="font-medium text-gray-900 group-hover:text-orange-600 transition-colors">{pkg.title}</p>
                          <p className="text-xs font-mono text-gray-400">{pkg.trackingNumber}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-sm text-gray-700">{pkg.userName}</p>
                      <p className="text-xs text-gray-400">{pkg.userEmail}</p>
                    </td>
                    <td className="px-6 py-4"><StatusBadge status={pkg.status as PackageStatus} /></td>
                    <td className="px-6 py-4 text-gray-500">{formatDate(pkg.createdAt)}</td>
                    <td className="px-6 py-4">
                      <Link href={`/admin/packages/${pkg.id}`}>
                        <a className="flex items-center justify-end gap-1 text-xs text-gray-400 group-hover:text-orange-500 transition-colors">
                          Review <ArrowRight size={13} />
                        </a>
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </DashboardLayout>
  );
}
