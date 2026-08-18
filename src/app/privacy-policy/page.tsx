"use client";

import { useEffect } from "react";

const LAST_UPDATED = "August 17, 2026";

export default function PrivacyPolicyPage() {
  useEffect(() => {
    document.title = "Privacy Policy | CeyBuild";
  }, []);

  return (
    <div className="pt-24 pb-20 bg-white">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-4xl font-extrabold text-gray-900 mb-2">Privacy Policy</h1>
        <p className="text-sm text-gray-500 mb-10">Last Updated: {LAST_UPDATED}</p>

        <div className="prose prose-gray max-w-none space-y-8 text-gray-700 leading-relaxed">

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-3">1. Introduction</h2>
            <p>
              At CeyBuild.com (&quot;CeyBuild,&quot; &quot;we,&quot; &quot;us,&quot; or &quot;our&quot;), we are committed to protecting
              your privacy. This Privacy Policy explains how we collect, use, share, and protect
              your personal information when you use our website at ceybuild.com, our mobile
              applications, and all related services (collectively, the &quot;Platform&quot;).
            </p>
            <p className="mt-3">
              By using the Platform, you consent to the collection and use of your information
              as described in this Privacy Policy. If you do not agree with this policy, please
              do not use the Platform.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-3">2. Information We Collect</h2>
            <p>We collect information that you provide directly to us and information generated through your use of the Platform.</p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-3">3. Account Information</h2>
            <p>When you create an account on CeyBuild, we collect:</p>
            <ul className="list-disc pl-6 mt-2 space-y-1">
              <li>Full name</li>
              <li>Email address</li>
              <li>Phone number</li>
              <li>Password (stored in encrypted form)</li>
              <li>Profile image (if uploaded)</li>
              <li>Account role (Customer, Worker, or Admin)</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-3">4. Contact Information</h2>
            <p>
              We may collect your contact information including email address, phone number,
              and postal address when you contact our support team, complete forms on the
              Platform, or communicate with other users through the Platform.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-3">5. Location Information</h2>
            <p>
              We collect location information you provide when creating bookings or worker
              profiles, including your city, district, and province. This information is used
              to match customers with nearby workers and to improve service delivery.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-3">6. Booking Information</h2>
            <p>When you create or manage bookings, we collect:</p>
            <ul className="list-disc pl-6 mt-2 space-y-1">
              <li>Service description and requirements</li>
              <li>Preferred dates and times</li>
              <li>Service location</li>
              <li>Booking status and history</li>
              <li>Communications between you and other users related to bookings</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-3">7. Payment-Related Information</h2>
            <p>
              When you make payments through CeyBuild, we collect and process payment
              information necessary to complete the transaction. This includes:
            </p>
            <ul className="list-disc pl-6 mt-2 space-y-1">
              <li>Transaction amounts and types</li>
              <li>Order and transaction reference IDs</li>
              <li>Payment status and history</li>
              <li>Booking-to-payment associations</li>
            </ul>
            <p className="mt-3">
              <strong>Important:</strong> We do not store your credit card number, CVV, or
              full banking details on our servers. All payment card information is processed
              directly by our payment gateway provider (PayHere) and is subject to their own
              privacy and security policies.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-3">8. Reviews and Ratings</h2>
            <p>
              When you leave a review or rating on the Platform, we collect the review content,
              rating score, and associated booking information. Reviews are visible to other
              users of the Platform.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-3">9. Device and Technical Information</h2>
            <p>
              We may automatically collect certain technical information when you access the
              Platform, including:
            </p>
            <ul className="list-disc pl-6 mt-2 space-y-1">
              <li>IP address</li>
              <li>Browser type and version</li>
              <li>Device type and operating system</li>
              <li>Pages visited and time spent on the Platform</li>
              <li>Referring website or source</li>
            </ul>
            <p className="mt-3">
              This information is used for analytics, security, and improving the Platform.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-3">10. How Information Is Used</h2>
            <p>We use the information we collect to:</p>
            <ul className="list-disc pl-6 mt-2 space-y-1">
              <li>Provide, maintain, and improve the Platform</li>
              <li>Process bookings and payments</li>
              <li>Connect customers with appropriate workers</li>
              <li>Send booking confirmations, updates, and notifications</li>
              <li>Communicate with you about your account, bookings, and support requests</li>
              <li>Detect, prevent, and address technical issues and fraud</li>
              <li>Enforce our Terms &amp; Conditions</li>
              <li>Generate anonymized analytics and platform insights</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-3">11. How Information Is Shared</h2>
            <p>We may share your information in the following circumstances:</p>
            <ul className="list-disc pl-6 mt-2 space-y-1">
              <li><strong>Between customers and workers:</strong> When a booking is created, relevant information (such as name, contact details, and service location) is shared with the other party to facilitate the service.</li>
              <li><strong>With service providers:</strong> We share information with third-party services that help us operate the Platform (see Section 12 below).</li>
              <li><strong>For legal compliance:</strong> We may disclose information if required by law, regulation, or legal process.</li>
              <li><strong>With your consent:</strong> We may share information for other purposes with your explicit consent.</li>
            </ul>
            <p className="mt-3">
              We do not sell your personal information to third parties.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-3">12. Service Providers</h2>
            <p>We use the following categories of third-party service providers:</p>
            <ul className="list-disc pl-6 mt-2 space-y-1">
              <li><strong>Payment providers:</strong> PayHere processes payments on our behalf. They receive transaction information necessary to process payments but do not receive unnecessary personal data.</li>
              <li><strong>Authentication providers:</strong> Firebase Authentication manages user sign-in and account security. Authentication credentials are handled by Firebase and are not stored on our servers.</li>
              <li><strong>Image/file storage providers:</strong> Cloudinary stores profile images, portfolio images, and other uploaded files.</li>
              <li><strong>Hosting providers:</strong> Our Platform is hosted on secure cloud infrastructure that maintains industry-standard security practices.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-3">13. Data Security</h2>
            <p>
              We implement industry-standard security measures to protect your personal information,
              including:
            </p>
            <ul className="list-disc pl-6 mt-2 space-y-1">
              <li>Encrypted data transmission (HTTPS/TLS)</li>
              <li>Encrypted password storage</li>
              <li>Role-based access controls</li>
              <li>Regular security reviews</li>
              <li>Secure authentication through Firebase</li>
            </ul>
            <p className="mt-3">
              However, no method of electronic transmission or storage is 100% secure. While we
              strive to use commercially acceptable means to protect your data, we cannot guarantee
              absolute security.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-3">14. Data Retention</h2>
            <p>
              We retain your personal information for as long as your account is active or as
              needed to provide the Platform. We may retain certain information as required by
              law or for legitimate business purposes, such as:
            </p>
            <ul className="list-disc pl-6 mt-2 space-y-1">
              <li>Transaction and payment records for financial compliance</li>
              <li>Booking history for dispute resolution</li>
              <li>Communications for customer support purposes</li>
            </ul>
            <p className="mt-3">
              When you delete your account, we will remove or anonymize your personal information
              within a reasonable timeframe, except where retention is required by law.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-3">15. User Rights</h2>
            <p>You have the right to:</p>
            <ul className="list-disc pl-6 mt-2 space-y-1">
              <li>Access the personal information we hold about you</li>
              <li>Request correction of inaccurate data</li>
              <li>Request deletion of your personal information</li>
              <li>Object to or restrict the processing of your data</li>
              <li>Request a copy of your data in a portable format</li>
              <li>Withdraw consent where processing is based on consent</li>
            </ul>
            <p className="mt-3">
              To exercise these rights, please contact us at{" "}
              <a href="mailto:infoceybuild@gmail.com" className="text-primary hover:underline">
                infoceybuild@gmail.com
              </a>.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-3">16. Cookies and Local Storage</h2>
            <p>
              The Platform uses cookies and local storage to maintain your login session, remember
              your preferences, and improve your experience. You can control cookie settings
              through your browser preferences.
            </p>
            <p className="mt-3">
              We use essential cookies for authentication and session management. We do not use
              third-party advertising cookies.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-3">17. Children&apos;s Privacy</h2>
            <p>
              The Platform is not intended for use by children under 18 years of age. We do not
              knowingly collect personal information from children. If we become aware that we
              have collected personal information from a child, we will take steps to delete
              that information promptly.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-3">18. Changes to This Privacy Policy</h2>
            <p>
              We may update this Privacy Policy from time to time. Changes will be posted on
              this page with an updated &quot;Last Updated&quot; date. We encourage you to review this
              policy periodically.
            </p>
            <p className="mt-3">
              Your continued use of the Platform after changes are posted constitutes acceptance
              of the updated Privacy Policy.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-3">19. Contact Information</h2>
            <p>If you have questions about this Privacy Policy, please contact us:</p>
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