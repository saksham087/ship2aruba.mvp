import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Link } from "wouter";
import { DashboardLayout } from "../../components/layout";
import { PageHeader } from "../../components/page-header";
import { StatusBadge } from "../../components/status-badge";
import { api } from "../../lib/api";
import { formatDate } from "../../lib/utils";
import { toast } from "sonner";
import {
  Package, CheckCircle, XCircle, FileText, ExternalLink,
  Loader2, ChevronDown, ChevronUp, Clock
} from "lucide-react";
import type { PackageStatus } from "../../lib/utils";

function ReviewCard({ pkg, onApprove, onReject, isUpdating }: {
  pkg: any;
  onApprove: (id: string) => void;
  onReject: (id: string, reason: string) => void;
  isUpdating: boolean;
}) {
  const [expanded, setExpanded] = useState(false);
  const [rejecting, setRejecting] = useState(false);
  const [rejectReason, setRejectReason] = useState("");

  return (
    <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
      <div className="p-5">
        <div className="flex items-start gap-4">
          <div className="w-10 h-10 bg-orange-50 rounded-xl flex items-center justify-center flex-shrink-0">
            <Package size={18} className="text-orange-500" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h3 className="font-semibold text-gray-900 text-sm">{pkg.title}</h3>
                <p className="text-xs text-gray-400 font-mono mt-0.5">{pkg.trackingNumber}</p>
              </div>
              <StatusBadge status={pkg.status as PackageStatus} />
            </div>
            <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
              <span>By: <strong className="text-gray-700">{pkg.userName}</strong></span>
              <span>·</span>
              <span>{formatDate(pkg.createdAt)}</span>
            </div>
            {pkg.notes && (
              <p className="text-xs text-gray-500 mt-2 bg-gray-50 rounded-lg p-2">{pkg.notes}</p>
            )}
          </div>
        </div>

        {/* Toggle invoices */}
        <button
          onClick={() => setExpanded(!expanded)}
          className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-gray-600 mt-3 transition-colors"
        >
          <FileText size={13} />
          View invoices
          {expanded ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
        </button>

        {expanded && (
          <InvoiceList packageId={pkg.id} />
        )}
      </div>

      {/* Actions */}
      {!rejecting ? (
        <div className="px-5 py-3 bg-gray-50 border-t border-gray-100 flex items-center justify-between gap-3">
          <p className="text-xs text-gray-400">Review the invoice before approving or rejecting</p>
          <div className="flex gap-2">
            <button
              onClick={() => setRejecting(true)}
              disabled={isUpdating}
              className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold border border-red-200 text-red-600 hover:bg-red-50 transition-colors disabled:opacity-50"
            >
              <XCircle size={14} /> Reject
            </button>
            <button
              onClick={() => onApprove(pkg.id)}
              disabled={isUpdating}
              className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold text-white disabled:opacity-50"
              style={{ background: "#22C55E" }}
            >
              {isUpdating ? <Loader2 size={13} className="animate-spin" /> : <CheckCircle size={14} />}
              Approve
            </button>
          </div>
        </div>
      ) : (
        <div className="px-5 py-4 bg-red-50 border-t border-red-100">
          <p className="text-xs font-semibold text-red-700 mb-2">Rejection reason</p>
          <textarea
            value={rejectReason}
            onChange={(e) => setRejectReason(e.target.value)}
            placeholder="Explain why this invoice is being rejected..."
            rows={2}
            className="w-full px-3 py-2 text-xs border border-red-200 rounded-lg focus:ring-2 focus:ring-red-400 focus:border-transparent resize-none bg-white"
          />
          <div className="flex gap-2 mt-2">
            <button
              onClick={() => setRejecting(false)}
              className="px-3 py-1.5 rounded-lg text-xs text-gray-600 border border-gray-200 hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              onClick={() => { onReject(pkg.id, rejectReason); setRejecting(false); }}
              disabled={isUpdating}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-white disabled:opacity-50"
              style={{ background: "#EF4444" }}
            >
              {isUpdating ? <Loader2 size={12} className="animate-spin" /> : <XCircle size={12} />}
              Confirm Rejection
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function InvoiceList({ packageId }: { packageId: string }) {
  const { data, isLoading } = useQuery({
    queryKey: ["invoices", packageId],
    queryFn: async () => {
      const res = await (api.packages as any)[":packageId"].invoices.$get({
        param: { packageId },
      });
      return res.json();
    },
  });

  const invoices = data?.invoices ?? [];

  if (isLoading) return <div className="mt-3 text-xs text-gray-400">Loading invoices...</div>;
  if (invoices.length === 0) return <div className="mt-3 p-3 bg-amber-50 rounded-lg text-xs text-amber-700 border border-amber-100">No invoice uploaded yet</div>;

  return (
    <div className="mt-3 space-y-2">
      {invoices.map((inv: any) => (
        <div key={inv.id} className="flex items-center gap-2 p-2.5 bg-gray-50 rounded-lg border border-gray-100">
          <FileText size={13} className="text-gray-400 flex-shrink-0" />
          <span className="text-xs text-gray-600 flex-1 truncate">{inv.fileName || "Invoice"}</span>
          <span className="text-xs text-gray-400">{formatDate(inv.uploadedAt)}</span>
          <a href={inv.fileUrl} target="_blank" rel="noreferrer" className="text-gray-400 hover:text-orange-500">
            <ExternalLink size={12} />
          </a>
        </div>
      ))}
    </div>
  );
}

export default function PendingReviewsPage() {
  const qc = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ["packages"],
    queryFn: async () => {
      const res = await api.packages.$get();
      return res.json();
    },
  });

  const updateStatus = useMutation({
    mutationFn: async ({ id, status, rejectionReason }: { id: string; status: string; rejectionReason?: string }) => {
      const res = await (api.packages as any)[":id"].status.$patch({
        param: { id },
        json: { status, rejectionReason },
      });
      if (!res.ok) throw new Error("Failed to update status");
      return res.json();
    },
    onSuccess: (_, vars) => {
      toast.success(`Package ${vars.status === "approved" ? "approved" : "rejected"} successfully!`);
      qc.invalidateQueries({ queryKey: ["packages"] });
      qc.invalidateQueries({ queryKey: ["admin-stats"] });
    },
    onError: () => toast.error("Failed to update package status"),
  });

  const pending = (data?.packages ?? []).filter((p: any) => p.status === "pending_review");

  return (
    <DashboardLayout>
      <PageHeader
        title="Pending Reviews"
        description={`${pending.length} package${pending.length !== 1 ? "s" : ""} awaiting review`}
      />

      {isLoading ? (
        <div className="grid gap-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="bg-white rounded-xl border border-gray-100 p-5 animate-pulse">
              <div className="flex gap-4">
                <div className="w-10 h-10 bg-gray-100 rounded-xl" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-gray-100 rounded w-1/3" />
                  <div className="h-3 bg-gray-100 rounded w-1/4" />
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : pending.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-16 text-center">
          <div className="w-16 h-16 bg-green-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <CheckCircle size={32} className="text-green-500" />
          </div>
          <p className="text-gray-700 font-semibold">All packages reviewed!</p>
          <p className="text-sm text-gray-400 mt-1">No pending reviews at this time.</p>
        </div>
      ) : (
        <div className="grid gap-4">
          {pending.map((pkg: any) => (
            <ReviewCard
              key={pkg.id}
              pkg={pkg}
              isUpdating={updateStatus.isPending}
              onApprove={(id) => updateStatus.mutate({ id, status: "approved" })}
              onReject={(id, reason) => updateStatus.mutate({ id, status: "rejected", rejectionReason: reason })}
            />
          ))}
        </div>
      )}
    </DashboardLayout>
  );
}
