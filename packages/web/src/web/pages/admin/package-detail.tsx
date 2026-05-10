import { useEffect, useState } from "react";
import { useParams, useLocation } from "wouter";
import { api } from "../../lib/api-client";
import { formatDate } from "../../lib/utils";
import {
  ArrowLeft, Package, CheckCircle, XCircle, Truck,
  FileText, User, Calendar, Loader2, AlertCircle
} from "lucide-react";

type PackageRow = {
  id: string; trackingNumber: string; title: string;
  status: string; notes: string | null; rejectionReason: string | null;
  createdAt: string; updatedAt: string; userId: string;
  userName: string | null; userEmail: string | null;
};

type Invoice = { id: string; fileUrl: string; fileName: string | null; uploadedAt: string };

const STATUS_COLORS: Record<string, string> = {
  pending_review: "bg-yellow-100 text-yellow-800",
  approved: "bg-blue-100 text-blue-800",
  rejected: "bg-red-100 text-red-800",
  shipment_requested: "bg-purple-100 text-purple-800",
  shipped: "bg-green-100 text-green-800",
};

const STATUS_LABELS: Record<string, string> = {
  pending_review: "Pending Review",
  approved: "Approved",
  rejected: "Rejected",
  shipment_requested: "Shipment Requested",
  shipped: "Shipped",
  uploaded: "Uploaded",
};

export default function AdminPackageDetail() {
  const { id } = useParams<{ id: string }>();
  const [, navigate] = useLocation();
  const [pkg, setPkg] = useState<PackageRow | null>(null);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [actionLoading, setActionLoading] = useState(false);
  const [rejectModal, setRejectModal] = useState(false);
  const [rejectReason, setRejectReason] = useState("");
  const [statusMsg, setStatusMsg] = useState("");

  useEffect(() => {
    if (!id) return;
    (async () => {
      try {
        const res = await (api.packages as any)[":id"].$get({ param: { id } });
        if (!res.ok) throw new Error("Not found");
        const data = await res.json();
        setPkg(data.package);
        setInvoices(data.invoices ?? []);
      } catch {
        setError("Package not found");
      } finally {
        setLoading(false);
      }
    })();
  }, [id]);

  const updateStatus = async (status: string, rejectionReason?: string) => {
    if (!id) return;
    setActionLoading(true);
    try {
      const res = await (api.packages as any)[":id"]["status"].$patch({
        param: { id },
        json: { status, rejectionReason },
      });
      if (!res.ok) throw new Error("Failed");
      const data = await res.json();
      setPkg(data.package);
      setStatusMsg(`Status updated to ${STATUS_LABELS[status] ?? status}`);
      setRejectModal(false);
      setTimeout(() => setStatusMsg(""), 3000);
    } catch {
      setStatusMsg("Failed to update status");
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="animate-spin text-blue-600" size={32} />
      </div>
    );
  }

  if (error || !pkg) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-4">
        <AlertCircle size={40} className="text-red-400" />
        <p className="text-gray-600">{error || "Package not found"}</p>
        <button onClick={() => navigate("/admin/packages")} className="text-blue-600 hover:underline flex items-center gap-1">
          <ArrowLeft size={16} /> Back to packages
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <button
          onClick={() => navigate("/admin/packages")}
          className="p-2 hover:bg-white rounded-lg border border-gray-200 transition-colors"
        >
          <ArrowLeft size={18} className="text-gray-600" />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Package Detail</h1>
          <p className="text-sm text-gray-500 font-mono">{pkg.trackingNumber}</p>
        </div>
        <span className={`ml-auto px-3 py-1 rounded-full text-xs font-semibold ${STATUS_COLORS[pkg.status] ?? "bg-gray-100 text-gray-700"}`}>
          {STATUS_LABELS[pkg.status] ?? pkg.status}
        </span>
      </div>

      {statusMsg && (
        <div className={`mb-4 p-3 rounded-lg text-sm font-medium ${statusMsg.includes("Failed") ? "bg-red-50 text-red-700" : "bg-green-50 text-green-700"}`}>
          {statusMsg}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Package Info */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h2 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Package size={16} className="text-blue-600" /> Package Info
          </h2>
          <dl className="space-y-3 text-sm">
            <div className="flex justify-between gap-4">
              <dt className="text-gray-500 shrink-0">Title</dt>
              <dd className="font-medium text-gray-900 text-right">{pkg.title}</dd>
            </div>
            {pkg.notes && (
              <div>
                <dt className="text-gray-500 mb-1">Notes</dt>
                <dd className="text-gray-700 bg-gray-50 p-2 rounded text-xs">{pkg.notes}</dd>
              </div>
            )}
            {pkg.rejectionReason && (
              <div>
                <dt className="text-red-500 mb-1">Rejection Reason</dt>
                <dd className="text-red-700 bg-red-50 p-2 rounded text-xs">{pkg.rejectionReason}</dd>
              </div>
            )}
            <div className="flex justify-between">
              <dt className="text-gray-500 flex items-center gap-1"><Calendar size={12} />Submitted</dt>
              <dd className="font-medium text-gray-900">{formatDate(pkg.createdAt)}</dd>
            </div>
          </dl>
        </div>

        {/* Client Info */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h2 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <User size={16} className="text-purple-600" /> Client
          </h2>
          <dl className="space-y-3 text-sm">
            <div className="flex justify-between">
              <dt className="text-gray-500">Name</dt>
              <dd className="font-medium text-gray-900">{pkg.userName ?? "—"}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-gray-500">Email</dt>
              <dd className="font-medium text-gray-900">{pkg.userEmail ?? "—"}</dd>
            </div>
          </dl>
        </div>

        {/* Invoices */}
        {invoices.length > 0 && (
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h2 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <FileText size={16} className="text-orange-600" /> Invoices ({invoices.length})
            </h2>
            <ul className="space-y-2">
              {invoices.map((inv) => (
                <li key={inv.id}>
                  <a
                    href={inv.fileUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-2 text-blue-600 hover:underline text-sm"
                  >
                    <FileText size={14} />
                    {inv.fileName ?? "Invoice"} — {formatDate(inv.uploadedAt)}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Actions */}
        {pkg.status === "pending_review" && (
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h2 className="font-semibold text-gray-900 mb-4">Review Actions</h2>
            <div className="flex gap-3">
              <button
                onClick={() => updateStatus("approved")}
                disabled={actionLoading}
                className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-green-600 hover:bg-green-700 text-white rounded-lg text-sm font-medium transition-colors disabled:opacity-60"
              >
                {actionLoading ? <Loader2 size={14} className="animate-spin" /> : <CheckCircle size={14} />}
                Approve
              </button>
              <button
                onClick={() => setRejectModal(true)}
                disabled={actionLoading}
                className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm font-medium transition-colors disabled:opacity-60"
              >
                <XCircle size={14} /> Reject
              </button>
            </div>
          </div>
        )}

        {pkg.status === "shipment_requested" && (
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h2 className="font-semibold text-gray-900 mb-4">Shipment Action</h2>
            <button
              onClick={() => updateStatus("shipped")}
              disabled={actionLoading}
              className="w-full flex items-center justify-center gap-2 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors disabled:opacity-60"
            >
              {actionLoading ? <Loader2 size={14} className="animate-spin" /> : <Truck size={14} />}
              Mark as Shipped
            </button>
          </div>
        )}
      </div>

      {/* Reject Modal */}
      {rejectModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 px-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-2xl">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Reject Package</h3>
            <p className="text-sm text-gray-500 mb-4">Provide a reason — it will be sent to the client.</p>
            <textarea
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              placeholder="e.g. Invoice is missing or illegible..."
              rows={3}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-300 resize-none"
            />
            <div className="flex gap-3 mt-4">
              <button
                onClick={() => setRejectModal(false)}
                className="flex-1 py-2 border border-gray-200 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={() => updateStatus("rejected", rejectReason)}
                disabled={actionLoading}
                className="flex-1 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm font-medium disabled:opacity-60 flex items-center justify-center gap-1"
              >
                {actionLoading ? <Loader2 size={13} className="animate-spin" /> : null}
                Confirm Reject
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
