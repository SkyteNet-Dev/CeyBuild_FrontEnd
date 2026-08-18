"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  HiOutlineCalendar,
  HiOutlineCheckCircle,
  HiOutlineClock,
  HiOutlineBell,
  HiOutlineBriefcase,
  HiOutlineCurrencyDollar,
  HiOutlineSearch,
  HiOutlineDocumentAdd,
  HiOutlineBookmarkAlt,
  HiOutlineClipboardList,
  HiOutlineLocationMarker,
} from "react-icons/hi";
import api from "@/lib/axios";
import { useAuth } from "@/contexts/AuthContext";
import toast from "react-hot-toast";
import { useI18n } from "@/i18n/I18nProvider";
import { useSocket } from "@/contexts/SocketContext";
import { StatCard } from "@/components/ui/StatCard";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { EmptyState } from "@/components/ui/EmptyState";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";

type Booking = {
  id: string;
  status: string;
  preferredDate: string;
  category: { name: string };
  worker?: { user: { fullName: string } };
  customer?: { fullName: string };
  location: string;
  estimatedPrice?: number;
};

type UserProfile = {
  fullName: string;
  email: string;
};

type Notification = {
  id: string;
  title: string;
  body: string;
  createdAt: string;
};

export default function DashboardOverview() {
  const { user, role } = useAuth();
  const { t } = useI18n();
  const { socket } = useSocket();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;

    const fetchDashboardData = async () => {
      try {
        const [profileRes, bookingsRes, notifRes] = await Promise.all([
          api.get("/users/profile"),
          api.get("/bookings"),
          api.get("/notifications"),
        ]);

        setProfile(profileRes.data);
        setBookings(bookingsRes.data);
        setNotifications(notifRes.data.slice(0, 5));
      } catch {
        toast.error(t("dashboard.failedToLoad"));
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [user, t]);

  useEffect(() => {
    if (!socket) return;

    const handleNewNotification = (notification: Notification) => {
      setNotifications((prev) => [notification, ...prev].slice(0, 5));
    };

    socket.on("notification", handleNewNotification);
    return () => {
      socket.off("notification", handleNewNotification);
    };
  }, [socket]);

  const isWorker = role === "worker";

  const bookingStats = useMemo(() => {
    const pending = bookings.filter((b) => b.status === "PENDING");
    const active = bookings.filter(
      (b) => b.status === "ACCEPTED" || b.status === "IN_PROGRESS"
    );
    const completed = bookings.filter((b) => b.status === "COMPLETED");

    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();

    const currentMonthCompleted = completed.filter((b) => {
      const d = new Date(b.preferredDate);
      return d.getMonth() === currentMonth && d.getFullYear() === currentYear;
    });

    const lastMonthCompleted = completed.filter((b) => {
      const d = new Date(b.preferredDate);
      const lastMonth = currentMonth === 0 ? 11 : currentMonth - 1;
      const lastYear = currentMonth === 0 ? currentYear - 1 : currentYear;
      return d.getMonth() === lastMonth && d.getFullYear() === lastYear;
    });

    const currentMonthlyEarnings = currentMonthCompleted.reduce(
      (acc, b) => acc + Number(b.estimatedPrice || 0),
      0
    );
    const lastMonthlyEarnings = lastMonthCompleted.reduce(
      (acc, b) => acc + Number(b.estimatedPrice || 0),
      0
    );

    const totalSpent = completed.reduce(
      (acc, b) => acc + Number(b.estimatedPrice || 0),
      0
    );

    const earningsTrend =
      lastMonthlyEarnings > 0
        ? {
            value: Math.round(
              ((currentMonthlyEarnings - lastMonthlyEarnings) /
                lastMonthlyEarnings) *
                100
            ),
            isPositive: currentMonthlyEarnings >= lastMonthlyEarnings,
          }
        : currentMonthlyEarnings > 0
          ? { value: 100, isPositive: true }
          : undefined;

    const completionRate =
      bookings.length > 0
        ? Math.round((completed.length / bookings.length) * 100)
        : 0;

    const last3Months = [0, 1, 2].map((offset) => {
      const d = new Date();
      d.setMonth(d.getMonth() - offset);
      const monthBookings = completed.filter((b) => {
        const bd = new Date(b.preferredDate);
        return (
          bd.getMonth() === d.getMonth() && bd.getFullYear() === d.getFullYear()
        );
      });
      return {
        month: d.toLocaleString("default", { month: "short" }),
        total: monthBookings.reduce(
          (acc, b) => acc + Number(b.estimatedPrice || 0),
          0
        ),
      };
    });

    return {
      pending,
      active,
      completed,
      currentMonthlyEarnings,
      totalSpent,
      completionRate,
      earningsTrend,
      last3Months,
    };
  }, [bookings]);

  if (loading) {
    return <LoadingSpinner size="lg" />;
  }

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return t("dashboard.goodMorning") || "Good morning";
    if (hour < 17) return t("dashboard.goodAfternoon") || "Good afternoon";
    return t("dashboard.goodEvening") || "Good evening";
  };

  const workerStats = [
    {
      title: t("dashboard.stats.newRequests") || "New Requests",
      value: bookingStats.pending.length,
      icon: <HiOutlineBell className="w-7 h-7 text-blue-600" />,
      bg: "bg-blue-50",
    },
    {
      title: t("dashboard.stats.activeJobs") || "Active Jobs",
      value: bookingStats.active.length,
      icon: <HiOutlineBriefcase className="w-7 h-7 text-orange-500" />,
      bg: "bg-orange-50",
    },
    {
      title: t("dashboard.stats.monthlyEarnings") || "Monthly Earnings",
      value: `LKR ${Number(bookingStats.currentMonthlyEarnings).toLocaleString("en-LK", { minimumFractionDigits: 2 })}`,
      icon: <HiOutlineCurrencyDollar className="w-7 h-7 text-green-600" />,
      trend: bookingStats.earningsTrend,
      bg: "bg-green-50",
    },
    {
      title: t("dashboard.completionRate") || "Completion Rate",
      value: `${bookingStats.completionRate}%`,
      icon: <HiOutlineCheckCircle className="w-7 h-7 text-teal-600" />,
      subtitle: `${bookingStats.completed.length}/${bookings.length} ${t("dashboard.thisMonth") || "jobs"}`,
      bg: "bg-teal-50",
    },
  ];

  const customerStats = [
    {
      title: t("dashboard.stats.activeBookings") || "Active Bookings",
      value: bookingStats.active.length,
      icon: <HiOutlineCalendar className="w-7 h-7 text-blue-600" />,
      bg: "bg-blue-50",
    },
    {
      title: t("dashboard.stats.completedJobs") || "Completed Jobs",
      value: bookingStats.completed.length,
      icon: <HiOutlineCheckCircle className="w-7 h-7 text-green-600" />,
      bg: "bg-green-50",
    },
    {
      title: t("dashboard.totalSpent") || "Total Spent",
      value: `LKR ${Number(bookingStats.totalSpent).toLocaleString("en-LK", { minimumFractionDigits: 2 })}`,
      icon: <HiOutlineCurrencyDollar className="w-7 h-7 text-amber-500" />,
      subtitle: `${t("dashboard.thisMonth") || "lifetime"}`,
      bg: "bg-amber-50",
    },
    {
      title: t("dashboard.stats.pendingRequests") || "Pending Requests",
      value: bookingStats.pending.length,
      icon: <HiOutlineClock className="w-7 h-7 text-orange-500" />,
      bg: "bg-orange-50",
    },
  ];

  const stats = isWorker ? workerStats : customerStats;

  const workerQuickActions = [
    {
      label: t("dashboard.viewEarnings") || "View Earnings",
      href: "/dashboard/earnings",
      icon: <HiOutlineCurrencyDollar className="w-5 h-5" />,
    },
    {
      label: t("dashboard.availability") || "My Availability",
      href: "/dashboard/availability",
      icon: <HiOutlineCalendar className="w-5 h-5" />,
    },
    {
      label: t("dashboard.portfolio") || "Portfolio",
      href: "/dashboard/portfolio",
      icon: <HiOutlineBookmarkAlt className="w-5 h-5" />,
    },
    {
      label: t("sidebar.myJobRequests") || "Job Requests",
      href: "/dashboard/job-requests",
      icon: <HiOutlineClipboardList className="w-5 h-5" />,
    },
  ];

  const customerQuickActions = [
    {
      label: t("dashboard.postNewJob") || "Post a Job",
      href: "/dashboard/job-requests/new",
      icon: <HiOutlineDocumentAdd className="w-5 h-5" />,
    },
    {
      label: t("dashboard.findWorkers") || "Find Workers",
      href: "/search",
      icon: <HiOutlineSearch className="w-5 h-5" />,
    },
    {
      label: t("sidebar.savedWorkers") || "Saved Workers",
      href: "/dashboard/saved",
      icon: <HiOutlineBookmarkAlt className="w-5 h-5" />,
    },
    {
      label: t("sidebar.myBookings") || "My Bookings",
      href: "/dashboard/bookings",
      icon: <HiOutlineClipboardList className="w-5 h-5" />,
    },
  ];

  const quickActions = isWorker ? workerQuickActions : customerQuickActions;

  const upcomingBookings = isWorker
    ? bookings
        .filter((b) => b.status === "ACCEPTED" || b.status === "IN_PROGRESS")
        .sort(
          (a, b) =>
            new Date(a.preferredDate).getTime() -
            new Date(b.preferredDate).getTime()
        )
        .slice(0, 5)
    : [];

  const pendingBookings = bookingStats.pending.slice(0, 5);

  const recentBookings = [...bookings]
    .sort(
      (a, b) =>
        new Date(b.preferredDate).getTime() -
        new Date(a.preferredDate).getTime()
    )
    .slice(0, 6);

  const maxEarnings = Math.max(
    ...bookingStats.last3Months.map((m) => m.total),
    1
  );

  return (
    <div className="space-y-8">
      {/* Welcome Banner */}
      <div className="relative overflow-hidden bg-gradient-to-br from-primary via-primary-hover to-primary rounded-3xl p-8 md:p-10 text-white">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3" />
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/5 rounded-full blur-3xl translate-y-1/2 -translate-x-1/3" />

        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div>
            <p className="text-white/70 text-sm font-medium mb-1">
              {getGreeting()}
            </p>
            <h1 className="text-3xl md:text-4xl font-bold mb-2">
              {profile?.fullName || "User"}
            </h1>
            <p className="text-white/80 text-lg">
              {isWorker
                ? t("dashboard.workerOverview") ||
                  "Here's what's happening with your work today."
                : t("dashboard.customerOverview") ||
                  "Here's an overview of your bookings and activity."}
            </p>
          </div>
          <div className="hidden md:flex items-center gap-3">
            {isWorker ? (
              <Link
                href="/dashboard/bookings"
                className="px-6 py-3 bg-white text-primary font-semibold rounded-full hover:bg-gray-50 transition-colors shadow-lg"
              >
                {t("dashboard.viewJobs") || "View Jobs"}
              </Link>
            ) : (
              <Link
                href="/dashboard/job-requests/new"
                className="px-6 py-3 bg-white text-primary font-semibold rounded-full hover:bg-gray-50 transition-colors shadow-lg"
              >
                {t("dashboard.postJob") || "Post a Job"}
              </Link>
            )}
          </div>
        </div>
      </div>

      {/* Stats Grid - 4 columns */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, idx) => (
          <StatCard key={idx} {...stat} />
        ))}
      </div>

      {/* Quick Actions */}
      <div>
        <h2 className="text-lg font-bold text-gray-900 mb-4">
          {t("dashboard.quickActions") || "Quick Actions"}
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {quickActions.map((action, idx) => (
            <Link
              key={idx}
              href={action.href}
              className="flex items-center gap-3 p-4 bg-white border border-gray-100 rounded-2xl hover:border-primary/30 hover:bg-primary/5 transition-all group"
            >
              <div className="p-2 bg-primary/10 rounded-xl text-primary group-hover:bg-primary group-hover:text-white transition-colors">
                {action.icon}
              </div>
              <span className="text-sm font-semibold text-gray-700 group-hover:text-primary transition-colors">
                {action.label}
              </span>
            </Link>
          ))}
        </div>
      </div>

      {/* Worker Performance Summary */}
      {isWorker && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-white p-5 rounded-2xl border border-gray-100 card-shadow">
            <p className="text-xs font-medium text-gray-500 mb-1">
              Total Completed
            </p>
            <p className="text-2xl font-bold text-gray-900">
              {bookingStats.completed.length}
            </p>
          </div>
          <div className="bg-white p-5 rounded-2xl border border-gray-100 card-shadow">
            <p className="text-xs font-medium text-gray-500 mb-1">
              {t("dashboard.avgRating") || "Avg Rating"}
            </p>
            <p className="text-2xl font-bold text-gray-900">--</p>
          </div>
          <div className="bg-white p-5 rounded-2xl border border-gray-100 card-shadow">
            <p className="text-xs font-medium text-gray-500 mb-1">
              {t("dashboard.thisMonth") || "This Month"}
            </p>
            <p className="text-2xl font-bold text-gray-900">
              LKR{" "}
              {Number(bookingStats.currentMonthlyEarnings).toLocaleString(
                "en-LK",
                { minimumFractionDigits: 2 }
              )}
            </p>
          </div>
        </div>
      )}

      {/* Main Content Grid */}
      <div className="grid lg:grid-cols-2 gap-8">
        {/* Pending Bookings */}
        {pendingBookings.length > 0 && (
          <div className="bg-white rounded-3xl border border-gray-100 card-shadow overflow-hidden">
            <div className="p-6 border-b border-gray-100 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-orange-100 rounded-xl">
                  <HiOutlineClock className="w-6 h-6 text-orange-600" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-gray-900">
                    {t("dashboard.pendingBookings") || "Pending Bookings"}
                  </h2>
                  <p className="text-sm text-gray-500">
                    {pendingBookings.length}{" "}
                    {isWorker
                      ? t("dashboard.awaitingYourResponse") ||
                        "awaiting your response"
                      : t("dashboard.awaitingWorkerResponse") ||
                        "awaiting worker response"}
                  </p>
                </div>
              </div>
              <Link
                href="/dashboard/bookings"
                className="text-sm font-medium text-primary hover:text-primary-hover transition-colors"
              >
                {t("dashboard.viewAll") || "View All"} →
              </Link>
            </div>
            <div className="divide-y divide-gray-100">
              {pendingBookings.map((booking) => {
                const targetName = isWorker
                  ? booking.customer?.fullName ||
                    t("dashboard.customer") ||
                    "Customer"
                  : booking.worker?.user?.fullName ||
                    t("dashboard.workerName") ||
                    "Worker";

                return (
                  <Link
                    key={booking.id}
                    href={`/dashboard/bookings/${booking.id}`}
                    className="flex items-center justify-between p-4 hover:bg-gray-50/50 transition-colors"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center">
                        <span className="text-orange-600 font-bold text-sm">
                          {targetName.charAt(0) || "U"}
                        </span>
                      </div>
                      <div>
                        <p className="font-semibold text-gray-900">
                          {targetName}
                        </p>
                        <p className="text-sm text-gray-500">
                          {booking.category?.name} · {booking.location}
                        </p>
                      </div>
                    </div>
                    <div className="text-right flex flex-col items-end gap-1">
                      <StatusBadge status={booking.status} />
                      {booking.estimatedPrice && (
                        <p className="text-xs font-medium text-gray-600">
                          LKR {Number(booking.estimatedPrice).toLocaleString("en-LK")}
                        </p>
                      )}
                      <p className="text-xs text-gray-400">
                        {new Date(booking.preferredDate).toLocaleDateString()}
                      </p>
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        )}

        {/* Upcoming Bookings - Worker Only */}
        {isWorker && (
          <div className="bg-white rounded-3xl border border-gray-100 card-shadow overflow-hidden">
            <div className="p-6 border-b border-gray-100 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-100 rounded-xl">
                  <HiOutlineCalendar className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-gray-900">
                    {t("dashboard.upcomingBookings") || "Upcoming Bookings"}
                  </h2>
                  <p className="text-sm text-gray-500">
                    {bookingStats.active.length} active
                  </p>
                </div>
              </div>
              <Link
                href="/dashboard/bookings"
                className="text-sm font-medium text-primary hover:text-primary-hover transition-colors"
              >
                {t("dashboard.viewAll") || "View All"} →
              </Link>
            </div>
            {upcomingBookings.length === 0 ? (
              <EmptyState
                icon={<HiOutlineCalendar className="w-12 h-12" />}
                title={t("dashboard.noBookings") || "No upcoming bookings"}
                description="Accepted or in-progress bookings will appear here."
              />
            ) : (
              <div className="divide-y divide-gray-100">
                {upcomingBookings.map((booking) => (
                  <Link
                    key={booking.id}
                    href={`/dashboard/bookings/${booking.id}`}
                    className="flex items-center justify-between p-4 hover:bg-gray-50/50 transition-colors"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                        <span className="text-blue-600 font-bold text-sm">
                          {booking.customer?.fullName?.charAt(0) || "C"}
                        </span>
                      </div>
                      <div>
                        <p className="font-semibold text-gray-900">
                          {booking.customer?.fullName || "Customer"}
                        </p>
                        <p className="text-sm text-gray-500">
                          {booking.category?.name}
                        </p>
                        <div className="flex items-center gap-1 text-xs text-gray-400 mt-0.5">
                          <HiOutlineLocationMarker className="w-3 h-3" />
                          <span>{booking.location}</span>
                        </div>
                      </div>
                    </div>
                    <div className="text-right flex flex-col items-end gap-1">
                      <StatusBadge status={booking.status} />
                      <p className="text-xs text-gray-400">
                        {new Date(booking.preferredDate).toLocaleDateString()}
                      </p>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Recent Bookings */}
        <div className="bg-white rounded-3xl border border-gray-100 card-shadow overflow-hidden">
          <div className="p-6 border-b border-gray-100 flex items-center justify-between">
            <h2 className="text-lg font-bold text-gray-900">
              {t("dashboard.recentBookings") || "Recent Bookings"}
            </h2>
            <Link
              href="/dashboard/bookings"
              className="text-sm font-medium text-primary hover:text-primary-hover transition-colors"
            >
              {t("dashboard.viewAll") || "View All"} →
            </Link>
          </div>
          {recentBookings.length === 0 ? (
            <EmptyState
              icon={<HiOutlineBriefcase className="w-12 h-12" />}
              title={t("dashboard.noBookings") || "No bookings yet"}
              description="Your booking history will appear here."
            />
          ) : (
            <div className="divide-y divide-gray-100">
              {recentBookings.map((booking) => {
                const targetName = isWorker
                  ? booking.customer?.fullName ||
                    t("dashboard.customer") ||
                    "Customer"
                  : booking.worker?.user?.fullName ||
                    t("dashboard.workerName") ||
                    "Worker";

                return (
                  <Link
                    key={booking.id}
                    href={`/dashboard/bookings/${booking.id}`}
                    className="flex items-center justify-between p-4 hover:bg-gray-50/50 transition-colors"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
                        <span className="text-gray-500 font-bold text-sm">
                          {targetName.charAt(0) || "U"}
                        </span>
                      </div>
                      <div>
                        <p className="font-semibold text-gray-900">
                          {targetName}
                        </p>
                        <p className="text-sm text-gray-500 line-clamp-1">
                          {booking.category?.name}
                        </p>
                      </div>
                    </div>
                    <div className="text-right flex flex-col items-end gap-1">
                      <StatusBadge status={booking.status} />
                      <p className="text-xs text-gray-400">
                        {new Date(booking.preferredDate).toLocaleDateString()}
                      </p>
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </div>

        {/* Notifications */}
        <div className="bg-white rounded-3xl border border-gray-100 card-shadow overflow-hidden">
          <div className="p-6 border-b border-gray-100 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-xl">
                <HiOutlineBell className="w-6 h-6 text-primary" />
              </div>
              <h2 className="text-lg font-bold text-gray-900">
                {t("dashboard.recentNotifications") || "Recent Notifications"}
              </h2>
            </div>
          </div>
          {notifications.length === 0 ? (
            <EmptyState
              icon={<HiOutlineBell className="w-12 h-12" />}
              title={t("dashboard.noNotifications") || "No notifications"}
              description="You're all caught up!"
            />
          ) : (
            <div className="divide-y divide-gray-100">
              {notifications.map((notif) => (
                <div
                  key={notif.id}
                  className="flex items-start gap-4 p-4 hover:bg-gray-50/50 transition-colors"
                >
                  <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center shrink-0 mt-0.5">
                    <HiOutlineBell className="w-5 h-5 text-primary" />
                  </div>
                  <div className="min-w-0">
                    <p className="font-semibold text-gray-900 text-sm">
                      {notif.title}
                    </p>
                    <p className="text-sm text-gray-500 mt-1 line-clamp-2">
                      {notif.body}
                    </p>
                    <p className="text-xs text-gray-400 mt-2">
                      {new Date(notif.createdAt).toLocaleString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Monthly Earnings Chart - Worker Only */}
      {isWorker && (
        <div className="bg-white rounded-3xl border border-gray-100 card-shadow p-6">
          <h2 className="text-lg font-bold text-gray-900 mb-6">
            {t("dashboard.monthlyEarningsChart") || "Monthly Earnings"}
          </h2>
          <div className="space-y-4">
            {bookingStats.last3Months.map((month, idx) => (
              <div key={idx} className="flex items-center gap-4">
                <span className="text-sm font-medium text-gray-500 w-12">
                  {month.month}
                </span>
                <div className="flex-1 bg-gray-100 rounded-full h-8 overflow-hidden">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-primary to-primary-hover transition-all duration-500"
                    style={{
                      width: `${maxEarnings > 0 ? (month.total / maxEarnings) * 100 : 0}%`,
                      minWidth: month.total > 0 ? "2rem" : "0",
                    }}
                  />
                </div>
                <span className="text-sm font-semibold text-gray-700 w-32 text-right">
                  LKR {Number(month.total).toLocaleString("en-LK")}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
