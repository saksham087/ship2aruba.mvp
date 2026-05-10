import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { DashboardLayout } from "../../components/layout";
import { PageHeader } from "../../components/page-header";
import { StatusBadge } from "../../components/status-badge";
import { api } from "../../lib/api";
import { formatDate } from "../../lib/utils";
import { Package, PackagePlus, Search, ArrowRight, Filter } from "lucide-react";
import type { PackageStatus } from "../../lib/utils";

const ALL_STATUSES: { value: string; label: string }[] = [
  { value: "all", label: "All Status" },
  { value: "pending_review", label: "Pending Review" },
  { value: "approved", label: "Approved" },
  { value: "rejected", label: "Rejected" },
  { value: "shipment_requested", label: "Shipment Requested" },
  { value: "shipped", label: "Shipped" },
];

export default function MyPackagesPage() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const { data, isLoading } = useQuery({
    queryKey: ["packages"],
    queryFn: async () => {
      const res = await api.packages.$get();
      return res.json();
    },
  });

  const packages = data?.packages ?? [];
  const filtered = packages.filter((p: any) => {
    const matchesSearch =
      !search ||
      p.title.toLowerCase().includes(search.toLowerCase()) ||
      p.trackingNumber.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === "all" || p.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <DashboardLayout>
      <PageHeader
        title="My Packages"
        description="Track and manage all your submitted packages"
        action={
          <Link href="/upload-package">
            <a
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold text-white"
              style={{ background: "#F97316" }}
            >
              <PackagePlus size={16} /> New Package
            </a>
          </Link>
        }
      />

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 mb-5">
        <div className="relative flex-1 max-w-xs">
          <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search by title or tracking #"
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
            className="pl-8 pr-8 py-2.5 text-sm border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent bg-white appearance-none cursor-pointer"
          >
            {ALL_STATUSES.map((s) => (
              <option key={s.value} value={s.value}>{s.label}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="table-container overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100">
                <th className="text-left px-6 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wide">Package</th>
                <th className="text-left px-6 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wide">Tracking #</th>
                <th className="text-left px-6 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wide">Status</th>
                <th className="text-left px-6 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wide">Date</th>
                <th className="px-6 py-3.5" />
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {isLoading ? (
                [...Array(4)].map((_, i) => (
                  <tr key={i} className="animate-pulse">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-gray-100 rounded-lg" />
                        <div className="h-4 bg-gray-100 rounded w-32" />
                      </div>
                    </td>
                    <td className="px-6 py-4"><div className="h-4 bg-gray-100 rounded w-28" /></td>
                    <td className="px-6 py-4"><div className="h-6 bg-gray-100 rounded-full w-24" /></td>
                    <td className="px-6 py-4"><div className="h-4 bg-gray-100 rounded w-20" /></td>
                    <td className="px-6 py-4" />
                  </tr>
                ))
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-16 text-center">
                    <Package size={36} className="text-gray-200 mx-auto mb-3" />
                    <p className="text-sm text-gray-400 font-medium">
                      {search || statusFilter !== "all" ? "No packages match your filters" : "No packages yet"}
                    </p>
                  </td>
                </tr>
              ) : (
                filtered.map((pkg: any) => (
                  <tr key={pkg.id} className="hover:bg-gray-50/80 transition-colors group">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-orange-50 flex items-center justify-center flex-shrink-0">
                          <Package size={15} className="text-orange-500" />
                        </div>
                        <span className="font-medium text-gray-900 group-hover:text-orange-600 transition-colors">
                          {pkg.title}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="font-mono text-xs text-gray-500">{pkg.trackingNumber}</span>
                    </td>
                    <td className="px-6 py-4">
                      <StatusBadge status={pkg.status as PackageStatus} />
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-gray-500">{formatDate(pkg.createdAt)}</span>
                    </td>
                    <td className="px-6 py-4">
                      <Link href={`/packages/${pkg.id}`}>
                        <a className="flex items-center justify-end gap-1 text-xs font-medium text-gray-400 group-hover:text-orange-500 transition-colors">
                          View <ArrowRight size={13} />
                        </a>
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        {filtered.length > 0 && (
          <div className="px-6 py-3 border-t border-gray-50">
            <p className="text-xs text-gray-400">{filtered.length} package{filtered.length !== 1 ? "s" : ""}</p>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
