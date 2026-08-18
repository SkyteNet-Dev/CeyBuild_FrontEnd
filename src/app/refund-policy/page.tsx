"use client";

import { useEffect } from "react";
import Link from "next/link";

const LAST_UPDATED = "August 17, 2026";

export default function RefundPolicyPage() {
  useEffect(() => {
    document.title = "Refund & Cancellation Policy | CeyBuild";
  }, []);

  return (
    <div className="pt-24 pb-20 bg-white">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-4xl font-extrabold text-gray-900 mb-2">Refund &amp; Cancellation Policy</h1>
        <p className="text-sm text-gray-500 mb-10">Last Updated: {LAST_UPDATED}</p>

        <div className="bg-amber-50 border border-amber-200 rounded-xl p-5 mb-10">
          <p className="text-amber-800 text-sm">
            <strong>Important:</strong> This policy applies to services booked and paid through the
            CeyBuild.com platform. CeyBuild acts as an intermediary between customers and independent
            skilled workers. Please read this policy carefully before making a booking.
          </p>
        </div>

        <div className="prose prose-gray max-w-none space-y-8 text-gray-700 leading-relaxed">

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-3">A. Advance Payment</h2>
            <p>
              When a worker accepts a booking on CeyBuild, the customer may be required to make an
              advance payment to secure the booking. The advance payment amount is a percentage of
              the total estimated service cost, as determined by the Platform&apos;s payment configuration.
            </p>
            <p className="mt-3">
              The advance payment is processed through our integrated payment gateway (PayHere) and
              is held by CeyBuild until the service is completed. Upon successful completion of the
              service, the advance payment (less any applicable platform commission) is released to
              the worker.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-3">B. Booking Cancellation</h2>
            <p>
              A booking may be cancelled by either the customer or the worker. The cancellation
              terms depend on the booking status at the time of cancellation:
            </p>
            <ul className="list-disc pl-6 mt-2 space-y-2">
              <li>
                <strong>Before worker acceptance:</strong> If the customer cancels before the worker
                accepts the booking, no payment is collected and the booking is simply closed.
              </li>
              <li>
                <strong>After acceptance, before advance payment:</strong> If the customer cancels
                after the worker accepts but before making the advance payment, the booking is
                cancelled and no payment is processed.
              </li>
              <li>
                <strong>After advance payment:</strong> Cancellation after the advance payment has
                been made is subject to the specific cancellation terms below for customers and
                workers.
              </li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-3">C. Worker Cancellation</h2>
            <p>
              If a worker cancels a booking after the customer has made an advance payment:
            </p>
            <ul className="list-disc pl-6 mt-2 space-y-1">
              <li>The customer will be notified of the cancellation</li>
              <li>The customer may request a refund of the advance payment</li>
              <li>CeyBuild will review the cancellation and process a refund where appropriate</li>
              <li>Repeated cancellations by workers may result in account review or suspension</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-3">D. Customer Cancellation</h2>
            <p>
              If a customer cancels a booking after making an advance payment:
            </p>
            <ul className="list-disc pl-6 mt-2 space-y-1">
              <li>
                <strong>Before the service has commenced:</strong> The customer may request a
                cancellation. Refund eligibility will be assessed based on whether the worker has
                already incurred costs or traveled to the service location.
              </li>
              <li>
                <strong>After the service has commenced:</strong> Cancellation after the service
                has begun may not be eligible for a full refund. The customer should contact
                CeyBuild support to discuss the situation.
              </li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-3">E. Rescheduling</h2>
            <p>
              Bookings may be rescheduled by mutual agreement between the customer and the worker
              through the Platform. If a booking is rescheduled:
            </p>
            <ul className="list-disc pl-6 mt-2 space-y-1">
              <li>The existing advance payment remains applied to the rescheduled date</li>
              <li>No additional cancellation fees apply for rescheduling</li>
              <li>Both parties must agree to the new date and time</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-3">F. Service Not Completed</h2>
            <p>
              If the service is not completed as agreed:
            </p>
            <ul className="list-disc pl-6 mt-2 space-y-1">
              <li>The customer should report the issue through the Platform</li>
              <li>CeyBuild will review the situation and may mediate between the parties</li>
              <li>A partial or full refund may be issued depending on the circumstances</li>
              <li>Both parties may be asked to provide evidence or documentation</li>
            </ul>
            <p className="mt-3">
              CeyBuild encourages customers to report incomplete services promptly so that
              the issue can be addressed while relevant details are fresh.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-3">G. Duplicate Payment</h2>
            <p>
              If a customer accidentally makes a duplicate payment for the same booking:
            </p>
            <ul className="list-disc pl-6 mt-2 space-y-1">
              <li>The duplicate payment will be identified during reconciliation</li>
              <li>The excess amount will be refunded to the original payment method</li>
              <li>Customers should contact support with their transaction reference IDs</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-3">H. Failed Payment</h2>
            <p>
              If a payment fails during processing:
            </p>
            <ul className="list-disc pl-6 mt-2 space-y-1">
              <li>The booking status will not be updated to &quot;paid&quot;</li>
              <li>No charge is applied to the customer&apos;s payment method</li>
              <li>The customer may retry the payment or use a different payment method</li>
              <li>If an amount was deducted but the payment failed, the bank will typically reverse the charge automatically within a few business days</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-3">I. Incorrect Payment</h2>
            <p>
              If a payment is made for an incorrect amount or to the wrong booking:
            </p>
            <ul className="list-disc pl-6 mt-2 space-y-1">
              <li>Contact CeyBuild support immediately with the transaction details</li>
              <li>Provide the order ID, booking ID, and payment reference</li>
              <li>CeyBuild will investigate and take corrective action where appropriate</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-3">J. Refund Processing</h2>
            <p>
              If a refund is approved:
            </p>
            <ul className="list-disc pl-6 mt-2 space-y-1">
              <li>Refunds are processed back to the original payment method</li>
              <li>Processing times may vary depending on the payment provider and bank</li>
              <li>Typical refund processing takes 5-10 business days</li>
              <li>Customers will be notified when a refund is initiated</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-3">K. Payment Disputes</h2>
            <p>
              If you have a dispute regarding a payment:
            </p>
            <ul className="list-disc pl-6 mt-2 space-y-1">
              <li>Contact CeyBuild support within 7 days of the transaction</li>
              <li>Provide all relevant details including booking ID, transaction ID, and a description of the issue</li>
              <li>CeyBuild will investigate the dispute and work toward a resolution</li>
              <li>Both parties may be asked to provide additional information</li>
            </ul>
            <p className="mt-3">
              CeyBuild will make reasonable efforts to resolve payment disputes fairly. However,
              CeyBuild is not a financial institution and cannot guarantee outcomes for disputes
              that are outside our control.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-3">L. Contacting CeyBuild</h2>
            <p>For refund requests, cancellation issues, or payment disputes, please contact us:</p>
            <div className="mt-3 bg-gray-50 p-5 rounded-xl">
              <p className="font-semibold text-gray-900">CeyBuild.com</p>
              <p className="mt-1">
                Email:{" "}
                <a href="mailto:infoceybuild@gmail.com" className="text-primary hover:underline">
                  infoceybuild@gmail.com
                </a>
              </p>
              <p>
                Phone:{" "}
                <a href="tel:0722233196" className="text-primary hover:underline">
                  072 223 3196
                </a>
              </p>
              <p className="mt-2 text-sm text-gray-500">
                Please include your booking ID and transaction reference when contacting us.
              </p>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}