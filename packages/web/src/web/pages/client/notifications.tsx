import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Link } from "wouter";
import { DashboardLayout } from "../../components/layout";
import { PageHeader } from "../../components/page-header";
import { api } from "../../lib/api";
import { formatTimeAgo } from "../../lib/utils";
import { toast } from "sonner";
import { Bell, CheckCheck, Package, Loader2, Info, CheckCircle, AlertTriangle, XCircle } from "lucide-react";

const TYPE_ICONS = {
  info: { icon: Info, bg: "bg-blue-50", color: "text-blue-500" },
  success: { icon: CheckCircle, bg: "bg-green-50", color: "text-green-500" },
  warning: { icon: AlertTriangle, bg: "bg-amber-50", color: "text-amber-500" },
  error: { icon: XCircle, bg: "bg-red-50", color: "text-red-500" },
};

export default function NotificationsPage() {
  const qc = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ["notifications"],
    queryFn: async () => {
      const res = await api.notifications.$get();
      return res.json();
    },
  });

  const markRead = useMutation({
    mutationFn: async (id: string) => {
      await (api.notifications as any)[":id"].read.$patch({ param: { id } });
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["notifications"] }),
  });

  const markAllRead = useMutation({
    mutationFn: async () => {
      await (api.notifications as any)["read-all"].$patch();
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["notifications"] });
      toast.success("All notifications marked as read");
    },
  });

  const notifications = data?.notifications ?? [];
  const unread = notifications.filter((n: any) => !n.read);

  return (
    <DashboardLayout>
      <PageHeader
        title="Notifications"
        description={unread.length > 0 ? `${unread.length} unread notification${unread.length > 1 ? "s" : ""}` : "All caught up!"}
        action={
          unread.length > 0 ? (
            <button
              onClick={() => markAllRead.mutate()}
              disabled={markAllRead.isPending}
              className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium border border-gray-200 text-gray-600 hover:bg-gray-50 transition-colors"
            >
              {markAllRead.isPending ? <Loader2 size={14} className="animate-spin" /> : <CheckCheck size={15} />}
              Mark all read
            </button>
          ) : undefined
        }
      />

      <div className="max-w-2xl">
        {isLoading ? (
          <div className="space-y-3">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="bg-white rounded-xl p-4 border border-gray-100 animate-pulse">
                <div className="flex gap-3">
                  <div className="w-10 h-10 bg-gray-100 rounded-xl flex-shrink-0" />
                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-gray-100 rounded w-2/3" />
                    <div className="h-3 bg-gray-100 rounded w-full" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : notifications.length === 0 ? (
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-12 text-center">
            <Bell size={40} className="text-gray-200 mx-auto mb-3" />
            <p className="text-sm text-gray-400 font-medium">No notifications yet</p>
            <p className="text-xs text-gray-300 mt-1">You'll be notified about package status updates here</p>
          </div>
        ) : (
          <div className="space-y-2">
            {notifications.map((notif: any) => {
              const typeConfig = TYPE_ICONS[notif.type as keyof typeof TYPE_ICONS] || TYPE_ICONS.info;
              const Icon = typeConfig.icon;
              return (
                <div
                  key={notif.id}
                  className={`bg-white rounded-xl p-4 border transition-all cursor-pointer hover:shadow-md ${
                    notif.read ? "border-gray-100 opacity-70" : "border-orange-100 shadow-sm"
                  }`}
                  onClick={() => !notif.read && markRead.mutate(notif.id)}
                >
                  <div className="flex items-start gap-3">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${typeConfig.bg}`}>
                      <Icon size={18} className={typeConfig.color} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2 mb-0.5">
                        <p className={`text-sm font-semibold ${notif.read ? "text-gray-600" : "text-gray-900"}`}>
                          {notif.title}
                        </p>
                        <div className="flex items-center gap-2 flex-shrink-0">
                          <span className="text-xs text-gray-400">{formatTimeAgo(notif.createdAt)}</span>
                          {!notif.read && (
                            <div className="w-2 h-2 rounded-full" style={{ background: "#F97316" }} />
                          )}
                        </div>
                      </div>
                      <p className="text-xs text-gray-500 leading-relaxed">{notif.message}</p>
                      {notif.packageId && (
                        <Link href={`/packages/${notif.packageId}`}>
                          <a className="inline-flex items-center gap-1 mt-2 text-xs font-medium" style={{ color: "#F97316" }} onClick={(e) => e.stopPropagation()}>
                            <Package size={12} /> View package
                          </a>
                        </Link>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
