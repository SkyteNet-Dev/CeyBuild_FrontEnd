"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import api from "@/lib/axios";
import { useAuth } from "@/contexts/AuthContext";
import toast from "react-hot-toast";

declare global {
  interface Window {
    payhere?: {
      startPayment: (payment: {
        sandbox: boolean;
        merchant_id: string;
        return_url?: string;
        cancel_url?: string;
        notify_url: string;
        order_id: string;
        items: string;
        amount: string;
        currency: string;
        hash: string;
        first_name: string;
        last_name: string;
        email: string;
        phone: string;
        address: string;
        city: string;
        country: string;
      }) => void;
      onCompleted: (orderId: string) => void;
      onDismissed: () => void;
      onError: (error: string) => void;
    };
  }
}

function PayhereCheckoutContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user } = useAuth();
  const bookingId = searchParams.get("bookingId");
  const amount = searchParams.get("amount");
  const type = searchParams.get("type") || "ADVANCE";
  const workerName = searchParams.get("worker") || "Service Provider";
  const serviceName = searchParams.get("service") || "Service";
  const bookingDate = searchParams.get("date") || "";
  const [loading, setLoading] = useState(false);
  const [sdkReady, setSdkReady] = useState(false);
  const [agreed, setAgreed] = useState(false);

  useEffect(() => {
    document.title = "Checkout | CeyBuild";
    const script = document.createElement("script");
    script.src = "https://www.payhere.lk/lib/payhere.js";
    script.onload = () => setSdkReady(true);
    script.onerror = () => {
      const fallback = document.createElement("script");
      fallback.src = "https://sandbox.payhere.lk/lib/payhere.js";
      fallback.onload = () => setSdkReady(true);
      fallback.onerror = () => toast.error("Failed to load payment gateway");
      document.body.appendChild(fallback);
    };
    document.body.appendChild(script);
    return () => { document.body.removeChild(script); };
  }, []);

  const handlePayment = async () => {
    if (!bookingId || !amount) {
      toast.error("Invalid payment parameters");
      return;
    }
    setLoading(true);
    try {
      const numAmount = parseFloat(amount);
      const initRes = await api.post(`/payhere/initiate/${bookingId}`, {
        amount: numAmount,
        paymentType: type,
      });

      const { orderId, hash, merchantId, sandbox } = initRes.data;

      if (!window.payhere) {
        toast.error("Payment gateway not loaded");
        setLoading(false);
        return;
      }

      window.payhere.onCompleted = async (completedOrderId: string) => {
        toast.success("Payment completed!");
        router.push(`/checkout/payhere/success?orderId=${completedOrderId}&bookingId=${bookingId}`);
      };

      window.payhere.onDismissed = () => {
        toast.error("Payment cancelled");
        router.push("/dashboard/bookings");
      };

      window.payhere.onError = (error: string) => {
        toast.error(`Payment error: ${error}`);
      };

      const displayName = user?.displayName || "Customer";
      const firstName = displayName.split(" ")[0] || "Customer";
      const lastName = displayName.split(" ").slice(1).join(" ") || "User";
      const email = user?.email || "customer@ceybuild.com";
      const phone = user?.phoneNumber || "0700000000";

      window.payhere.startPayment({
        sandbox: sandbox !== false,
        merchant_id: merchantId,
        return_url: undefined,
        cancel_url: undefined,
        notify_url: initRes.data.notifyUrl,
        order_id: orderId,
        items: `${type} payment for ${workerName}`,
        amount: parseFloat(amount).toFixed(2),
        currency: "LKR",
        hash: hash,
        first_name: firstName,
        last_name: lastName,
        email: email,
        phone: phone,
        address: "Colombo",
        city: "Colombo",
        country: "Sri Lanka",
      });
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "Failed to initiate payment");
    } finally {
      setLoading(false);
    }
  };

  if (!bookingId || !amount) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <p className="text-gray-500">Invalid payment parameters.</p>
          <button onClick={() => router.push("/dashboard/bookings")} className="mt-4 px-6 py-2 bg-primary text-white rounded-xl">
            Go to Bookings
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4 py-12">
      <div className="bg-white rounded-2xl shadow-lg p-8 max-w-md w-full">
        <div className="text-center mb-6">
          <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-1">
            {type === "ADVANCE" ? "Advance Payment" : "Balance Payment"}
          </h1>
          <p className="text-gray-500 text-sm">Complete your payment securely through PayHere</p>
        </div>

        <div className="bg-gray-50 rounded-xl p-4 mb-6">
          <h3 className="text-sm font-semibold text-gray-700 mb-3">Booking Details</h3>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-500">Service Provider</span>
              <span className="font-medium text-gray-900">{workerName}</span>
            </div>
            {serviceName && (
              <div className="flex justify-between">
                <span className="text-gray-500">Service</span>
                <span className="font-medium text-gray-900">{serviceName}</span>
              </div>
            )}
            {bookingDate && (
              <div className="flex justify-between">
                <span className="text-gray-500">Booking Date</span>
                <span className="font-medium text-gray-900">{bookingDate}</span>
              </div>
            )}
            <div className="flex justify-between">
              <span className="text-gray-500">Payment Type</span>
              <span className="font-medium text-gray-900">
                {type === "ADVANCE" ? "Advance (10%)" : "Remaining Balance"}
              </span>
            </div>
            <div className="border-t border-gray-200 mt-2 pt-2 flex justify-between">
              <span className="text-gray-700 font-semibold">Amount</span>
              <span className="text-xl font-bold text-primary">LKR {parseFloat(amount).toFixed(2)}</span>
            </div>
          </div>
        </div>

        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-6 text-sm text-amber-800">
          <p>
            Please review our{" "}
            <Link href="/refund-policy" className="font-semibold underline" target="_blank">
              Refund &amp; Cancellation Policy
            </Link>{" "}
            before making this payment. Payments are processed securely through PayHere.
          </p>
        </div>

        <label className="flex items-start gap-3 mb-6 cursor-pointer">
          <input
            type="checkbox"
            checked={agreed}
            onChange={(e) => setAgreed(e.target.checked)}
            className="mt-1 w-4 h-4 text-primary border-gray-300 rounded focus:ring-primary"
          />
          <span className="text-sm text-gray-600">
            I agree to the{" "}
            <Link href="/terms-and-conditions" className="text-primary font-medium underline" target="_blank">
              Terms &amp; Conditions
            </Link>{" "}
            and understand the applicable{" "}
            <Link href="/refund-policy" className="text-primary font-medium underline" target="_blank">
              Refund &amp; Cancellation Policy
            </Link>.
          </span>
        </label>

        <button
          onClick={handlePayment}
          disabled={loading || !sdkReady || !agreed}
          className="w-full py-4 bg-primary text-white font-bold rounded-xl hover:bg-primary-hover shadow-lg shadow-primary/30 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? "Processing..." : !sdkReady ? "Loading Payment Gateway..." : `Pay LKR ${parseFloat(amount).toFixed(2)}`}
        </button>

        <button
          onClick={() => router.push("/dashboard/bookings")}
          className="w-full mt-3 py-2 text-gray-500 text-sm hover:text-gray-700 transition-colors"
        >
          Cancel &amp; Go Back
        </button>
      </div>
    </div>
  );
}

function LoadingFallback() {
  return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
}

export default function PayhereCheckoutPage() {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <PayhereCheckoutContent />
    </Suspense>
  );
}