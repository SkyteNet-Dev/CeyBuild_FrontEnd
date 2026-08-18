"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  HiOutlineHome,
  HiOutlineCalendar,
  HiOutlineUser,
  HiOutlineBell,
  HiOutlineCog,
  HiOutlineLogout,
  HiOutlineBriefcase,
  HiOutlineCurrencyDollar,
  HiOutlineChartBar,
  HiOutlineStar,
  HiOutlinePhotograph,
  HiOutlineUserGroup,
  HiOutlineClipboardCheck,
  HiOutlineDocumentReport,
  HiOutlineClock,
} from "react-icons/hi";
import { HiOutlineChatBubbleLeftRight } from "react-icons/hi2";
import { auth } from "@/lib/firebase";
import { signOut } from "firebase/auth";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { useAuth } from "@/contexts/AuthContext";
import { useUnreadCount } from "@/hooks/useUnreadCount";
import { useI18n } from "@/i18n/I18nProvider";

type NavLink = {
  name: string;
  href: string;
  icon: React.ReactNode;
  badge?: number;
};

type NavGroup = {
  label?: string;
  links: NavLink[];
};

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { role } = useAuth();
  const unreadCount = useUnreadCount();
  const { t } = useI18n();

  const handleLogout = async () => {
    try {
      await signOut(auth);
      toast.success(t('sidebar.loggedOut'));
      router.push("/");
    } catch (error) {
      toast.error(t('sidebar.logoutError'));
    }
  };

  const getNavGroups = (): NavGroup[] => {
    if (role === "worker") {
      return [
        {
          label: t('sidebar.main'),
          links: [
            { name: t('sidebar.overview'), href: "/dashboard", icon: <HiOutlineHome className="w-5 h-5" /> },
          { name: t('sidebar.myBookings'), href: "/dashboard/bookings", icon: <HiOutlineCalendar className="w-5 h-5" /> },
          { name: t('sidebar.myJobRequests'), href: "/dashboard/job-requests", icon: <HiOutlineClipboardCheck className="w-5 h-5" /> },
          { name: t('sidebar.availability'), href: "/dashboard/availability", icon: <HiOutlineClock className="w-5 h-5" /> },
          ],
        },
        {
          label: t('sidebar.management'),
          links: [
            { name: t('sidebar.reviews'), href: "/dashboard/reviews", icon: <HiOutlineStar className="w-5 h-5" /> },
            { name: t('sidebar.earnings'), href: "/dashboard/earnings", icon: <HiOutlineCurrencyDollar className="w-5 h-5" /> },
            { name: t('sidebar.portfolio'), href: "/dashboard/portfolio", icon: <HiOutlinePhotograph className="w-5 h-5" /> },
          ],
        },
        {
          label: t('sidebar.account'),
          links: [
            { name: t('sidebar.profile'), href: "/dashboard/profile", icon: <HiOutlineUser className="w-5 h-5" /> },
            {
              name: t('sidebar.notifications'),
              href: "/dashboard/notifications",
              icon: <HiOutlineBell className="w-5 h-5" />,
              badge: unreadCount > 0 ? unreadCount : undefined,
            },
            { name: t('sidebar.chat'), href: "/dashboard/chats", icon: <HiOutlineChatBubbleLeftRight className="w-5 h-5" /> },
          ],
        },
      ];
    }

    if (role === "admin") {
      return [
        {
          label: t('sidebar.main'),
          links: [
            { name: t('sidebar.dashboard'), href: "/dashboard", icon: <HiOutlineHome className="w-5 h-5" /> },
          ],
        },
        {
          label: t('sidebar.management'),
          links: [
            { name: t('sidebar.users'), href: "/dashboard/users", icon: <HiOutlineUserGroup className="w-5 h-5" /> },
            { name: t('sidebar.workers'), href: "/dashboard/workers", icon: <HiOutlineBriefcase className="w-5 h-5" /> },
            { name: t('sidebar.bookings'), href: "/dashboard/bookings", icon: <HiOutlineClipboardCheck className="w-5 h-5" /> },
            { name: t('sidebar.analytics'), href: "/dashboard/analytics", icon: <HiOutlineChartBar className="w-5 h-5" /> },
          ],
        },
        {
          label: t('sidebar.system'),
          links: [
            { name: t('sidebar.reports'), href: "/dashboard/reports", icon: <HiOutlineDocumentReport className="w-5 h-5" /> },
            {
              name: t('sidebar.notifications'),
              href: "/dashboard/notifications",
              icon: <HiOutlineBell className="w-5 h-5" />,
              badge: unreadCount > 0 ? unreadCount : undefined,
            },
            { name: t('sidebar.settings'), href: "/dashboard/settings", icon: <HiOutlineCog className="w-5 h-5" /> },
          ],
        },
      ];
    }

    // Customer
    return [
      {
        label: t('sidebar.main'),
        links: [
          { name: t('sidebar.overview'), href: "/dashboard", icon: <HiOutlineHome className="w-5 h-5" /> },
          { name: t('sidebar.myBookings'), href: "/dashboard/bookings", icon: <HiOutlineCalendar className="w-5 h-5" /> },
          { name: t('sidebar.myJobRequests'), href: "/dashboard/job-requests", icon: <HiOutlineClipboardCheck className="w-5 h-5" /> },
        ],
      },
      {
        label: t('sidebar.account'),
        links: [
          { name: t('sidebar.savedWorkers'), href: "/dashboard/saved", icon: <HiOutlineUser className="w-5 h-5" /> },
          { name: t('sidebar.profile'), href: "/dashboard/profile", icon: <HiOutlineUser className="w-5 h-5" /> },
          {
            name: t('sidebar.notifications'),
            href: "/dashboard/notifications",
            icon: <HiOutlineBell className="w-5 h-5" />,
            badge: unreadCount > 0 ? unreadCount : undefined,
          },
          { name: t('sidebar.chat'), href: "/dashboard/chats", icon: <HiOutlineChatBubbleLeftRight className="w-5 h-5" /> },
        ],
      },
    ];
  };

  const groups = getNavGroups();

  return (
    <div className="w-64 bg-white border-r border-gray-100 flex flex-col h-[calc(100vh-80px)] sticky top-20">
      <div className="flex-1 py-6 overflow-y-auto">
        {groups.map((group, groupIdx) => (
          <div key={groupIdx} className={groupIdx > 0 ? "mt-6" : ""}>
            {group.label && (
              <p className="px-7 mb-2 text-[11px] font-semibold uppercase tracking-wider text-gray-400">
                {group.label}
              </p>
            )}
            <nav className="space-y-1 px-4">
              {group.links.map((link) => {
                const isActive =
                  link.href === "/dashboard"
                    ? pathname === "/dashboard"
                    : pathname === link.href || pathname.startsWith(link.href + "/");
                return (
                  <Link
                    key={link.name}
                    href={link.href}
                    className={`flex items-center space-x-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-all ${
                      isActive
                        ? "bg-primary text-white shadow-md shadow-primary/20"
                        : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                    }`}
                  >
                    <span className="relative shrink-0">
                      {link.icon}
                      {link.badge !== undefined && (
                        <span className="absolute -top-1.5 -right-1.5 bg-red-500 text-white text-[9px] font-bold rounded-full min-w-[18px] h-[18px] flex items-center justify-center px-1">
                          {link.badge > 99 ? "99+" : link.badge}
                        </span>
                      )}
                    </span>
                    <span className="flex-1">{link.name}</span>
                    {link.badge !== undefined && link.badge > 0 && (
                      <span className="bg-red-500/10 text-red-600 text-[10px] font-bold px-1.5 py-0.5 rounded-full">
                        {link.badge > 99 ? "99+" : link.badge}
                      </span>
                    )}
                  </Link>
                );
              })}
            </nav>
          </div>
        ))}
      </div>

      <div className="p-4 border-t border-gray-100">
        <button
          onClick={handleLogout}
          className="flex items-center space-x-3 px-4 py-2.5 w-full rounded-xl text-red-600 hover:bg-red-50 transition-all font-medium text-sm"
        >
          <HiOutlineLogout className="w-5 h-5" />
          <span>{t('sidebar.logOut')}</span>
        </button>
      </div>
    </div>
  );
}
