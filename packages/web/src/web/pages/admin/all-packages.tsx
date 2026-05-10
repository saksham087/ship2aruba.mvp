import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Link } from "wouter";
import { DashboardLayout } from "../../components/layout";
import { PageHeader } from "../../components/page-header";
import { StatusBadge } from "../../components/status-badge";
import { api } from "../../lib/api";
import { formatDate } from "../../lib/utils";
import { toast } from "sonner";
import { Package, Search, Filter, ArrowRight, Loader2, CheckCircle, XCircle } from "lucide-react";
import type { PackageStatus } from "../../lib/utils";

const ALL_STATUSES = [
  { value: "all", label: "All Statuses" },
  { value: "pending_review", label: "Pending Review" },
  { value: "approved", label: "Approved" },
  { value: "rejected", label: "Rejected" },
  { value: "shipment_requested", label: "Shipment Requested" },
  { value: "shipped", label: "Shipped" },
];

export default function AdminAllPackagesPage() {
  const qc = useQueryClient();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const { data, isLoading } = useQuery({
    queryKey: ["packages"],
    queryFn: async () => {
      const res = await api.packages.$get();
      return res.json();
    },
  });

  const updateStatus = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      const res = await (api.packages as any)[":id"].status.$patch({
        param: { id },
        json: { status },
      });
      return res.json();
    },
    onSuccess: () => {
      toast.success("Status updated");
      qc.invalidateQueries({ queryKey: ["packages"] });
      qc.invalidateQueries({ queryKey: ["admin-stats"] });
    },
    onError: () => toast.error("Failed to update"),
  });

  const packages = data?.packages ?? [];
  const filtered = packages.filter((p: any) => {
    const s = search.toLowerCase();
    const matchesSearch =
      !s ||
      p.title.toLowerCase().includes(s) ||
      p.trackingNumber.toLowerCase().includes(s) ||
      (p.userName || "").toLowerCase().includes(s) ||
      (p.userEmail || "").toLowerCase().includes(s);
    const matchesStatus = statusFilter === "all" || p.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <DashboardLayout>
      <PageHeader
        title="All Packages"
        description={`${packages.length} total packages across all clients`}
      />

      <div className="flex flex-col sm:flex-row gap-3 mb-5">
        <div className="relative flex-1 max-w-sm">
          <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search packages, clients, tracking..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 text-sm border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent"
          />
        </div>
        <div className="relative">
          <Filter size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="pl-8 pr-8 py-2.5 text-sm border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 bg-white appearance-none cursor-pointer"
          >
            {ALL_STATUSES.map((s) => (
              <option key={s.value} value={s.value}>{s.label}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="table-container overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50/50">
                <th className="text-left px-6 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wide">Package</th>
                <th className="text-left px-6 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wide">Client</th>
                <th className="text-left px-6 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wide">Status</th>
                <th className="text-left px-6 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wide">Submitted</th>
                <th className="text-left px-6 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wide">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {isLoading ? (
                [...Array(5)].map((_, i) => (
                  <tr key={i} className="animate-pulse">
                    <td className="px-6 py-4"><div className="flex gap-3"><div className="w-8 h-8 bg-gray-100 rounded-lg" /><div className="space-y-1.5"><div className="h-4 bg-gray-100 rounded w-32" /><div className="h-3 bg-gray-100 rounded w-24" /></div></div></td>
                    <td className="px-6 py-4"><div className="space-y-1.5"><div className="h-4 bg-gray-100 rounded w-24" /><div className="h-3 bg-gray-100 rounded w-32" /></div></td>
                    <td className="px-6 py-4"><div className="h-6 bg-gray-100 rounded-full w-28" /></td>
                    <td className="px-6 py-4"><div className="h-4 bg-gray-100 rounded w-20" /></td>
                    <td className="px-6 py-4"><div className="h-8 bg-gray-100 rounded-lg w-24" /></td>
                  </tr>
                ))
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-16 text-center">
                    <Package size={36} className="text-gray-200 mx-auto mb-3" />
                    <p className="text-sm text-gray-400">No packages found</p>
                  </td>
                </tr>
              ) : (
                filtered.map((pkg: any) => (
                  <tr key={pkg.id} className="hover:bg-gray-50/80 transition-colors group">
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
                      <p className="text-sm text-gray-700">{pkg.userName || "—"}</p>
                      <p className="text-xs text-gray-400">{pkg.userEmail || "—"}</p>
                    </td>
                    <td className="px-6 py-4"><StatusBadge status={pkg.status as PackageStatus} /></td>
                    <td className="px-6 py-4 text-sm text-gray-500">{formatDate(pkg.createdAt)}</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        {pkg.status === "pending_review" && (
                          <>
                            <button
                              onClick={() => updateStatus.mutate({ id: pkg.id, status: "approved" })}
                              disabled={updateStatus.isPending}
                              title="Approve"
                              className="p-1.5 rounded-lg bg-green-50 text-green-600 hover:bg-green-100 transition-colors"
                            >
                              <CheckCircle size={14} />
                            </button>
                            <button
                              onClick={() => updateStatus.mutate({ id: pkg.id, status: "rejected", ...(undefined) })}
                              disabled={updateStatus.isPending}
                              title="Reject"
                              className="p-1.5 rounded-lg bg-red-50 text-red-600 hover:bg-red-100 transition-colors"
                            >
                              <XCircle size={14} />
                            </button>
                          </>
                        )}
                        <Link href={`/admin/packages/${pkg.id}`}>
                          <a className="flex items-center gap-1 text-xs text-gray-400 group-hover:text-orange-500 transition-colors">
                            Review <ArrowRight size={12} />
                          </a>
                        </Link>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        {filtered.length > 0 && (
          <div className="px-6 py-3 border-t border-gray-50">
            <p className="text-xs text-gray-400">{filtered.length} of {packages.length} packages</p>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
