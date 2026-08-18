"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import AnimatedSection from "@/components/AnimatedSection";
import api from "@/lib/axios";
import toast from "react-hot-toast";
import { useI18n } from "@/i18n/I18nProvider";
import {
  HiOutlineLocationMarker,
  HiOutlineCalendar,
  HiOutlineCurrencyDollar,
  HiOutlineX,
  HiOutlineChevronDown,
  HiOutlineChevronUp,
  HiOutlinePencilAlt,
  HiOutlineCheck,
  HiOutlineClock,
  HiOutlineBriefcase,
  HiOutlinePhone,
  HiOutlineUser,
} from "react-icons/hi";
import { HiOutlineChatBubbleLeftRight, HiOutlineEnvelope } from "react-icons/hi2";
import RescheduleModal from "@/components/dashboard/RescheduleModal";

type Booking = {
  id: string;
  status: 'PENDING' | 'ACCEPTED' | 'REJECTED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED' | 'ADVANCE_PAID';
  description: string;
  location: string;
  preferredDate: string;
  preferredTime?: string;
  estimatedPrice?: number;
  advanceAmount?: number;
  rescheduledDate?: string;
  rescheduledTime?: string;
  rescheduleReason?: string;
  rescheduledBy?: string;
  customer?: { fullName: string; email?: string; phoneNumber?: string };
  category?: { name: string };
  payment?: { id: string; amount: number; paymentStatus: string; transactionId?: string };
  review?: { id: string; rating: number; comment?: string; reply?: string; repliedAt?: string; createdAt: string };
  createdAt: string;
};

type ContactInfo = {
  fullName: string;
  email?: string;
  phoneNumber?: string;
};

export default function WorkerJobsPage() {
  const { t } = useI18n();
  const router = useRouter();
  const [jobs, setJobs] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'ALL'|'PENDING'|'ACCEPTED'|'ADVANCE_PAID'|'IN_PROGRESS'|'COMPLETED'|'CANCELLED'>('ALL');
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [rescheduleBookingId, setRescheduleBookingId] = useState<string | null>(null);
  const [contactInfo, setContactInfo] = useState<Record<string, ContactInfo>>({});
  const [loadingContact, setLoadingContact] = useState<Record<string, boolean>>({});
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [replyText, setReplyText] = useState("");
  const [acknowledged, setAcknowledged] = useState<Set<string>>(new Set());

  useEffect(() => {
    const stored = localStorage.getItem("acknowledgedBookings");
    if (stored) {
      setAcknowledged(new Set(JSON.parse(stored)));
    }
  }, []);

  const markAcknowledged = (id: string) => {
    setAcknowledged((prev) => {
      const next = new Set(prev);
      next.add(id);
      localStorage.setItem("acknowledgedBookings", JSON.stringify([...next]));
      return next;
    });
  };

  const isPaid = (j: Booking) => {
    return j.status === 'ADVANCE_PAID' || j.status === 'IN_PROGRESS' || j.status === 'COMPLETED' || j.payment?.paymentStatus === 'COMPLETED';
  };

  const fetchJobs = async () => {
    try {
      const res = await api.get("/bookings");
      setJobs(res.data);
    } catch (error) {
      toast.error(t('jobs.failedToLoad'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchJobs(); }, []);

  const fetchContactDetails = async (bookingId: string) => {
    if (contactInfo[bookingId]) return;
    setLoadingContact(prev => ({ ...prev, [bookingId]: true }));
    try {
      const res = await api.get(`/bookings/${bookingId}/contact`);
      setContactInfo(prev => ({ ...prev, [bookingId]: res.data }));
    } catch (error: any) {
      toast.error(error.response?.data?.message || t('jobs.failedToLoadContact'));
    } finally {
      setLoadingContact(prev => ({ ...prev, [bookingId]: false }));
    }
  };

  const handleExpand = (id: string) => {
    if (expandedId === id) { setExpandedId(null); return; }
    setExpandedId(id);
    markAcknowledged(id);
    const j = jobs.find(x => x.id === id);
    if (j && isPaid(j)) fetchContactDetails(id);
  };

  const updateStatus = async (id: string, newStatus: string) => {
    setSubmitting(true);
    try {
      await api.put(`/bookings/${id}/status`, { status: newStatus });
      toast.success(t('bookings.bookingUpdated'));
      fetchJobs();
    } catch (error) {
      toast.error(t('jobs.failedToUpdate'));
    } finally {
      setSubmitting(false);
    }
  };

  const handleReschedule = async (date: string, time: string, reason: string) => {
    if (!rescheduleBookingId) return;
    setSubmitting(true);
    try {
      await api.put(`/bookings/${rescheduleBookingId}/reschedule`, {
        preferredDate: date,
        preferredTime: time || undefined,
        reason: reason || undefined,
      });
      toast.success(t('jobs.rescheduleSent'));
      setRescheduleBookingId(null);
      fetchJobs();
    } catch (error: any) {
      toast.error(error.response?.data?.message || t('jobs.failedToSendProposal'));
    } finally {
      setSubmitting(false);
    }
  };

  const handleReply = async (reviewId: string) => {
    if (!replyText.trim()) { toast.error(t('jobs.enterReply')); return; }
    setSubmitting(true);
    try {
      await api.put(`/reviews/${reviewId}/reply`, { reply: replyText });
      toast.success(t('jobs.replySubmitted'));
      setReplyingTo(null);
      setReplyText("");
      fetchJobs();
    } catch (error: any) {
      toast.error(error.response?.data?.message || t('jobs.failedToSubmitReply'));
    } finally {
      setSubmitting(false);
    }
  };

  const handleOpenChat = async (booking: Booking) => {
    try {
      const res = await api.get(`/chat/booking/${booking.id}`);
      router.push(`/dashboard/chat/${res.data.id}`);
    } catch (error: any) {
      toast.error(error.response?.data?.message || t('jobs.failedToOpenChat'));
    }
  };

  const newBookings = jobs.filter(j => j.status === 'PENDING');
  const filteredJobs = filter === 'ALL' ? jobs : jobs.filter(j => j.status === filter);
  const sortedJobs = [...filteredJobs].sort((a, b) => {
    const aNew = a.status === 'PENDING' && !acknowledged.has(a.id);
    const bNew = b.status === 'PENDING' && !acknowledged.has(b.id);
    if (aNew && !bNew) return -1;
    if (!aNew && bNew) return 1;
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  });

  const statusConfig: Record<string, { color: string; label: string }> = {
    PENDING: { color: "bg-amber-100 text-amber-700 border-amber-200", label: t('jobs.newRequest') },
    ACCEPTED: { color: "bg-blue-100 text-blue-700 border-blue-200", label: t('jobs.accepted') },
    REJECTED: { color: "bg-red-100 text-red-700 border-red-200", label: t('jobs.rejected') },
    ADVANCE_PAID: { color: "bg-purple-100 text-purple-700 border-purple-200", label: t('jobs.paymentReceived') },
    IN_PROGRESS: { color: "bg-indigo-100 text-indigo-700 border-indigo-200", label: t('jobs.inProgress') },
    COMPLETED: { color: "bg-green-100 text-green-700 border-green-200", label: t('jobs.completed') },
    CANCELLED: { color: "bg-red-100 text-red-700 border-red-200", label: t('jobs.cancelled') },
  };

  if (loading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-5xl">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 tracking-tight">{t('jobs.title')}</h1>
        <p className="text-gray-500 mt-1">{t('jobs.desc')}</p>
      </div>

      {/* New Bookings Section */}
      {newBookings.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <span className="relative flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-amber-500"></span>
              </span>
              <h2 className="text-xl font-bold text-gray-900">{t('jobs.newBookingRequests')}</h2>
            </div>
            <span className="px-3 py-1 text-sm font-bold rounded-full bg-amber-100 text-amber-700 border border-amber-200">
              {newBookings.length}
            </span>
          </div>

          <div className="grid gap-4">
            {newBookings.map(job => {
              const isNew = !acknowledged.has(job.id);
              return (
                <AnimatedSection key={job.id}>
                  <div className={`rounded-2xl border-2 p-5 transition-all ${
                    isNew
                      ? 'bg-gradient-to-r from-amber-50 via-orange-50 to-amber-50 border-amber-300 shadow-md shadow-amber-100'
                      : 'bg-white border-amber-200'
                  }`}>
                    <div className="flex flex-col lg:flex-row gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex flex-wrap items-center gap-2 mb-3">
                          {isNew && (
                            <span className="px-2.5 py-1 text-xs font-bold rounded-full bg-amber-500 text-white animate-pulse">
                              {t('jobs.newRequest')}
                            </span>
                          )}
                          <span className="px-3 py-1 text-xs font-bold rounded-full bg-amber-100 text-amber-700 border border-amber-200">
                            {t('bookings.pending')}
                          </span>
                        </div>

                         <h3 className="text-lg font-bold text-gray-900 mb-1">{job.customer?.fullName || t('jobs.customer')}</h3>
                        <p className="text-primary font-medium text-sm mb-2">{job.category?.name}</p>
                        <p className="text-gray-600 text-sm mb-3 line-clamp-2">{job.description}</p>

                        <div className="flex flex-wrap items-center gap-3 text-sm text-gray-500">
                          <span className="flex items-center gap-1"><HiOutlineLocationMarker className="w-4 h-4" /> {job.location}</span>
                          <span className="flex items-center gap-1"><HiOutlineCalendar className="w-4 h-4" /> {new Date(job.preferredDate).toLocaleDateString()} {job.preferredTime && `at ${job.preferredTime}`}</span>
                          {job.estimatedPrice && (
                            <span className="flex items-center gap-1 text-gray-900 font-bold"><HiOutlineCurrencyDollar className="w-4 h-4" /> LKR {job.estimatedPrice.toLocaleString()}</span>
                          )}
                        </div>
                      </div>

                      <div className="flex flex-col sm:flex-row lg:flex-col gap-2 lg:w-44 shrink-0">
                        <button
                          onClick={() => updateStatus(job.id, 'ACCEPTED')}
                          disabled={submitting}
                          className="flex items-center justify-center gap-2 px-5 py-2.5 bg-green-600 text-white font-semibold rounded-xl hover:bg-green-700 shadow-sm shadow-green-200 disabled:opacity-50 transition-colors"
                        >
                          <HiOutlineCheck className="w-5 h-5" /> {t('bookings.accept')}
                        </button>
                        <button
                          onClick={() => setRescheduleBookingId(job.id)}
                          disabled={submitting}
                          className="flex items-center justify-center gap-2 px-5 py-2.5 bg-blue-50 text-blue-600 font-semibold rounded-xl hover:bg-blue-100 border border-blue-200 disabled:opacity-50 transition-colors"
                        >
                          <HiOutlinePencilAlt className="w-5 h-5" /> {t('bookings.reschedule')}
                        </button>
                        <button
                          onClick={() => updateStatus(job.id, 'CANCELLED')}
                          disabled={submitting}
                          className="flex items-center justify-center gap-2 px-5 py-2.5 bg-red-50 text-red-600 font-semibold rounded-xl hover:bg-red-100 border border-red-200 disabled:opacity-50 transition-colors"
                        >
                          <HiOutlineX className="w-5 h-5" /> {t('bookings.cancel')}
                        </button>
                      </div>
                    </div>

                    <button
                      onClick={() => handleExpand(job.id)}
                      className="mt-4 flex items-center gap-1 text-sm text-primary font-medium hover:underline"
                    >
                      {expandedId === job.id ? <HiOutlineChevronUp className="w-4 h-4" /> : <HiOutlineChevronDown className="w-4 h-4" />}
                      {expandedId === job.id ? t('jobs.hideDetails') : t('jobs.viewFullDetails')}
                    </button>

                    {expandedId === job.id && (
                      <div className="mt-4 pt-4 border-t border-amber-200 space-y-4">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                         <div><p className="text-xs text-gray-500 uppercase font-medium">{t('jobs.customer')}</p><p className="font-semibold">{job.customer?.fullName || "N/A"}</p></div>
                           <div><p className="text-xs text-gray-500 uppercase font-medium">{t('jobs.service')}</p><p className="font-semibold">{job.category?.name || "N/A"}</p></div>
                           <div><p className="text-xs text-gray-500 uppercase font-medium">{t('jobs.date')}</p><p className="font-semibold">{new Date(job.preferredDate).toLocaleDateString()} {job.preferredTime && `at ${job.preferredTime}`}</p></div>
                           <div><p className="text-xs text-gray-500 uppercase font-medium">{t('jobs.location')}</p><p className="font-semibold">{job.location}</p></div>
                           {job.estimatedPrice && <div><p className="text-xs text-gray-500 uppercase font-medium">{t('jobs.estimatedPrice')}</p><p className="font-semibold">LKR {job.estimatedPrice.toLocaleString()}</p></div>}
                           {job.advanceAmount && <div><p className="text-xs text-gray-500 uppercase font-medium">{t('jobs.advance10')}</p><p className="font-semibold text-green-600">LKR {job.advanceAmount.toLocaleString()}</p></div>}
                        </div>
                         <div><p className="text-xs text-gray-500 uppercase font-medium mb-1">{t('jobs.description')}</p><p className="text-sm text-gray-700 bg-white p-3 rounded-xl border border-amber-100">{job.description}</p></div>
                      </div>
                    )}
                  </div>
                </AnimatedSection>
              );
            })}
          </div>
        </div>
      )}

      {/* Filter Tabs */}
      <div className="flex space-x-2 overflow-x-auto pb-2 -mx-1 px-1">
        {(['ALL','PENDING','ACCEPTED','ADVANCE_PAID','IN_PROGRESS','COMPLETED','CANCELLED'] as const).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all ${
              filter === f
                ? 'bg-primary text-white shadow-md shadow-primary/20'
                : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
            }`}
          >
            {f === 'ALL' ? t('jobs.allJobs') : f.replace(/_/g, ' ')}
            {f === 'PENDING' && newBookings.length > 0 && (
              <span className="ml-1.5 px-1.5 py-0.5 text-xs rounded-full bg-amber-500 text-white">{newBookings.length}</span>
            )}
          </button>
        ))}
      </div>

      {/* All Jobs */}
      <div className="space-y-4">
        {sortedJobs.length === 0 ? (
          <div className="bg-white p-16 text-center rounded-3xl border border-gray-100 shadow-sm">
            <HiOutlineBriefcase className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 font-medium">{t('jobs.noJobs')}</p>
          </div>
        ) : (
          sortedJobs.map(job => {
            const config = statusConfig[job.status] || statusConfig.PENDING;
            const isNew = job.status === 'PENDING' && !acknowledged.has(job.id);

            return (
              <AnimatedSection key={job.id}>
                <div className={`bg-white border rounded-2xl overflow-hidden transition-all ${
                  isNew ? 'border-amber-300 shadow-sm' : 'border-gray-100'
                }`}>
                  <div className="p-5">
                    <div className="flex flex-col lg:flex-row gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex flex-wrap items-center gap-2 mb-2">
                          {isNew && <span className="relative flex h-2.5 w-2.5"><span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span><span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-amber-500"></span></span>}
                           <h3 className="text-lg font-bold text-gray-900">{job.customer?.fullName || t('jobs.customer')}</h3>
                          <span className={`px-3 py-1 text-xs font-bold rounded-full border ${config.color}`}>{config.label}</span>
                          {isNew && <span className="px-2 py-0.5 text-xs font-bold rounded-full bg-amber-100 text-amber-700 animate-pulse">{t('jobs.newRequest')}</span>}
                          {job.payment && (
                            <span className={`px-3 py-1 text-xs font-bold rounded-full ${job.payment.paymentStatus === "COMPLETED" ? "bg-green-100 text-green-700 border border-green-200" : "bg-yellow-100 text-yellow-700 border border-yellow-200"}`}>
                              {job.payment.paymentStatus === "COMPLETED" ? t('bookings.paid') : t('bookings.paymentPending')}
                            </span>
                          )}
                        </div>

                        <p className="text-primary font-medium text-sm mb-2">{job.category?.name}</p>
                        <p className="text-gray-600 text-sm mb-3 line-clamp-2">{job.description}</p>

                        <div className="flex flex-wrap items-center gap-3 text-sm text-gray-500">
                          <span className="flex items-center gap-1"><HiOutlineLocationMarker className="w-4 h-4" /> {job.location}</span>
                          <span className="flex items-center gap-1"><HiOutlineCalendar className="w-4 h-4" /> {new Date(job.preferredDate).toLocaleDateString()} {job.preferredTime && `at ${job.preferredTime}`}</span>
                          {job.estimatedPrice && <span className="flex items-center gap-1 text-gray-900 font-bold"><HiOutlineCurrencyDollar className="w-4 h-4" /> LKR {job.estimatedPrice.toLocaleString()}</span>}
                        </div>
                      </div>

                      <div className="flex flex-wrap lg:flex-col gap-2 lg:w-44 shrink-0">
                        {job.status === 'PENDING' && (
                          <>
                            <button onClick={() => updateStatus(job.id, 'ACCEPTED')} disabled={submitting} className="flex items-center justify-center gap-2 px-4 py-2.5 bg-green-600 text-white font-medium rounded-xl hover:bg-green-700 shadow-sm disabled:opacity-50 transition-colors"><HiOutlineCheck className="w-4 h-4" /> {t('bookings.accept')}</button>
                            <button onClick={() => setRescheduleBookingId(job.id)} disabled={submitting} className="flex items-center justify-center gap-2 px-4 py-2.5 bg-blue-50 text-blue-600 font-medium rounded-xl hover:bg-blue-100 border border-blue-200 disabled:opacity-50 transition-colors"><HiOutlinePencilAlt className="w-4 h-4" /> {t('bookings.reschedule')}</button>
                            <button onClick={() => updateStatus(job.id, 'CANCELLED')} disabled={submitting} className="flex items-center justify-center gap-2 px-4 py-2.5 bg-red-50 text-red-600 font-medium rounded-xl hover:bg-red-100 border border-red-200 disabled:opacity-50 transition-colors"><HiOutlineX className="w-4 h-4" /> {t('bookings.cancel')}</button>
                          </>
                        )}
                        {job.status === 'ACCEPTED' && (
                          <>
                            <button onClick={() => updateStatus(job.id, 'IN_PROGRESS')} disabled={submitting} className="flex items-center justify-center gap-2 px-4 py-2.5 bg-blue-600 text-white font-medium rounded-xl hover:bg-blue-700 shadow-sm disabled:opacity-50 transition-colors"><HiOutlineClock className="w-4 h-4" /> {t('bookings.startJob')}</button>
                            <button onClick={() => setRescheduleBookingId(job.id)} disabled={submitting} className="flex items-center justify-center gap-2 px-4 py-2.5 bg-blue-50 text-blue-600 font-medium rounded-xl hover:bg-blue-100 border border-blue-200 disabled:opacity-50 transition-colors"><HiOutlinePencilAlt className="w-4 h-4" /> {t('bookings.reschedule')}</button>
                            <button onClick={() => updateStatus(job.id, 'CANCELLED')} disabled={submitting} className="flex items-center justify-center gap-2 px-4 py-2.5 bg-red-50 text-red-600 font-medium rounded-xl hover:bg-red-100 border border-red-200 disabled:opacity-50 transition-colors"><HiOutlineX className="w-4 h-4" /> {t('bookings.cancel')}</button>
                          </>
                        )}
                        {job.status === 'ADVANCE_PAID' && (
                          <button onClick={() => updateStatus(job.id, 'IN_PROGRESS')} disabled={submitting} className="flex items-center justify-center gap-2 px-4 py-2.5 bg-indigo-600 text-white font-medium rounded-xl hover:bg-indigo-700 shadow-sm disabled:opacity-50 transition-colors"><HiOutlineBriefcase className="w-4 h-4" /> {t('bookings.startWork')}</button>
                        )}
                        {job.status === 'IN_PROGRESS' && (
                          <>
                            <button onClick={() => updateStatus(job.id, 'COMPLETED')} disabled={submitting} className="flex items-center justify-center gap-2 px-4 py-2.5 bg-green-600 text-white font-medium rounded-xl hover:bg-green-700 shadow-sm disabled:opacity-50 transition-colors"><HiOutlineCheck className="w-4 h-4" /> {t('bookings.complete')}</button>
                            <button onClick={() => updateStatus(job.id, 'CANCELLED')} disabled={submitting} className="flex items-center justify-center gap-2 px-4 py-2.5 bg-red-50 text-red-600 font-medium rounded-xl hover:bg-red-100 border border-red-200 disabled:opacity-50 transition-colors"><HiOutlineX className="w-4 h-4" /> {t('bookings.cancel')}</button>
                          </>
                        )}

                        {isPaid(job) && (
                          <button onClick={() => handleOpenChat(job)} className="flex items-center justify-center gap-2 px-4 py-2.5 bg-primary/10 text-primary font-medium rounded-xl hover:bg-primary/20 transition-colors"><HiOutlineChatBubbleLeftRight className="w-4 h-4" /> {t('bookings.chat')}</button>
                        )}

                        <button onClick={() => handleExpand(job.id)} className="flex items-center justify-center gap-1 px-4 py-2 text-sm text-primary font-medium hover:underline">
                          {expandedId === job.id ? <HiOutlineChevronUp className="w-4 h-4" /> : <HiOutlineChevronDown className="w-4 h-4" />}
                           {expandedId === job.id ? t('jobs.hideDetails') : t('jobs.viewFullDetails')}
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Expanded Details */}
                  {expandedId === job.id && (
                    <div className="px-5 py-5 border-t border-gray-100 space-y-5">
                       <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                         <div><p className="text-xs text-gray-500 uppercase font-medium">{t('jobs.customer')}</p><p className="font-semibold">{job.customer?.fullName || "N/A"}</p></div>
                         <div><p className="text-xs text-gray-500 uppercase font-medium">{t('jobs.service')}</p><p className="font-semibold">{job.category?.name || "N/A"}</p></div>
                         <div><p className="text-xs text-gray-500 uppercase font-medium">{t('jobs.date')}</p><p className="font-semibold">{new Date(job.preferredDate).toLocaleDateString()} {job.preferredTime && `at ${job.preferredTime}`}</p></div>
                         <div><p className="text-xs text-gray-500 uppercase font-medium">{t('jobs.location')}</p><p className="font-semibold">{job.location}</p></div>
                         {job.estimatedPrice && <div><p className="text-xs text-gray-500 uppercase font-medium">{t('jobs.estimatedPrice')}</p><p className="font-semibold">LKR {job.estimatedPrice.toLocaleString()}</p></div>}
                         {job.advanceAmount && <div><p className="text-xs text-gray-500 uppercase font-medium">{t('jobs.advance10')}</p><p className="font-semibold text-green-600">LKR {job.advanceAmount.toLocaleString()}</p></div>}
                      </div>

                       <div><p className="text-xs text-gray-500 uppercase font-medium mb-1">{t('jobs.description')}</p><p className="text-sm text-gray-700 bg-gray-50 p-4 rounded-xl">{job.description}</p></div>

                      {/* Contact Details (after payment) */}
                      {isPaid(job) && (
                        <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-xl p-5">
                          <div className="flex items-center gap-2 mb-4">
                            <HiOutlinePhone className="w-5 h-5 text-green-600" />
                             <p className="text-sm font-bold text-green-800 uppercase tracking-wider">{t('jobs.customerContactDetails')}</p>
                          </div>
                          {loadingContact[job.id] ? (
                            <div className="flex items-center gap-2 text-green-600"><div className="animate-spin rounded-full h-4 w-4 border-b-2 border-green-600"></div><span className="text-sm">{t('common.loading')}</span></div>
                          ) : contactInfo[job.id] ? (
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                              <div className="flex items-center gap-3">
                                <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center"><HiOutlineUser className="w-4 h-4 text-green-600" /></div>
                                <div><p className="text-xs text-green-600">{t('bookings.fullName')}</p><p className="text-sm font-semibold text-gray-900">{contactInfo[job.id].fullName}</p></div>
                              </div>
                              {contactInfo[job.id].phoneNumber && (
                                <div className="flex items-center gap-3">
                                  <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center"><HiOutlinePhone className="w-4 h-4 text-green-600" /></div>
                                  <div><p className="text-xs text-green-600">{t('bookings.mobile')}</p><p className="text-sm font-semibold text-gray-900">{contactInfo[job.id].phoneNumber}</p></div>
                                </div>
                              )}
                              {contactInfo[job.id].email && (
                                <div className="flex items-center gap-3">
                                  <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center"><HiOutlineEnvelope className="w-4 h-4 text-green-600" /></div>
                                  <div><p className="text-xs text-green-600">{t('bookings.emailLabel')}</p><p className="text-sm font-semibold text-gray-900">{contactInfo[job.id].email}</p></div>
                                </div>
                              )}
                            </div>
                          ) : (
                             <p className="text-sm text-green-600">{t('jobs.contactDetailsAppear')}</p>
                          )}
                        </div>
                      )}

                      {/* Payment Info */}
                      {job.payment && (
                        <div>
                           <p className="text-xs text-gray-500 uppercase font-medium mb-2">{t('jobs.paymentInfo')}</p>
                          <div className="bg-gray-50 rounded-xl p-4 grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm">
                            <div><p className="text-gray-500">{t('jobs.amount')}</p><p className="font-semibold">LKR {job.payment.amount.toLocaleString()}</p></div>
                            <div><p className="text-gray-500">{t('jobs.status')}</p><p className={`font-semibold ${job.payment.paymentStatus === 'COMPLETED' ? 'text-green-600' : 'text-amber-600'}`}>{job.payment.paymentStatus}</p></div>
                            {job.payment.transactionId && <div><p className="text-gray-500">{t('jobs.transactionId')}</p><p className="font-semibold font-mono text-xs">{job.payment.transactionId}</p></div>}
                          </div>
                        </div>
                      )}

                      {/* Reschedule Info */}
                      {job.rescheduledDate && (
                        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                           <p className="text-xs font-bold text-blue-700 uppercase tracking-wider mb-2">{t('jobs.rescheduleInfo')}</p>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                            <div><p className="text-blue-600">{t('jobs.newDate')}</p><p className="font-semibold">{new Date(job.rescheduledDate).toLocaleDateString()}</p></div>
                            {job.rescheduledTime && <div><p className="text-blue-600">{t('jobs.newTime')}</p><p className="font-semibold">{job.rescheduledTime}</p></div>}
                            {job.rescheduleReason && <div className="sm:col-span-2"><p className="text-blue-600">{t('jobs.reason')}</p><p className="font-semibold">{job.rescheduleReason}</p></div>}
                          </div>
                        </div>
                      )}

                      {/* Customer Review */}
                      {job.review && (
                        <div>
                           <p className="text-xs text-gray-500 uppercase font-medium mb-2">{t('jobs.customerReview')}</p>
                          <div className="bg-orange-50 border border-orange-200 p-4 rounded-xl">
                            <div className="flex items-center gap-1 mb-2">
                              {Array.from({length: 5}).map((_, i) => (
                                <span key={i} className={i < job.review!.rating ? "text-orange-500" : "text-gray-300"}>★</span>
                              ))}
                              <span className="text-sm text-gray-500 ml-2">{job.review.rating}/5</span>
                            </div>
                            {job.review.comment && <p className="text-sm text-gray-700 italic">&ldquo;{job.review.comment}&rdquo;</p>}
                          </div>

                          {job.review.reply ? (
                            <div className="mt-3 ml-4 pl-4 border-l-2 border-primary/20">
                               <p className="text-xs font-bold text-primary mb-1">{t('jobs.yourReply')}</p>
                              <p className="text-sm text-gray-700">{job.review.reply}</p>
                            </div>
                          ) : (
                            <div className="mt-3">
                              {replyingTo === job.review.id ? (
                                <div className="ml-4 pl-4 border-l-2 border-primary/20 space-y-2">
                                  <textarea
                                    value={replyText}
                                    onChange={(e) => setReplyText(e.target.value)}
                                     placeholder={t('jobs.writeReplyPlaceholder')}
                                    rows={2}
                                    className="w-full px-3 py-2 rounded-xl border border-gray-200 focus:ring-2 focus:ring-primary/20 outline-none text-sm"
                                  />
                                  <div className="flex gap-2">
                                     <button onClick={() => handleReply(job.review!.id)} disabled={submitting || !replyText.trim()} className="px-4 py-1.5 bg-primary text-white text-xs font-medium rounded-lg hover:bg-primary-hover disabled:opacity-50">
                                       {submitting ? t('jobs.submitting') : t('jobs.submit')}
                                     </button>
                                    <button onClick={() => { setReplyingTo(null); setReplyText(""); }} className="px-4 py-1.5 text-xs text-gray-600 hover:bg-gray-100 rounded-lg">{t('common.cancel')}</button>
                                  </div>
                                </div>
                              ) : (
                                 <button onClick={() => setReplyingTo(job.review!.id)} className="flex items-center gap-1 text-xs font-medium text-primary hover:underline">
                                   <HiOutlineChatBubbleLeftRight className="w-3 h-3" /> {t('jobs.replyToReview')}
                                 </button>
                              )}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </AnimatedSection>
            );
          })
        )}
      </div>

      <RescheduleModal
        isOpen={!!rescheduleBookingId}
        onClose={() => setRescheduleBookingId(null)}
        onConfirm={handleReschedule}
        submitting={submitting}
        bookingId={rescheduleBookingId || ""}
        currentDate={jobs.find(j => j.id === rescheduleBookingId)?.preferredDate}
        currentTime={jobs.find(j => j.id === rescheduleBookingId)?.preferredTime}
      />
    </div>
  );
}
