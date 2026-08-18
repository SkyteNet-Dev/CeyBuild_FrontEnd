"use client";

import { useState, useEffect } from "react";
import { HiOutlineChatBubbleLeftRight, HiOutlineArchiveBox } from "react-icons/hi2";
import { HiArrowLeft } from "react-icons/hi2";
import Link from "next/link";
import api from "@/lib/axios";
import { useAuth } from "@/contexts/AuthContext";
import { useI18n } from "@/i18n/I18nProvider";

type Chat = {
  id: string;
  bookingId: string;
  isArchived: boolean;
  customer: { id: string; fullName: string; profileImage?: string };
  worker: { id: string; fullName: string; profileImage?: string };
  booking: { id: string; category: { name: string }; status: string };
  messages: { id: string; content: string; createdAt: string; senderId: string }[];
  updatedAt: string;
};

export default function ChatsPage() {
  const [chats, setChats] = useState<Chat[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const { t } = useI18n();

  useEffect(() => {
    fetchChats();
  }, []);

  const fetchChats = async () => {
    try {
      const res = await api.get("/chat/user");
      setChats(res.data);
    } catch (error) {
      console.error("Failed to fetch chats:", error);
    } finally {
      setLoading(false);
    }
  };

  const userId = user?.uid || "";

  const activeChats = chats.filter(c => !c.isArchived);
  const archivedChats = chats.filter(c => c.isArchived);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-lg mx-auto">
        <div className="sticky top-0 z-10 bg-white border-b border-gray-100 px-4 py-3">
          <div className="flex items-center gap-3">
            <Link href="/dashboard" className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
              <HiArrowLeft className="w-5 h-5 text-gray-600" />
            </Link>
            <h1 className="text-lg font-bold text-gray-900">{t('chats.title')}</h1>
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center p-12">
            <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
          </div>
        ) : chats.length === 0 ? (
          <div className="p-12 text-center">
            <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <HiOutlineChatBubbleLeftRight className="w-10 h-10 text-gray-300" />
            </div>
            <p className="text-gray-600 font-medium mb-1">{t('chats.noConversations')}</p>
            <p className="text-sm text-gray-400">{t('chats.noConversationsDesc')}</p>
          </div>
        ) : (
          <div>
            {/* Active Chats */}
            {activeChats.length > 0 && (
              <div className="divide-y divide-gray-100">
                {activeChats.map((chat) => {
                  const otherPerson = chat.customer.id === userId ? chat.worker : chat.customer;
                  const lastMessage = chat.messages[0];

                  return (
                    <Link
                      key={chat.id}
                      href={`/dashboard/chat/${chat.id}`}
                      className="flex items-center gap-3 p-4 hover:bg-gray-50 transition-colors"
                    >
                      <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                        <span className="text-lg font-bold text-primary">
                          {otherPerson.fullName.charAt(0)}
                        </span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-1">
                          <h3 className="font-semibold text-gray-900 truncate">{otherPerson.fullName}</h3>
                          {lastMessage && (
                            <span className="text-xs text-gray-400 shrink-0">
                              {new Date(lastMessage.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-gray-500 truncate">{chat.booking.category.name}</p>
                        {lastMessage && (
                          <p className="text-sm text-gray-400 truncate mt-0.5">{lastMessage.content}</p>
                        )}
                      </div>
                    </Link>
                  );
                })}
              </div>
            )}

            {/* Archived Chats */}
            {archivedChats.length > 0 && (
              <div>
                <div className="px-4 py-3 bg-gray-50 border-y border-gray-100">
                  <div className="flex items-center gap-2">
                    <HiOutlineArchiveBox className="w-4 h-4 text-gray-400" />
                    <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                      {t('chats.archivedChats') || 'Archived Chats'}
                    </span>
                    <span className="text-xs text-gray-400">({archivedChats.length})</span>
                  </div>
                </div>
                <div className="divide-y divide-gray-100">
                  {archivedChats.map((chat) => {
                    const otherPerson = chat.customer.id === userId ? chat.worker : chat.customer;
                    const lastMessage = chat.messages[0];

                    return (
                      <Link
                        key={chat.id}
                        href={`/dashboard/chat/${chat.id}`}
                        className="flex items-center gap-3 p-4 hover:bg-gray-50 transition-colors opacity-60"
                      >
                        <div className="w-12 h-12 rounded-full bg-gray-200 flex items-center justify-center shrink-0">
                          <span className="text-lg font-bold text-gray-500">
                            {otherPerson.fullName.charAt(0)}
                          </span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between mb-1">
                            <div className="flex items-center gap-2">
                              <h3 className="font-semibold text-gray-700 truncate">{otherPerson.fullName}</h3>
                              <HiOutlineArchiveBox className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                            </div>
                            {lastMessage && (
                              <span className="text-xs text-gray-400 shrink-0">
                                {new Date(lastMessage.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                              </span>
                            )}
                          </div>
                          <p className="text-sm text-gray-400 truncate">{chat.booking.category.name}</p>
                          {lastMessage && (
                            <p className="text-sm text-gray-400 truncate mt-0.5">{lastMessage.content}</p>
                          )}
                        </div>
                      </Link>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
