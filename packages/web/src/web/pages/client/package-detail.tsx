import { useParams, useLocation } from "wouter";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { DashboardLayout } from "../../components/layout";
import { StatusBadge } from "../../components/status-badge";
import { UploadZone } from "../../components/upload-zone";
import { api } from "../../lib/api";
import { formatDateTime, formatDate, TIMELINE_STEPS, type PackageStatus } from "../../lib/utils";
import { toast } from "sonner";
import {
  Package, FileText, Truck, Clock, CheckCircle2, XCircle,
  ChevronLeft, Loader2, ExternalLink, ArrowRight
} from "lucide-react";

const STEP_ORDER: PackageStatus[] = ["pending_review", "approved", "shipment_requested", "shipped"];

function getStepIndex(status: PackageStatus): number {
  if (status === "rejected") return 1; // show between pending and approved
  return STEP_ORDER.indexOf(status);
}

export default function PackageDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [, navigate] = useLocation();
  const qc = useQueryClient();

  const { data, isLoading, refetch } = useQuery({
    queryKey: ["package", id],
    queryFn: async () => {
      const res = await (api.packages as any)[":id"].$get({ param: { id } });
      return res.json();
    },
  });

  const pkg = data?.package;
  const invoices = data?.invoices ?? [];
  const shipmentRequests = data?.shipmentRequests ?? [];

  const requestShipment = useMutation({
    mutationFn: async () => {
      const res = await (api.packages as any)[":id"]["shipment-request"].$post({
        param: { id },
      });
      if (!res.ok) {
        const err = await res.json() as any;
        throw new Error(err.message);
      }
      return res.json();
    },
    onSuccess: () => {
      toast.success("Shipment requested successfully!");
      qc.invalidateQueries({ queryKey: ["package", id] });
      qc.invalidateQueries({ queryKey: ["packages"] });
    },
    onError: (err: any) => toast.error(err.message || "Failed to request shipment"),
  });

  const uploadInvoice = useMutation({
    mutationFn: async ({ fileUrl, fileName }: { fileUrl: string; fileName: string }) => {
      const res = await (api.packages as any)[":packageId"].invoice.$post({
        param: { packageId: id },
        json: { fileUrl, fileName },
      });
      if (!res.ok) throw new Error("Failed to upload invoice");
      return res.json();
    },
    onSuccess: () => {
      toast.success("Invoice uploaded successfully!");
      refetch();
    },
    onError: () => toast.error("Failed to upload invoice"),
  });

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center py-20">
          <Loader2 size={32} className="animate-spin text-orange-500" />
        </div>
      </DashboardLayout>
    );
  }

  if (!pkg) {
    return (
      <DashboardLayout>
        <div className="text-center py-20">
          <p className="text-gray-400">Package not found</p>
        </div>
      </DashboardLayout>
    );
  }

  const currentStepIdx = getStepIndex(pkg.status as PackageStatus);

  return (
    <DashboardLayout>
      {/* Back */}
      <button onClick={() => navigate("/packages")} className="flex items-center gap-1.5 text-sm text-gray-400 hover:text-gray-600 mb-5 transition-colors">
        <ChevronLeft size={16} /> Back to packages
      </button>

      <div className="flex items-start justify-between mb-6">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <h1 className="text-2xl font-bold text-gray-900">{pkg.title}</h1>
            <StatusBadge status={pkg.status as PackageStatus} />
          </div>
          <p className="text-sm text-gray-400">
            Tracking: <span className="font-mono font-semibold text-gray-600">{pkg.trackingNumber}</span>
            &nbsp;·&nbsp; Submitted {formatDate(pkg.createdAt)}
          </p>
        </div>
        {pkg.status === "approved" && (
          <button
            onClick={() => requestShipment.mutate()}
            disabled={requestShipment.isPending}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold text-white disabled:opacity-70"
            style={{ background: "#F97316" }}
          >
            {requestShipment.isPending ? <Loader2 size={15} className="animate-spin" /> : <Truck size={15} />}
            Request Shipment
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left column */}
        <div className="lg:col-span-2 space-y-6">
          {/* Status Timeline */}
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
            <h3 className="font-semibold text-gray-900 mb-5">Shipment Timeline</h3>
            <div className="relative">
              <div className="absolute left-4 top-4 bottom-4 w-0.5 bg-gray-100" />
              <div className="space-y-6">
                {TIMELINE_STEPS.map((step, i) => {
                  const isCompleted = currentStepIdx > i;
                  const isCurrent = currentStepIdx === i;
                  const isRejected = pkg.status === "rejected" && step.status === "approved";
                  return (
                    <div key={step.status} className="flex items-start gap-4 relative">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 z-10 border-2 ${
                        isRejected ? "border-red-300 bg-red-50" :
                        isCompleted || isCurrent ? "border-orange-400 bg-orange-500" : "border-gray-200 bg-white"
                      }`}>
                        {isRejected ? (
                          <XCircle size={16} className="text-red-500" />
                        ) : isCompleted ? (
                          <CheckCircle2 size={15} className="text-white" />
                        ) : isCurrent ? (
                          <div className="w-2.5 h-2.5 bg-white rounded-full" />
                        ) : (
                          <div className="w-2 h-2 bg-gray-300 rounded-full" />
                        )}
                      </div>
                      <div className="flex-1 pt-1">
                        <p className={`text-sm font-semibold ${isCompleted || isCurrent ? "text-gray-900" : "text-gray-400"}`}>
                          {isRejected ? "Rejected" : step.label}
                        </p>
                        <p className="text-xs text-gray-400 mt-0.5">
                          {isRejected ? `Reason: ${pkg.rejectionReason || "No reason provided"}` : step.description}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Rejection notice */}
          {pkg.status === "rejected" && (
            <div className="bg-red-50 border border-red-100 rounded-xl p-5">
              <div className="flex items-start gap-3">
                <XCircle size={18} className="text-red-500 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold text-red-700 text-sm">Package Rejected</p>
                  <p className="text-sm text-red-600 mt-1">{pkg.rejectionReason || "No reason provided."}</p>
                  <p className="text-xs text-red-500 mt-2">Please upload a corrected invoice below and your package will be re-submitted for review.</p>
                </div>
              </div>
            </div>
          )}

          {/* Upload invoice (if rejected or no invoice) */}
          {(pkg.status === "rejected" || (pkg.status === "pending_review" && invoices.length === 0)) && (
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
              <div className="flex items-center gap-2 mb-4">
                <FileText size={17} className="text-orange-500" />
                <h3 className="font-semibold text-gray-900">
                  {pkg.status === "rejected" ? "Upload Corrected Invoice" : "Upload Invoice"}
                </h3>
              </div>
              <UploadZone
                onUpload={(url, name) => uploadInvoice.mutate({ fileUrl: url, fileName: name })}
                label="Upload Invoice (PDF, JPG, PNG)"
              />
            </div>
          )}

          {/* Invoices */}
          {invoices.length > 0 && (
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
              <div className="flex items-center gap-2 mb-4">
                <FileText size={17} className="text-orange-500" />
                <h3 className="font-semibold text-gray-900">Invoices ({invoices.length})</h3>
              </div>
              <div className="space-y-2">
                {invoices.map((inv: any, i: number) => (
                  <div key={inv.id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg border border-gray-100">
                    <FileText size={16} className="text-gray-400 flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-700 truncate">
                        {inv.fileName || `Invoice ${invoices.length - i}`}
                      </p>
                      <p className="text-xs text-gray-400">{formatDateTime(inv.uploadedAt)}</p>
                    </div>
                    <a href={inv.fileUrl} target="_blank" rel="noreferrer" className="text-gray-400 hover:text-orange-500 transition-colors">
                      <ExternalLink size={15} />
                    </a>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right column */}
        <div className="space-y-4">
          {/* Package details */}
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
            <h3 className="font-semibold text-gray-900 mb-4 text-sm">Package Details</h3>
            <dl className="space-y-3">
              <div>
                <dt className="text-xs text-gray-400 uppercase tracking-wide mb-0.5">Title</dt>
                <dd className="text-sm font-medium text-gray-900">{pkg.title}</dd>
              </div>
              <div>
                <dt className="text-xs text-gray-400 uppercase tracking-wide mb-0.5">Tracking Number</dt>
                <dd className="text-sm font-mono font-semibold text-gray-900">{pkg.trackingNumber}</dd>
              </div>
              <div>
                <dt className="text-xs text-gray-400 uppercase tracking-wide mb-0.5">Status</dt>
                <dd><StatusBadge status={pkg.status as PackageStatus} /></dd>
              </div>
              <div>
                <dt className="text-xs text-gray-400 uppercase tracking-wide mb-0.5">Submitted</dt>
                <dd className="text-sm text-gray-700">{formatDate(pkg.createdAt)}</dd>
              </div>
              <div>
                <dt className="text-xs text-gray-400 uppercase tracking-wide mb-0.5">Last Updated</dt>
                <dd className="text-sm text-gray-700">{formatDate(pkg.updatedAt)}</dd>
              </div>
              {pkg.notes && (
                <div>
                  <dt className="text-xs text-gray-400 uppercase tracking-wide mb-0.5">Notes</dt>
                  <dd className="text-sm text-gray-700">{pkg.notes}</dd>
                </div>
              )}
            </dl>
          </div>

          {/* Shipment requests */}
          {shipmentRequests.length > 0 && (
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
              <div className="flex items-center gap-2 mb-3">
                <Truck size={16} className="text-orange-500" />
                <h3 className="font-semibold text-gray-900 text-sm">Shipment Requests</h3>
              </div>
              {shipmentRequests.map((req: any) => (
                <div key={req.id} className="p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center justify-between mb-1">
                    <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                      req.status === "shipped" ? "bg-teal-100 text-teal-700" :
                      req.status === "pending" ? "bg-amber-100 text-amber-700" : "bg-red-100 text-red-700"
                    }`}>
                      {req.status.charAt(0).toUpperCase() + req.status.slice(1)}
                    </span>
                    <span className="text-xs text-gray-400">{formatDate(req.requestedAt)}</span>
                  </div>
                  {req.shippedAt && (
                    <p className="text-xs text-gray-500 mt-1">Shipped: {formatDate(req.shippedAt)}</p>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
