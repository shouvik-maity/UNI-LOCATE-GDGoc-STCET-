/**
 * Footer Component - Fully Responsive
 * Provides footer information and links
 */
import Link from 'next/link'

export default function Footer() {
  return (

    <footer className="bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white mt-auto">
      <div className="container mx-auto px-4 sm:px-6 py-6 sm:py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
          {/* Brand Section */}
          <div className="space-y-4">
            <h3 className="text-2xl font-bold text-primary-light">
              🎓 UNI LOCATE
            </h3>

            <p className="text-gray-400 text-sm">
              Smart Lost & Found System for Campus Students.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-lg font-semibold mb-4 text-primary-light">
              Quick Links
            </h4>
            <ul className="space-y-2">
              <li>
                <Link 
                  href="/" 
                  className="text-gray-400 hover:text-primary-light transition-colors text-sm"
                >
                  Home
                </Link>
              </li>
              <li>
                <Link 
                  href="/lost" 
                  className="text-gray-400 hover:text-primary-light transition-colors text-sm"
                >
                  Lost Items
                </Link>
              </li>
              <li>
                <Link 
                  href="/found" 
                  className="text-gray-400 hover:text-primary-light transition-colors text-sm"
                >
                  Found Items
                </Link>
              </li>
              <li>
                <Link 
                  href="/explore" 
                  className="text-gray-400 hover:text-primary-light transition-colors text-sm"
                >
                  Explore
                </Link>
              </li>
            </ul>
          </div>

          {/* Resources */}
          <div>
            <h4 className="text-lg font-semibold mb-4 text-primary-light">
              Resources
            </h4>
            <ul className="space-y-2">
              <li>
                <Link 
                  href="/chat" 
                  className="text-gray-400 hover:text-primary-light transition-colors text-sm"
                >
                  Chat
                </Link>
              </li>
              <li>
                <Link 
                  href="/admin" 
                  className="text-gray-400 hover:text-primary-light transition-colors text-sm"
                >
                  Admin
                </Link>
              </li>
              <li>
                <Link 
                  href="/help" 
                  className="text-gray-400 hover:text-primary-light transition-colors text-sm"
                >
                  Help Center
                </Link>
              </li>
              <li>
                <Link 
                  href="/privacy" 
                  className="text-gray-400 hover:text-primary-light transition-colors text-sm"
                >
                  Privacy Policy
                </Link>
              </li>
            </ul>
          </div>
        </div>


        {/* Bottom Bar */}
        <div className="border-t border-gray-700 mt-6 pt-4">
          <div className="flex flex-col sm:flex-row justify-between items-center space-y-4 sm:space-y-0">
            <p className="text-gray-400 text-sm text-center sm:text-left">
              © {new Date().getFullYear()} UNI LOCATE. All rights reserved.
            </p>
            <div className="flex space-x-6">
              <a 
                href="#" 
                className="text-gray-400 hover:text-primary-light transition-colors text-sm"
                aria-label="Facebook"
              >
                📘
              </a>
              <a 
                href="#" 
                className="text-gray-400 hover:text-primary-light transition-colors text-sm"
                aria-label="Twitter"
              >
                🐦
              </a>
              <a 
                href="#" 
                className="text-gray-400 hover:text-primary-light transition-colors text-sm"
                aria-label="Instagram"
              >
                📷
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}

