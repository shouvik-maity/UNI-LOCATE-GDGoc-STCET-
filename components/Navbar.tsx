'use client'

import Link from 'next/link'
import { useState } from 'react'
import { useAuth } from '@/utils/useAuth'

export default function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const { user, logout } = useAuth()

  return (
    <nav className="bg-white shadow-md sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          <Link href="/" className="text-xl sm:text-2xl font-bold text-primary">
            🎓 UNI LOCATE
          </Link>



          <div className="hidden md:flex space-x-4 lg:space-x-6 items-center">
            <Link href="/" className="text-gray-700 hover:text-primary text-sm lg:text-base">Home</Link>


            {user && (
              <>
                <Link href="/lost" className="text-gray-700 hover:text-primary text-sm lg:text-base">📍 Report Lost</Link>
                <Link href="/found" className="text-gray-700 hover:text-primary text-sm lg:text-base">✅ Report Found</Link>
                <Link href="/explore" className="text-gray-700 hover:text-primary text-sm lg:text-base">🔍 Explore</Link>
                <Link href="/ai-agent" className="text-purple-700 hover:text-purple-900 text-sm lg:text-base font-semibold bg-purple-100 px-3 py-1 rounded-lg">🤖 AI Agent</Link>
                <Link href="/admin" className="text-gray-700 hover:text-primary text-sm lg:text-base">⚙️ Admin</Link>
              </>
            )}
            {!user ? (
              <>
                <Link href="/login" className="text-gray-700 hover:text-primary text-sm lg:text-base">Login</Link>
                <Link href="/signup" className="bg-primary text-white px-4 py-2 rounded-lg font-semibold text-sm lg:text-base">Sign Up</Link>
              </>
            ) : (
              <>
                <span className="text-gray-700 text-sm lg:text-base">{user.email}</span>
                <button onClick={logout} className="bg-red-500 text-white px-4 py-2 rounded-lg font-semibold text-sm lg:text-base">Logout</button>
              </>
            )}
          </div>

          <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="md:hidden p-2">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
        </div>


        {isMenuOpen && (
          <div className="md:hidden pb-4 border-t">
            <Link href="/" className="block px-4 py-2">Home</Link>



            {user && (
              <>
                <Link href="/lost" className="block px-4 py-2">📍 Report Lost</Link>
                <Link href="/found" className="block px-4 py-2">✅ Report Found</Link>
                <Link href="/explore" className="block px-4 py-2">🔍 Explore</Link>
                <Link href="/ai-agent" className="block px-4 py-2 bg-purple-100 text-purple-800 font-semibold rounded">🤖 AI Agent</Link>
                <Link href="/admin" className="block px-4 py-2">⚙️ Admin</Link>
              </>
            )}
            {!user ? (
              <>
                <Link href="/login" className="block px-4 py-2">Login</Link>
                <Link href="/signup" className="block px-4 py-2 bg-primary text-white">Sign Up</Link>
              </>
            ) : (
              <>
                <span className="block px-4 py-2">{user.email}</span>
                <button onClick={logout} className="block w-full text-left px-4 py-2 bg-red-500 text-white">Logout</button>
              </>
            )}
          </div>
        )}
      </div>
    </nav>
  )
}
