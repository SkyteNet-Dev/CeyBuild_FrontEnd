"use client";

import { useEffect, useState } from "react";
import api from "@/lib/axios";
import { HiOutlineUserGroup, HiOutlineBriefcase, HiOutlineCalendar, HiOutlineCheckCircle, HiOutlineArrowPath, HiOutlineCurrencyDollar } from "react-icons/hi2";
import AnimatedSection from "@/components/AnimatedSection";
import AdminRoute from "@/components/AdminRoute";
import { useI18n } from "@/i18n/I18nProvider";

export default function AnalyticsPage() {
  const { t } = useI18n();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const fetchAnalytics = async () => {
    setLoading(true);
    setError(false);
    try {
      const response = await api.get("/admin/analytics");
      setData(response.data);
    } catch {
      setError(true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, []);

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
          <button onClick={fetchAnalytics} className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-xl hover:bg-primary-hover transition-colors text-sm font-medium">
            <HiOutlineArrowPath className="w-4 h-4" />
            {t("admin.retry")}
          </button>
        </div>
      </AdminRoute>
    );
  }

  const stats = [
    { title: t("admin.totalUsers"), value: data?.totalUsers || 0, icon: <HiOutlineUserGroup className="w-6 h-6 sm:w-8 sm:h-8 text-blue-500" />, bg: "bg-blue-50" },
    { title: t("admin.totalWorkers"), value: data?.totalWorkers || 0, icon: <HiOutlineBriefcase className="w-6 h-6 sm:w-8 sm:h-8 text-purple-500" />, bg: "bg-purple-50" },
    { title: t("admin.totalBookings"), value: data?.totalBookings || 0, icon: <HiOutlineCalendar className="w-6 h-6 sm:w-8 sm:h-8 text-orange-500" />, bg: "bg-orange-50" },
    { title: t("admin.completedBookings"), value: data?.completedBookings || 0, icon: <HiOutlineCheckCircle className="w-6 h-6 sm:w-8 sm:h-8 text-green-500" />, bg: "bg-green-50" },
    { title: t("dashboard.stats.totalRevenue"), value: `Rs. ${(data?.totalRevenue || 0).toLocaleString()}`, icon: <HiOutlineCurrencyDollar className="w-6 h-6 sm:w-8 sm:h-8 text-emerald-500" />, bg: "bg-emerald-50" },
  ];

  return (
    <AdminRoute>
      <div className="space-y-6 sm:space-y-8">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 tracking-tight">{t("admin.analyticsPageTitle")}</h1>
          <p className="text-gray-500 mt-1 sm:mt-2 text-sm sm:text-base">{t("admin.analyticsPageDesc")}</p>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
          {stats.map((stat, idx) => (
            <AnimatedSection key={idx} delay={idx * 0.05}>
              <div className="bg-white p-4 sm:p-6 rounded-2xl border border-gray-100 card-shadow flex items-center gap-3 sm:gap-4 hover:shadow-md transition-shadow">
                <div className={`p-3 sm:p-4 rounded-xl ${stat.bg}`}>{stat.icon}</div>
                <div>
                  <p className="text-xs sm:text-sm font-medium text-gray-500">{stat.title}</p>
                  <h3 className="text-xl sm:text-2xl font-bold text-gray-900">{stat.value}</h3>
                </div>
              </div>
            </AnimatedSection>
          ))}
        </div>

        <AnimatedSection delay={0.3} className="bg-white p-6 sm:p-8 rounded-2xl border border-gray-100 card-shadow">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">{t("admin.revenueChart")}</h2>
          <div className="h-48 sm:h-64 flex items-center justify-center border-2 border-dashed border-gray-100 rounded-xl bg-gray-50/50">
            <p className="text-gray-400 font-medium text-sm">{t("admin.chartPlaceholder")}</p>
          </div>
        </AnimatedSection>
      </div>
    </AdminRoute>
  );
}
