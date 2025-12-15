'use client'

import Link from 'next/link'

export default function HelpCentre() {
  const faqs = [
    {
      question: 'How do I report a lost item?',
      answer:
        'Click on "Lost Items" in the navigation menu, fill in the details about your lost item including the title, description, category, location where it was lost, and attach a photo if available. Submit the form and your item will be listed immediately.',
    },
    {
      question: 'How do I report a found item?',
      answer:
        'Navigate to "Found Items" and complete the form with details about the item you found. Include the location where you found it, a clear description, and a photo. Once submitted, the system will automatically match it with similar lost items.',
    },


    {
      question: 'What categories can I choose from?',
      answer:
        'Available categories include: Electronics, Accessories, Clothing, Books, Bags, Jewelry, Documents, and Other. Choose the category that best matches your item.',
    },
    {
      question: 'Can I edit or delete my listings?',
      answer:
        'You can modify your item listings through your dashboard. If an item is successfully matched or resolved, mark it as "resolved" to remove it from active listings.',
    },
    {
      question: 'Is my personal information safe?',
      answer:
        'Yes, we use Firebase Authentication for secure login and encrypted data storage. Your personal information is never shared publicly without your consent. Only matched users can see your contact information.',
    },
    {
      question: 'What if I find multiple matches for my item?',
      answer:
        'You will receive notifications for all potential matches. Review each match based on the match score and details. You can communicate with multiple people to verify which item is yours.',
    },
    {
      question: 'How long do listings stay active?',
      answer:
        'Lost and found items stay active for 90 days. You can manually mark items as "resolved" at any time when you no longer need assistance finding or returning the item.',
    },


  ]

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-primary to-blue-600 text-white py-12 sm:py-16">
        <div className="container mx-auto px-4 sm:px-6">
          <h1 className="text-4xl sm:text-5xl font-bold mb-4">Help Centre</h1>
          <p className="text-lg opacity-90">
            Find answers to common questions about UNI LOCATE
          </p>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 sm:px-6 py-12 sm:py-16">
        <div className="max-w-3xl mx-auto">
          {/* Search/Navigation */}
          <div className="mb-12">
            <Link
              href="/"
              className="text-primary hover:underline text-sm font-semibold mb-6 inline-block"
            >
              ← Back to Home
            </Link>
          </div>

          {/* FAQs */}
          <div className="space-y-6">
            {faqs.map((faq, index) => (
              <div
                key={index}
                className="bg-white rounded-lg shadow-md hover:shadow-lg transition p-6"
              >
                <h3 className="text-lg font-semibold text-gray-900 mb-3">
                  {faq.question}
                </h3>
                <p className="text-gray-600 leading-relaxed">{faq.answer}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
