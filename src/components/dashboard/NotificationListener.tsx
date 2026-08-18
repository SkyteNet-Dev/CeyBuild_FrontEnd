"use client";

import { useEffect, useRef, useCallback } from "react";
import { useSocket } from "@/contexts/SocketContext";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { HiOutlineBell } from "react-icons/hi";
import { useI18n } from "@/i18n/I18nProvider";

type NotificationPayload = {
  id: string;
  title: string;
  body: string;
  type?: string;
  metadata?: {
    customerName?: string;
    serviceName?: string;
    bookingDate?: string;
    bookingTime?: string;
    location?: string;
    bookingRef?: string;
    status?: string;
    bookingId?: string;
  };
  createdAt: string;
};

let audioContext: AudioContext | null = null;

function playNotificationSound() {
  try {
    if (!audioContext) {
      audioContext = new AudioContext();
    }

    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);

    oscillator.type = "sine";
    oscillator.frequency.setValueAtTime(880, audioContext.currentTime);
    oscillator.frequency.setValueAtTime(660, audioContext.currentTime + 0.1);
    oscillator.frequency.setValueAtTime(880, audioContext.currentTime + 0.2);

    gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);

    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + 0.5);
  } catch (e) {
    console.warn("Could not play notification sound:", e);
  }
}

export default function NotificationListener() {
  const { t } = useI18n();
  const { socket } = useSocket();
  const { user, role } = useAuth();
  const router = useRouter();
  const hasSetup = useRef(false);

  const handleNotification = useCallback((notification: NotificationPayload) => {
    playNotificationSound();

    const meta = notification.metadata;
    let details = "";
    if (meta) {
      if (meta.customerName) details += `${t('notification.customer')}: ${meta.customerName}\n`;
      if (meta.serviceName) details += `${t('notification.service')}: ${meta.serviceName}\n`;
      if (meta.bookingDate) details += `${t('notification.date')}: ${new Date(meta.bookingDate).toLocaleDateString()}\n`;
      if (meta.bookingTime) details += `${t('notification.time')}: ${meta.bookingTime}\n`;
      if (meta.location) details += `${t('notification.location')}: ${meta.location}\n`;
      if (meta.bookingRef) details += `${t('notification.ref')}: #${meta.bookingRef}`;
    }

    const navigateToPage = () => {
      toast.dismiss(toastId);
      if (role === "worker") {
        router.push("/dashboard/jobs");
      } else {
        router.push("/dashboard/bookings");
      }
    };

    const toastId = toast.custom(
      (toastInstance) => (
        <div
          className={`${
            toastInstance.visible ? "animate-enter" : "animate-leave"
          } max-w-sm w-full bg-white shadow-lg rounded-2xl pointer-events-auto ring-1 ring-black ring-opacity-5 overflow-hidden cursor-pointer`}
          onClick={navigateToPage}
        >
          <div className="p-4">
            <div className="flex items-start">
              <div className="flex-shrink-0">
                <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                  <HiOutlineBell className="w-5 h-5 text-primary" />
                </div>
              </div>
              <div className="ml-3 flex-1">
                <p className="text-sm font-semibold text-gray-900">{notification.title}</p>
                <p className="mt-1 text-sm text-gray-600">{notification.body}</p>
                {details && (
                  <p className="mt-2 text-xs text-gray-500 whitespace-pre-line">{details}</p>
                )}
                <p className="mt-1 text-xs text-gray-400">{t('notification.justNow')}</p>
              </div>
            </div>
          </div>
          <div className="bg-gray-50 px-4 py-3 flex justify-between items-center">
            <span className="text-xs text-gray-400">{t('notification.clickToView')}</span>
            <button
              onClick={(e) => { e.stopPropagation(); toast.dismiss(toastInstance.id); }}
              className="text-xs font-medium text-primary hover:text-primary/80"
            >
              {t('notification.dismiss')}
            </button>
          </div>
        </div>
      ),
      { duration: 8000, position: "top-right" }
    );
  }, [role, router]);

  useEffect(() => {
    if (!socket || !user || hasSetup.current) return;

    socket.on("notification", handleNotification);
    hasSetup.current = true;

    return () => {
      socket.off("notification", handleNotification);
      hasSetup.current = false;
    };
  }, [socket, user, handleNotification]);

  return null;
}
