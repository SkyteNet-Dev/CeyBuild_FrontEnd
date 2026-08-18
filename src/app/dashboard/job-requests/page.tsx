"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import api from "@/lib/axios";
import toast from "react-hot-toast";
import { useAuth } from "@/contexts/AuthContext";
import { useI18n } from "@/i18n/I18nProvider";
import AnimatedSection from "@/components/AnimatedSection";
import {
  HiOutlinePlus,
  HiOutlineClipboardCheck,
  HiOutlineClock,
  HiOutlineCheckCircle,
  HiOutlineXCircle,
  HiOutlineOfficeBuilding,
  HiOutlineCalendar,
  HiOutlineCurrencyDollar,
  HiOutlineEye,
  HiOutlineLocationMarker,
  HiOutlinePhotograph,
} from "react-icons/hi";
import { HiOutlineChatBubbleLeftRight } from "react-icons/hi2";

type JobRequest = {
  id: string;
  title: string;
  description: string;
  status: string;
  budgetMin?: number;
  budgetMax?: number;
  preferredDate?: string;
  location: string;
  city?: string;
  images: string[];
  category: { id: string; name: string };
  quotations: { id: string; status: string; quotedAmount?: number; workerId: string }[];
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

const statusDots: Record<string, string> = {
  OPEN: "bg-blue-500",
  QUOTING: "bg-amber-500",
  WORKER_SELECTED: "bg-purple-500",
  BOOKED: "bg-indigo-500",
  IN_PROGRESS: "bg-orange-500",
  COMPLETED: "bg-emerald-500",
  CANCELLED: "bg-red-500",
  EXPIRED: "bg-gray-400",
};

const FILTERS = ["ALL", "OPEN", "QUOTING", "WORKER_SELECTED", "BOOKED", "COMPLETED", "CANCELLED", "EXPIRED"];

export default function JobRequestsPage() {
  const router = useRouter();
  const { role } = useAuth();
  const { t } = useI18n();
  const [jobs, setJobs] = useState<JobRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("ALL");
  const [stats, setStats] = useState<any>(null);

  const isWorker = role === "worker";

  useEffect(() => {
    fetchData();
  }, [filter]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const params: any = { limit: 50 };
      if (filter !== "ALL") params.status = filter;

      const [jobsRes, statsRes] = await Promise.all([
        api.get("/job-requests", { params }),
        api.get("/job-requests/stats"),
      ]);
      setJobs(jobsRes.data.jobs);
      setStats(statsRes.data);
    } catch (err) {
      toast.error(t("jobRequests.failedToLoad"));
    } finally {
      setLoading(false);
    }
  };

  const formatBudget = (min?: number, max?: number) => {
    if (!min && !max) return t("jobRequests.budgetNotSpecified");
    if (min && max) return `Rs.${min.toLocaleString()} – Rs.${max.toLocaleString()}`;
    if (min) return `${t("jobRequests.fromBudget")} Rs.${min.toLocaleString()}`;
    return `${t("jobRequests.upToBudget")} Rs.${max!.toLocaleString()}`;
  };

  const timeAgo = (date: string) => {
    const diff = Date.now() - new Date(date).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 60) return `${mins}m`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `${hours}h`;
    const days = Math.floor(hours / 24);
    return `${days}d`;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <AnimatedSection>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900">
              {t("jobRequests.title")}
            </h1>
            <p className="text-gray-500 mt-1 text-sm sm:text-base">
              {isWorker ? t("jobRequests.workerSubtitle") : t("jobRequests.customerSubtitle")}
            </p>
          </div>
          {!isWorker && (
            <button
              onClick={() => router.push("/dashboard/job-requests/new")}
              className="inline-flex items-center gap-2 bg-primary text-white px-5 py-2.5 rounded-xl font-semibold hover:bg-primary-hover transition-colors shadow-md shadow-primary/15 shrink-0"
            >
              <HiOutlinePlus className="w-5 h-5" />
              {t("jobRequests.postJob")}
            </button>
          )}
        </div>
      </AnimatedSection>

      {/* Stats */}
      {stats && (
        <AnimatedSection delay={0.05}>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4">
            {isWorker ? (
              <>
                <StatCard label={t("jobRequests.openOpportunities")} value={stats.openOpportunities} icon={<HiOutlineClipboardCheck className="w-5 h-5" />} color="bg-blue-500" />
                <StatCard label={t("jobRequests.quotesSubmitted")} value={stats.quotesSubmitted} icon={<HiOutlineClock className="w-5 h-5" />} color="bg-amber-500" />
                <StatCard label={t("jobRequests.quotesAccepted")} value={stats.quotesAccepted} icon={<HiOutlineCheckCircle className="w-5 h-5" />} color="bg-emerald-500" />
                <StatCard label={t("jobRequests.successRate")} value={`${stats.successRate}%`} icon={<HiOutlineOfficeBuilding className="w-5 h-5" />} color="bg-violet-500" />
                <StatCard label={t("jobRequests.jobsCompleted")} value={stats.totalJobsCompleted} icon={<HiOutlineCheckCircle className="w-5 h-5" />} color="bg-green-500" />
              </>
            ) : (
              <>
                <StatCard label={t("jobRequests.activeRequests")} value={stats.activeRequests} icon={<HiOutlineClipboardCheck className="w-5 h-5" />} color="bg-blue-500" />
                <StatCard label={t("jobRequests.quotesReceived")} value={stats.quotesReceived} icon={<HiOutlineChatBubbleLeftRight className="w-5 h-5" />} color="bg-amber-500" />
                <StatCard label={t("jobRequests.bookedJobs")} value={stats.bookedJobs} icon={<HiOutlineCalendar className="w-5 h-5" />} color="bg-indigo-500" />
                <StatCard label={t("jobRequests.jobsCompleted")} value={stats.completedJobs} icon={<HiOutlineCheckCircle className="w-5 h-5" />} color="bg-emerald-500" />
                <StatCard label={t("jobRequests.activeRequests")} value={stats.cancelledRequests} icon={<HiOutlineXCircle className="w-5 h-5" />} color="bg-red-500" />
              </>
            )}
          </div>
        </AnimatedSection>
      )}

      {/* Filters */}
      <AnimatedSection delay={0.1}>
        <div className="flex gap-2 overflow-x-auto pb-2 -mx-1 px-1">
          {FILTERS.map((s) => (
            <button
              key={s}
              onClick={() => setFilter(s)}
              className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-all duration-200 ${
                filter === s
                  ? "bg-primary text-white shadow-md shadow-primary/15"
                  : "bg-white border border-gray-200 text-gray-600 hover:border-primary/30 hover:text-primary"
              }`}
            >
              {filter === s && <div className="w-1.5 h-1.5 bg-white rounded-full" />}
              {s === "ALL" ? t("jobRequests.filterAll") : s.replace(/_/g, " ")}
            </button>
          ))}
        </div>
      </AnimatedSection>

      {/* Job List */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary"></div>
        </div>
      ) : jobs.length === 0 ? (
        <AnimatedSection delay={0.15}>
          <div className="text-center py-16 sm:py-20 bg-gradient-to-br from-slate-50 to-white rounded-2xl border border-gray-100">
            <div className="w-16 h-16 rounded-2xl bg-gray-100 flex items-center justify-center mx-auto mb-4">
              <HiOutlineClipboardCheck className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-bold text-gray-700 mb-2">{t("jobRequests.noJobs")}</h3>
            <p className="text-gray-500 mb-6 text-sm max-w-sm mx-auto">
              {isWorker ? t("jobRequests.noRelevantJobs") : t("jobRequests.postFirst")}
            </p>
            {!isWorker && (
              <button
                onClick={() => router.push("/dashboard/job-requests/new")}
                className="inline-flex items-center gap-2 bg-primary text-white px-6 py-3 rounded-xl font-semibold hover:bg-primary-hover transition-colors shadow-md shadow-primary/15"
              >
                <HiOutlinePlus className="w-5 h-5" />
                {t("jobRequests.postYourFirst")}
              </button>
            )}
          </div>
        </AnimatedSection>
      ) : (
        <div className="space-y-3">
          {jobs.map((job, idx) => (
            <AnimatedSection key={job.id} delay={idx * 0.03}>
              <div
                className="bg-white rounded-2xl p-4 sm:p-5 border border-gray-100 hover:border-primary/20 card-shadow hover:shadow-lg transition-all duration-300 cursor-pointer group hover:-translate-y-0.5"
                onClick={() => {
                  if (isWorker) {
                    router.push(`/dashboard/job-requests/${job.id}/quote`);
                  } else {
                    router.push(`/dashboard/job-requests/${job.id}/quotes`);
                  }
                }}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    {/* Title + Status */}
                    <div className="flex items-center gap-2.5 mb-2 flex-wrap">
                      <h3 className="text-base sm:text-lg font-bold text-gray-900 truncate group-hover:text-primary transition-colors">
                        {job.title}
                      </h3>
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold shrink-0 ${statusColors[job.status] || "bg-gray-50 text-gray-500 border border-gray-200"}`}>
                        <div className={`w-1.5 h-1.5 rounded-full ${statusDots[job.status] || "bg-gray-400"}`} />
                        {job.status.replace(/_/g, " ")}
                      </span>
                    </div>

                    {/* Description */}
                    <p className="text-gray-500 text-sm mb-3 line-clamp-2">{job.description}</p>

                    {/* Meta info */}
                    <div className="flex flex-wrap gap-x-4 gap-y-1.5 text-sm text-gray-500">
                      <span className="inline-flex items-center gap-1.5">
                        <HiOutlineOfficeBuilding className="w-4 h-4 text-gray-400 shrink-0" />
                        <span className="font-medium text-gray-700">{job.category.name}</span>
                      </span>
                      <span className="inline-flex items-center gap-1.5">
                        <HiOutlineCurrencyDollar className="w-4 h-4 text-gray-400 shrink-0" />
                        {formatBudget(job.budgetMin, job.budgetMax)}
                      </span>
                      <span className="inline-flex items-center gap-1.5">
                        <HiOutlineLocationMarker className="w-4 h-4 text-gray-400 shrink-0" />
                        <span className="truncate">{job.location}{job.city ? `, ${job.city}` : ""}</span>
                      </span>
                      {job.preferredDate && (
                        <span className="inline-flex items-center gap-1.5">
                          <HiOutlineCalendar className="w-4 h-4 text-gray-400 shrink-0" />
                          {new Date(job.preferredDate).toLocaleDateString()}
                        </span>
                      )}
                      <span className="text-gray-400">
                        {t("jobRequests.postedAgo")} {timeAgo(job.createdAt)}
                      </span>
                    </div>
                  </div>

                  {/* Right side badges */}
                  <div className="flex flex-col items-end gap-2 shrink-0">
                    {!isWorker && job.quotations.length > 0 && (
                      <span className="inline-flex items-center gap-1.5 bg-primary/10 text-primary px-3 py-1 rounded-full text-sm font-bold">
                        <HiOutlineChatBubbleLeftRight className="w-3.5 h-3.5" />
                        {job.quotations.length}
                      </span>
                    )}
                    {job.images.length > 0 && (
                      <span className="inline-flex items-center gap-1 text-gray-400 text-xs">
                        <HiOutlinePhotograph className="w-3.5 h-3.5" />
                        {job.images.length}
                      </span>
                    )}
                    <HiOutlineEye className="w-5 h-5 text-gray-300 group-hover:text-primary/40 transition-colors" />
                  </div>
                </div>
              </div>
            </AnimatedSection>
          ))}
        </div>
      )}
    </div>
  );
}

function StatCard({ label, value, icon, color }: { label: string; value: any; icon: React.ReactNode; color: string }) {
  return (
    <div className="bg-white rounded-xl p-4 border border-gray-100 card-shadow hover:shadow-md transition-shadow">
      <div className="flex items-center gap-3">
        <div className={`w-10 h-10 rounded-xl ${color} text-white flex items-center justify-center shrink-0`}>
          {icon}
        </div>
        <div className="min-w-0">
          <p className="text-xl sm:text-2xl font-extrabold text-gray-900">{value}</p>
          <p className="text-xs text-gray-500 font-medium truncate">{label}</p>
        </div>
      </div>
    </div>
  );
}
