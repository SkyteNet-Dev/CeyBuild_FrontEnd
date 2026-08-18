"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useSocket } from "@/contexts/SocketContext";
import api from "@/lib/axios";

type Message = {
  id: string;
  chatId: string;
  senderId: string;
  content: string;
  isRead: boolean;
  createdAt: string;
  sender: { id: string; fullName: string; profileImage?: string };
};

type Chat = {
  id: string;
  bookingId: string;
  customerId: string;
  workerId: string;
  customer: { id: string; fullName: string; profileImage?: string };
  worker: { id: string; fullName: string; profileImage?: string };
  booking: { id: string; category: { name: string }; status: string };
  messages: Message[];
  updatedAt: string;
};

export function useChat(chatId: string | null, userId: string | null) {
  const { socket } = useSocket();
  const [messages, setMessages] = useState<Message[]>([]);
  const [chat, setChat] = useState<Chat | null>(null);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!chatId || !userId) return;

    setLoading(true);
    setMessages([]);
    setPage(1);
    setHasMore(true);

    const fetchChat = async () => {
      try {
        const res = await api.get(`/chat/booking/${chatId}`);
        setChat(res.data);
      } catch (error) {
        console.error("Failed to fetch chat:", error);
        try {
          const chatsRes = await api.get("/chat/user");
          const found = chatsRes.data.find((c: Chat) => c.id === chatId);
          if (found) setChat(found);
        } catch (fallbackError) {
          console.error("Failed to fetch chat from user chats:", fallbackError);
        }
      }
    };

    const fetchMessages = async () => {
      try {
        const res = await api.get(`/chat/${chatId}/messages?page=1&limit=50`);
        setMessages(res.data.messages);
        setHasMore(res.data.page < res.data.totalPages);
      } catch {
      } finally {
        setLoading(false);
      }
    };

    fetchChat();
    fetchMessages();

    if (socket) {
      socket.emit("joinChat", { chatId });
      return () => {
        socket.emit("leaveChat", { chatId });
      };
    }
  }, [chatId, userId, socket]);

  useEffect(() => {
    if (!socket || !chatId) return;

    const handleNewMessage = (data: { chatId: string; message: Message }) => {
      if (data.chatId === chatId) {
        setMessages((prev) => {
          if (prev.find((m) => m.id === data.message.id)) return prev;
          return [...prev, data.message];
        });
      }
    };

    socket.on("newMessage", handleNewMessage);
    return () => {
      socket.off("newMessage", handleNewMessage);
    };
  }, [socket, chatId]);

  const loadMore = useCallback(async () => {
    if (!chatId || !hasMore || loading) return;
    const nextPage = page + 1;
    try {
      const res = await api.get(`/chat/${chatId}/messages?page=${nextPage}&limit=50`);
      setMessages((prev) => [...res.data.messages, ...prev]);
      setPage(nextPage);
      setHasMore(res.data.page < res.data.totalPages);
    } catch (error) {
      console.error("Failed to load more messages:", error);
    }
  }, [chatId, page, hasMore, loading]);

  const sendMessage = useCallback(async (content: string) => {
    if (!chatId || !content.trim()) return;
    setSending(true);
    try {
      await api.post(`/chat/${chatId}/messages`, { content: content.trim() });
      } catch (error) {
        console.error("Failed to fetch messages:", error);
      } finally {
        setLoading(false);
      }
  }, [chatId]);

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  return {
    messages,
    chat,
    loading,
    sending,
    hasMore,
    loadMore,
    sendMessage,
    scrollToBottom,
    messagesEndRef,
  };
}

export function useUserChats(userId: string | null) {
  const { socket } = useSocket();
  const [chats, setChats] = useState<Chat[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userId) return;

    const fetchChats = async () => {
      try {
        const res = await api.get("/chat/user");
        setChats(res.data);
      } catch (error) {
        console.error("Failed to fetch user chats:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchChats();
  }, [userId]);

  useEffect(() => {
    if (!socket) return;

    const handleChatCreated = (chat: Chat) => {
      setChats((prev) => {
        if (prev.find((c) => c.id === chat.id)) return prev;
        return [chat, ...prev];
      });
    };

    const handleNewMessage = (data: { chatId: string; message: Message }) => {
      setChats((prev) =>
        prev.map((c) =>
          c.id === data.chatId
            ? { ...c, messages: [data.message], updatedAt: data.message.createdAt }
            : c
        ).sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
      );
    };

    socket.on("chatCreated", handleChatCreated);
    socket.on("newMessage", handleNewMessage);
    return () => {
      socket.off("chatCreated", handleChatCreated);
      socket.off("newMessage", handleNewMessage);
    };
  }, [socket]);

  return { chats, loading };
}
