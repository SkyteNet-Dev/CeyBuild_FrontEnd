"use client";

import { useState, useEffect, useCallback } from "react";
import { useSocket } from "@/contexts/SocketContext";
import { useAuth } from "@/contexts/AuthContext";
import api from "@/lib/axios";

export function useUnreadCount() {
  const { socket } = useSocket();
  const { user } = useAuth();
  const [unreadCount, setUnreadCount] = useState(0);

  const fetchUnread = useCallback(async () => {
    if (!user) return;
    try {
      const res = await api.get("/notifications");
      const count = res.data.filter((n: any) => !n.isRead).length;
      setUnreadCount(count);
    } catch (e) {
      console.warn("Failed to fetch unread count");
    }
  }, [user]);

  useEffect(() => {
    fetchUnread();
  }, [fetchUnread]);

  useEffect(() => {
    if (!socket) return;

    const handleNotification = () => {
      setUnreadCount((prev) => prev + 1);
    };

    socket.on("notification", handleNotification);
    return () => {
      socket.off("notification", handleNotification);
    };
  }, [socket]);

  return unreadCount;
}
