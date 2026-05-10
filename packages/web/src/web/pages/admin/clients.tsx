import { useEffect, useState } from "react";
import { api } from "../../lib/api-client";
import { formatDate } from "../../lib/utils";
import { Users, Loader2, Package, Mail, RefreshCw } from "lucide-react";

type Client = {
  id: string;
  name: string | null;
  email: string;
  createdAt: string;
  packageCount: number;
  role: string | null;
};

export default function AdminClients() {
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await (api.admin as any).clients.$get();
      if (!res.ok) throw new Error();
      const data = await res.json();
      setClients(data.clients ?? []);
    } catch {
      setError("Failed to load clients");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Clients</h1>
          <p className="text-sm text-gray-500 mt-0.5">{clients.length} registered clients</p>
        </div>
        <button
          onClick={load}
          className="flex items-center gap-2 px-3 py-2 text-sm border border-gray-200 bg-white rounded-lg hover:bg-gray-50 transition-colors"
        >
          <RefreshCw size={14} className={loading ? "animate-spin" : ""} /> Refresh
        </button>
      </div>

      {error && (
        <div className="mb-4 p-3 rounded-lg bg-red-50 text-red-700 text-sm">{error}</div>
      )}

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="animate-spin text-blue-600" size={28} />
        </div>
      ) : clients.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-200 py-20 text-center">
          <Users size={40} className="mx-auto text-gray-300 mb-3" />
          <p className="text-gray-500">No clients yet</p>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  {["Client", "Email", "Joined", "Packages"].map((h) => (
                    <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {clients.map((c) => (
                  <tr key={c.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-400 to-indigo-600 flex items-center justify-center text-white text-xs font-bold shrink-0">
                          {(c.name ?? c.email)[0].toUpperCase()}
                        </div>
                        <span className="font-medium text-gray-900">{c.name ?? "—"}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1.5 text-gray-600">
                        <Mail size={13} className="text-gray-400" />
                        {c.email}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-gray-500 text-xs">{formatDate(c.createdAt)}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1.5">
                        <Package size={13} className="text-blue-500" />
                        <span className="font-semibold text-gray-900">{c.packageCount}</span>
                      </div>
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
