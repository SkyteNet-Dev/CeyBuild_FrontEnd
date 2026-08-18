"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import api from "@/lib/axios";
import toast from "react-hot-toast";
import { useI18n } from "@/i18n/I18nProvider";
import {
  HiOutlineArrowLeft,
  HiOutlineOfficeBuilding,
  HiOutlineCurrencyDollar,
  HiOutlineCalendar,
  HiOutlineStar,
  HiOutlineCheck,
  HiOutlineUser,
  HiOutlinePhotograph,
  HiOutlineClock,
  HiOutlineBriefcase,
} from "react-icons/hi";
import { HiOutlineChatBubbleLeftRight } from "react-icons/hi2";

type Quotation = {
  id: string;
  quotedAmount: number;
  estimatedDuration: string;
  availableDate?: string;
  message: string;
  includedServices?: string;
  excludedServices?: string;
  status: string;
  createdAt: string;
  worker: {
    id: string;
    userId: string;
    experienceYears: number;
    district: string;
    city: string;
    user: { id: string; fullName: string; profileImage?: string };
    avgRating: number;
    totalReviews: number;
    totalJobsCompleted: number;
  };
};

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
  images: string[];
  requirements?: string;
  category: { id: string; name: string };
  createdAt: string;
};

type SortKey = "RECOMMENDED" | "LOWEST_PRICE" | "HIGHEST_RATING" | "FASTEST";

export default function CustomerQuotesPage() {
  const router = useRouter();
  const params = useParams();
  const { t } = useI18n();
  const jobId = params.id as string;

  const [job, setJob] = useState<JobRequest | null>(null);
  const [quotations, setQuotations] = useState<Quotation[]>([]);
  const [loading, setLoading] = useState(true);
  const [selecting, setSelecting] = useState<string | null>(null);
  const [converting, setConverting] = useState(false);
  const [sort, setSort] = useState<SortKey>("RECOMMENDED");
  const [confirmSelect, setConfirmSelect] = useState<Quotation | null>(null);

  useEffect(() => {
    fetchData();
  }, [jobId]);

  const fetchData = async () => {
    try {
      const res = await api.get(`/quotations/job/${jobId}`);
      setJob(res.data.jobRequest);
      setQuotations(res.data.quotations);
    } catch (err: any) {
      if (err.response?.status === 403) {
        toast.error("Access denied");
        router.back();
        return;
      }
      toast.error("Failed to load quotations");
    } finally {
      setLoading(false);
    }
  };

  const sortedQuotations = [...quotations].sort((a, b) => {
    if (sort === "LOWEST_PRICE") return Number(a.quotedAmount) - Number(b.quotedAmount);
    if (sort === "HIGHEST_RATING") return b.worker.avgRating - a.worker.avgRating;
    if (sort === "FASTEST") {
      const parseDuration = (d: string) => {
        const num = parseInt(d.replace(/[^0-9]/g, ""));
        return d.toLowerCase().includes("hour") ? num / 24 : d.toLowerCase().includes("week") ? num * 7 : num;
      };
      return parseDuration(a.estimatedDuration) - parseDuration(b.estimatedDuration);
    }
    // RECOMMENDED: weighted score
    const scoreA = a.worker.avgRating * 20 + a.worker.totalJobsCompleted * 0.5 + (100 - Number(a.quotedAmount) / 100);
    const scoreB = b.worker.avgRating * 20 + b.worker.totalJobsCompleted * 0.5 + (100 - Number(b.quotedAmount) / 100);
    return scoreB - scoreA;
  });

  const handleSelectWorker = async () => {
    if (!confirmSelect) return;
    setSelecting(confirmSelect.id);
    try {
      await api.put(`/quotations/${jobId}/select`, { quotationId: confirmSelect.id });
      toast.success("Worker selected!");
      setConfirmSelect(null);
      fetchData();
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to select worker");
    } finally {
      setSelecting(null);
    }
  };

  const handleConvertToBooking = async () => {
    setConverting(true);
    try {
      const res = await api.put(`/quotations/${jobId}/convert-to-booking`);
      toast.success("Booking created!");
      router.push(`/dashboard/bookings`);
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to create booking");
    } finally {
      setConverting(false);
    }
  };

  if (loading) {
    return (
      <div className="text-center py-20">
        <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!job) return null;

  return (
    <div className="max-w-4xl mx-auto">
      <button onClick={() => router.back()} className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6">
        <HiOutlineArrowLeft className="w-5 h-5" /> Back
      </button>

      <div className="bg-white rounded-2xl p-6 border border-gray-100 mb-6">
        <div className="flex items-center gap-3 mb-3">
          <h1 className="text-2xl font-bold text-gray-900">{job.title}</h1>
          <span className="px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-700">
            {job.status.replace(/_/g, " ")}
          </span>
        </div>

        <div className="flex flex-wrap gap-4 text-sm text-gray-500">
          <span className="flex items-center gap-1"><HiOutlineOfficeBuilding className="w-4 h-4" /> {job.category.name}</span>
          <span className="flex items-center gap-1">📍 {job.location}{job.city ? `, ${job.city}` : ""}</span>
          {job.budgetMin && job.budgetMax && (
            <span className="flex items-center gap-1">
              <HiOutlineCurrencyDollar className="w-4 h-4" />
              Rs.{Number(job.budgetMin).toLocaleString()} – Rs.{Number(job.budgetMax).toLocaleString()}
            </span>
          )}
          {job.preferredDate && (
            <span className="flex items-center gap-1">
              <HiOutlineCalendar className="w-4 h-4" />
              {new Date(job.preferredDate).toLocaleDateString()}
            </span>
          )}
        </div>
      </div>

      {job.status === "WORKER_SELECTED" && (
        <div className="bg-purple-50 border border-purple-200 rounded-2xl p-4 mb-6">
          <p className="text-purple-800 font-semibold mb-2">Worker Selected</p>
          <button
            onClick={handleConvertToBooking}
            disabled={converting}
            className="bg-purple-600 text-white px-6 py-2.5 rounded-xl font-medium hover:bg-purple-700 disabled:opacity-50"
          >
            {converting ? "Creating Booking..." : "Convert to Booking"}
          </button>
        </div>
      )}

      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-semibold text-gray-900">
          {quotations.length} Quote{quotations.length !== 1 ? "s" : ""} Received
        </h2>
        <div className="flex gap-2">
          {(["RECOMMENDED", "LOWEST_PRICE", "HIGHEST_RATING", "FASTEST"] as SortKey[]).map((s) => (
            <button
              key={s}
              onClick={() => setSort(s)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                sort === s ? "bg-primary text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              {s === "RECOMMENDED" ? "⭐ Recommended" : s === "LOWEST_PRICE" ? "💰 Lowest" : s === "HIGHEST_RATING" ? "🏆 Rating" : "⚡ Fastest"}
            </button>
          ))}
        </div>
      </div>

      {quotations.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-2xl">
          <HiOutlineClock className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-700 mb-2">No quotations yet</h3>
          <p className="text-gray-500">Workers will submit quotations soon. Check back later.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {sortedQuotations.map((q, idx) => (
            <div
              key={q.id}
              className={`bg-white rounded-2xl p-6 border transition-all ${
                q.status === "ACCEPTED" ? "border-green-300 bg-green-50" :
                q.status === "REJECTED" ? "border-red-200 opacity-60" :
                q.status === "EXPIRED" ? "border-gray-200 opacity-50" :
                "border-gray-100 hover:border-primary/20"
              }`}
            >
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center shrink-0 overflow-hidden">
                  {q.worker.user.profileImage ? (
                    <img src={q.worker.user.profileImage} alt="" className="w-full h-full object-cover" />
                  ) : (
                    <HiOutlineUser className="w-6 h-6 text-primary" />
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-semibold text-gray-900">{q.worker.user.fullName}</h3>
                    {idx === 0 && sort === "RECOMMENDED" && (
                      <span className="px-2 py-0.5 bg-yellow-100 text-yellow-700 text-xs font-medium rounded-full">⭐ Recommended</span>
                    )}
                    {q.status === "ACCEPTED" && (
                      <span className="px-2 py-0.5 bg-green-100 text-green-700 text-xs font-medium rounded-full">✓ Accepted</span>
                    )}
                    {q.status === "REJECTED" && (
                      <span className="px-2 py-0.5 bg-red-100 text-red-700 text-xs font-medium rounded-full">Not Selected</span>
                    )}
                  </div>

                  <div className="flex items-center gap-3 text-sm text-gray-500 mb-3">
                    <span className="flex items-center gap-1">
                      <HiOutlineStar className="w-4 h-4 text-yellow-500" />
                      {q.worker.avgRating} ({q.worker.totalReviews})
                    </span>
                    <span className="flex items-center gap-1">
                      <HiOutlineBriefcase className="w-4 h-4" />
                      {q.worker.totalJobsCompleted} jobs
                    </span>
                    <span>{q.worker.experienceYears}yr exp</span>
                    <span>📍 {q.worker.district}</span>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
                    <div className="bg-gray-50 rounded-xl p-3">
                      <p className="text-xs text-gray-500">Quote</p>
                      <p className="text-lg font-bold text-primary">Rs.{Number(q.quotedAmount).toLocaleString()}</p>
                    </div>
                    <div className="bg-gray-50 rounded-xl p-3">
                      <p className="text-xs text-gray-500">Duration</p>
                      <p className="text-lg font-bold text-gray-900">{q.estimatedDuration}</p>
                    </div>
                    {q.availableDate && (
                      <div className="bg-gray-50 rounded-xl p-3">
                        <p className="text-xs text-gray-500">Available From</p>
                        <p className="text-sm font-semibold text-gray-900">{new Date(q.availableDate).toLocaleDateString()}</p>
                      </div>
                    )}
                    <div className="bg-gray-50 rounded-xl p-3">
                      <p className="text-xs text-gray-500">Status</p>
                      <p className={`text-sm font-semibold ${q.status === "ACCEPTED" ? "text-green-600" : q.status === "REJECTED" ? "text-red-600" : q.status === "EXPIRED" ? "text-gray-500" : "text-blue-600"}`}>
                        {q.status}
                      </p>
                    </div>
                  </div>

                  <p className="text-gray-600 text-sm mb-3 whitespace-pre-wrap">{q.message}</p>

                  {q.includedServices && (
                    <p className="text-sm text-green-700 mb-1"><span className="font-medium">Included:</span> {q.includedServices}</p>
                  )}
                  {q.excludedServices && (
                    <p className="text-sm text-red-600 mb-3"><span className="font-medium">Excluded:</span> {q.excludedServices}</p>
                  )}

                  {q.status === "PENDING" && job.status !== "WORKER_SELECTED" && job.status !== "BOOKED" && (
                    <div className="flex gap-3 mt-4">
                      <button
                        onClick={() => router.push(`/dashboard/chat/${q.worker.userId}`)}
                        className="flex items-center gap-2 px-4 py-2 border border-gray-200 rounded-xl text-sm font-medium text-gray-700 hover:bg-gray-50"
                      >
                        <HiOutlineChatBubbleLeftRight className="w-4 h-4" /> Chat
                      </button>
                      <button
                        onClick={() => setConfirmSelect(q)}
                        className="flex items-center gap-2 px-5 py-2 bg-primary text-white rounded-xl text-sm font-medium hover:bg-primary/90"
                      >
                        <HiOutlineCheck className="w-4 h-4" /> Select Worker
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {confirmSelect && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Confirm Selection</h3>
            <p className="text-gray-600 mb-4">
              You are about to select <strong>{confirmSelect.worker.user.fullName}</strong> for <strong>Rs.{Number(confirmSelect.quotedAmount).toLocaleString()}</strong>.
            </p>
            <div className="bg-gray-50 rounded-xl p-4 mb-6 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Duration:</span>
                <span className="font-medium">{confirmSelect.estimatedDuration}</span>
              </div>
              {confirmSelect.availableDate && (
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Available From:</span>
                  <span className="font-medium">{new Date(confirmSelect.availableDate).toLocaleDateString()}</span>
                </div>
              )}
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setConfirmSelect(null)}
                className="flex-1 px-4 py-3 border border-gray-200 rounded-xl font-medium text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleSelectWorker}
                disabled={selecting === confirmSelect.id}
                className="flex-1 px-4 py-3 bg-primary text-white rounded-xl font-medium hover:bg-primary/90 disabled:opacity-50"
              >
                {selecting === confirmSelect.id ? "Selecting..." : "Confirm Selection"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
