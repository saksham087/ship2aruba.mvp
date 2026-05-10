import { useEffect, useState } from "react";
import { api } from "../../lib/api-client";
import { formatDate } from "../../lib/utils";
import { Loader2, Truck, CheckCircle, Package, RefreshCw } from "lucide-react";

type ShipmentRequest = {
  id: string;
  packageId: string;
  packageTracking: string | null;
  packageTitle: string | null;
  clientName: string | null;
  clientEmail: string | null;
  status: string;
  requestedAt: string;
  shippedAt: string | null;
  notes: string | null;
};

const STATUS_COLORS: Record<string, string> = {
  pending: "bg-yellow-100 text-yellow-800",
  shipped: "bg-green-100 text-green-800",
  cancelled: "bg-red-100 text-red-800",
};

export default function AdminShipmentRequests() {
  const [requests, setRequests] = useState<ShipmentRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState<string | null>(null);
  const [msg, setMsg] = useState("");

  const load = async () => {
    setLoading(true);
    try {
      const res = await (api as any)["shipment-requests"].$get();
      if (!res.ok) throw new Error();
      const data = await res.json();
      setRequests(data.requests ?? []);
    } catch {
      setMsg("Failed to load requests");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const markShipped = async (id: string) => {
    setUpdating(id);
    try {
      const res = await (api as any)["shipment-requests"][":id"].$patch({
        param: { id },
        json: { status: "shipped" },
      });
      if (!res.ok) throw new Error();
      setRequests((prev) =>
        prev.map((r) => (r.id === id ? { ...r, status: "shipped" } : r))
      );
      setMsg("Marked as shipped");
      setTimeout(() => setMsg(""), 3000);
    } catch {
      setMsg("Failed to update");
      setTimeout(() => setMsg(""), 3000);
    } finally {
      setUpdating(null);
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Shipment Requests</h1>
          <p className="text-sm text-gray-500 mt-0.5">Client delivery requests</p>
        </div>
        <button
          onClick={load}
          className="flex items-center gap-2 px-3 py-2 text-sm border border-gray-200 bg-white rounded-lg hover:bg-gray-50 transition-colors"
        >
          <RefreshCw size={14} className={loading ? "animate-spin" : ""} /> Refresh
        </button>
      </div>

      {msg && (
        <div className={`mb-4 p-3 rounded-lg text-sm font-medium ${msg.includes("Failed") ? "bg-red-50 text-red-700" : "bg-green-50 text-green-700"}`}>
          {msg}
        </div>
      )}

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="animate-spin text-blue-600" size={28} />
        </div>
      ) : requests.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-200 py-20 text-center">
          <Truck size={40} className="mx-auto text-gray-300 mb-3" />
          <p className="text-gray-500">No shipment requests yet</p>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  {["Package", "Client", "Requested", "Shipped", "Status", "Action"].map((h) => (
                    <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {requests.map((r) => (
                  <tr key={r.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <Package size={14} className="text-blue-500 shrink-0" />
                        <div>
                          <p className="font-medium text-gray-900 text-xs">{r.packageTitle ?? "—"}</p>
                          <p className="font-mono text-xs text-gray-500">{r.packageTracking ?? ""}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div>
                        <p className="font-medium text-gray-900">{r.clientName ?? "—"}</p>
                        <p className="text-xs text-gray-500">{r.clientEmail ?? ""}</p>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-xs text-gray-500">{formatDate(r.requestedAt)}</td>
                    <td className="px-4 py-3 text-xs text-gray-500">{r.shippedAt ? formatDate(r.shippedAt) : "—"}</td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${STATUS_COLORS[r.status] ?? "bg-gray-100 text-gray-700"}`}>
                        {r.status}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      {r.status === "pending" ? (
                        <button
                          onClick={() => markShipped(r.id)}
                          disabled={updating === r.id}
                          className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-medium transition-colors disabled:opacity-60"
                        >
                          {updating === r.id
                            ? <Loader2 size={11} className="animate-spin" />
                            : <CheckCircle size={11} />}
                          Mark Shipped
                        </button>
                      ) : (
                        <span className="text-xs text-gray-400">—</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
