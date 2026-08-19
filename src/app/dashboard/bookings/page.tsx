"use client";

import { useEffect, useState, useMemo } from "react";
import api from "@/lib/axios";
import { useI18n } from "@/i18n/I18nProvider";
import { useAuth } from "@/contexts/AuthContext";
import {
  HiOutlineSearch,
  HiOutlineCalendar,
  HiOutlineClock,
  HiOutlineCheckCircle,
  HiOutlineXCircle,
  HiOutlineLocationMarker,
  HiOutlineUser,
  HiOutlineBriefcase,
} from "react-icons/hi";
import { HiOutlineArrowPath, HiOutlineArrowTrendingUp } from "react-icons/hi2";
import { useRouter } from "next/navigation";
import { StatusBadge } from "@/components/ui/StatusBadge";

interface Booking {
  id: string;
  serviceCategory?: string;
  status: string;
  scheduledDate?: string;
  totalAmount?: number;
  estimatedPrice?: number;
  location?: string;
  customer?: { fullName: string };
  worker?: { user?: { fullName: string } };
}

export default function BookingsPage() {
  const { t } = useI18n();
  const { role } = useAuth();
  const router = useRouter();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");

  const isAdmin = role === "admin";

  const fetchBookings = async () => {
    setLoading(true);
    setError(false);
    try {
      const url = isAdmin ? "/admin/bookings" : "/bookings";
      const response = await api.get(url);
      const data = response.data.data || response.data;
      setBookings(Array.isArray(data) ? data : []);
    } catch {
      setError(true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, [isAdmin]);

  const filteredBookings = useMemo(() => {
    return bookings
      .filter((b) => {
        const searchLower = search.toLowerCase();
        const matchesSearch =
          b.serviceCategory?.toLowerCase().includes(searchLower) ||
          b.customer?.fullName?.toLowerCase().includes(searchLower) ||
          b.worker?.user?.fullName?.toLowerCase().includes(searchLower) ||
          b.id?.toLowerCase().includes(searchLower);
        const matchesStatus = statusFilter === "ALL" || b.status === statusFilter;
        return matchesSearch && matchesStatus;
      })
      .sort((a, b) => {
        const dateA = a.scheduledDate ? new Date(a.scheduledDate).getTime() : 0;
        const dateB = b.scheduledDate ? new Date(b.scheduledDate).getTime() : 0;
        return dateB - dateA;
      });
  }, [bookings, search, statusFilter]);

  const stats = useMemo(() => {
    return {
      total: bookings.length,
      pending: bookings.filter((b) => b.status === "PENDING").length,
      inProgress: bookings.filter(
        (b) => b.status === "ACCEPTED" || b.status === "IN_PROGRESS"
      ).length,
      completed: bookings.filter((b) => b.status === "COMPLETED").length,
    };
  }, [bookings]);

  const getDisplayPrice = (booking: Booking) => {
    const price = booking.totalAmount || booking.estimatedPrice;
    if (!price) return null;
    return `Rs. ${Number(price).toLocaleString()}`;
  };

  const formatDate = (date?: string) => {
    if (!date) return null;
    return new Date(date).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const getInitial = (name?: string) => {
    return name?.charAt(0)?.toUpperCase() || "?";
  };

  const getAvatarColor = (status: string) => {
    switch (status) {
      case "PENDING": return "bg-orange-100 text-orange-600";
      case "ACCEPTED": return "bg-purple-100 text-purple-600";
      case "IN_PROGRESS": return "bg-blue-100 text-blue-600";
      case "COMPLETED": return "bg-green-100 text-green-600";
      case "CANCELLED": return "bg-red-100 text-red-600";
      default: return "bg-gray-100 text-gray-600";
    }
  };

  const statCards = [
    {
      label: t("admin.totalBookings") || "Total",
      value: stats.total,
      icon: HiOutlineBriefcase,
      color: "text-gray-600",
      bg: "bg-gray-100",
    },
    {
      label: t("admin.pendingStatus") || "Pending",
      value: stats.pending,
      icon: HiOutlineClock,
      color: "text-orange-600",
      bg: "bg-orange-100",
    },
    {
      label: t("admin.inProgressStatus") || "In Progress",
      value: stats.inProgress,
      icon: HiOutlineArrowTrendingUp,
      color: "text-blue-600",
      bg: "bg-blue-100",
    },
    {
      label: t("admin.completedStatus") || "Completed",
      value: stats.completed,
      icon: HiOutlineCheckCircle,
      color: "text-green-600",
      bg: "bg-green-100",
    },
  ];

  if (loading) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] space-y-4">
        <p className="text-gray-500">{t("admin.errorLoading")}</p>
        <button
          onClick={fetchBookings}
          className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-xl hover:bg-primary-hover transition-colors text-sm font-medium"
        >
          <HiOutlineArrowPath className="w-4 h-4" />
          {t("admin.retry")}
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6 sm:space-y-8">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 tracking-tight">
          {t("sidebar.myBookings")}
        </h1>
        <p className="text-gray-500 mt-1 sm:mt-2 text-sm sm:text-base">
          {t("admin.bookingsPageDesc")}
        </p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {statCards.map((stat) => (
          <div
            key={stat.label}
            className="bg-white p-4 sm:p-5 rounded-2xl border border-gray-100 card-shadow"
          >
            <div className="flex items-center gap-3">
              <div className={`p-2.5 ${stat.bg} rounded-xl`}>
                <stat.icon className={`w-5 h-5 ${stat.color}`} />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                <p className="text-xs text-gray-500">{stat.label}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 card-shadow">
        <div className="p-4 sm:p-5 border-b border-gray-100">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <HiOutlineSearch className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder={t("admin.searchPlaceholder")}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
              />
            </div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-primary/20"
            >
              <option value="ALL">{t("admin.allStatusesFilter")}</option>
              <option value="PENDING">{t("admin.pendingStatus")}</option>
              <option value="ACCEPTED">{t("admin.acceptedStatus")}</option>
              <option value="IN_PROGRESS">{t("admin.inProgressStatus")}</option>
              <option value="COMPLETED">{t("admin.completedStatus")}</option>
              <option value="CANCELLED">{t("admin.cancelledStatus")}</option>
            </select>
          </div>
        </div>

        {filteredBookings.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-gray-400">
            <HiOutlineCalendar className="w-12 h-12 mb-3" />
            <p className="text-sm">{t("admin.noBookings")}</p>
          </div>
        ) : (
          <div className="p-4 sm:p-5 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {filteredBookings.map((booking) => {
              const personName =
                role === "worker"
                  ? booking.customer?.fullName
                  : booking.worker?.user?.fullName;
              const personLabel = role === "worker" ? t("admin.customer") : t("admin.worker");

              return (
                <div
                  key={booking.id}
                  onClick={() => router.push(`/dashboard/bookings/${booking.id}`)}
                  className="group flex flex-col justify-between p-4 sm:p-5 bg-gray-50/50 hover:bg-gray-50 border border-gray-100 hover:border-primary/20 rounded-2xl transition-all cursor-pointer"
                >
                  <div className="flex items-start justify-between gap-3 mb-4">
                    <div className="flex items-center gap-3 min-w-0">
                      <div
                        className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${getAvatarColor(
                          booking.status
                        )}`}
                      >
                        <span className="font-bold text-sm">
                          {getInitial(personName)}
                        </span>
                      </div>
                      <div className="min-w-0">
                        <p className="font-semibold text-gray-900 text-sm truncate">
                          {booking.serviceCategory || "-"}
                        </p>
                        <p className="text-xs text-gray-500 truncate">
                          {personName || "-"}
                        </p>
                      </div>
                    </div>
                    <StatusBadge status={booking.status} />
                  </div>

                  <div className="space-y-2 text-xs text-gray-500">
                    {booking.location && (
                      <div className="flex items-center gap-1.5">
                        <HiOutlineLocationMarker className="w-3.5 h-3.5 shrink-0" />
                        <span className="truncate">{booking.location}</span>
                      </div>
                    )}
                    {booking.scheduledDate && (
                      <div className="flex items-center gap-1.5">
                        <HiOutlineCalendar className="w-3.5 h-3.5 shrink-0" />
                        <span>{formatDate(booking.scheduledDate)}</span>
                      </div>
                    )}
                  </div>

                  {getDisplayPrice(booking) && (
                    <div className="mt-4 pt-3 border-t border-gray-100">
                      <p className="text-sm font-semibold text-gray-900">
                        {getDisplayPrice(booking)}
                      </p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
