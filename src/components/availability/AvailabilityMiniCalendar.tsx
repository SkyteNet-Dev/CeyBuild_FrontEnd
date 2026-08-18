"use client";

import { useState, useEffect } from "react";
import api from "@/lib/axios";
import { HiOutlineCheckCircle, HiOutlineClock, HiOutlineLockClosed } from "react-icons/hi";

type CalendarDay = {
  date: string;
  status: "available" | "blocked" | "booked" | "past";
};

type Props = {
  workerId: string;
  t: (key: string) => string;
};

export default function AvailabilityMiniCalendar({ workerId, t }: Props) {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [calendarData, setCalendarData] = useState<{
    blockedDates: { date: string }[];
    bookedDates: { date: string }[];
  } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCalendar();
  }, [currentMonth, workerId]);

  const fetchCalendar = async () => {
    setLoading(true);
    try {
      const year = currentMonth.getFullYear();
      const month = currentMonth.getMonth();
      const startDate = new Date(year, month, 1).toISOString().split("T")[0];
      const endDate = new Date(year, month + 1, 0).toISOString().split("T")[0];

      const res = await api.get(`/availability/worker/${workerId}/calendar`, {
        params: { startDate, endDate },
      });
      setCalendarData({
        blockedDates: res.data.blockedDates,
        bookedDates: res.data.bookedDates,
      });
    } catch {
      // Silently fail
    } finally {
      setLoading(false);
    }
  };

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDay = (firstDay.getDay() + 6) % 7;

    const days: (Date | null)[] = [];
    for (let i = 0; i < startingDay; i++) days.push(null);
    for (let i = 1; i <= daysInMonth; i++) days.push(new Date(year, month, i));
    return days;
  };

  const getDayStatus = (date: Date): CalendarDay["status"] => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (date < today) return "past";

    const dateStr = date.toISOString().split("T")[0];
    if (calendarData?.blockedDates.some((bd) => bd.date.split("T")[0] === dateStr)) {
      return "blocked";
    }
    if (calendarData?.bookedDates.some((bd) => bd.date.split("T")[0] === dateStr)) {
      return "booked";
    }
    return "available";
  };

  const getDayClasses = (status: string) => {
    switch (status) {
      case "blocked":
        return "bg-red-100 text-red-600";
      case "booked":
        return "bg-yellow-100 text-yellow-600";
      case "past":
        return "text-gray-300";
      default:
        return "text-green-600";
    }
  };

  const navigateMonth = (direction: number) => {
    const newMonth = new Date(currentMonth);
    newMonth.setMonth(newMonth.getMonth() + direction);
    setCurrentMonth(newMonth);
  };

  const days = getDaysInMonth(currentMonth);
  const monthLabel = currentMonth.toLocaleDateString("en-US", {
    month: "short",
    year: "numeric",
  });

  return (
    <div>
      {/* Month Navigation */}
      <div className="flex items-center justify-between mb-3">
        <button
          onClick={() => navigateMonth(-1)}
          className="p-1 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <span className="text-sm font-semibold text-gray-900">{monthLabel}</span>
        <button
          onClick={() => navigateMonth(1)}
          className="p-1 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>

      {/* Day Headers */}
      <div className="grid grid-cols-7 gap-0.5 mb-1">
        {["M", "T", "W", "T", "F", "S", "S"].map((day, idx) => (
          <div key={idx} className="text-center text-[10px] font-semibold text-gray-400 py-1">
            {day}
          </div>
        ))}
      </div>

      {/* Calendar Grid */}
      <div className="grid grid-cols-7 gap-0.5">
        {days.map((date, idx) => {
          if (!date) {
            return <div key={`empty-${idx}`} className="aspect-square" />;
          }

          const status = getDayStatus(date);
          const classes = getDayClasses(status);
          const isToday =
            date.getDate() === new Date().getDate() &&
            date.getMonth() === new Date().getMonth() &&
            date.getFullYear() === new Date().getFullYear();

          return (
            <div
              key={idx}
              className={`aspect-square rounded-md flex items-center justify-center text-xs ${
                isToday ? "ring-2 ring-primary ring-offset-1 font-bold" : ""
              } ${classes}`}
            >
              {date.getDate()}
            </div>
          );
        })}
      </div>

      {/* Legend */}
      <div className="flex flex-wrap gap-3 mt-3 pt-3 border-t border-gray-100">
        <div className="flex items-center gap-1">
          <div className="w-2.5 h-2.5 rounded-sm bg-green-100"></div>
          <span className="text-[10px] text-gray-500">{t("availability.available")}</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-2.5 h-2.5 rounded-sm bg-yellow-100"></div>
          <span className="text-[10px] text-gray-500">{t("availability.busy")}</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-2.5 h-2.5 rounded-sm bg-red-100"></div>
          <span className="text-[10px] text-gray-500">{t("availability.blocked")}</span>
        </div>
      </div>
    </div>
  );
}
