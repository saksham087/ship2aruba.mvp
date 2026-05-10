import { useState } from "react";
import { useLocation } from "wouter";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { DashboardLayout } from "../../components/layout";
import { PageHeader } from "../../components/page-header";
import { UploadZone } from "../../components/upload-zone";
import { api } from "../../lib/api";
import { toast } from "sonner";
import { Loader2, Package, FileText, CheckCircle2 } from "lucide-react";

export default function UploadPackagePage() {
  const [, navigate] = useLocation();
  const qc = useQueryClient();
  const [title, setTitle] = useState("");
  const [notes, setNotes] = useState("");
  const [invoiceUrl, setInvoiceUrl] = useState("");
  const [invoiceFileName, setInvoiceFileName] = useState("");
  const [step, setStep] = useState<"form" | "success">("form");
  const [createdPkg, setCreatedPkg] = useState<any>(null);

  const createPkg = useMutation({
    mutationFn: async () => {
      const res = await api.packages.$post({ json: { title, notes } });
      if (!res.ok) {
        const err = await res.json() as any;
        throw new Error(err.message || "Failed to create package");
      }
      return res.json();
    },
    onSuccess: async (data) => {
      const pkg = (data as any).package;
      setCreatedPkg(pkg);

      if (invoiceUrl) {
        const invoiceRes = await (api.packages as any)[":packageId"].invoice.$post({
          param: { packageId: pkg.id },
          json: { fileUrl: invoiceUrl, fileName: invoiceFileName },
        });
        if (!invoiceRes.ok) {
          toast.error("Package created but failed to attach invoice");
        }
      }

      qc.invalidateQueries({ queryKey: ["packages"] });
      setStep("success");
      toast.success("Package submitted for review!");
    },
    onError: (err: any) => {
      toast.error(err.message || "Failed to create package");
    },
  });

  if (step === "success" && createdPkg) {
    return (
      <DashboardLayout>
        <div className="max-w-md mx-auto mt-12 text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle2 size={32} className="text-green-500" />
          </div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">Package Submitted!</h2>
          <p className="text-gray-500 text-sm mb-6">
            Your package has been submitted for admin review. You'll receive a notification when it's approved or if any changes are needed.
          </p>
          <div className="bg-gray-50 rounded-xl p-4 mb-6 text-left">
            <div className="flex justify-between text-sm mb-2">
              <span className="text-gray-500">Title</span>
              <span className="font-medium text-gray-900">{createdPkg.title}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Tracking #</span>
              <span className="font-mono font-semibold text-gray-900">{createdPkg.trackingNumber}</span>
            </div>
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => navigate(`/packages/${createdPkg.id}`)}
              className="flex-1 py-2.5 rounded-xl text-sm font-semibold border border-gray-200 text-gray-700 hover:bg-gray-50 transition-colors"
            >
              View Package
            </button>
            <button
              onClick={() => {
                setTitle(""); setNotes(""); setInvoiceUrl(""); setInvoiceFileName(""); setStep("form"); setCreatedPkg(null);
              }}
              className="flex-1 py-2.5 rounded-xl text-sm font-semibold text-white"
              style={{ background: "#F97316" }}
            >
              Upload Another
            </button>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <PageHeader
        title="Upload Package"
        description="Submit package details and invoice for admin review"
      />

      <div className="max-w-xl">
        {/* Steps indicator */}
        <div className="flex items-center gap-0 mb-8">
          {["Package Details", "Upload Invoice", "Review & Submit"].map((s, i) => (
            <div key={s} className="flex items-center flex-1 last:flex-none">
              <div className={`flex items-center gap-2 ${i === 0 ? 'opacity-100' : i === 1 && (invoiceUrl || title) ? 'opacity-100' : 'opacity-40'}`}>
                <div className="w-7 h-7 rounded-full text-xs font-bold flex items-center justify-center text-white" style={{ background: "#F97316" }}>
                  {i + 1}
                </div>
                <span className="text-xs font-medium text-gray-600 hidden sm:block">{s}</span>
              </div>
              {i < 2 && <div className="flex-1 h-px bg-gray-200 mx-2 hidden sm:block" />}
            </div>
          ))}
        </div>

        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
          <div className="space-y-5">
            {/* Package info */}
            <div>
              <div className="flex items-center gap-2 mb-4">
                <Package size={18} className="text-orange-500" />
                <h3 className="font-semibold text-gray-800">Package Information</h3>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Package Title <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="e.g. Electronics, Clothing, Documents"
                    className="w-full px-4 py-3 text-sm border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Notes <span className="text-gray-400 font-normal">(optional)</span>
                  </label>
                  <textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Any special instructions or details about the package..."
                    rows={3}
                    className="w-full px-4 py-3 text-sm border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all resize-none"
                  />
                </div>
              </div>
            </div>

            <hr className="border-gray-100" />

            {/* Invoice upload */}
            <div>
              <div className="flex items-center gap-2 mb-4">
                <FileText size={18} className="text-orange-500" />
                <h3 className="font-semibold text-gray-800">Invoice Upload</h3>
                <span className="text-xs text-gray-400">(optional — can upload later)</span>
              </div>
              <UploadZone
                onUpload={(url, name) => { setInvoiceUrl(url); setInvoiceFileName(name); }}
                label="Upload Invoice (PDF, JPG, PNG)"
              />
            </div>

            <button
              onClick={() => createPkg.mutate()}
              disabled={!title || createPkg.isPending}
              className="w-full py-3 rounded-xl text-sm font-semibold text-white flex items-center justify-center gap-2 transition-all hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
              style={{ background: "#F97316" }}
            >
              {createPkg.isPending && <Loader2 size={16} className="animate-spin" />}
              {createPkg.isPending ? "Submitting..." : "Submit Package for Review"}
            </button>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
