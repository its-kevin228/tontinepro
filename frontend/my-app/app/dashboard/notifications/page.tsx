"use client";

import { useEffect, useState } from "react";
import { fetchApi } from "@/lib/api";
import {
  Bell,
  BellOff,
  CheckCheck,
  Loader2,
  RefreshCw,
} from "lucide-react";

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
    } catch (err: any) {
      console.error(err);
    }
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
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-4xl font-black text-[#272343] tracking-tight flex items-center gap-3">
            <Bell className="h-8 w-8 text-[#ffd803]" />
            Notifications
            {unreadCount > 0 && (
              <span className="text-sm font-black bg-[#f25f4c] text-white px-2.5 py-1 rounded-full">
                {unreadCount}
              </span>
            )}
          </h1>
          <p className="text-[#2d334a]/60 font-medium mt-1">
            Vos alertes et messages système.
          </p>
        </div>

        <div className="flex items-center gap-3">
          {unreadCount > 0 && (
            <button
              onClick={handleMarkAllAsRead}
              disabled={markingAll}
              className="flex items-center gap-2 px-5 py-3 bg-[#272343] text-[#ffd803] rounded-xl font-black text-sm hover:bg-[#1a1730] transition-all disabled:opacity-50"
            >
              {markingAll ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <CheckCheck className="h-4 w-4" />
              )}
              Tout marquer lu
            </button>
          )}
          <button
            onClick={fetchNotifications}
            disabled={loading}
            className="flex items-center gap-2 px-5 py-3 bg-[#f8fafc] border border-[#dfe5f2] rounded-xl font-bold text-sm text-[#272343] hover:bg-[#e3f6f5] transition-all disabled:opacity-50"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
            Actualiser
          </button>
        </div>
      </div>

      {error && (
        <div className="p-4 bg-[#f25f4c]/10 border border-[#f25f4c]/20 text-[#f25f4c] rounded-2xl font-bold text-sm">
          {error}
        </div>
      )}

      {/* Liste */}
      {loading ? (
        <div className="space-y-3">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="card-base h-20 animate-pulse bg-[#f8fafc] border-[#f0f0f0]" />
          ))}
        </div>
      ) : notifications.length === 0 ? (
        <div className="card-base text-center py-24">
          <BellOff className="h-12 w-12 text-[#2d334a]/20 mx-auto mb-4" />
          <p className="font-black text-[#272343] text-lg">Aucune notification</p>
          <p className="text-[#2d334a]/60 font-medium mt-1">
            Vous êtes à jour. Revenez plus tard.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {notifications.map((notif) => (
            <div
              key={notif.id}
              onClick={() => !notif.read && handleMarkAsRead(notif.id)}
              className={`card-base flex items-start gap-4 transition-all cursor-pointer ${
                notif.read
                  ? "opacity-60 hover:opacity-80"
                  : "border-l-4 border-l-[#ffd803] hover:border-[#ffd803]"
              }`}
            >
              {/* Indicateur non lu */}
              <div className="shrink-0 mt-1">
                {notif.read ? (
                  <div className="w-3 h-3 rounded-full bg-[#dfe5f2]" />
                ) : (
                  <div className="w-3 h-3 rounded-full bg-[#ffd803] shadow-[0_0_6px_rgba(255,216,3,0.6)]" />
                )}
              </div>

              {/* Contenu */}
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-4">
                  <p className={`font-black text-[#272343] ${notif.read ? "" : "text-[#272343]"}`}>
                    {notif.title}
                  </p>
                  <span className="text-[10px] font-bold text-[#2d334a]/40 uppercase tracking-widest shrink-0">
                    {formatDate(notif.createdAt)}
                  </span>
                </div>
                <p className="text-sm text-[#2d334a]/60 font-medium mt-1 leading-relaxed">
                  {notif.body}
                </p>
              </div>

              {/* Action marquer lu */}
              {!notif.read && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleMarkAsRead(notif.id);
                  }}
                  className="shrink-0 p-2 bg-[#f8fafc] border border-[#dfe5f2] rounded-xl hover:bg-[#e3f6f5] transition-all"
                  title="Marquer comme lu"
                >
                  <CheckCheck className="h-4 w-4 text-[#272343]" />
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
