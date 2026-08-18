"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import api from "@/lib/axios";
import toast from "react-hot-toast";
import { useI18n } from "@/i18n/I18nProvider";
import AnimatedSection from "@/components/AnimatedSection";
import {
  HiOutlineArrowLeft,
  HiOutlineOfficeBuilding,
  HiOutlineCurrencyDollar,
  HiOutlineCalendar,
  HiOutlinePhotograph,
  HiOutlineCheck,
  HiOutlineClock,
  HiOutlineExclamationCircle,
  HiOutlineLocationMarker,
  HiOutlineClipboardCheck,
} from "react-icons/hi";

type JobRequest = {
  id: string;
  title: string;
  description: string;
  status: string;
  budgetMin?: number;
  budgetMax?: number;
  preferredDate?: string;
  preferredTime?: string;
  location: string;
  city?: string;
  province?: string;
  district?: string;
  images: string[];
  requirements?: string;
  category: { id: string; name: string };
  createdAt: string;
};

type MyQuotation = {
  id: string;
  quotedAmount: number;
  estimatedDuration: string;
  message: string;
  status: string;
  createdAt: string;
};

const statusColors: Record<string, string> = {
  OPEN: "bg-blue-50 text-blue-700 border border-blue-200",
  QUOTING: "bg-amber-50 text-amber-700 border border-amber-200",
  WORKER_SELECTED: "bg-purple-50 text-purple-700 border border-purple-200",
  BOOKED: "bg-indigo-50 text-indigo-700 border border-indigo-200",
  IN_PROGRESS: "bg-orange-50 text-orange-700 border border-orange-200",
  COMPLETED: "bg-emerald-50 text-emerald-700 border border-emerald-200",
  CANCELLED: "bg-red-50 text-red-700 border border-red-200",
  EXPIRED: "bg-gray-50 text-gray-500 border border-gray-200",
};

const quoteStatusColors: Record<string, { bg: string; border: string; icon: React.ReactNode; label: string }> = {
  ACCEPTED: { bg: "bg-emerald-50", border: "border-emerald-200", icon: <HiOutlineCheck className="w-5 h-5 text-emerald-600" />, label: "quoteAccepted" },
  REJECTED: { bg: "bg-red-50", border: "border-red-200", icon: <HiOutlineExclamationCircle className="w-5 h-5 text-red-600" />, label: "quoteRejected" },
  EXPIRED: { bg: "bg-gray-50", border: "border-gray-200", icon: <HiOutlineClock className="w-5 h-5 text-gray-500" />, label: "quoteExpired" },
  PENDING: { bg: "bg-blue-50", border: "border-blue-200", icon: <HiOutlineClock className="w-5 h-5 text-blue-600" />, label: "waitForResponse" },
};

export default function WorkerQuotePage() {
  const router = useRouter();
  const params = useParams();
  const { t } = useI18n();
  const jobId = params.id as string;

  const [job, setJob] = useState<JobRequest | null>(null);
  const [myQuote, setMyQuote] = useState<MyQuotation | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const [form, setForm] = useState({
    quotedAmount: "",
    estimatedDuration: "",
    availableDate: "",
    message: "",
    includedServices: "",
    excludedServices: "",
  });

  useEffect(() => {
    fetchData();
  }, [jobId]);

  const fetchData = async () => {
    try {
      const [jobRes, quoteRes] = await Promise.all([
        api.get(`/job-requests/${jobId}`),
        api.get(`/quotations/job/${jobId}/my`),
      ]);
      setJob(jobRes.data);
      setMyQuote(quoteRes.data.myQuotation);
    } catch (err: any) {
      if (err.response?.status === 403) {
        toast.error(t("jobRequests.noAccess"));
        router.back();
        return;
      }
      toast.error(t("jobRequests.failedToLoadJob"));
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.quotedAmount || Number(form.quotedAmount) <= 0) return toast.error(t("jobRequests.enterValidPrice"));
    if (!form.estimatedDuration.trim()) return toast.error(t("jobRequests.durationRequired"));
    if (!form.message.trim()) return toast.error(t("jobRequests.messageRequired"));

    setSubmitting(true);
    try {
      await api.post(`/quotations/${jobId}`, {
        quotedAmount: Number(form.quotedAmount),
        estimatedDuration: form.estimatedDuration,
        availableDate: form.availableDate || undefined,
        message: form.message,
        includedServices: form.includedServices || undefined,
        excludedServices: form.excludedServices || undefined,
      });
      toast.success(t("jobRequests.quoteSubmitted"));
      fetchData();
    } catch (err: any) {
      toast.error(err.response?.data?.message || t("jobRequests.failedToLoadJob"));
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!job) return null;

  const isExpired = job.status === "EXPIRED" || job.status === "CANCELLED" || job.status === "BOOKED" || job.status === "IN_PROGRESS" || job.status === "COMPLETED";
  const canQuote = !isExpired && !myQuote;

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Back button */}
      <AnimatedSection>
        <button
          onClick={() => router.back()}
          className="inline-flex items-center gap-2 text-gray-500 hover:text-gray-900 font-medium transition-colors"
        >
          <HiOutlineArrowLeft className="w-5 h-5" />
          {t("jobRequests.back")}
        </button>
      </AnimatedSection>

      {/* Quote Status Banner */}
      {myQuote && (
        <AnimatedSection delay={0.05}>
          <div className={`p-4 sm:p-5 rounded-2xl border ${quoteStatusColors[myQuote.status]?.bg || "bg-blue-50"} ${quoteStatusColors[myQuote.status]?.border || "border-blue-200"}`}>
            <div className="flex items-center gap-2.5 mb-1.5">
              {quoteStatusColors[myQuote.status]?.icon || <HiOutlineClock className="w-5 h-5 text-blue-600" />}
              <span className="font-bold text-gray-900">
                {t(`jobRequests.${quoteStatusColors[myQuote.status]?.label || "waitForResponse"}`)}
              </span>
            </div>
            <p className="text-sm text-gray-600 ml-7.5">
              {t("jobRequests.quotedLabel")}: Rs.{Number(myQuote.quotedAmount).toLocaleString()} | {t("jobRequests.durationLabel")}: {myQuote.estimatedDuration}
            </p>
          </div>
        </AnimatedSection>
      )}

      {/* Job Details Card */}
      <AnimatedSection delay={0.1}>
        <div className="bg-white rounded-2xl p-5 sm:p-6 border border-gray-100 card-shadow">
          {/* Title + Status */}
          <div className="flex items-center gap-3 mb-4 flex-wrap">
            <h1 className="text-xl sm:text-2xl font-extrabold text-gray-900">{job.title}</h1>
            <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold shrink-0 ${statusColors[job.status] || "bg-gray-50 text-gray-500 border border-gray-200"}`}>
              {job.status.replace(/_/g, " ")}
            </span>
          </div>

          {/* Description */}
          <p className="text-gray-600 mb-6 whitespace-pre-wrap leading-relaxed">{job.description}</p>

          {/* Info Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 text-sm">
            <div className="flex items-center gap-2.5 text-gray-600 bg-gray-50 rounded-xl px-3 py-2.5">
              <HiOutlineOfficeBuilding className="w-4 h-4 text-gray-400 shrink-0" />
              <span className="font-medium">{job.category.name}</span>
            </div>
            <div className="flex items-center gap-2.5 text-gray-600 bg-gray-50 rounded-xl px-3 py-2.5">
              <HiOutlineCurrencyDollar className="w-4 h-4 text-gray-400 shrink-0" />
              <span className="font-medium">
                {job.budgetMin && job.budgetMax
                  ? `Rs.${Number(job.budgetMin).toLocaleString()} – Rs.${Number(job.budgetMax).toLocaleString()}`
                  : t("jobRequests.budgetNotSpecified")}
              </span>
            </div>
            <div className="flex items-center gap-2.5 text-gray-600 bg-gray-50 rounded-xl px-3 py-2.5">
              <HiOutlineLocationMarker className="w-4 h-4 text-gray-400 shrink-0" />
              <span className="font-medium truncate">{job.location}{job.city ? `, ${job.city}` : ""}</span>
            </div>
            {job.preferredDate && (
              <div className="flex items-center gap-2.5 text-gray-600 bg-gray-50 rounded-xl px-3 py-2.5">
                <HiOutlineCalendar className="w-4 h-4 text-gray-400 shrink-0" />
                <span className="font-medium">
                  {new Date(job.preferredDate).toLocaleDateString()}
                  {job.preferredTime && ` • ${job.preferredTime}`}
                </span>
              </div>
            )}
          </div>

          {/* Requirements */}
          {job.requirements && (
            <div className="mt-4 p-4 bg-amber-50 rounded-xl border border-amber-100">
              <p className="text-sm font-bold text-amber-800 mb-1">{t("jobRequests.requirementsLabel")}</p>
              <p className="text-sm text-amber-700">{job.requirements}</p>
            </div>
          )}

          {/* Photos */}
          {job.images.length > 0 && (
            <div className="mt-4">
              <p className="text-sm font-bold text-gray-700 mb-2.5 flex items-center gap-1.5">
                <HiOutlinePhotograph className="w-4 h-4 text-gray-400" />
                {t("jobRequests.photosLabel")} ({job.images.length})
              </p>
              <div className="flex gap-2 overflow-x-auto pb-2">
                {job.images.map((url, idx) => (
                  <img
                    key={idx}
                    src={url}
                    alt=""
                    className="w-20 h-20 rounded-xl object-cover border border-gray-200 shrink-0 hover:scale-105 transition-transform"
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      </AnimatedSection>

      {/* Quote Form */}
      {canQuote && (
        <AnimatedSection delay={0.15}>
          <form onSubmit={handleSubmit} className="bg-white rounded-2xl p-5 sm:p-6 border border-gray-100 card-shadow space-y-5">
            <h2 className="text-lg font-extrabold text-gray-900">{t("jobRequests.submitQuote")}</h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">{t("jobRequests.quotedPrice")} *</label>
                <input
                  name="quotedAmount"
                  type="number"
                  value={form.quotedAmount}
                  onChange={handleChange}
                  placeholder="45,000"
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">{t("jobRequests.estimatedDuration")} *</label>
                <input
                  name="estimatedDuration"
                  value={form.estimatedDuration}
                  onChange={handleChange}
                  placeholder={t("jobRequests.durationPlaceholder")}
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">{t("jobRequests.availableFrom")}</label>
              <input
                name="availableDate"
                type="date"
                value={form.availableDate}
                onChange={handleChange}
                className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">{t("jobRequests.proposal")} *</label>
              <textarea
                name="message"
                value={form.message}
                onChange={handleChange}
                rows={4}
                placeholder={t("jobRequests.proposalPlaceholder")}
                className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary resize-none transition-all"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">{t("jobRequests.includedServices")}</label>
                <textarea
                  name="includedServices"
                  value={form.includedServices}
                  onChange={handleChange}
                  rows={2}
                  placeholder={t("jobRequests.proposalPlaceholder")}
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary resize-none transition-all"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">{t("jobRequests.excludedServices")}</label>
                <textarea
                  name="excludedServices"
                  value={form.excludedServices}
                  onChange={handleChange}
                  rows={2}
                  placeholder={t("jobRequests.proposalPlaceholder")}
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary resize-none transition-all"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full bg-primary text-white py-3 rounded-xl font-bold hover:bg-primary-hover transition-all disabled:opacity-50 shadow-md shadow-primary/15"
            >
              {submitting ? t("jobRequests.submitting") : t("jobRequests.submitQuote")}
            </button>
          </form>
        </AnimatedSection>
      )}

      {/* Cannot Quote */}
      {!canQuote && !myQuote && (
        <AnimatedSection delay={0.15}>
          <div className="bg-gray-50 rounded-2xl p-8 text-center border border-gray-100">
            <div className="w-14 h-14 rounded-2xl bg-gray-100 flex items-center justify-center mx-auto mb-4">
              <HiOutlineExclamationCircle className="w-7 h-7 text-gray-400" />
            </div>
            <p className="text-gray-600 font-semibold">{t("jobRequests.noLongerAccepting")}</p>
          </div>
        </AnimatedSection>
      )}
    </div>
  );
}
