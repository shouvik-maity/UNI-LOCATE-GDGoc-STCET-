'use client'

import Link from 'next/link'

export default function PrivacyPolicy() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-primary to-blue-600 text-white py-12 sm:py-16">
        <div className="container mx-auto px-4 sm:px-6">
          <h1 className="text-4xl sm:text-5xl font-bold mb-4">Privacy Policy</h1>
          <p className="text-lg opacity-90">
            Your privacy is important to us. Learn how we protect your data.
          </p>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 sm:px-6 py-12 sm:py-16">
        <div className="max-w-3xl mx-auto">
          {/* Navigation */}
          <div className="mb-12">
            <Link
              href="/"
              className="text-primary hover:underline text-sm font-semibold mb-6 inline-block"
            >
              ← Back to Home
            </Link>
          </div>

          {/* Last Updated */}
          <p className="text-gray-500 text-sm mb-8">
            Last Updated: December 13, 2025
          </p>

          {/* Content Sections */}
          <div className="space-y-8">
            {/* Section 1 */}
            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                1. Introduction
              </h2>
              <p className="text-gray-600 leading-relaxed">
                This page informs you of our policies regarding the collection,
                use, and disclosure of personal data when you use our Service
                and the choices you have associated with that data.
              </p>
            </section>

            {/* Section 2 */}
            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                2. Information Collection and Use
              </h2>
              <p className="text-gray-600 leading-relaxed mb-4">
                We collect several different types of information for various
                purposes to provide and improve our Service to you.
              </p>
              <h3 className="text-lg font-semibold text-gray-800 mb-2">
                Types of Data Collected:
              </h3>
              <ul className="list-disc list-inside space-y-2 text-gray-600">
                <li>
                  <strong>Personal Data:</strong> Email address, name, phone
                  number, profile information
                </li>
                <li>
                  <strong>Item Data:</strong> Photos, descriptions, categories,
                  locations of lost/found items
                </li>
                <li>
                  <strong>Communication Data:</strong> Chat messages and
                  inquiries
                </li>
                <li>
                  <strong>Usage Data:</strong> Log data, browser type, pages
                  visited
                </li>
              </ul>
            </section>

            {/* Section 3 */}
            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                3. Use of Data
              </h2>
              <p className="text-gray-600 leading-relaxed mb-4">
                UNI LOCATE uses the collected data for various purposes:
              </p>
              <ul className="list-disc list-inside space-y-2 text-gray-600">
                <li>To provide and maintain our Service</li>
                <li>
                  To notify you about changes to our Service or policies
                </li>
                <li>To provide customer support</li>
                <li>To gather analysis or valuable information for improvement</li>
                <li>To monitor the usage of our Service</li>
                <li>To detect, prevent, and address fraud and other issues</li>
                <li>To match lost and found items using AI technology</li>
              </ul>
            </section>

            {/* Section 4 */}
            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                4. Security of Data
              </h2>
              <p className="text-gray-600 leading-relaxed">
                The security of your data is important to us but remember that
                no method of transmission over the Internet or method of
                electronic storage is 100% secure. While we strive to use
                commercially acceptable means to protect your Personal Data, we
                cannot guarantee its absolute security. We use Firebase
                Authentication and encryption protocols to secure your data.
              </p>
            </section>

            {/* Section 5 */}
            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                5. Changes to This Privacy Policy
              </h2>
              <p className="text-gray-600 leading-relaxed">
                We may update our Privacy Policy from time to time. We will
                notify you of any changes by posting the new Privacy Policy on
                this page and updating the "Last Updated" date at the top of
                this Privacy Policy.
              </p>
            </section>






            {/* Section 6 */}
            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                6. User Rights
              </h2>
              <p className="text-gray-600 leading-relaxed mb-4">
                You have the right to:
              </p>
              <ul className="list-disc list-inside space-y-2 text-gray-600">
                <li>Access your personal data</li>
                <li>Correct inaccurate personal data</li>
                <li>Request deletion of your data</li>
                <li>Object to processing of your data</li>
                <li>Request restriction of processing</li>
                <li>Data portability</li>
              </ul>
            </section>

            {/* Section 7 */}
            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                7. Third-Party Services
              </h2>
              <p className="text-gray-600 leading-relaxed">
                Our Service may contain links to third-party sites that are not
                operated by us. This Privacy Policy does not apply to such
                third-party services, and we are not responsible for their
                privacy practices. We encourage you to review the Privacy Policy
                of any third-party service before providing your personal
                information.
              </p>
            </section>
          </div>

          {/* Confirmation */}
          <div className="bg-blue-50 rounded-lg shadow-md p-8 mt-12">
            <h2 className="text-xl font-bold text-gray-900 mb-4">
              Privacy Commitment
            </h2>
            <p className="text-gray-600 leading-relaxed">
              We are committed to protecting your privacy and ensuring you have
              a positive experience on our platform. If you have any concerns or
              questions about how we handle your data, please don't hesitate to
              contact us.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
