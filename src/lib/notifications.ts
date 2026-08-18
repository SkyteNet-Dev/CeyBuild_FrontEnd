import { messaging } from "./firebase";
import { getToken, onMessage } from "firebase/messaging";
import api from "./axios";

export async function requestNotificationPermission(): Promise<string | null> {
  if (typeof window === "undefined" || !messaging) return null;

  try {
    const permission = await Notification.requestPermission();
    if (permission !== "granted") return null;

    const token = await getToken(messaging, {
      vapidKey: process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY,
    });

    if (token) {
      await api.put("/users/profile/device-token", { deviceToken: token });
    }

    return token;
  } catch (error) {
    console.warn("Failed to get FCM token:", error);
    return null;
  }
}

export function onForegroundMessage(callback: (payload: any) => void) {
  if (typeof window === "undefined" || !messaging) return () => {};

  return onMessage(messaging, callback);
}
