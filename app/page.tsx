/**
 * Home Page - Landing page for UNI LOCATE
 * This will be the main entry point of the application
 */
import Link from 'next/link'

export default function Home() {
  return (
    <>
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-primary to-primary-dark text-white py-12 sm:py-16 md:py-20">
        <div className="container mx-auto px-4 sm:px-6 text-center">
          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold mb-4 sm:mb-6">
            Welcome to UNI LOCATE
          </h1>
          <p className="text-lg sm:text-xl md:text-2xl mb-6 sm:mb-8 text-primary-lighter px-2">
            Smart Lost & Found System for Campus Students
          </p>
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center px-4">
            <Link 
              href="/lost"
              className="bg-white text-primary px-6 sm:px-8 py-2.5 sm:py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors text-sm sm:text-base"
            >
              Report Lost Item
            </Link>
            <Link 
              href="/found"
              className="bg-primary-light text-white px-6 sm:px-8 py-2.5 sm:py-3 rounded-lg font-semibold hover:bg-primary transition-colors text-sm sm:text-base"
            >
              Report Found Item
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-10 sm:py-12 md:py-16">
        <div className="container mx-auto px-4 sm:px-6">
          <h2 className="text-2xl sm:text-3xl font-bold text-center mb-8 sm:mb-10 md:mb-12 text-gray-800">
            How It Works
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8 max-w-4xl mx-auto">
            <div className="bg-white p-5 sm:p-6 rounded-lg shadow-md text-center">
              <div className="text-4xl mb-3 sm:mb-4">📸</div>
              <h3 className="text-lg sm:text-xl font-semibold mb-2">Upload Items</h3>
              <p className="text-sm sm:text-base text-gray-600">
                Upload photos of lost or found items with details
              </p>
            </div>

            <div className="bg-white p-5 sm:p-6 rounded-lg shadow-md text-center">
              <div className="text-4xl mb-3 sm:mb-4">💬</div>
              <h3 className="text-lg sm:text-xl font-semibold mb-2">Contact Safely</h3>


              <p className="text-sm sm:text-base text-gray-600">
                Contact safely with students through Gmail
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Quick Links Section */}
      <section className="bg-white py-10 sm:py-12 md:py-16">
        <div className="container mx-auto px-4 sm:px-6">
          <h2 className="text-2xl sm:text-3xl font-bold text-center mb-6 sm:mb-8 text-gray-800">
            Quick Actions
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 max-w-4xl mx-auto">
            <Link 
              href="/explore"
              className="bg-primary text-white p-5 sm:p-6 rounded-lg text-center hover:bg-primary-dark transition-colors"
            >
              <div className="text-3xl mb-2">🔍</div>
              <div className="font-semibold text-sm sm:text-base">Explore Items</div>
            </Link>
            <Link 
              href="/lost"
              className="bg-red-500 text-white p-5 sm:p-6 rounded-lg text-center hover:bg-red-600 transition-colors"
            >
              <div className="text-3xl mb-2">❌</div>
              <div className="font-semibold text-sm sm:text-base">Lost Something?</div>
            </Link>
            <Link 
              href="/found"
              className="bg-green-500 text-white p-5 sm:p-6 rounded-lg text-center hover:bg-green-600 transition-colors"
            >
              <div className="text-3xl mb-2">✅</div>
              <div className="font-semibold text-sm sm:text-base">Found Something?</div>
            </Link>
          </div>
        </div>
      </section>
    </>
  )
}

