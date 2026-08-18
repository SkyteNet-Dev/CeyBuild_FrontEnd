"use client";

import { useEffect, useState, useCallback } from "react";
import AnimatedSection from "@/components/AnimatedSection";
import api from "@/lib/axios";
import toast from "react-hot-toast";
import { HiOutlineBell, HiOutlineCheck } from "react-icons/hi";
import { useI18n } from "@/i18n/I18nProvider";
import { useSocket } from "@/contexts/SocketContext";

type Notification = {
  id: string;
  title: string;
  body: string;
  isRead: boolean;
  type?: string;
  metadata?: {
    customerName?: string;
    serviceName?: string;
    bookingDate?: string;
    bookingTime?: string;
    location?: string;
    bookingRef?: string;
    status?: string;
  };
  createdAt: string;
};

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const { t } = useI18n();
  const { socket } = useSocket();

  const fetchNotifications = async () => {
    try {
      const res = await api.get("/notifications");
      setNotifications(res.data);
    } catch (error) {
      toast.error(t('notifications.failedToLoad'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  useEffect(() => {
    if (!socket) return;

    const handleNewNotification = (notification: Notification) => {
      setNotifications((prev) => [notification, ...prev]);
    };

    socket.on("notification", handleNewNotification);
    return () => {
      socket.off("notification", handleNewNotification);
    };
  }, [socket]);

  const markAsRead = async (id: string) => {
    try {
      await api.put(`/notifications/${id}/read`);
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, isRead: true } : n))
      );
    } catch (error) {
      toast.error(t('notifications.failedToMarkRead'));
    }
  };

  const markAllAsRead = async () => {
    try {
      const unread = notifications.filter((n) => !n.isRead);
      await Promise.all(unread.map((n) => api.put(`/notifications/${n.id}/read`)));
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
      toast.success(t('notifications.allMarkedRead'));
    } catch (error) {
      toast.error(t('notifications.failedToMarkAll'));
    }
  };

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  if (loading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-4xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight">{t('notifications.title')}</h1>
          <p className="text-gray-500 mt-2">
            {unreadCount > 0 ? `${unreadCount} ${t('notifications.unread')}` : t('notifications.allCaughtUp')}
          </p>
        </div>
        {unreadCount > 0 && (
          <button
            onClick={markAllAsRead}
            className="flex items-center space-x-2 px-4 py-2 text-sm font-medium text-primary hover:bg-primary/5 rounded-xl transition-colors"
          >
            <HiOutlineCheck className="w-4 h-4" />
            <span>{t('notifications.markAllRead')}</span>
          </button>
        )}
      </div>

      {notifications.length === 0 ? (
        <AnimatedSection>
          <div className="bg-white p-12 text-center rounded-3xl border border-gray-100 card-shadow">
            <HiOutlineBell className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">{t('notifications.noNotifications')}</h3>
            <p className="text-gray-500">{t('notifications.noNotificationsDesc')}</p>
          </div>
        </AnimatedSection>
      ) : (
        <div className="space-y-4">
          {notifications.map((notification, idx) => (
            <AnimatedSection key={notification.id} delay={idx * 0.05}>
              <div
                className={`p-5 rounded-2xl border transition-all ${
                  notification.isRead
                    ? "bg-white border-gray-100"
                    : "bg-primary/5 border-primary/20"
                }`}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start space-x-4">
                    <div
                      className={`p-2 rounded-full shrink-0 ${
                        notification.isRead ? "bg-gray-100" : "bg-primary/10"
                      }`}
                    >
                      <HiOutlineBell
                        className={`w-5 h-5 ${
                          notification.isRead ? "text-gray-400" : "text-primary"
                        }`}
                      />
                    </div>
                    <div>
                      <h4 className={`font-semibold ${notification.isRead ? "text-gray-700" : "text-gray-900"}`}>
                        {notification.title}
                      </h4>
                      <p className="text-sm text-gray-500 mt-1">{notification.body}</p>
                      {notification.metadata && (
                        <div className="mt-2 text-xs text-gray-400 space-y-0.5">
                          {notification.metadata.customerName && (
                            <p>{t('notifications.customer')}: {notification.metadata.customerName}</p>
                          )}
                          {notification.metadata.serviceName && (
                            <p>{t('notifications.service')}: {notification.metadata.serviceName}</p>
                          )}
                          {notification.metadata.bookingDate && (
                            <p>{t('notifications.date')}: {new Date(notification.metadata.bookingDate).toLocaleDateString()}</p>
                          )}
                          {notification.metadata.bookingTime && (
                            <p>{t('notifications.time')}: {notification.metadata.bookingTime}</p>
                          )}
                          {notification.metadata.location && (
                            <p>{t('notifications.location')}: {notification.metadata.location}</p>
                          )}
                          {notification.metadata.bookingRef && (
                            <p>{t('notifications.ref')}: #{notification.metadata.bookingRef}</p>
                          )}
                        </div>
                      )}
                      <p className="text-xs text-gray-400 mt-2">
                        {new Date(notification.createdAt).toLocaleString()}
                      </p>
                    </div>
                  </div>
                  {!notification.isRead && (
                    <button
                      onClick={() => markAsRead(notification.id)}
                      className="text-xs text-primary hover:text-primary/80 font-medium whitespace-nowrap"
                    >
                      {t('notifications.markRead')}
                    </button>
                  )}
                </div>
              </div>
            </AnimatedSection>
          ))}
        </div>
      )}
    </div>
  );
}
