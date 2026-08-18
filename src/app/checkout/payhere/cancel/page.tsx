"use client";

import { useRouter } from "next/navigation";
import { HiOutlineXCircle } from "react-icons/hi";
import { useI18n } from "@/i18n/I18nProvider";

export default function PayhereCancelPage() {
  const router = useRouter();
  const { t } = useI18n();

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="bg-white rounded-2xl shadow-lg p-8 max-w-md w-full text-center">
        <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <HiOutlineXCircle className="w-12 h-12 text-red-500" />
        </div>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">{t('checkoutCancel.title')}</h1>
        <p className="text-gray-500 mb-6">
          {t('checkoutCancel.description')}
        </p>
        <button
          onClick={() => router.push("/dashboard/bookings")}
          className="w-full py-3 bg-primary text-white font-bold rounded-xl hover:bg-primary-hover transition-colors"
        >
          {t('checkoutCancel.goToBookings')}
        </button>
        <button
          onClick={() => router.push("/")}
          className="w-full mt-3 py-2 text-gray-500 text-sm hover:text-gray-700 transition-colors"
        >
          {t('checkoutCancel.goToHome')}
        </button>
      </div>
    </div>
  );
}
