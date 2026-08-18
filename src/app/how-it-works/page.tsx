"use client";

import { useEffect } from "react";
import AnimatedSection from "@/components/AnimatedSection";
import Link from "next/link";
import {
  HiOutlineSearch,
  HiOutlineUser,
  HiOutlineClipboardCheck,
  HiOutlineCreditCard,
  HiOutlineShieldCheck,
  HiOutlineChat,
  HiOutlineCog,
  HiOutlineStar,
  HiCheckCircle,
} from "react-icons/hi";

export default function HowItWorksPage() {
  useEffect(() => {
    document.title = "How CeyBuild Works | CeyBuild";
  }, []);

  const steps = [
    {
      num: "1",
      icon: <HiOutlineSearch className="w-7 h-7" />,
      title: "Search for a Worker",
      desc: "Browse through our categories or search for a specific service. Filter by location, ratings, and availability to find the right professional.",
    },
    {
      num: "2",
      icon: <HiOutlineUser className="w-7 h-7" />,
      title: "View Worker Profile",
      desc: "Review the worker's profile including their skills, experience, portfolio, ratings, and reviews from other customers.",
    },
    {
      num: "3",
      icon: <HiOutlineClipboardCheck className="w-7 h-7" />,
      title: "Create a Booking",
      desc: "Submit a booking request with your service requirements, preferred date, and location details.",
    },
    {
      num: "4",
      icon: <HiOutlineShieldCheck className="w-7 h-7" />,
      title: "Worker Accepts",
      desc: "The worker reviews your request and accepts the booking. You'll be notified when the booking is confirmed.",
    },
    {
      num: "5",
      icon: <HiOutlineCreditCard className="w-7 h-7" />,
      title: "Make Advance Payment",
      desc: "After the worker accepts, you'll be prompted to make an advance payment through our secure payment gateway (PayHere). This confirms your booking.",
    },
    {
      num: "6",
      icon: <HiOutlineChat className="w-7 h-7" />,
      title: "Connect with the Worker",
      desc: "Once the advance payment is confirmed, you can communicate with the worker through the platform to finalize details.",
    },
    {
      num: "7",
      icon: <HiOutlineCog className="w-7 h-7" />,
      title: "Service is Performed",
      desc: "The worker arrives at your location and performs the agreed service.",
    },
    {
      num: "8",
      icon: <HiOutlineCreditCard className="w-7 h-7" />,
      title: "Pay Remaining Balance",
      desc: "After the service is completed, you pay any remaining balance through the platform.",
    },
    {
      num: "9",
      icon: <HiOutlineStar className="w-7 h-7" />,
      title: "Leave a Review",
      desc: "Share your experience by leaving a rating and review to help other customers find quality workers.",
    },
  ];

  return (
    <div className="pt-24 pb-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        <AnimatedSection className="text-center mb-16 max-w-3xl mx-auto">
          <h1 className="text-4xl font-extrabold text-gray-900 mb-4">How CeyBuild Works</h1>
          <p className="text-lg text-gray-600">
            Getting your home services done is simple. Here&apos;s how the CeyBuild platform
            connects you with skilled workers from search to completion.
          </p>
        </AnimatedSection>

        <div className="max-w-3xl mx-auto mb-20">
          <div className="relative">
            <div className="absolute left-8 top-0 bottom-0 w-0.5 bg-primary/10 hidden md:block" />

            <div className="space-y-8">
              {steps.map((step, i) => (
                <AnimatedSection key={i} delay={i * 0.05}>
                  <div className="flex gap-6 items-start">
                    <div className="w-16 h-16 rounded-full bg-primary text-white flex items-center justify-center text-xl font-bold shrink-0 shadow-lg shadow-primary/20 relative z-10">
                      {step.num}
                    </div>
                    <div className="flex-1 bg-gray-50 rounded-2xl p-6 border border-gray-100">
                      <div className="flex items-center gap-3 mb-2">
                        <span className="text-primary">{step.icon}</span>
                        <h3 className="text-xl font-bold text-gray-900">{step.title}</h3>
                      </div>
                      <p className="text-gray-600">{step.desc}</p>
                    </div>
                  </div>
                </AnimatedSection>
              ))}
            </div>
          </div>
        </div>

        <AnimatedSection className="mb-16">
          <h2 className="text-3xl font-bold text-gray-900 text-center mb-12">How Payments Work</h2>
          <div className="max-w-3xl mx-auto">
            <div className="bg-gray-50 rounded-3xl p-8 border border-gray-100">
              <div className="space-y-6">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 bg-primary/10 text-primary rounded-lg flex items-center justify-center shrink-0 font-bold text-sm">A</div>
                  <div>
                    <h3 className="font-bold text-gray-900">Advance Payment</h3>
                    <p className="text-gray-600 text-sm mt-1">
                      After the worker accepts your booking, you&apos;ll be required to make an advance
                      payment through PayHere, our integrated payment gateway. This payment secures
                      your booking and confirms the service arrangement.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 bg-primary/10 text-primary rounded-lg flex items-center justify-center shrink-0 font-bold text-sm">B</div>
                  <div>
                    <h3 className="font-bold text-gray-900">Payment Verification</h3>
                    <p className="text-gray-600 text-sm mt-1">
                      Your payment is verified server-side through PayHere&apos;s secure notification
                      system. The booking status is updated only after the payment is confirmed by
                      the gateway — never based solely on the frontend redirect.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 bg-primary/10 text-primary rounded-lg flex items-center justify-center shrink-0 font-bold text-sm">C</div>
                  <div>
                    <h3 className="font-bold text-gray-900">Remaining Balance</h3>
                    <p className="text-gray-600 text-sm mt-1">
                      After the service is completed, you&apos;ll pay any remaining balance through the
                      platform. Once fully paid, an invoice is generated and you can leave a review.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 bg-primary/10 text-primary rounded-lg flex items-center justify-center shrink-0 font-bold text-sm">D</div>
                  <div>
                    <h3 className="font-bold text-gray-900">Secure Processing</h3>
                    <p className="text-gray-600 text-sm mt-1">
                      All payments are processed through PayHere. CeyBuild does not store your
                      credit card details. Transaction reference IDs are stored securely for
                      dispute resolution and record-keeping.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </AnimatedSection>

        <AnimatedSection className="mb-16">
          <h2 className="text-3xl font-bold text-gray-900 text-center mb-8">Important Notes</h2>
          <div className="max-w-3xl mx-auto grid sm:grid-cols-2 gap-4">
            {[
              "Never trust payment status based only on the frontend redirect",
              "Payment is confirmed only after server-side verification",
              "Payment secrets are never exposed to the frontend",
              "Failed, cancelled, and pending payments are handled separately",
              "Duplicate payment processing is prevented by the system",
              "Transaction IDs are stored securely for reference",
            ].map((note, i) => (
              <div key={i} className="flex items-start gap-2 text-sm text-gray-600 bg-gray-50 rounded-xl p-4 border border-gray-100">
                <HiCheckCircle className="text-green-500 mt-0.5 shrink-0" />
                <span>{note}</span>
              </div>
            ))}
          </div>
        </AnimatedSection>

        <AnimatedSection className="text-center bg-primary rounded-3xl p-10 md:p-16 text-white relative overflow-hidden">
          <div className="relative z-10">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Ready to Get Started?</h2>
            <p className="text-xl opacity-90 mb-8 max-w-2xl mx-auto">
              Find skilled workers for your next project. It&apos;s fast, easy, and secure.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Link
                href="/search"
                className="inline-block bg-white text-primary font-bold text-lg px-8 py-4 rounded-full shadow-xl hover:shadow-2xl hover:bg-gray-50 transition-all"
              >
                Find a Worker
              </Link>
              <Link
                href="/auth/register?role=worker"
                className="inline-block bg-white/20 backdrop-blur-sm text-white font-bold text-lg px-8 py-4 rounded-full border border-white/30 hover:bg-white/30 transition-all"
              >
                Become a Worker
              </Link>
            </div>
          </div>
        </AnimatedSection>
      </div>
    </div>
  );
}