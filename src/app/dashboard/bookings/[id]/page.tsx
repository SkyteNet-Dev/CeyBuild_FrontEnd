"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import api from "@/lib/axios";
import { useI18n } from "@/i18n/I18nProvider";
import { useAuth } from "@/contexts/AuthContext";
import toast from "react-hot-toast";
import {
  HiOutlineArrowLeft,
  HiOutlineCalendar,
  HiOutlineMapPin,
  HiOutlineUser,
  HiOutlineBriefcase,
  HiOutlineCurrencyDollar,
  HiOutlineCheckCircle,
  HiOutlineClock,
  HiOutlineXCircle,
  HiOutlineChatBubbleLeftRight,
  HiOutlinePhone,
  HiOutlineEnvelope,
  HiOutlineArrowPath,
  HiOutlineCheckBadge,
  HiOutlineExclamationTriangle,
  HiOutlineCalendarDays,
} from "react-icons/hi2";

interface Booking {
  id: string;
  serviceCategory?: string;
  description?: string;
  status: string;
  scheduledDate?: string;
  preferredDate?: string;
  preferredTime?: string;
  estimatedPrice?: number;
  advanceAmount?: number;
  location?: string;
  province?: string;
  district?: string;
  city?: string;
  customer?: { id: string; fullName: string; email: string; phoneNumber?: string };
  worker?: {
    id: string;
    userId?: string;
    user?: { id: string; fullName: string; email: string; phoneNumber?: string };
    category?: { name: string };
    experienceYears?: number;
    averageRating?: number;
  };
  category?: { name: string };
  payments?: { id: string; paymentType: string; paymentStatus: string; amount: number }[];
  chat?: { id: string };
  createdAt?: string;
}

interface ContactInfo {
  fullName: string;
  email: string;
  phoneNumber?: string;
}

export default function BookingDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const { t } = useI18n();
  const { role } = useAuth();
  const [booking, setBooking] = useState<Booking | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [contact, setContact] = useState<ContactInfo | null>(null);
  const [contactLoading, setContactLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  const isWorker = role === "worker";
  const isCustomer = role === "customer";

  const fetchBooking = async () => {
    setLoading(true);
    setError(false);
    try {
      const response = await api.get(`/bookings/${id}`);
      setBooking(response.data);
    } catch {
      setError(true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBooking();
  }, [id]);

  const isPaid = () => {
    if (!booking) return false;
    return (
      booking.status === "ADVANCE_PAID" ||
      booking.status === "IN_PROGRESS" ||
      booking.status === "SERVICE_COMPLETED" ||
      booking.status === "COMPLETED" ||
      booking.payments?.some((p) => p.paymentStatus === "COMPLETED")
    );
  };

  const advanceAmount = () => {
    if (!booking) return 0;
    if (booking.advanceAmount) return Number(booking.advanceAmount);
    if (booking.estimatedPrice) return Math.round(Number(booking.estimatedPrice) * 0.10 * 100) / 100;
    return 0;
  };

  const fetchContact = async () => {
    setContactLoading(true);
    try {
      const response = await api.get(`/bookings/${id}/contact`);
      setContact(response.data);
    } catch {
      setContact(null);
    } finally {
      setContactLoading(false);
    }
  };

  useEffect(() => {
    if (isPaid() && !contact) {
      fetchContact();
    }
  }, [booking]);

  const handleStatusUpdate = async (status: string) => {
    if (!confirm(`Are you sure you want to ${status.toLowerCase().replace(/_/g, " ")}?`)) return;
    setActionLoading(true);
    try {
      await api.put(`/bookings/${id}/status`, { status });
      fetchBooking();
    } catch (err: any) {
      const msg = err?.response?.data?.message || "Failed to update booking status. Please try again.";
      toast.error(typeof msg === "string" ? msg : "An error occurred");
    } finally {
      setActionLoading(false);
    }
  };

  const handleCompleteService = async () => {
    if (!confirm("Are you sure you want to mark this service as completed?")) return;
    setActionLoading(true);
    try {
      await api.put(`/bookings/${id}/complete-service`);
      fetchBooking();
    } catch (err: any) {
      const msg = err?.response?.data?.message || "Failed to mark service as completed.";
      toast.error(typeof msg === "string" ? msg : "An error occurred");
    } finally {
      setActionLoading(false);
    }
  };

  const handleConfirmCompletion = async () => {
    if (!confirm("Have you received the service? Confirm to complete the booking.")) return;
    setActionLoading(true);
    try {
      await api.put(`/bookings/${id}/confirm-completion`);
      fetchBooking();
    } catch (err: any) {
      const msg = err?.response?.data?.message || "Failed to confirm completion.";
      toast.error(typeof msg === "string" ? msg : "An error occurred");
    } finally {
      setActionLoading(false);
    }
  };

  const handleReschedule = async () => {
    const newDate = prompt("Enter new date (YYYY-MM-DD):");
    if (!newDate) return;
    const newTime = prompt("Enter new time (HH:MM):");
    setActionLoading(true);
    try {
      await api.put(`/bookings/${id}/reschedule`, {
        newPreferredDate: newDate,
        newPreferredTime: newTime || undefined,
      });
      fetchBooking();
    } catch (err: any) {
      const msg = err?.response?.data?.message || "Failed to reschedule booking.";
      toast.error(typeof msg === "string" ? msg : "An error occurred");
    } finally {
      setActionLoading(false);
    }
  };

  const handlePayNow = () => {
    if (!booking) return;
    const amount = advanceAmount();
    const workerName = booking.worker?.user?.fullName || "";
    const serviceName = booking.category?.name || booking.serviceCategory || "";
    const date = booking.preferredDate
      ? new Date(booking.preferredDate).toLocaleDateString()
      : "";
    router.push(
      `/checkout/payhere?bookingId=${booking.id}&amount=${amount}&type=ADVANCE&worker=${encodeURIComponent(workerName)}&service=${encodeURIComponent(serviceName)}&date=${encodeURIComponent(date)}`
    );
  };

  const handleOpenChat = () => {
    if (!booking?.chat?.id) return;
    router.push(`/dashboard/chat/${booking.chat.id}`);
  };

  const statusColor = (status: string) => {
    switch (status) {
      case "COMPLETED": return "bg-green-100 text-green-700 border-green-200";
      case "SERVICE_COMPLETED": return "bg-teal-100 text-teal-700 border-teal-200";
      case "IN_PROGRESS": return "bg-blue-100 text-blue-700 border-blue-200";
      case "ACCEPTED": return "bg-purple-100 text-purple-700 border-purple-200";
      case "ADVANCE_PAID": return "bg-indigo-100 text-indigo-700 border-indigo-200";
      case "PENDING": return "bg-orange-100 text-orange-700 border-orange-200";
      case "CANCELLED": return "bg-red-100 text-red-700 border-red-200";
      case "REJECTED": return "bg-red-100 text-red-700 border-red-200";
      default: return "bg-gray-100 text-gray-700 border-gray-200";
    }
  };

  if (loading) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (error || !booking) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] space-y-4">
        <p className="text-gray-500">{t("admin.errorLoading")}</p>
        <button onClick={fetchBooking} className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-xl hover:bg-primary-hover transition-colors text-sm font-medium">
          <HiOutlineArrowPath className="w-4 h-4" />
          {t("admin.retry")}
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      <button onClick={() => router.back()} className="flex items-center gap-2 text-gray-500 hover:text-gray-900 transition-colors text-sm font-medium">
        <HiOutlineArrowLeft className="w-4 h-4" />
        {t("admin.back")}
      </button>

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{booking.category?.name || booking.serviceCategory || "Booking"}</h1>
          <p className="text-sm text-gray-500 mt-1">Booking #{booking.id.slice(0, 8)}</p>
        </div>
        <span className={`inline-flex items-center px-3 py-1.5 text-sm font-bold rounded-full border ${statusColor(booking.status)}`}>
          {booking.status.replace(/_/g, " ")}
        </span>
      </div>

      {isWorker && booking.status === "PENDING" && (
        <div className="bg-orange-50 border border-orange-200 rounded-2xl p-5 space-y-4">
          <div className="flex items-center gap-3">
            <HiOutlineExclamationTriangle className="w-5 h-5 text-orange-500 shrink-0" />
            <div>
              <p className="text-sm font-semibold text-orange-900">New Booking Request</p>
              <p className="text-xs text-orange-600 mt-0.5">A customer has requested your services. Please accept or decline.</p>
            </div>
          </div>
          <div className="flex flex-col sm:flex-row gap-3">
            <button
              onClick={() => handleStatusUpdate("ACCEPTED")}
              disabled={actionLoading}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-green-600 text-white font-semibold rounded-xl hover:bg-green-700 shadow-md transition-all text-sm disabled:opacity-50"
            >
              <HiOutlineCheckBadge className="w-5 h-5" />
              Accept Booking
            </button>
            <button
              onClick={() => handleStatusUpdate("REJECTED")}
              disabled={actionLoading}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-3 text-red-600 font-semibold bg-red-50 rounded-xl hover:bg-red-100 transition-all text-sm disabled:opacity-50"
            >
              <HiOutlineXCircle className="w-5 h-5" />
              Decline
            </button>
          </div>
        </div>
      )}

      {isCustomer && booking.status === "PENDING" && (
        <div className="bg-orange-50 border border-orange-200 rounded-2xl p-4 flex items-center gap-3">
          <HiOutlineClock className="w-5 h-5 text-orange-500 shrink-0" />
          <p className="text-sm text-orange-700">Waiting for the worker to respond to your booking request.</p>
        </div>
      )}

      {isWorker && booking.status === "ACCEPTED" && (
        <div className="bg-purple-50 border border-purple-200 rounded-2xl p-4 flex items-center gap-3">
          <HiOutlineCheckCircle className="w-5 h-5 text-purple-600 shrink-0" />
          <p className="text-sm text-purple-700">You accepted this booking. Waiting for the customer to make the advance payment.</p>
        </div>
      )}

      {isCustomer && booking.status === "ACCEPTED" && !isPaid() && (
        <div className="bg-indigo-50 border border-indigo-200 rounded-2xl p-5 space-y-4">
          <div className="flex items-center gap-3">
            <HiOutlineCheckCircle className="w-5 h-5 text-indigo-600 shrink-0" />
            <div>
              <p className="text-sm font-semibold text-indigo-900">Your booking has been accepted!</p>
              <p className="text-xs text-indigo-600 mt-0.5">10% advance payment is required to confirm the booking.</p>
            </div>
          </div>
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div>
              <p className="text-xs text-gray-500">Advance Amount</p>
              <p className="text-xl font-bold text-gray-900">Rs. {advanceAmount().toLocaleString()}</p>
              <p className="text-xs text-gray-400">of Rs. {Number(booking.estimatedPrice || 0).toLocaleString()} total</p>
            </div>
            <button
              onClick={handlePayNow}
              className="px-6 py-3 bg-primary text-white font-semibold rounded-xl hover:bg-primary-hover shadow-md shadow-primary/15 transition-all text-sm"
            >
              Pay {advanceAmount().toLocaleString()} Advance
            </button>
          </div>
        </div>
      )}

      {isPaid() && (
        <div className="bg-green-50 border border-green-200 rounded-2xl p-4 flex items-center gap-3">
          <HiOutlineCheckCircle className="w-5 h-5 text-green-600 shrink-0" />
          <p className="text-sm font-medium text-green-700">Payment Confirmed</p>
        </div>
      )}

      {isWorker && (booking.status === "ADVANCE_PAID" || booking.status === "IN_PROGRESS") && (
        <div className="bg-blue-50 border border-blue-200 rounded-2xl p-5 space-y-4">
          <div className="flex items-center gap-3">
            <HiOutlineBriefcase className="w-5 h-5 text-blue-600 shrink-0" />
            <div>
              <p className="text-sm font-semibold text-blue-900">
                {booking.status === "ADVANCE_PAID" ? "Payment received — you can start the service." : "Service in progress."}
              </p>
              <p className="text-xs text-blue-600 mt-0.5">When the work is done, mark the service as completed.</p>
            </div>
          </div>
          <div className="flex flex-col sm:flex-row gap-3">
            <button
              onClick={handleCompleteService}
              disabled={actionLoading}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-green-600 text-white font-semibold rounded-xl hover:bg-green-700 shadow-md transition-all text-sm disabled:opacity-50"
            >
              <HiOutlineCheckBadge className="w-5 h-5" />
              Mark Service Completed
            </button>
            <button
              onClick={handleReschedule}
              disabled={actionLoading}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-3 text-blue-600 font-semibold bg-blue-50 rounded-xl hover:bg-blue-100 transition-all text-sm disabled:opacity-50"
            >
              <HiOutlineCalendarDays className="w-5 h-5" />
              Propose Reschedule
            </button>
          </div>
        </div>
      )}

      {isWorker && booking.status === "SERVICE_COMPLETED" && (
        <div className="bg-teal-50 border border-teal-200 rounded-2xl p-4 flex items-center gap-3">
          <HiOutlineCheckCircle className="w-5 h-5 text-teal-600 shrink-0" />
          <p className="text-sm font-medium text-teal-700">You marked the service as completed. Waiting for customer confirmation.</p>
        </div>
      )}

      {isCustomer && booking.status === "SERVICE_COMPLETED" && (
        <div className="bg-teal-50 border border-teal-200 rounded-2xl p-5 space-y-4">
          <div className="flex items-center gap-3">
            <HiOutlineCheckCircle className="w-5 h-5 text-teal-600 shrink-0" />
            <div>
              <p className="text-sm font-semibold text-teal-900">Service completed by the worker.</p>
              <p className="text-xs text-teal-600 mt-0.5">Please confirm that you received the service to complete the booking.</p>
            </div>
          </div>
          <button
            onClick={handleConfirmCompletion}
            disabled={actionLoading}
            className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3 bg-green-600 text-white font-semibold rounded-xl hover:bg-green-700 shadow-md transition-all text-sm disabled:opacity-50"
          >
            <HiOutlineCheckBadge className="w-5 h-5" />
            Confirm Completion
          </button>
        </div>
      )}

      {booking.status === "COMPLETED" && (
        <div className="bg-green-50 border border-green-200 rounded-2xl p-4 flex items-center gap-3">
          <HiOutlineCheckCircle className="w-5 h-5 text-green-600 shrink-0" />
          <p className="text-sm font-medium text-green-700">This booking has been completed.</p>
        </div>
      )}

      {booking.status === "CANCELLED" && (
        <div className="bg-red-50 border border-red-200 rounded-2xl p-4 flex items-center gap-3">
          <HiOutlineXCircle className="w-5 h-5 text-red-500 shrink-0" />
          <p className="text-sm font-medium text-red-700">This booking has been cancelled.</p>
        </div>
      )}

      {booking.status === "REJECTED" && (
        <div className="bg-red-50 border border-red-200 rounded-2xl p-4 flex items-center gap-3">
          <HiOutlineXCircle className="w-5 h-5 text-red-500 shrink-0" />
          <p className="text-sm font-medium text-red-700">This booking has been declined.</p>
        </div>
      )}

      <div className="bg-white rounded-2xl border border-gray-100 card-shadow divide-y divide-gray-100">
        <div className="p-5 space-y-4">
          <h3 className="font-semibold text-gray-900">Booking Details</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
            <div className="flex items-start gap-3">
              <HiOutlineUser className="w-5 h-5 text-gray-400 mt-0.5 shrink-0" />
              <div>
                <p className="text-gray-500">{isWorker ? "Customer" : t("admin.worker")}</p>
                <p className="font-medium text-gray-900">
                  {isWorker ? (booking.customer?.fullName || "-") : (booking.worker?.user?.fullName || "-")}
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <HiOutlineBriefcase className="w-5 h-5 text-gray-400 mt-0.5 shrink-0" />
              <div>
                <p className="text-gray-500">{t("admin.category")}</p>
                <p className="font-medium text-gray-900">{booking.worker?.category?.name || booking.serviceCategory || "-"}</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <HiOutlineCalendar className="w-5 h-5 text-gray-400 mt-0.5 shrink-0" />
              <div>
                <p className="text-gray-500">{t("admin.bookingDate")}</p>
                <p className="font-medium text-gray-900">
                  {booking.preferredDate ? new Date(booking.preferredDate).toLocaleDateString() : "-"}
                  {booking.preferredTime ? ` at ${booking.preferredTime}` : ""}
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <HiOutlineMapPin className="w-5 h-5 text-gray-400 mt-0.5 shrink-0" />
              <div>
                <p className="text-gray-500">Location</p>
                <p className="font-medium text-gray-900">{booking.location || "-"}</p>
                {[booking.city, booking.district, booking.province].filter(Boolean).length > 0 && (
                  <p className="text-xs text-gray-400 mt-0.5">{[booking.city, booking.district, booking.province].filter(Boolean).join(", ")}</p>
                )}
              </div>
            </div>
          </div>
          {booking.description && (
            <div className="mt-4 pt-4 border-t border-gray-100">
              <p className="text-gray-500 text-sm mb-1">Description</p>
              <p className="text-sm text-gray-700">{booking.description}</p>
            </div>
          )}
        </div>

        <div className="p-5">
          <h3 className="font-semibold text-gray-900 mb-3">Price</h3>
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-500">Estimated Total</span>
            <span className="font-bold text-gray-900 text-lg">Rs. {Number(booking.estimatedPrice || 0).toLocaleString()}</span>
          </div>
          {booking.advanceAmount && (
            <div className="flex items-center justify-between text-sm mt-2">
              <span className="text-gray-500">Advance Paid (10%)</span>
              <span className="font-medium text-green-600">Rs. {Number(booking.advanceAmount).toLocaleString()}</span>
            </div>
          )}
        </div>

        {isPaid() && contact && (
          <div className="p-5">
            <h3 className="font-semibold text-gray-900 mb-3">
              {isWorker ? "Customer Contact" : "Worker Contact"}
            </h3>
            <div className="space-y-2 text-sm">
              <div className="flex items-center gap-3">
                <HiOutlineUser className="w-4 h-4 text-gray-400" />
                <span className="text-gray-900 font-medium">{contact.fullName}</span>
              </div>
              {contact.email && (
                <div className="flex items-center gap-3">
                  <HiOutlineEnvelope className="w-4 h-4 text-gray-400" />
                  <a href={`mailto:${contact.email}`} className="text-primary hover:underline">{contact.email}</a>
                </div>
              )}
              {contact.phoneNumber && (
                <div className="flex items-center gap-3">
                  <HiOutlinePhone className="w-4 h-4 text-gray-400" />
                  <a href={`tel:${contact.phoneNumber}`} className="text-primary hover:underline">{contact.phoneNumber}</a>
                </div>
              )}
            </div>
          </div>
        )}

        {!isPaid() && (
          <div className="p-5">
            <div className="bg-gray-50 rounded-xl p-4 text-center text-sm text-gray-500">
              <HiOutlinePhone className="w-5 h-5 mx-auto mb-2 text-gray-400" />
              Contact details will be available after advance payment.
            </div>
          </div>
        )}
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        {isPaid() && booking.chat?.id && (
          <button
            onClick={handleOpenChat}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-primary text-white font-semibold rounded-xl hover:bg-primary-hover shadow-md transition-all text-sm"
          >
            <HiOutlineChatBubbleLeftRight className="w-5 h-5" />
            {isWorker ? "Chat with Customer" : "Chat with Worker"}
          </button>
        )}

        {!isWorker && (booking.status === "PENDING" || booking.status === "ACCEPTED") && (
          <button
            onClick={() => handleStatusUpdate("CANCELLED")}
            disabled={actionLoading}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-3 text-red-600 font-semibold bg-red-50 rounded-xl hover:bg-red-100 transition-all text-sm disabled:opacity-50"
          >
            <HiOutlineXCircle className="w-5 h-5" />
            Cancel Booking
          </button>
        )}

        {isWorker && booking.status === "PENDING" && (
          <button
            onClick={() => handleStatusUpdate("CANCELLED")}
            disabled={actionLoading}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-3 text-red-600 font-semibold bg-red-50 rounded-xl hover:bg-red-100 transition-all text-sm disabled:opacity-50"
          >
            <HiOutlineXCircle className="w-5 h-5" />
            Cancel Booking
          </button>
        )}
      </div>
    </div>
  );
}
