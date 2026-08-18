"use client";

import { useEffect, useState, useMemo } from "react";
import api from "@/lib/axios";
import AdminRoute from "@/components/AdminRoute";
import toast from "react-hot-toast";
import { useI18n } from "@/i18n/I18nProvider";
import { HiOutlineSearch, HiOutlineBriefcase, HiOutlineCheckCircle, HiOutlineClock, HiOutlineXCircle } from "react-icons/hi";
import { HiOutlineArrowPath } from "react-icons/hi2";

interface Worker {
  id: string;
  user?: { fullName: string; email: string };
  category?: { name: string };
  experienceYears?: number;
  verificationStatus?: string;
  averageRating?: number;
}

export default function WorkersManagementPage() {
  const { t } = useI18n();
  const [workers, setWorkers] = useState<Worker[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");

  const fetchWorkers = async () => {
    setLoading(true);
    setError(false);
    try {
      const response = await api.get("/admin/workers");
      const data = response.data.data || response.data;
      setWorkers(Array.isArray(data) ? data : []);
    } catch {
      setError(true);
      toast.error(t("admin.failedToFetchWorkers"));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWorkers();
  }, []);

  const filteredWorkers = useMemo(() => {
    return workers.filter((worker) => {
      const name = worker.user?.fullName?.toLowerCase() || "";
      const email = worker.user?.email?.toLowerCase() || "";
      const matchesSearch = name.includes(search.toLowerCase()) || email.includes(search.toLowerCase());
      const matchesStatus = statusFilter === "ALL" || worker.verificationStatus === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [workers, search, statusFilter]);

  const stats = useMemo(() => ({
    total: workers.length,
    verified: workers.filter((w) => w.verificationStatus === "VERIFIED").length,
    pending: workers.filter((w) => w.verificationStatus === "PENDING").length,
    rejected: workers.filter((w) => w.verificationStatus === "REJECTED").length,
  }), [workers]);

  const handleVerify = async (workerId: string) => {
    try {
      await api.put(`/workers/${workerId}/verify`);
      toast.success(t("admin.workerVerified"));
      fetchWorkers();
    } catch {
      toast.error(t("admin.failedToVerifyWorker"));
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
          <button onClick={fetchWorkers} className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-xl hover:bg-primary-hover transition-colors text-sm font-medium">
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
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 tracking-tight">{t("admin.workersPageTitle")}</h1>
          <p className="text-gray-500 mt-1 sm:mt-2 text-sm sm:text-base">{t("admin.workersPageDesc")}</p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
          {[
            { label: t("admin.totalUsers"), value: stats.total, icon: <HiOutlineBriefcase className="w-5 h-5 sm:w-6 sm:h-6 text-blue-500" />, bg: "bg-blue-50" },
            { label: t("admin.verified"), value: stats.verified, icon: <HiOutlineCheckCircle className="w-5 h-5 sm:w-6 sm:h-6 text-green-500" />, bg: "bg-green-50" },
            { label: t("admin.pending"), value: stats.pending, icon: <HiOutlineClock className="w-5 h-5 sm:w-6 sm:h-6 text-orange-500" />, bg: "bg-orange-50" },
            { label: t("admin.rejected"), value: stats.rejected, icon: <HiOutlineXCircle className="w-5 h-5 sm:w-6 sm:h-6 text-red-500" />, bg: "bg-red-50" },
          ].map((stat, idx) => (
            <div key={idx} className="bg-white p-4 sm:p-5 rounded-2xl border border-gray-100 card-shadow flex items-center gap-3">
              <div className={`p-2.5 sm:p-3 rounded-xl ${stat.bg}`}>{stat.icon}</div>
              <div>
                <p className="text-xs sm:text-sm font-medium text-gray-500">{stat.label}</p>
                <h3 className="text-xl sm:text-2xl font-bold text-gray-900">{stat.value}</h3>
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
                <option value="ALL">{t("admin.allStatuses")}</option>
                <option value="VERIFIED">{t("admin.verified")}</option>
                <option value="PENDING">{t("admin.pending")}</option>
                <option value="REJECTED">{t("admin.rejected")}</option>
              </select>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50/80 border-b border-gray-100 text-xs sm:text-sm font-medium text-gray-500 uppercase tracking-wider">
                  <th className="px-4 sm:px-6 py-3 sm:py-4">{t("admin.name")}</th>
                  <th className="px-4 sm:px-6 py-3 sm:py-4 hidden md:table-cell">{t("admin.category")}</th>
                  <th className="px-4 sm:px-6 py-3 sm:py-4 hidden lg:table-cell">{t("admin.experience")}</th>
                  <th className="px-4 sm:px-6 py-3 sm:py-4 hidden sm:table-cell">{t("admin.rating")}</th>
                  <th className="px-4 sm:px-6 py-3 sm:py-4">{t("admin.status")}</th>
                  <th className="px-4 sm:px-6 py-3 sm:py-4 text-right">{t("admin.actions")}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredWorkers.map((worker) => (
                  <tr key={worker.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-4 sm:px-6 py-3 sm:py-4">
                      <div className="font-semibold text-gray-900 text-sm">{worker.user?.fullName}</div>
                      <div className="text-xs text-gray-500">{worker.user?.email}</div>
                      <div className="text-xs text-gray-400 mt-0.5 md:hidden">{worker.category?.name || "N/A"}</div>
                    </td>
                    <td className="px-4 sm:px-6 py-3 sm:py-4 hidden md:table-cell">
                      <span className="inline-block px-2.5 py-1 bg-blue-50 text-blue-700 text-xs font-bold rounded-full">
                        {worker.category?.name || "N/A"}
                      </span>
                    </td>
                    <td className="px-4 sm:px-6 py-3 sm:py-4 text-gray-600 text-sm hidden lg:table-cell">
                      {worker.experienceYears} {t("admin.years")}
                    </td>
                    <td className="px-4 sm:px-6 py-3 sm:py-4 hidden sm:table-cell">
                      <span className="text-sm font-medium text-gray-700">{worker.averageRating?.toFixed(1) || "-"}</span>
                    </td>
                    <td className="px-4 sm:px-6 py-3 sm:py-4">
                      <span className={`inline-block px-2.5 py-1 text-xs font-bold rounded-full ${
                        worker.verificationStatus === "VERIFIED" ? "bg-green-100 text-green-700" :
                        worker.verificationStatus === "REJECTED" ? "bg-red-100 text-red-700" :
                        "bg-orange-100 text-orange-700"
                      }`}>
                        {worker.verificationStatus}
                      </span>
                    </td>
                    <td className="px-4 sm:px-6 py-3 sm:py-4 text-right">
                      {worker.verificationStatus !== "VERIFIED" && (
                        <button
                          onClick={() => handleVerify(worker.id)}
                          className="px-3 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm font-medium text-white bg-primary hover:bg-primary-hover rounded-xl transition-colors"
                        >
                          {t("admin.verify")}
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
                {filteredWorkers.length === 0 && (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center text-gray-500 text-sm">
                      {t("admin.noResults")}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </AdminRoute>
  );
}
