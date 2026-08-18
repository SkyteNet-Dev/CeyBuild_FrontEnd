"use client";

import { use, useEffect, useState, useCallback, useRef } from "react";
import { HiArrowLeft, HiOutlineArchiveBox } from "react-icons/hi2";
import Link from "next/link";
import { io, Socket } from "socket.io-client";
import ChatBubble from "@/components/dashboard/ChatBubble";
import ChatInput from "@/components/dashboard/ChatInput";
import api from "@/lib/axios";
import { useAuth } from "@/contexts/AuthContext";
import { useI18n } from "@/i18n/I18nProvider";
import toast from "react-hot-toast";

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
  isArchived: boolean;
  customer: { id: string; fullName: string; profileImage?: string };
  worker: { id: string; fullName: string; profileImage?: string };
  booking: { id: string; category: { name: string }; status: string };
};

export default function ChatPage({ params }: { params: Promise<{ chatId: string }> }) {
  const { chatId } = use(params);
  const { user } = useAuth();
  const { t } = useI18n();
  const userId = user?.uid || "";

  const [messages, setMessages] = useState<Message[]>([]);
  const [chat, setChat] = useState<Chat | null>(null);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [chatError, setChatError] = useState<string | null>(null);
  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    const socketUrl = process.env.NEXT_PUBLIC_API_URL?.replace("/api", "") || "http://localhost:3001";
    const socket = io(`${socketUrl}/chat`, {
      query: { userId },
      transports: ["websocket", "polling"],
      reconnection: true,
    });

    socket.on("connect", () => {
      socket.emit("joinChat", { chatId });
    });

    socket.on("newMessage", (data: { chatId: string; message: Message }) => {
      if (data.chatId === chatId) {
        setMessages((prev) => {
          const exists = prev.some((m) => m.id === data.message.id);
          if (exists) return prev;
          return [...prev, data.message];
        });
      }
    });

    socketRef.current = socket;

    return () => {
      socket.emit("leaveChat", { chatId });
      socket.disconnect();
    };
  }, [chatId, userId]);

  useEffect(() => {
    const fetchChat = async () => {
      try {
        const chatsRes = await api.get("/chat/user");
        const found = chatsRes.data.find((c: Chat) => c.id === chatId);
        if (found) {
          setChat(found);
        } else {
          try {
            const res = await api.get(`/chat/booking/${chatId}`);
            setChat(res.data);
          } catch (chatErr: any) {
            const msg = chatErr?.response?.data?.message || "Chat is only available after advance payment is completed.";
            setChatError(typeof msg === "string" ? msg : Array.isArray(msg) ? msg[0] : "Access denied");
          }
        }
      } catch (error) {
        console.error("Failed to fetch chat:", error);
      } finally {
        setLoading(false);
      }
    };

    const fetchMessages = async () => {
      try {
        const res = await api.get(`/chat/${chatId}/messages?page=1&limit=50`);
        setMessages(res.data.messages);
        setHasMore(res.data.page < res.data.totalPages);
    } catch (error) {
      console.error("Failed to fetch messages:", error);
    }
  };

  fetchChat();
  fetchMessages();
  }, [chatId]);

  const loadMore = useCallback(async () => {
    if (!hasMore || loading) return;
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

  const handleSend = useCallback(async (content: string) => {
    if (!content.trim()) return;
    setSending(true);
    try {
      await api.post(`/chat/${chatId}/messages`, { content: content.trim() });
    } catch (error) {
      console.error("Failed to send message:", error);
      toast.error("Failed to send message. Please try again.");
    } finally {
      setSending(false);
    }
  }, [chatId]);

  const otherPerson = chat?.customer.id === userId ? chat?.worker : chat?.customer;
  const isArchived = chat?.isArchived || false;

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  if (chatError && !chat) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center space-y-4 max-w-sm px-6">
          <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mx-auto">
            <HiOutlineArchiveBox className="w-8 h-8 text-gray-400" />
          </div>
          <h2 className="text-lg font-semibold text-gray-900">Chat Unavailable</h2>
          <p className="text-sm text-gray-500">{chatError}</p>
          <Link href="/dashboard/chats" className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-xl hover:bg-primary-hover transition-colors text-sm font-medium">
            <HiArrowLeft className="w-4 h-4" />
            Back to Chats
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <div className="sticky top-0 z-10 bg-white border-b border-gray-100 px-4 py-3">
        <div className="flex items-center gap-3">
          <Link href="/dashboard/chats" className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
            <HiArrowLeft className="w-5 h-5 text-gray-600" />
          </Link>
          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
            <span className="text-sm font-bold text-primary">
              {otherPerson?.fullName.charAt(0)}
            </span>
          </div>
          <div className="flex-1">
            <h2 className="font-semibold text-gray-900 text-sm">{otherPerson?.fullName}</h2>
            <p className="text-xs text-gray-400">{chat?.booking.category.name}</p>
          </div>
          {isArchived && (
            <div className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-100 rounded-full">
              <HiOutlineArchiveBox className="w-4 h-4 text-gray-500" />
              <span className="text-xs font-medium text-gray-500">{t('chats.archived') || 'Archived'}</span>
            </div>
          )}
        </div>
      </div>

      {isArchived && (
        <div className="bg-amber-50 border-b border-amber-200 px-4 py-3">
          <p className="text-sm text-amber-700 text-center font-medium">
            {t('chats.archivedDescription') || 'This service is complete. Chat is now read-only. You can view the history but cannot send new messages.'}
          </p>
        </div>
      )}

      <div className="flex-1 overflow-y-auto p-4">
        {hasMore && (
          <button
            onClick={loadMore}
            className="w-full text-center py-2 text-sm text-gray-500 hover:text-primary transition-colors"
          >
            Load older messages
          </button>
        )}

        {messages.map((msg) => (
          <ChatBubble key={msg.id} message={msg} isOwn={msg.senderId === userId} />
        ))}
      </div>

      <div className="sticky bottom-0 bg-white border-t border-gray-100">
        {isArchived ? (
          <div className="px-4 py-3 text-center">
            <p className="text-sm text-gray-400">{t('chats.chatClosed') || 'Chat is closed. This service has been completed.'}</p>
          </div>
        ) : (
          <ChatInput onSend={handleSend} disabled={sending} />
        )}
      </div>
    </div>
  );
}
