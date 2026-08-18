"use client";

import { useEffect } from "react";
import Link from "next/link";

const LAST_UPDATED = "August 17, 2026";

export default function TermsAndConditionsPage() {
  useEffect(() => {
    document.title = "Terms & Conditions | CeyBuild";
  }, []);

  return (
    <div className="pt-24 pb-20 bg-white">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-4xl font-extrabold text-gray-900 mb-2">Terms & Conditions</h1>
        <p className="text-sm text-gray-500 mb-10">Last Updated: {LAST_UPDATED}</p>

        <div className="prose prose-gray max-w-none space-y-8 text-gray-700 leading-relaxed">

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-3">1. Introduction</h2>
            <p>
              Welcome to CeyBuild.com (&quot;CeyBuild,&quot; &quot;we,&quot; &quot;us,&quot; or &quot;our&quot;). These Terms & Conditions
              (&quot;Terms&quot;) govern your access to and use of the CeyBuild platform, including our website at
              ceybuild.com, our mobile applications, and all related services (collectively, the &quot;Platform&quot;).
            </p>
            <p className="mt-3">
              By accessing or using the Platform, you agree to be bound by these Terms. If you do not agree to
              these Terms, please do not use the Platform.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-3">2. About CeyBuild</h2>
            <p>
              CeyBuild.com is a digital platform designed to connect customers with skilled workers and service
              professionals for construction, repair, maintenance, renovation, and home-service needs in Sri Lanka.
            </p>
            <p className="mt-3">
              CeyBuild acts as an intermediary marketplace. We connect customers seeking services with independent
              skilled workers who offer those services. CeyBuild is not a party to any service agreement between
              a customer and a worker, and we do not directly employ the workers listed on our Platform.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-3">3. Eligibility to Use the Platform</h2>
            <p>To use CeyBuild, you must:</p>
            <ul className="list-disc pl-6 mt-2 space-y-1">
              <li>Be at least 18 years of age</li>
              <li>Have the legal capacity to enter into binding agreements</li>
              <li>Be a resident of Sri Lanka</li>
              <li>Provide accurate and truthful registration information</li>
            </ul>
            <p className="mt-3">
              By using the Platform, you represent and warrant that you meet these eligibility requirements.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-3">4. Customer Accounts</h2>
            <p>
              Customers may create an account to search for workers, make bookings, and manage their services.
              When creating a customer account, you agree to:
            </p>
            <ul className="list-disc pl-6 mt-2 space-y-1">
              <li>Provide accurate personal information including your full name, email address, and phone number</li>
              <li>Maintain the confidentiality of your account credentials</li>
              <li>Accept responsibility for all activities that occur under your account</li>
              <li>Notify CeyBuild immediately of any unauthorized use of your account</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-3">5. Worker Accounts</h2>
            <p>
              Workers may create a professional profile to offer their services to customers. When creating a
              worker account, you agree to:
            </p>
            <ul className="list-disc pl-6 mt-2 space-y-1">
              <li>Provide accurate and complete professional information</li>
              <li>Maintain a valid and up-to-date profile</li>
              <li>Honestly represent your skills, experience, and qualifications</li>
              <li>Comply with all applicable laws and regulations related to your trade</li>
              <li>Maintain the confidentiality of your account credentials</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-3">6. Worker Profile Information</h2>
            <p>
              Workers are responsible for the accuracy of their profile information, including their skills,
              experience, portfolio images, certificates, and descriptions. CeyBuild may verify worker profiles
              but does not guarantee the accuracy of all information provided by workers.
            </p>
            <p className="mt-3">
              Workers must ensure their profile content does not infringe on any third-party rights, including
              copyright or trademark rights.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-3">7. Services Offered Through the Platform</h2>
            <p>
              CeyBuild facilitates connections between customers and workers across various service categories,
              including but not limited to plumbing, electrical work, carpentry, painting, cleaning, landscaping,
              masonry, AC repair, and other construction and home-maintenance services.
            </p>
            <p className="mt-3">
              The specific services available on the Platform are determined by the workers registered on
              CeyBuild and the categories configured on the Platform. Service descriptions are provided by
              workers and CeyBuild does not warrant their accuracy.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-3">8. Customer Responsibilities</h2>
            <p>Customers using the Platform agree to:</p>
            <ul className="list-disc pl-6 mt-2 space-y-1">
              <li>Provide accurate booking information including service requirements, location, and preferred schedule</li>
              <li>Communicate respectfully with workers through the Platform</li>
              <li>Be present or make arrangements for access to the service location at the agreed time</li>
              <li>Make payments in accordance with the Platform&apos;s payment terms</li>
              <li>Review and confirm service completion in a timely manner</li>
              <li>Provide honest reviews and ratings after service completion</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-3">9. Worker Responsibilities</h2>
            <p>Workers using the Platform agree to:</p>
            <ul className="list-disc pl-6 mt-2 space-y-1">
              <li>Perform services with reasonable skill and care</li>
              <li>Arrive at the agreed time and location for scheduled bookings</li>
              <li>Communicate professionally and promptly with customers</li>
              <li>Complete services as described in the booking</li>
              <li>Maintain appropriate insurance and licenses where required by law</li>
              <li>Comply with all applicable health and safety regulations</li>
              <li>Keep customer information confidential</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-3">10. Booking Process</h2>
            <p>The booking process on CeyBuild follows these general steps:</p>
            <ul className="list-disc pl-6 mt-2 space-y-1">
              <li>A customer searches for and selects a worker or service category</li>
              <li>The customer creates a booking request with relevant details</li>
              <li>The worker reviews and accepts or rejects the booking</li>
              <li>Upon acceptance, the customer is prompted to make the required advance payment</li>
              <li>Once payment is verified, the booking is confirmed and the service can proceed</li>
            </ul>
            <p className="mt-3">
              Both parties are expected to honor confirmed bookings. CeyBuild is not responsible for
              no-shows, incomplete work, or disputes arising from the service relationship.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-3">11. Payment Process</h2>
            <p>
              All payments on CeyBuild are processed through our integrated payment gateway (PayHere).
              Payments are made in Sri Lankan Rupees (LKR).
            </p>
            <p className="mt-3">
              CeyBuild charges a platform commission on completed transactions. The commission rate
              is configured by CeyBuild administration and may be updated from time to time. Workers
              are informed of the applicable commission before confirming their earnings.
            </p>
            <p className="mt-3">
              CeyBuild does not store payment card details. All payment information is processed
              securely through the payment gateway provider.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-3">12. Advance Payment</h2>
            <p>
              When a worker accepts a booking, the customer may be required to make an advance
              payment through the Platform. The advance payment is a percentage of the total
              service amount, as determined by the Platform&apos;s payment configuration.
            </p>
            <p className="mt-3">
              The advance payment is held by CeyBuild and released to the worker (less any applicable
              platform commission) after the service is completed and confirmed. The advance payment
              secures the booking and commits both parties to the service agreement.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-3">13. Service Completion</h2>
            <p>
              After the service is performed, the booking status is updated to indicate completion.
              The customer may be required to confirm service completion and pay any remaining
              balance through the Platform.
            </p>
            <p className="mt-3">
              Once the service is fully completed and all payments are settled, an invoice is generated
              and the customer may leave a review and rating for the worker.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-3">14. Cancellation</h2>
            <p>
              Both customers and workers may cancel a booking under certain circumstances, subject
              to the following conditions:
            </p>
            <ul className="list-disc pl-6 mt-2 space-y-1">
              <li><strong>Customer cancellation:</strong> Customers may cancel a booking before the service
                has commenced. Refund eligibility depends on the timing of the cancellation and
                whether the worker has already incurred costs.</li>
              <li><strong>Worker cancellation:</strong> Workers may cancel a booking if they are unable to
                perform the service. In such cases, any advance payment made by the customer
                will be handled in accordance with the Refund Policy.</li>
            </ul>
            <p className="mt-3">
              For detailed cancellation terms, please refer to our{" "}
              <Link href="/refund-policy" className="text-primary hover:underline font-medium">
                Refund &amp; Cancellation Policy
              </Link>.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-3">15. Rescheduling</h2>
            <p>
              Bookings may be rescheduled by mutual agreement between the customer and the worker.
              Rescheduling requests should be communicated through the Platform. If a booking is
              rescheduled, the existing payment remains applied to the new date.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-3">16. Reviews and Ratings</h2>
            <p>
              After a service is completed, customers may leave a review and rating for the worker.
              Reviews should be honest, fair, and based on the actual service experience.
            </p>
            <p className="mt-3">
              CeyBuild reserves the right to remove reviews that contain offensive language, false
              information, or that violate our community guidelines. Workers may respond to reviews
              but must maintain a professional tone.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-3">17. Prohibited Activities</h2>
            <p>Users of the Platform must not:</p>
            <ul className="list-disc pl-6 mt-2 space-y-1">
              <li>Use the Platform for any unlawful purpose</li>
              <li>Provide false or misleading information</li>
              <li>Circumvent the Platform&apos;s payment system by making direct arrangements with other users</li>
              <li>Harass, abuse, or threaten other users</li>
              <li>Attempt to gain unauthorized access to the Platform or other users&apos; accounts</li>
              <li>Upload malicious content or code</li>
              <li>Impersonate another person or entity</li>
              <li>Use automated tools to access the Platform without written permission</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-3">18. Platform Responsibilities</h2>
            <p>CeyBuild commits to:</p>
            <ul className="list-disc pl-6 mt-2 space-y-1">
              <li>Maintain the Platform in a functional and secure state</li>
              <li>Process payments securely through the integrated payment gateway</li>
              <li>Provide reasonable customer support for platform-related issues</li>
              <li>Protect user data in accordance with our Privacy Policy</li>
              <li>Review and take action on reported issues in a timely manner</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-3">19. Limitation of Liability</h2>
            <p>
              To the maximum extent permitted by law, CeyBuild shall not be liable for any indirect,
              incidental, special, consequential, or punitive damages arising out of or related to your
              use of the Platform.
            </p>
            <p className="mt-3">
              CeyBuild is not responsible for the quality, safety, legality, or availability of services
              provided by workers. CeyBuild is not a party to agreements between customers and workers
              and does not guarantee the performance of either party.
            </p>
            <p className="mt-3">
              The Platform is provided &quot;as is&quot; and &quot;as available&quot; without warranties of any kind,
              whether express or implied.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-3">20. Dispute Handling</h2>
            <p>
              If a dispute arises between a customer and a worker, CeyBuild encourages both parties to
              resolve the matter directly through the Platform&apos;s communication tools.
            </p>
            <p className="mt-3">
              CeyBuild may, at its discretion, assist in mediating disputes but is not obligated to do so.
              CeyBuild is not responsible for resolving disputes and does not act as an arbitrator.
            </p>
            <p className="mt-3">
              If you have a dispute, please contact us at{" "}
              <a href="mailto:infoceybuild@gmail.com" className="text-primary hover:underline">
                infoceybuild@gmail.com
              </a>.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-3">21. Account Suspension/Termination</h2>
            <p>
              CeyBuild reserves the right to suspend or terminate your account at any time if we
              believe you have violated these Terms or engaged in conduct that is harmful to the
              Platform, other users, or our business.
            </p>
            <p className="mt-3">
              You may also terminate your account at any time by contacting us. Upon termination,
              your right to use the Platform ceases immediately. Any pending bookings and payments
              will be handled in accordance with our policies.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-3">22. Changes to Terms</h2>
            <p>
              CeyBuild reserves the right to update these Terms at any time. Changes will be
              posted on this page with an updated &quot;Last Updated&quot; date. Your continued use of
              the Platform after changes are posted constitutes your acceptance of the updated Terms.
            </p>
            <p className="mt-3">
              We encourage you to review these Terms periodically to stay informed about your
              rights and responsibilities.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-3">23. Contact Information</h2>
            <p>If you have questions about these Terms, please contact us:</p>
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
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
