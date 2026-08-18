"use client";

import Sidebar from "@/components/dashboard/Sidebar";
import ProtectedRoute from "@/components/ProtectedRoute";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { useI18n } from "@/i18n/I18nProvider";
import {
  HiOutlineHome,
  HiOutlineCalendar,
  HiOutlineUser,
  HiOutlineBriefcase,
  HiOutlineBookmark,
  HiOutlineClock,
} from "react-icons/hi";
import { HiOutlineChatBubbleLeftRight } from "react-icons/hi2";

function MobileNav() {
  const pathname = usePathname();
  const { role } = useAuth();
  const { t } = useI18n();

  const isActive = (href: string) =>
    href === "/dashboard"
      ? pathname === "/dashboard"
      : pathname === href || pathname.startsWith(href + "/");

  const adminItems = [
    { name: t("sidebar.dashboard"), href: "/dashboard", icon: <HiOutlineHome className="w-5 h-5" /> },
    { name: t("sidebar.users"), href: "/dashboard/users", icon: <HiOutlineUser className="w-5 h-5" /> },
    { name: t("sidebar.workers"), href: "/dashboard/workers", icon: <HiOutlineBriefcase className="w-5 h-5" /> },
    { name: t("sidebar.bookings"), href: "/dashboard/bookings", icon: <HiOutlineCalendar className="w-5 h-5" /> },
  ];

  const workerItems = [
    { name: t("sidebar.overview"), href: "/dashboard", icon: <HiOutlineHome className="w-5 h-5" /> },
    { name: t("sidebar.myBookings"), href: "/dashboard/bookings", icon: <HiOutlineCalendar className="w-5 h-5" /> },
    { name: t("sidebar.availability"), href: "/dashboard/availability", icon: <HiOutlineClock className="w-5 h-5" /> },
    { name: t("sidebar.chat"), href: "/dashboard/chats", icon: <HiOutlineChatBubbleLeftRight className="w-5 h-5" /> },
    { name: t("sidebar.profile"), href: "/dashboard/profile", icon: <HiOutlineUser className="w-5 h-5" /> },
  ];

  const customerItems = [
    { name: t("sidebar.overview"), href: "/dashboard", icon: <HiOutlineHome className="w-5 h-5" /> },
    { name: t("sidebar.myBookings"), href: "/dashboard/bookings", icon: <HiOutlineCalendar className="w-5 h-5" /> },
    { name: t("sidebar.savedWorkers"), href: "/dashboard/saved", icon: <HiOutlineBookmark className="w-5 h-5" /> },
    { name: t("sidebar.chat"), href: "/dashboard/chats", icon: <HiOutlineChatBubbleLeftRight className="w-5 h-5" /> },
    { name: t("sidebar.profile"), href: "/dashboard/profile", icon: <HiOutlineUser className="w-5 h-5" /> },
  ];

  const items = role === "admin" ? adminItems : role === "worker" ? workerItems : customerItems;

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 md:hidden z-50 safe-area-bottom">
      <div className="flex justify-around items-center h-16">
        {items.map((item) => {
          const active = isActive(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center justify-center w-full h-full transition-colors ${
                active ? "text-primary" : "text-gray-400"
              }`}
            >
              <span className="relative">
                {item.icon}
                {active && (
                  <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 bg-primary rounded-full" />
                )}
              </span>
              <span className="text-[10px] mt-0.5 font-medium truncate max-w-[60px]">{item.name}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ProtectedRoute>
      <div className="flex flex-col md:flex-row min-h-[calc(100vh-80px)] bg-gray-50">
        <div className="hidden md:block">
          <Sidebar />
        </div>
        <div className="flex-1 p-6 md:p-8 lg:p-10 overflow-y-auto w-full pb-24 md:pb-10">
          <div className="max-w-6xl mx-auto">
            {children}
          </div>
        </div>
      </div>
      <MobileNav />
    </ProtectedRoute>
  );
}
