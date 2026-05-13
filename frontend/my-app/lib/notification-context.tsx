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
import { useAuth } from "./auth-context";

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
  const { user } = useAuth();
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
    toastTimerRef.current = setTimeout(() => setToast(null), 5000);
  }, []);

  // Se connecte/déconnecte selon l'utilisateur connecté
  useEffect(() => {
    // Fermer toute connexion existante
    if (esRef.current) {
      esRef.current.close();
      esRef.current = null;
    }

    // Réinitialiser le compteur quand l'utilisateur change
    setUnreadCount(0);
    setToast(null);

    // Ne pas se connecter si pas d'utilisateur connecté
    if (!user) return;

    const token = localStorage.getItem("token");
    if (!token) return;

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
          if (data.notification) {
            showToast({
              id: data.notification.id,
              title: data.notification.title,
              body: data.notification.body,
            });
          }
        }
      } catch {
        // Ignorer les heartbeats et messages malformés
      }
    };

    es.onerror = () => {
      // EventSource se reconnecte automatiquement
    };

    return () => {
      es.close();
      if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
    };
  // Se reconnecte à chaque changement d'utilisateur (login/logout)
  }, [user?.id, showToast]);

  return (
    <NotificationContext.Provider value={{ unreadCount, toast, dismissToast, resetUnread }}>
      {children}
    </NotificationContext.Provider>
  );
}

export function useNotifications() {
  return useContext(NotificationContext);
}
