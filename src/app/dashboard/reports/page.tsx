"use client";

import { useEffect, useState, useMemo } from "react";
import api from "@/lib/axios";
import AdminRoute from "@/components/AdminRoute";
import toast from "react-hot-toast";
import { useI18n } from "@/i18n/I18nProvider";
import { HiOutlineChatBubbleLeftRight, HiOutlineExclamationTriangle, HiOutlineArrowPath } from "react-icons/hi2";

interface Review {
  id: string;
  rating: number;
  comment?: string;
  customer?: { fullName: string };
  worker?: { user?: { fullName: string } };
  createdAt?: string;
}

interface AbuseReport {
  id: string;
  reason: string;
  details?: string;
  status: string;
  reportedBy?: { fullName: string };
  review?: { rating: number; comment?: string };
  createdAt?: string;
}

export default function ReportsPage() {
  const { t } = useI18n();
  const [tab, setTab] = useState<"reviews" | "reports">("reviews");
  const [reviews, setReviews] = useState<Review[]>([]);
  const [reports, setReports] = useState<AbuseReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    setError(false);
    try {
      const [reviewsRes, reportsRes] = await Promise.allSettled([
        api.get("/admin/reviews"),
        api.get("/admin/reports/abuse"),
      ]);
      if (reviewsRes.status === "fulfilled") {
        const d = reviewsRes.value.data.data || reviewsRes.value.data;
        setReviews(Array.isArray(d) ? d : []);
      }
      if (reportsRes.status === "fulfilled") {
        const d = reportsRes.value.data.data || reportsRes.value.data;
        setReports(Array.isArray(d) ? d : []);
      }
    } catch {
      setError(true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleDeleteReview = async (reviewId: string) => {
    if (!confirm(t("admin.confirmBlock"))) return;
    try {
      await api.delete(`/admin/reviews/${reviewId}`);
      toast.success(t("admin.reviewDeleted"));
      setReviews((prev) => prev.filter((r) => r.id !== reviewId));
    } catch {
      toast.error(t("admin.failedToDeleteReview"));
    }
  };

  const handleUpdateReportStatus = async (reportId: string, status: string) => {
    try {
      await api.put(`/admin/reports/abuse/${reportId}`, { status });
      toast.success(t("admin.reportUpdated"));
      setReports((prev) => prev.map((r) => r.id === reportId ? { ...r, status } : r));
    } catch {
      toast.error(t("admin.failedToUpdateReport"));
    }
  };

  if (loading) {
    return (
      <AdminRoute>
        <div className="flex h-[60vh] items-center justify-center">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
      </AdminRoute>
    );
  }

  if (error) {
    return (
      <AdminRoute>
        <div className="flex flex-col items-center justify-center h-[60vh] space-y-4">
          <p className="text-gray-500">{t("admin.errorLoading")}</p>
          <button onClick={fetchData} className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-xl hover:bg-primary-hover transition-colors text-sm font-medium">
            <HiOutlineArrowPath className="w-4 h-4" />
            {t("admin.retry")}
          </button>
        </div>
      </AdminRoute>
    );
  }

  return (
    <AdminRoute>
      <div className="space-y-6 sm:space-y-8">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 tracking-tight">{t("admin.reportsPageTitle")}</h1>
          <p className="text-gray-500 mt-1 sm:mt-2 text-sm sm:text-base">{t("admin.reportsPageDesc")}</p>
        </div>

        <div className="flex gap-2 bg-gray-100 p-1 rounded-xl w-fit">
          <button
            onClick={() => setTab("reviews")}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              tab === "reviews" ? "bg-white text-gray-900 shadow-sm" : "text-gray-500 hover:text-gray-700"
            }`}
          >
            <HiOutlineChatBubbleLeftRight className="w-4 h-4" />
            {t("admin.allReviews")}
          </button>
          <button
            onClick={() => setTab("reports")}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              tab === "reports" ? "bg-white text-gray-900 shadow-sm" : "text-gray-500 hover:text-gray-700"
            }`}
          >
            <HiOutlineExclamationTriangle className="w-4 h-4" />
            {t("admin.abuseReports")}
          </button>
        </div>

        {tab === "reviews" && (
          <div className="space-y-3">
            {reviews.map((review) => (
              <div key={review.id} className="bg-white p-4 sm:p-5 rounded-2xl border border-gray-100 card-shadow">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-gray-900 text-sm">{review.customer?.fullName}</span>
                      <span className="text-gray-400 text-xs">{t("admin.reviewWorker")}: {review.worker?.user?.fullName}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <span key={star} className={`text-sm ${star <= review.rating ? "text-yellow-400" : "text-gray-200"}`}>★</span>
                      ))}
                    </div>
                    {review.comment && <p className="text-sm text-gray-600">{review.comment}</p>}
                  </div>
                  <button
                    onClick={() => handleDeleteReview(review.id)}
                    className="px-3 py-1.5 text-xs font-medium text-red-600 bg-red-50 hover:bg-red-100 rounded-xl transition-colors self-start sm:self-center"
                  >
                    {t("admin.deleteReview")}
                  </button>
                </div>
              </div>
            ))}
            {reviews.length === 0 && (
              <div className="bg-white p-12 rounded-2xl border border-gray-100 card-shadow text-center text-gray-500 text-sm">{t("admin.noReviews")}</div>
            )}
          </div>
        )}

        {tab === "reports" && (
          <div className="space-y-3">
            {reports.map((report) => (
              <div key={report.id} className="bg-white p-4 sm:p-5 rounded-2xl border border-gray-100 card-shadow">
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                  <div className="space-y-1 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-sm font-medium text-gray-900">{report.reason}</span>
                      <span className={`px-2 py-0.5 text-xs font-bold rounded-full ${
                        report.status === "PENDING" ? "bg-orange-100 text-orange-700" :
                        report.status === "REVIEWED" ? "bg-blue-100 text-blue-700" :
                        "bg-gray-100 text-gray-700"
                      }`}>{report.status}</span>
                    </div>
                    {report.details && <p className="text-sm text-gray-600">{report.details}</p>}
                    <p className="text-xs text-gray-400">{t("admin.reportedBy")}: {report.reportedBy?.fullName}</p>
                  </div>
                  <div className="flex gap-2">
                    {report.status === "PENDING" && (
                      <>
                        <button
                          onClick={() => handleUpdateReportStatus(report.id, "REVIEWED")}
                          className="px-3 py-1.5 text-xs font-medium text-white bg-primary hover:bg-primary-hover rounded-xl transition-colors"
                        >
                          {t("admin.reviewed")}
                        </button>
                        <button
                          onClick={() => handleUpdateReportStatus(report.id, "DISMISSED")}
                          className="px-3 py-1.5 text-xs font-medium text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-xl transition-colors"
                        >
                          {t("admin.dismissed")}
                        </button>
                      </>
                    )}
                  </div>
                </div>
              </div>
            ))}
            {reports.length === 0 && (
              <div className="bg-white p-12 rounded-2xl border border-gray-100 card-shadow text-center text-gray-500 text-sm">{t("admin.noReports")}</div>
            )}
          </div>
        )}
      </div>
    </AdminRoute>
  );
}
