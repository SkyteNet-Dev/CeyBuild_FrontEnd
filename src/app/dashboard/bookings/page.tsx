"use client";

import { useEffect, useState, useMemo } from "react";
import api from "@/lib/axios";
import { useI18n } from "@/i18n/I18nProvider";
import { useAuth } from "@/contexts/AuthContext";
import { HiOutlineSearch, HiOutlineCalendar } from "react-icons/hi";
import { HiOutlineArrowPath } from "react-icons/hi2";
import { useRouter } from "next/navigation";
import Link from "next/link";

interface Booking {
  id: string;
  serviceCategory?: string;
  status: string;
  scheduledDate?: string;
  totalAmount?: number;
  estimatedPrice?: number;
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
    return bookings.filter((b) => {
      const searchLower = search.toLowerCase();
      const matchesSearch =
        b.serviceCategory?.toLowerCase().includes(searchLower) ||
        b.customer?.fullName?.toLowerCase().includes(searchLower) ||
        b.worker?.user?.fullName?.toLowerCase().includes(searchLower) ||
        b.id?.toLowerCase().includes(searchLower);
      const matchesStatus = statusFilter === "ALL" || b.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [bookings, search, statusFilter]);

  const statusColor = (status: string) => {
    switch (status) {
      case "COMPLETED": return "bg-green-100 text-green-700";
      case "IN_PROGRESS": return "bg-blue-100 text-blue-700";
      case "ACCEPTED": return "bg-purple-100 text-purple-700";
      case "PENDING": return "bg-orange-100 text-orange-700";
      case "CANCELLED": return "bg-red-100 text-red-700";
      default: return "bg-gray-100 text-gray-700";
    }
  };

  const getDisplayPrice = (booking: Booking) => {
    const price = booking.totalAmount || booking.estimatedPrice;
    if (!price) return "-";
    return `Rs. ${Number(price).toLocaleString()}`;
  };

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
        <button onClick={fetchBookings} className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-xl hover:bg-primary-hover transition-colors text-sm font-medium">
          <HiOutlineArrowPath className="w-4 h-4" />
          {t("admin.retry")}
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6 sm:space-y-8">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 tracking-tight">{t("sidebar.myBookings")}</h1>
        <p className="text-gray-500 mt-1 sm:mt-2 text-sm sm:text-base">{t("admin.bookingsPageDesc")}</p>
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

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50/80 border-b border-gray-100 text-xs sm:text-sm font-medium text-gray-500 uppercase tracking-wider">
                <th className="px-4 sm:px-6 py-3 sm:py-4">{t("jobRequests.category")}</th>
                <th className="px-4 sm:px-6 py-3 sm:py-4 hidden sm:table-cell">{t("admin.customer")}</th>
                <th className="px-4 sm:px-6 py-3 sm:py-4 hidden md:table-cell">{t("admin.worker")}</th>
                <th className="px-4 sm:px-6 py-3 sm:py-4 hidden lg:table-cell">{t("admin.bookingDate")}</th>
                <th className="px-4 sm:px-6 py-3 sm:py-4 hidden sm:table-cell">{t("admin.bookingAmount")}</th>
                <th className="px-4 sm:px-6 py-3 sm:py-4">{t("admin.bookingStatus")}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredBookings.map((booking) => (
                <tr
                  key={booking.id}
                  className="hover:bg-gray-50/50 transition-colors cursor-pointer"
                  onClick={() => router.push(`/dashboard/bookings/${booking.id}`)}
                >
                  <td className="px-4 sm:px-6 py-3 sm:py-4">
                    <div className="font-medium text-gray-900 text-sm">{booking.serviceCategory || "-"}</div>
                    <div className="text-xs text-gray-400 sm:hidden">{booking.customer?.fullName}</div>
                  </td>
                  <td className="px-4 sm:px-6 py-3 sm:py-4 text-sm text-gray-600 hidden sm:table-cell">{booking.customer?.fullName || "-"}</td>
                  <td className="px-4 sm:px-6 py-3 sm:py-4 text-sm text-gray-600 hidden md:table-cell">{booking.worker?.user?.fullName || "-"}</td>
                  <td className="px-4 sm:px-6 py-3 sm:py-4 text-sm text-gray-600 hidden lg:table-cell">
                    {booking.scheduledDate ? new Date(booking.scheduledDate).toLocaleDateString() : "-"}
                  </td>
                  <td className="px-4 sm:px-6 py-3 sm:py-4 text-sm font-medium text-gray-900 hidden sm:table-cell">
                    {getDisplayPrice(booking)}
                  </td>
                  <td className="px-4 sm:px-6 py-3 sm:py-4">
                    <span className={`inline-block px-2.5 py-1 text-xs font-bold rounded-full ${statusColor(booking.status)}`}>
                      {booking.status.replace(/_/g, " ")}
                    </span>
                  </td>
                </tr>
              ))}
              {filteredBookings.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-gray-500 text-sm">
                    {t("admin.noBookings")}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
