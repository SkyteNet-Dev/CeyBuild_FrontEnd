"use client";

import { useState, useEffect, useCallback } from "react";
import AnimatedSection from "@/components/AnimatedSection";
import { useI18n } from "@/i18n/I18nProvider";
import api from "@/lib/axios";
import toast from "react-hot-toast";
import {
  HiOutlineCalendar,
  HiOutlineCheckCircle,
  HiOutlineXCircle,
  HiOutlineClock,
  HiOutlineBan,
  HiOutlineExclamationCircle,
} from "react-icons/hi";

type BlockedDate = {
  date: string;
  isBlocked: boolean;
  reason?: string;
  allDay: boolean;
  startTime?: string;
  endTime?: string;
};

type BookedDate = {
  bookingId: string;
  date: string;
  time?: string;
  status: string;
  description: string;
  customerName: string;
};

type CalendarData = {
  workerId: string;
  workingHours: Record<string, { start: string; end: string; available: boolean }> | null;
  availability: boolean;
  blockedDates: BlockedDate[];
  bookedDates: BookedDate[];
  rescheduledDates: { bookingId: string; date: string; time?: string }[];
};

type WorkingHours = Record<string, { start: string; end: string; available: boolean }>;

const DAYS_OF_WEEK = ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"];

const DAY_LABELS: Record<string, string> = {
  monday: "Mon",
  tuesday: "Tue",
  wednesday: "Wed",
  thursday: "Thu",
  friday: "Fri",
  saturday: "Sat",
  sunday: "Sun",
};

export default function AvailabilityPage() {
  const { t } = useI18n();
  const [calendarData, setCalendarData] = useState<CalendarData | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [showBlockModal, setShowBlockModal] = useState(false);
  const [blockReason, setBlockReason] = useState("");
  const [blockAllDay, setBlockAllDay] = useState(true);
  const [blockStartTime, setBlockStartTime] = useState("09:00");
  const [blockEndTime, setBlockEndTime] = useState("17:00");
  const [workingHours, setWorkingHours] = useState<WorkingHours>({});
  const [showWorkingHours, setShowWorkingHours] = useState(false);
  const [saving, setSaving] = useState(false);
  const [availability, setAvailability] = useState(true);

  const fetchCalendar = useCallback(async () => {
    try {
      const year = currentMonth.getFullYear();
      const month = currentMonth.getMonth();
      const startDate = new Date(year, month, 1).toISOString().split("T")[0];
      const endDate = new Date(year, month + 1, 0).toISOString().split("T")[0];

      const res = await api.get(`/availability/worker/me/calendar`, {
        params: { startDate, endDate },
      });
      setCalendarData(res.data);
      setWorkingHours(res.data.workingHours || {});
      setAvailability(res.data.availability);
    } catch (error) {
      toast.error("Failed to load calendar");
    } finally {
      setLoading(false);
    }
  }, [currentMonth]);

  useEffect(() => {
    fetchCalendar();
  }, [fetchCalendar]);

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDay = (firstDay.getDay() + 6) % 7; // Monday = 0

    const days: (Date | null)[] = [];
    for (let i = 0; i < startingDay; i++) days.push(null);
    for (let i = 1; i <= daysInMonth; i++) days.push(new Date(year, month, i));
    return days;
  };

  const isDateBlocked = (date: Date) => {
    if (!calendarData) return false;
    const dateStr = date.toISOString().split("T")[0];
    return calendarData.blockedDates.some(
      (bd) => bd.date.split("T")[0] === dateStr && bd.isBlocked
    );
  };

  const isDateBooked = (date: Date) => {
    if (!calendarData) return false;
    const dateStr = date.toISOString().split("T")[0];
    return calendarData.bookedDates.some(
      (bd) => bd.date.split("T")[0] === dateStr
    );
  };

  const isToday = (date: Date) => {
    const today = new Date();
    return (
      date.getDate() === today.getDate() &&
      date.getMonth() === today.getMonth() &&
      date.getFullYear() === today.getFullYear()
    );
  };

  const isPast = (date: Date) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return date < today;
  };

  const handleBlockDate = async () => {
    if (!selectedDate) return;
    setSaving(true);
    try {
      await api.post("/availability/block", {
        date: selectedDate.toISOString().split("T")[0],
        reason: blockReason || undefined,
        allDay: blockAllDay,
        startTime: blockAllDay ? undefined : blockStartTime,
        endTime: blockAllDay ? undefined : blockEndTime,
      });
      toast.success(t("availability.dateBlocked"));
      setShowBlockModal(false);
      setSelectedDate(null);
      setBlockReason("");
      fetchCalendar();
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "Failed to block date");
    } finally {
      setSaving(false);
    }
  };

  const handleUnblockDate = async (date: Date) => {
    setSaving(true);
    try {
      await api.delete("/availability/block", {
        data: { date: date.toISOString().split("T")[0] },
      });
      toast.success(t("availability.dateUnblocked"));
      fetchCalendar();
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "Failed to unblock date");
    } finally {
      setSaving(false);
    }
  };

  const handleUpdateWorkingHours = async () => {
    setSaving(true);
    try {
      await api.put("/availability/working-hours", { workingHours });
      toast.success(t("availability.workingHoursUpdated"));
      setShowWorkingHours(false);
      fetchCalendar();
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "Failed to update working hours");
    } finally {
      setSaving(false);
    }
  };

  const handleToggleAvailability = async () => {
    setSaving(true);
    try {
      await api.put("/availability/toggle", { available: !availability });
      toast.success(t("availability.availabilityUpdated"));
      setAvailability(!availability);
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "Failed to update availability");
    } finally {
      setSaving(false);
    }
  };

  const navigateMonth = (direction: number) => {
    const newMonth = new Date(currentMonth);
    newMonth.setMonth(newMonth.getMonth() + direction);
    setCurrentMonth(newMonth);
  };

  const getDayStatus = (date: Date): "blocked" | "booked" | "past" | "today" | "available" => {
    if (isPast(date)) return "past";
    if (isToday(date)) return "today";
    if (isDateBlocked(date)) return "blocked";
    if (isDateBooked(date)) return "booked";
    return "available";
  };

  const getDayClasses = (status: string) => {
    switch (status) {
      case "blocked":
        return "bg-red-100 text-red-700 border-red-200 cursor-pointer hover:bg-red-200";
      case "booked":
        return "bg-yellow-100 text-yellow-700 border-yellow-200";
      case "past":
        return "bg-gray-50 text-gray-400 border-gray-100";
      case "today":
        return "bg-primary/10 text-primary border-primary/30 font-bold";
      default:
        return "bg-white text-gray-700 border-gray-200 hover:border-primary/50 hover:bg-primary/5 cursor-pointer";
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  const days = getDaysInMonth(currentMonth);
  const monthLabel = currentMonth.toLocaleDateString("en-US", {
    month: "long",
    year: "numeric",
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <AnimatedSection>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
              {t("availability.title")}
            </h1>
            <p className="text-gray-500 mt-1">{t("availability.subtitle")}</p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => setShowWorkingHours(!showWorkingHours)}
              className="px-4 py-2 bg-white border border-gray-200 rounded-xl text-sm font-medium hover:bg-gray-50 transition-colors flex items-center gap-2"
            >
              <HiOutlineClock className="w-4 h-4" />
              {t("availability.workingHours")}
            </button>
            <button
              onClick={handleToggleAvailability}
              disabled={saving}
              className={`px-4 py-2 rounded-xl text-sm font-medium flex items-center gap-2 transition-colors ${
                availability
                  ? "bg-green-500 text-white hover:bg-green-600"
                  : "bg-red-500 text-white hover:bg-red-600"
              }`}
            >
              {availability ? (
                <HiOutlineCheckCircle className="w-4 h-4" />
              ) : (
                <HiOutlineBan className="w-4 h-4" />
              )}
              {availability ? t("availability.available") : t("availability.unavailable")}
            </button>
          </div>
        </div>
      </AnimatedSection>

      {/* Working Hours Modal */}
      {showWorkingHours && (
        <AnimatedSection>
          <div className="bg-white rounded-2xl border border-gray-100 p-6">
            <h2 className="text-lg font-bold text-gray-900 mb-4">
              {t("availability.workingHours")}
            </h2>
            <div className="space-y-4">
              {DAYS_OF_WEEK.map((day) => (
                <div
                  key={day}
                  className="flex items-center gap-4 p-3 bg-gray-50 rounded-xl"
                >
                  <div className="w-24">
                    <span className="font-medium text-gray-700 capitalize">
                      {DAY_LABELS[day]}
                    </span>
                  </div>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={workingHours[day]?.available || false}
                      onChange={(e) =>
                        setWorkingHours((prev) => ({
                          ...prev,
                          [day]: {
                            ...prev[day],
                            available: e.target.checked,
                            start: prev[day]?.start || "09:00",
                            end: prev[day]?.end || "17:00",
                          },
                        }))
                      }
                      className="w-4 h-4 text-primary rounded"
                    />
                    <span className="text-sm text-gray-600">
                      {workingHours[day]?.available
                        ? `${workingHours[day].start} - ${workingHours[day].end}`
                        : t("availability.unavailable")}
                    </span>
                  </label>
                  {workingHours[day]?.available && (
                    <div className="flex items-center gap-2 ml-auto">
                      <input
                        type="time"
                        value={workingHours[day]?.start || "09:00"}
                        onChange={(e) =>
                          setWorkingHours((prev) => ({
                            ...prev,
                            [day]: { ...prev[day], start: e.target.value },
                          }))
                        }
                        className="px-3 py-1.5 border border-gray-200 rounded-lg text-sm"
                      />
                      <span className="text-gray-400">-</span>
                      <input
                        type="time"
                        value={workingHours[day]?.end || "17:00"}
                        onChange={(e) =>
                          setWorkingHours((prev) => ({
                            ...prev,
                            [day]: { ...prev[day], end: e.target.value },
                          }))
                        }
                        className="px-3 py-1.5 border border-gray-200 rounded-lg text-sm"
                      />
                    </div>
                  )}
                </div>
              ))}
            </div>
            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={() => setShowWorkingHours(false)}
                className="px-4 py-2 text-gray-600 hover:text-gray-900 text-sm font-medium"
              >
                Cancel
              </button>
              <button
                onClick={handleUpdateWorkingHours}
                disabled={saving}
                className="px-6 py-2 bg-primary text-white rounded-xl text-sm font-medium hover:bg-primary-hover disabled:opacity-50"
              >
                {saving ? "Saving..." : "Save"}
              </button>
            </div>
          </div>
        </AnimatedSection>
      )}

      {/* Calendar */}
      <AnimatedSection delay={0.05}>
        <div className="bg-white rounded-2xl border border-gray-100 p-6">
          {/* Month Navigation */}
          <div className="flex items-center justify-between mb-6">
            <button
              onClick={() => navigateMonth(-1)}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <h2 className="text-xl font-bold text-gray-900">{monthLabel}</h2>
            <button
              onClick={() => navigateMonth(1)}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>

          {/* Day Headers */}
          <div className="grid grid-cols-7 gap-1 mb-2">
            {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((day) => (
              <div key={day} className="text-center text-xs font-semibold text-gray-500 py-2">
                {day}
              </div>
            ))}
          </div>

          {/* Calendar Grid */}
          <div className="grid grid-cols-7 gap-1">
            {days.map((date, idx) => {
              if (!date) {
                return <div key={`empty-${idx}`} className="aspect-square" />;
              }

              const status = getDayStatus(date);
              const classes = getDayClasses(status);

              return (
                <div
                  key={idx}
                  className={`aspect-square rounded-xl border flex flex-col items-center justify-center text-sm transition-all ${classes}`}
                  onClick={() => {
                    if (status === "blocked") {
                      handleUnblockDate(date);
                    } else if (status === "available" || status === "today") {
                      setSelectedDate(date);
                      setShowBlockModal(true);
                    }
                  }}
                >
                  <span>{date.getDate()}</span>
                  {status === "blocked" && (
                    <HiOutlineBan className="w-3 h-3 mt-0.5 text-red-500" />
                  )}
                  {status === "booked" && (
                    <HiOutlineExclamationCircle className="w-3 h-3 mt-0.5 text-yellow-500" />
                  )}
                </div>
              );
            })}
          </div>

          {/* Legend */}
          <div className="flex flex-wrap gap-4 mt-6 pt-4 border-t border-gray-100">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded bg-primary/10 border border-primary/30"></div>
              <span className="text-xs text-gray-600">{t("availability.today")}</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded bg-white border border-gray-200"></div>
              <span className="text-xs text-gray-600">{t("availability.available")}</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded bg-red-100 border border-red-200"></div>
              <span className="text-xs text-gray-600">{t("availability.blocked")}</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded bg-yellow-100 border border-yellow-200"></div>
              <span className="text-xs text-gray-600">{t("availability.busy")}</span>
            </div>
          </div>
        </div>
      </AnimatedSection>

      {/* Blocked Dates Summary */}
      {calendarData && calendarData.blockedDates.length > 0 && (
        <AnimatedSection delay={0.1}>
          <div className="bg-white rounded-2xl border border-gray-100 p-6">
            <h3 className="font-bold text-gray-900 mb-4">
              {t("availability.blocked")} ({calendarData.blockedDates.length})
            </h3>
            <div className="space-y-2">
              {calendarData.blockedDates.map((bd, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between p-3 bg-red-50 rounded-xl"
                >
                  <div className="flex items-center gap-3">
                    <HiOutlineBan className="w-4 h-4 text-red-500" />
                    <div>
                      <p className="text-sm font-medium text-gray-900">
                        {new Date(bd.date).toLocaleDateString("en-US", {
                          weekday: "short",
                          month: "short",
                          day: "numeric",
                        })}
                      </p>
                      {bd.reason && (
                        <p className="text-xs text-gray-500">{bd.reason}</p>
                      )}
                    </div>
                  </div>
                  {!bd.allDay && bd.startTime && bd.endTime && (
                    <span className="text-xs text-gray-500">
                      {bd.startTime} - {bd.endTime}
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>
        </AnimatedSection>
      )}

      {/* Block Date Modal */}
      {showBlockModal && selectedDate && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md">
            <h3 className="text-lg font-bold text-gray-900 mb-4">
              {t("availability.blockDate")}
            </h3>
            <p className="text-sm text-gray-600 mb-4">
              {selectedDate.toLocaleDateString("en-US", {
                weekday: "long",
                month: "long",
                day: "numeric",
                year: "numeric",
              })}
            </p>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t("availability.reasonOptional")}
                </label>
                <input
                  type="text"
                  value={blockReason}
                  onChange={(e) => setBlockReason(e.target.value)}
                  placeholder={t("availability.reasonPlaceholder")}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-primary/20 outline-none"
                />
              </div>

              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  id="blockAllDay"
                  checked={blockAllDay}
                  onChange={(e) => setBlockAllDay(e.target.checked)}
                  className="w-4 h-4 text-primary rounded"
                />
                <label htmlFor="blockAllDay" className="text-sm text-gray-700">
                  {t("availability.blockFullDay")}
                </label>
              </div>

              {!blockAllDay && (
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      {t("availability.from")}
                    </label>
                    <input
                      type="time"
                      value={blockStartTime}
                      onChange={(e) => setBlockStartTime(e.target.value)}
                      className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      {t("availability.to")}
                    </label>
                    <input
                      type="time"
                      value={blockEndTime}
                      onChange={(e) => setBlockEndTime(e.target.value)}
                      className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm"
                    />
                  </div>
                </div>
              )}
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => {
                  setShowBlockModal(false);
                  setSelectedDate(null);
                  setBlockReason("");
                }}
                className="flex-1 px-4 py-2.5 border border-gray-200 rounded-xl text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleBlockDate}
                disabled={saving}
                className="flex-1 px-4 py-2.5 bg-red-500 text-white rounded-xl text-sm font-medium hover:bg-red-600 disabled:opacity-50"
              >
                {saving ? "Blocking..." : t("availability.confirmBlock")}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
