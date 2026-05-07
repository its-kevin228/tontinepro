"use client";

import { useEffect, useState } from "react";
import { notificationApi, type Notification } from "@/lib/api";
import {
  Bell, CheckCircle, AlertCircle, Clock, Loader2,
  CheckCheck, Trash2
} from "lucide-react";

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [markingAll, setMarkingAll] = useState(false);

  useEffect(() => {
    notificationApi.getAll()
      .then((res) => setNotifications(res.notifications))
      .finally(() => setLoading(false));
  }, []);

  const handleMarkRead = async (id: string) => {
    await notificationApi.markRead(id);
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
  };

  const handleMarkAllRead = async () => {
    setMarkingAll(true);
    try {
      await notificationApi.markAllRead();
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    } finally {
      setMarkingAll(false);
    }
  };

  const unreadCount = notifications.filter((n) => !n.read).length;

  const getIcon = (title: string) => {
    if (title.includes("✅") || title.includes("approuvé")) return { icon: CheckCircle, color: "var(--success)" };
    if (title.includes("❌") || title.includes("rejeté"))   return { icon: AlertCircle, color: "var(--error)" };
    if (title.includes("Cycle"))                            return { icon: Clock,       color: "var(--info)" };
    return { icon: Bell, color: "var(--text-secondary)" };
  };

  const timeAgo = (dateStr: string) => {
    const now = new Date();
    const d = new Date(dateStr);
    const diffMin = Math.floor((now.getTime() - d.getTime()) / 60000);
    if (diffMin < 1) return "À l'instant";
    if (diffMin < 60) return `Il y a ${diffMin} min`;
    const diffH = Math.floor(diffMin / 60);
    if (diffH < 24) return `Il y a ${diffH}h`;
    const diffD = Math.floor(diffH / 24);
    if (diffD < 7) return `Il y a ${diffD}j`;
    return d.toLocaleDateString("fr-FR");
  };

  return (
    <div className="p-6 lg:p-8 space-y-6 animate-fade-in">
      {/* En-tête */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="page-title">Notifications</h1>
          <p className="mt-1 text-sm" style={{ color: "var(--text-secondary)" }}>
            {unreadCount > 0
              ? `${unreadCount} non lue${unreadCount > 1 ? "s" : ""}`
              : "Vous êtes à jour ✨"}
          </p>
        </div>
        {unreadCount > 0 && (
          <button
            id="mark-all-read"
            className="btn-secondary text-sm px-4 py-2"
            onClick={handleMarkAllRead}
            disabled={markingAll}
          >
            {markingAll ? (
              <Loader2 size={14} className="animate-spin" />
            ) : (
              <CheckCheck size={14} />
            )}
            Tout marquer comme lu
          </button>
        )}
      </div>

      {/* Liste */}
      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="card animate-pulse">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-full" style={{ background: "var(--surface-alt)" }} />
                <div className="flex-1 space-y-2">
                  <div className="h-4 w-1/3 rounded" style={{ background: "var(--surface-alt)" }} />
                  <div className="h-3 w-2/3 rounded" style={{ background: "var(--surface-alt)" }} />
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : notifications.length === 0 ? (
        <div className="card text-center py-16">
          <Bell size={40} className="mx-auto mb-4 opacity-20" />
          <p className="font-medium" style={{ color: "var(--text-primary)" }}>
            Aucune notification
          </p>
          <p className="text-sm mt-1" style={{ color: "var(--text-secondary)" }}>
            Vos alertes de paiement, cycles et invitations apparaîtront ici
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {notifications.map((notif) => {
            const { icon: Icon, color } = getIcon(notif.title);
            return (
              <button
                key={notif.id}
                onClick={() => !notif.read && handleMarkRead(notif.id)}
                className="card w-full text-left flex items-start gap-4 transition-all"
                style={{
                  background: notif.read ? "var(--surface)" : "var(--surface-alt)",
                  opacity: notif.read ? 0.75 : 1,
                  cursor: notif.read ? "default" : "pointer",
                }}
              >
                {/* Icône */}
                <div
                  className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0"
                  style={{ background: `${color}15` }}
                >
                  <Icon size={18} style={{ color }} />
                </div>

                {/* Contenu */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <p
                      className="text-sm leading-tight"
                      style={{
                        color: "var(--text-primary)",
                        fontWeight: notif.read ? 400 : 600,
                      }}
                    >
                      {notif.title}
                    </p>
                    <span className="text-xs flex-shrink-0" style={{ color: "var(--text-secondary)" }}>
                      {timeAgo(notif.createdAt)}
                    </span>
                  </div>
                  <p
                    className="text-xs mt-1 line-clamp-2"
                    style={{ color: "var(--text-secondary)" }}
                  >
                    {notif.body}
                  </p>
                </div>

                {/* Indicateur non lu */}
                {!notif.read && (
                  <div
                    className="w-2.5 h-2.5 rounded-full flex-shrink-0 mt-1"
                    style={{ background: "var(--accent)" }}
                  />
                )}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
