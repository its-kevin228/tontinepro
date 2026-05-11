"use client";

import React, {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
  useCallback,
} from "react";
import { API_BASE_URL } from "./api";

export interface ToastNotification {
  id: string;
  title: string;
  body: string;
}

interface NotificationContextType {
  unreadCount: number;
  toast: ToastNotification | null;
  dismissToast: () => void;
  resetUnread: () => void;
}

const NotificationContext = createContext<NotificationContextType>({
  unreadCount: 0,
  toast: null,
  dismissToast: () => {},
  resetUnread: () => {},
});

export function NotificationProvider({ children }: { children: React.ReactNode }) {
  const [unreadCount, setUnreadCount] = useState(0);
  const [toast, setToast] = useState<ToastNotification | null>(null);
  const esRef = useRef<EventSource | null>(null);
  const toastTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const dismissToast = useCallback(() => {
    setToast(null);
    if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
  }, []);

  const resetUnread = useCallback(() => {
    setUnreadCount(0);
  }, []);

  const showToast = useCallback((notif: ToastNotification) => {
    setToast(notif);
    if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
    // Auto-dismiss après 5 secondes
    toastTimerRef.current = setTimeout(() => setToast(null), 5000);
  }, []);

  const connect = useCallback(() => {
    const token = localStorage.getItem("token");
    if (!token) return;

    // Fermer la connexion précédente si elle existe
    if (esRef.current) {
      esRef.current.close();
    }

    // EventSource ne supporte pas les headers nativement
    // On passe le token en query param (le backend le lira)
    const url = `${API_BASE_URL}/notifications/stream?token=${encodeURIComponent(token)}`;
    const es = new EventSource(url);
    esRef.current = es;

    es.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);

        if (data.type === "init") {
          setUnreadCount(data.unreadCount);
        }

        if (data.type === "new") {
          setUnreadCount(data.unreadCount);
          // Afficher le toast avec la nouvelle notification
          if (data.notification) {
            showToast({
              id: data.notification.id,
              title: data.notification.title,
              body: data.notification.body,
            });
          }
        }
      } catch {
        // Ignorer les messages malformés (heartbeats, etc.)
      }
    };

    es.onerror = () => {
      // EventSource se reconnecte automatiquement — on ne fait rien
    };
  }, [showToast]);

  useEffect(() => {
    connect();

    return () => {
      esRef.current?.close();
      if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
    };
  }, [connect]);

  return (
    <NotificationContext.Provider value={{ unreadCount, toast, dismissToast, resetUnread }}>
      {children}
    </NotificationContext.Provider>
  );
}

export function useNotifications() {
  return useContext(NotificationContext);
}
