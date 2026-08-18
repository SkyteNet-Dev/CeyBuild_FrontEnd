"use client";

import { useState } from "react";
import { HiOutlineX, HiOutlineCalendar } from "react-icons/hi";
import { useI18n } from "@/i18n/I18nProvider";

type RescheduleModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (date: string, time: string, reason: string) => void;
  submitting: boolean;
  bookingId: string;
  currentDate?: string;
  currentTime?: string;
};

export default function RescheduleModal({
  isOpen,
  onClose,
  onConfirm,
  submitting,
  bookingId,
  currentDate,
  currentTime,
}: RescheduleModalProps) {
  const { t } = useI18n();
  const [newDate, setNewDate] = useState("");
  const [newTime, setNewTime] = useState("");
  const [reason, setReason] = useState("");

  if (!isOpen) return null;

  const handleConfirm = () => {
    if (!newDate) return;
    onConfirm(new Date(newDate).toISOString(), newTime, reason);
    setNewDate("");
    setNewTime("");
    setReason("");
  };

  const handleClose = () => {
    setNewDate("");
    setNewTime("");
    setReason("");
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center" role="dialog" aria-modal="true">
      <div className="fixed inset-0 bg-black/50" onClick={handleClose} />
      <div className="relative bg-white rounded-3xl shadow-xl max-w-md w-full mx-4 overflow-hidden">
        <div className="flex items-center justify-between p-6 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
              <HiOutlineCalendar className="w-5 h-5 text-primary" />
            </div>
            <div>
               <h3 className="text-lg font-bold text-gray-900">{t('reschedule.title')}</h3>
               <p className="text-xs text-gray-500">{t('reschedule.proposeNew')}</p>
            </div>
          </div>
          <button onClick={handleClose} className="p-2 rounded-full hover:bg-gray-100 transition-colors">
            <HiOutlineX className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        <div className="p-6 space-y-4">
          {currentDate && (
            <div className="bg-gray-50 p-3 rounded-xl">
               <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">{t('reschedule.currentSchedule')}</p>
              <p className="text-sm font-semibold text-gray-900 mt-1">
                {new Date(currentDate).toLocaleDateString()}
                {currentTime && ` at ${currentTime}`}
              </p>
            </div>
          )}

          <div>
             <label className="block text-sm font-medium text-gray-700 mb-1">{t('reschedule.newDate')}</label>
            <input
              type="date"
              value={newDate}
              onChange={(e) => setNewDate(e.target.value)}
              min={new Date().toISOString().split("T")[0]}
              className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
            />
          </div>

          <div>
             <label className="block text-sm font-medium text-gray-700 mb-1">{t('reschedule.newTime')}</label>
            <input
              type="time"
              value={newTime}
              onChange={(e) => setNewTime(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
            />
          </div>

          <div>
             <label className="block text-sm font-medium text-gray-700 mb-1">{t('reschedule.reason')}</label>
            <textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              rows={3}
               placeholder={t('reschedule.reasonPlaceholder')}
              className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all resize-none"
            />
          </div>
        </div>

        <div className="flex gap-3 p-6 border-t border-gray-100 bg-gray-50">
          <button
            onClick={handleClose}
            className="flex-1 px-4 py-2.5 text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors"
          >
             {t('reschedule.cancel')}
          </button>
          <button
            onClick={handleConfirm}
            disabled={submitting || !newDate}
            className="flex-1 px-4 py-2.5 text-sm font-medium text-white bg-primary rounded-xl hover:bg-primary-hover shadow-md disabled:opacity-50 transition-all"
          >
             {submitting ? t('reschedule.sending') : t('reschedule.sendProposal')}
          </button>
        </div>
      </div>
    </div>
  );
}
