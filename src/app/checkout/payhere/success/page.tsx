"use client";

import { useEffect, useState, Suspense, useCallback, useRef } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { HiCheckCircle, HiOutlineClock } from "react-icons/hi";
import { HiOutlineChatBubbleLeftRight } from "react-icons/hi2";
import { useI18n } from "@/i18n/I18nProvider";
import api from "@/lib/axios";

function SuccessContent({ t }: { t: (key: string, params?: Record<string, string | number>) => string }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const orderId = searchParams.get("orderId");
  const bookingId = searchParams.get("bookingId");
  const [countdown, setCountdown] = useState(10);
  const [webhookStatus, setWebhookStatus] = useState<"processing" | "confirmed" | "failed">("processing");
  const [paymentType, setPaymentType] = useState<string>("ADVANCE");
  const [bookingStatus, setBookingStatus] = useState<string>("");
  const pollIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const maxAttempts = 15;
  const pollIntervalMs = 2000;
  const hasConfirmedRef = useRef(false);

  const isFinalPaid = paymentType === "FINAL" && (bookingStatus === "COMPLETED" || bookingStatus === "ADVANCE_PAID");

  const checkPaymentStatus = useCallback(async () => {
    if (!orderId || hasConfirmedRef.current) return;
    try {
      const res = await api.get(`/bookings/${bookingId}/payment-status`);
      const status = res.data?.paymentStatus;
      const bStatus = res.data?.status;
      const pType = res.data?.paymentType;
      if (status === "COMPLETED") {
        hasConfirmedRef.current = true;
        setWebhookStatus("confirmed");
        setPaymentType(pType || "ADVANCE");
        setBookingStatus(bStatus || "");
        if (pollIntervalRef.current) clearInterval(pollIntervalRef.current);
      } else if (status === "FAILED") {
        hasConfirmedRef.current = true;
        setWebhookStatus("failed");
        if (pollIntervalRef.current) clearInterval(pollIntervalRef.current);
      }
    } catch {
      // Payment record may not exist yet — keep polling
    }
  }, [orderId, bookingId]);

  useEffect(() => {
    if (!orderId || hasConfirmedRef.current) return;

    let attempts = 0;

    pollIntervalRef.current = setInterval(() => {
      attempts++;
      checkPaymentStatus();
      if (attempts >= maxAttempts) {
        if (pollIntervalRef.current) clearInterval(pollIntervalRef.current);
      }
    }, pollIntervalMs);

    checkPaymentStatus();

    return () => {
      if (pollIntervalRef.current) clearInterval(pollIntervalRef.current);
    };
  }, [orderId, checkPaymentStatus]);

  // Auto-redirect countdown (only starts after confirmation)
  useEffect(() => {
    if (webhookStatus !== "confirmed") return;
    if (countdown <= 0) {
      router.push("/dashboard/bookings");
      return;
    }
    const timer = setInterval(() => {
      setCountdown((prev) => prev - 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [countdown, router, webhookStatus]);

  const handleOpenChat = async () => {
    if (!bookingId) {
      router.push("/dashboard/chats");
      return;
    }
    try {
      const res = await api.get(`/chat/booking/${bookingId}`);
      router.push(`/dashboard/chat/${res.data.id}`);
    } catch {
      router.push("/dashboard/chats");
    }
  };

  const confirmedTitle = isFinalPaid
    ? (t('checkoutSuccess.finalTitle') || 'Payment Fully Completed!')
    : (t('checkoutSuccess.title'));

  const confirmedDescription = isFinalPaid
    ? (t('checkoutSuccess.finalDescription') || 'Your remaining balance has been paid. This booking is now fully paid and complete.')
    : (t('checkoutSuccess.description'));

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="bg-white rounded-2xl shadow-lg p-8 max-w-md w-full text-center">
        {webhookStatus === "processing" && (
          <>
            <div className="w-20 h-20 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <HiOutlineClock className="w-12 h-12 text-amber-500 animate-pulse" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">{t('checkoutSuccess.processingTitle') || 'Processing Payment...'}</h1>
            <p className="text-gray-500 mb-4">
              {t('checkoutSuccess.processingDescription') || 'Please wait while we confirm your payment with PayHere.'}
            </p>
          </>
        )}

        {webhookStatus === "confirmed" && (
          <>
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <HiCheckCircle className="w-12 h-12 text-green-500" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">{confirmedTitle}</h1>
            <p className="text-gray-500 mb-4">{confirmedDescription}</p>
          </>
        )}

        {webhookStatus === "failed" && (
          <>
            <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <span className="text-red-500 text-4xl font-bold">!</span>
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">{t('checkoutSuccess.failedTitle') || 'Payment Not Confirmed'}</h1>
            <p className="text-gray-500 mb-4">
              {t('checkoutSuccess.failedDescription') || 'Your payment could not be confirmed. Please check your bookings or contact support.'}
            </p>
          </>
        )}

        {orderId && (
          <div className="bg-gray-50 rounded-xl p-3 mb-6">
            <p className="text-xs text-gray-400">{t('checkoutSuccess.orderReference')}</p>
            <p className="text-sm font-mono text-gray-700">{orderId}</p>
          </div>
        )}

        {webhookStatus === "confirmed" && (
          <div className="space-y-3 mb-6">
            {paymentType === "ADVANCE" && (
              <button
                onClick={handleOpenChat}
                className="w-full py-3 bg-primary text-white font-bold rounded-xl hover:bg-primary-hover transition-colors flex items-center justify-center gap-2"
              >
                <HiOutlineChatBubbleLeftRight className="w-5 h-5" />
                {t('checkoutSuccess.chatWithProvider')}
              </button>
            )}
            <button
              onClick={() => router.push("/dashboard/bookings")}
              className="w-full py-3 bg-gray-100 text-gray-700 font-medium rounded-xl hover:bg-gray-200 transition-colors"
            >
              {t('checkoutSuccess.goToBookings')}
            </button>
          </div>
        )}

        {webhookStatus === "processing" && (
          <div className="space-y-3 mb-6">
            <div className="flex items-center justify-center gap-2 text-sm text-gray-400">
              <div className="w-4 h-4 border-2 border-gray-300 border-t-primary rounded-full animate-spin" />
              <span>{t('checkoutSuccess.waitingForConfirmation') || 'Waiting for PayHere confirmation...'}</span>
            </div>
            <button
              onClick={() => router.push("/dashboard/bookings")}
              className="w-full py-3 bg-gray-100 text-gray-700 font-medium rounded-xl hover:bg-gray-200 transition-colors"
            >
              {t('checkoutSuccess.goToBookings')}
            </button>
          </div>
        )}

        {webhookStatus === "failed" && (
          <div className="space-y-3 mb-6">
            <button
              onClick={() => router.push("/dashboard/bookings")}
              className="w-full py-3 bg-primary text-white font-bold rounded-xl hover:bg-primary-hover transition-colors"
            >
              {t('checkoutSuccess.goToBookings')}
            </button>
          </div>
        )}

        {webhookStatus === "confirmed" && (
          <p className="text-sm text-gray-400">
            {t('checkoutSuccess.redirecting', { countdown })}
          </p>
        )}
      </div>
    </div>
  );
}

export default function PayhereSuccessPage() {
  const { t } = useI18n();
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">{t('common.loading')}</div>}>
      <SuccessContent t={t} />
    </Suspense>
  );
}
