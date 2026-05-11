"use client";

import { useEffect, useState } from "react";
import { fetchApi } from "@/lib/api";
import { CheckCheck, Loader2, RefreshCw, BellOff } from "lucide-react";

interface Notification {
  id: string;
  title: string;
  body: string;
  read: boolean;
  createdAt: string;
}

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [markingAll, setMarkingAll] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchNotifications = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchApi("/notifications");
      setNotifications(data.notifications);
      setUnreadCount(data.unreadCount);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  const handleMarkAsRead = async (id: string) => {
    try {
      await fetchApi(`/notifications/${id}/read`, { method: "PATCH" });
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, read: true } : n))
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));
    } catch {}
  };

  const handleMarkAllAsRead = async () => {
    setMarkingAll(true);
    try {
      await fetchApi("/notifications/read-all", { method: "PATCH" });
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
      setUnreadCount(0);
    } catch (err: any) {
      alert(err.message);
    } finally {
      setMarkingAll(false);
    }
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);
    if (diffMins < 1) return "À l'instant";
    if (diffMins < 60) return `Il y a ${diffMins} min`;
    if (diffHours < 24) return `Il y a ${diffHours}h`;
    if (diffDays < 7) return `Il y a ${diffDays}j`;
    return date.toLocaleDateString("fr-FR");
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-[#272343] tracking-tight">
            Notifications
            {unreadCount > 0 && (
              <span className="ml-2 text-xs font-black bg-[#272343] text-[#ffd803] px-2 py-0.5 rounded-full align-middle">
                {unreadCount}
              </span>
            )}
          </h1>
          <p className="text-sm text-[#2d334a]/40 font-medium mt-0.5">
            {notifications.length} message{notifications.length !== 1 ? "s" : ""}
          </p>
        </div>

        <div className="flex items-center gap-2">
          {unreadCount > 0 && (
            <button
              onClick={handleMarkAllAsRead}
              disabled={markingAll}
              className="flex items-center gap-1.5 px-4 py-2 text-xs font-black text-[#272343] border border-[#dfe5f2] rounded-xl hover:bg-[#f8fafc] transition-all disabled:opacity-50"
            >
              {markingAll ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : (
                <CheckCheck className="h-3.5 w-3.5" />
              )}
              Tout lire
            </button>
          )}
          <button
            onClick={fetchNotifications}
            disabled={loading}
            className="p-2 text-[#2d334a]/40 hover:text-[#272343] hover:bg-[#f8fafc] rounded-xl transition-all disabled:opacity-50"
            title="Actualiser"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
          </button>
        </div>
      </div>

      {error && (
        <p className="text-sm text-[#f25f4c] font-medium">{error}</p>
      )}

      {/* Liste */}
      {loading ? (
        <div className="space-y-px">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-16 bg-[#f8fafc] animate-pulse rounded-2xl" />
          ))}
        </div>
      ) : notifications.length === 0 ? (
        <div className="text-center py-20">
          <BellOff className="h-8 w-8 text-[#2d334a]/20 mx-auto mb-3" />
          <p className="font-bold text-[#272343]">Aucune notification</p>
          <p className="text-sm text-[#2d334a]/40 font-medium mt-1">Vous êtes à jour.</p>
        </div>
      ) : (
        <div className="divide-y divide-[#dfe5f2]">
          {notifications.map((notif) => (
            <div
              key={notif.id}
              onClick={() => !notif.read && handleMarkAsRead(notif.id)}
              className={`flex items-start gap-4 py-4 transition-all ${
                notif.read
                  ? "cursor-default"
                  : "cursor-pointer hover:bg-[#f8fafc] -mx-3 px-3 rounded-2xl"
              }`}
            >
              {/* Point lu / non lu */}
              <div className="mt-1.5 shrink-0">
                {notif.read ? (
                  <div className="w-2 h-2 rounded-full bg-[#dfe5f2]" />
                ) : (
                  <div className="w-2 h-2 rounded-full bg-[#272343]" />
                )}
              </div>

              {/* Contenu */}
              <div className="flex-1 min-w-0">
                <div className="flex items-baseline justify-between gap-4">
                  <p className={`text-sm font-black text-[#272343] ${notif.read ? "opacity-50" : ""}`}>
                    {notif.title}
                  </p>
                  <span className="text-[10px] text-[#2d334a]/30 font-medium shrink-0">
                    {formatDate(notif.createdAt)}
                  </span>
                </div>
                <p className={`text-sm text-[#2d334a]/60 font-medium mt-0.5 leading-relaxed ${notif.read ? "opacity-50" : ""}`}>
                  {notif.body}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
