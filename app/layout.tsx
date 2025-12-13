import type { Metadata, Viewport } from 'next'
import React from 'react'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import '../styles/globals.css'

export const metadata: Metadata = {
  title: 'UNI LOCATE - Lost & Found System',
  description: 'Smart Lost & Found system for campus students',
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-gray-50 flex flex-col">
        <Navbar />
        <main className="flex-grow">
          {children}
        </main>
        <Footer />
      </body>
    </html>
  )
}

