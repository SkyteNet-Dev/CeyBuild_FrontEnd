"use client";

import { useEffect, useState } from "react";
import AnimatedSection from "@/components/AnimatedSection";
import api from "@/lib/axios";
import toast from "react-hot-toast";
import {
  HiOutlineCurrencyDollar,
  HiOutlineChartBar,
  HiOutlineCheckCircle,
  HiOutlineClock,
  HiOutlineCalculator,
} from "react-icons/hi";
import { useI18n } from "@/i18n/I18nProvider";

type EarningsData = {
  totalEarnings: number;
  pendingEarnings: number;
  totalCommission: number;
  commissionPercentage: number;
  completedJobsCount: number;
  availableBalance: number;
};

type MonthlyData = {
  month: string;
  year: number;
  earnings: number;
  commission: number;
  jobs: number;
};

export default function EarningsPage() {
  const { t } = useI18n();
  const [earnings, setEarnings] = useState<EarningsData | null>(null);
  const [monthlyData, setMonthlyData] = useState<MonthlyData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchEarnings = async () => {
      try {
        const res = await api.get("/bookings/worker/earnings");
        setEarnings(res.data);

        const bookingsRes = await api.get("/bookings");
        const bookings = Array.isArray(bookingsRes.data) ? bookingsRes.data : (bookingsRes.data?.data || []);

        const completedJobs = bookings.filter(
          (b: any) => b.status === "COMPLETED"
        );

        const commissionPercentage = res.data.commissionPercentage || 10;
        const monthMap: Record<string, { earnings: number; commission: number; jobs: number; year: number }> = {};
        const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

        completedJobs.forEach((b: any) => {
          const date = new Date(b.preferredDate);
          const key = `${monthNames[date.getMonth()]} ${date.getFullYear()}`;
          if (!monthMap[key]) {
            monthMap[key] = { earnings: 0, commission: 0, jobs: 0, year: date.getFullYear() };
          }
          const total = Number(b.estimatedPrice || 0);
          const commission = Math.round(total * (commissionPercentage / 100) * 100) / 100;
          const workerEarnings = Math.round((total - commission) * 100) / 100;
          monthMap[key].earnings += workerEarnings;
          monthMap[key].commission += commission;
          monthMap[key].jobs += 1;
        });

        const sorted = Object.entries(monthMap)
          .map(([month, data]) => ({ month, ...data }))
          .sort((a, b) => b.year - a.year);

        setMonthlyData(sorted);
      } catch (error) {
        toast.error(t('earnings.failedToLoad'));
      } finally {
        setLoading(false);
      }
    };
    fetchEarnings();
  }, []);

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
        <h1 className="text-3xl font-bold text-gray-900 tracking-tight">
          {t("earnings.title")}
        </h1>
        <p className="text-gray-500 mt-2">{t("earnings.subtitle")}</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <AnimatedSection delay={0.1}>
          <div className="bg-white p-6 rounded-3xl border border-gray-100 card-shadow flex items-center space-x-4">
            <div className="p-4 rounded-2xl bg-green-50">
              <HiOutlineCurrencyDollar className="w-8 h-8 text-green-500" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">
                {t("earnings.totalEarnings")}
              </p>
              <h3 className="text-2xl font-bold text-gray-900">
                LKR {Number(earnings?.totalEarnings || 0).toLocaleString()}
              </h3>
            </div>
          </div>
        </AnimatedSection>

        <AnimatedSection delay={0.2}>
          <div className="bg-white p-6 rounded-3xl border border-gray-100 card-shadow flex items-center space-x-4">
            <div className="p-4 rounded-2xl bg-blue-50">
              <HiOutlineCheckCircle className="w-8 h-8 text-blue-500" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">
                {t("earnings.completedJobs")}
              </p>
              <h3 className="text-2xl font-bold text-gray-900">
                {earnings?.completedJobsCount || 0}
              </h3>
            </div>
          </div>
        </AnimatedSection>

        <AnimatedSection delay={0.3}>
          <div className="bg-white p-6 rounded-3xl border border-gray-100 card-shadow flex items-center space-x-4">
            <div className="p-4 rounded-2xl bg-orange-50">
              <HiOutlineClock className="w-8 h-8 text-orange-500" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">
                {t("earnings.pendingValue")}
              </p>
              <h3 className="text-2xl font-bold text-gray-900">
                LKR {Number(earnings?.pendingEarnings || 0).toLocaleString()}
              </h3>
            </div>
          </div>
        </AnimatedSection>

        <AnimatedSection delay={0.4}>
          <div className="bg-white p-6 rounded-3xl border border-gray-100 card-shadow flex items-center space-x-4">
            <div className="p-4 rounded-2xl bg-amber-50">
              <HiOutlineCalculator className="w-8 h-8 text-amber-500" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">
                Platform Commission ({earnings?.commissionPercentage || 10}%)
              </p>
              <h3 className="text-2xl font-bold text-gray-900">
                LKR {Number(earnings?.totalCommission || 0).toLocaleString()}
              </h3>
            </div>
          </div>
        </AnimatedSection>
      </div>

      <AnimatedSection
        delay={0.5}
        className="bg-white p-8 rounded-3xl border border-gray-100 card-shadow"
      >
        <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
          <HiOutlineChartBar className="text-primary" />{" "}
          {t("earnings.monthlyHistory")}
        </h2>
        {monthlyData.length === 0 ? (
          <div className="h-64 flex items-center justify-center bg-gray-50 rounded-xl border border-dashed border-gray-200">
            <div className="text-center text-gray-500">
              <HiOutlineChartBar className="w-10 h-10 mx-auto mb-2 text-gray-300" />
              <p className="font-medium text-lg mb-2">
                {t("earnings.noCompletedJobs")}
              </p>
              <p className="text-sm">{t("earnings.noCompletedJobsDesc")}</p>
            </div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-gray-100">
                  <th className="py-3 px-4 text-xs font-medium text-gray-500 uppercase tracking-wide">
                    {t("earnings.month")}
                  </th>
                  <th className="py-3 px-4 text-xs font-medium text-gray-500 uppercase tracking-wide text-right">
                    {t("earnings.jobsCompleted")}
                  </th>
                  <th className="py-3 px-4 text-xs font-medium text-gray-500 uppercase tracking-wide text-right">
                    Commission
                  </th>
                  <th className="py-3 px-4 text-xs font-medium text-gray-500 uppercase tracking-wide text-right">
                    {t("earnings.earnings")}
                  </th>
                </tr>
              </thead>
              <tbody>
                {monthlyData.map((row, idx) => (
                  <tr
                    key={idx}
                    className="border-b border-gray-50 hover:bg-gray-50 transition-colors"
                  >
                    <td className="py-3 px-4 text-sm font-semibold text-gray-900">
                      {row.month}
                    </td>
                    <td className="py-3 px-4 text-sm text-gray-600 text-right">
                      {row.jobs}
                    </td>
                    <td className="py-3 px-4 text-sm text-amber-600 text-right">
                      LKR {Number(row.commission).toLocaleString()}
                    </td>
                    <td className="py-3 px-4 text-sm font-bold text-green-600 text-right">
                      LKR {Number(row.earnings).toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="bg-gray-50">
                  <td className="py-3 px-4 text-sm font-bold text-gray-900">
                    {t('earnings.total')}
                  </td>
                  <td className="py-3 px-4 text-sm font-bold text-gray-900 text-right">
                    {earnings?.completedJobsCount || 0}
                  </td>
                  <td className="py-3 px-4 text-sm font-bold text-amber-600 text-right">
                    LKR {Number(earnings?.totalCommission || 0).toLocaleString()}
                  </td>
                  <td className="py-3 px-4 text-sm font-bold text-green-600 text-right">
                    LKR {Number(earnings?.totalEarnings || 0).toLocaleString()}
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        )}
      </AnimatedSection>
    </div>
  );
}
