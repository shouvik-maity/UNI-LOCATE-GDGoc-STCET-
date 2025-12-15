'use client'


import { useState, useEffect } from 'react'
import Link from 'next/link'
import ImageWithFallback from '@/components/ImageWithFallback'

const categories = ['All', 'Electronics', 'Accessories', 'Clothing', 'Books', 'Bags', 'Jewelry', 'Documents', 'Other']


interface Item {
  _id: string
  title: string
  description: string
  category: string
  image: string
  location: string
  dateLost?: string
  dateFound?: string
  userName: string
  userEmail: string
  userPhone: string
  status: string
  createdAt: string
}

export default function ExplorePage() {
  const [lostItems, setLostItems] = useState<Item[]>([])
  const [foundItems, setFoundItems] = useState<Item[]>([])
  const [category, setCategory] = useState('All')
  const [activeTab, setActiveTab] = useState<'lost' | 'found'>('lost')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [searchQuery, setSearchQuery] = useState('')

  useEffect(() => {
    fetchItems()
  }, [category, activeTab])

  const fetchItems = async () => {
    try {
      setLoading(true)
      setError('')

      const categoryParam = category === 'All' ? '' : `&category=${category}`
      const endpoint = activeTab === 'lost' ? '/api/lost' : '/api/found'

      const response = await fetch(`${endpoint}?limit=50${categoryParam}`)
      const data = await response.json()

      if (!data.success) {
        throw new Error(data.message || 'Failed to fetch items')
      }

      if (activeTab === 'lost') {
        setLostItems(data.data)
      } else {
        setFoundItems(data.data)
      }
    } catch (error: any) {
      setError(error.message || 'Failed to fetch items')
    } finally {
      setLoading(false)
    }
  }

  const filteredItems = (activeTab === 'lost' ? lostItems : foundItems).filter((item) =>
    item.title.toLowerCase().includes(searchQuery.toLowerCase()) || item.description.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <div className="min-h-screen bg-gray-50 py-8 sm:py-12">
      <div className="container mx-auto px-4 sm:px-6">
        <h1 className="text-3xl sm:text-4xl font-bold text-primary mb-8">Explore Items</h1>

        {/* Tabs */}
        <div className="flex gap-4 mb-8 border-b border-gray-300">
          <button
            onClick={() => setActiveTab('lost')}
            className={`px-4 py-2 font-semibold border-b-2 transition ${
              activeTab === 'lost' ? 'border-primary text-primary' : 'border-transparent text-gray-600 hover:text-primary'
            }`}
          >
            🔍 Lost Items
          </button>
          <button
            onClick={() => setActiveTab('found')}
            className={`px-4 py-2 font-semibold border-b-2 transition ${
              activeTab === 'found' ? 'border-primary text-primary' : 'border-transparent text-gray-600 hover:text-primary'
            }`}
          >
            ✅ Found Items
          </button>
        </div>

        {/* Search Bar */}
        <div className="mb-8">
          <input
            type="text"
            placeholder="Search items..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
          />
        </div>

        {/* Category Filter */}
        <div className="mb-8 flex flex-wrap gap-2">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setCategory(cat)}
              className={`px-4 py-2 rounded-full font-semibold transition ${
                category === cat
                  ? 'bg-primary text-white'
                  : 'bg-gray-200 text-gray-800 hover:bg-gray-300'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Error Message */}
        {error && <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">{error}</div>}

        {/* Loading State */}
        {loading && <div className="text-center py-12 text-gray-600">Loading items...</div>}

        {/* Items Grid */}
        {!loading && filteredItems.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredItems.map((item) => (

              <div key={item._id} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition">




                {/* Image */}
                <ImageWithFallback
                  src={item.image}
                  alt={item.title}
                  className="w-full h-48 object-cover cursor-pointer hover:opacity-90 transition"
                  fallbackClassName="w-full h-48 bg-gray-100"
                  maxSize={3000000}
                  showRetry={true}
                  onRetry={() => {
                    // Force re-render by updating a key or state
                    window.location.reload()
                  }}
                />

                {/* Content */}
                <div className="p-4">
                  <h3 className="text-lg font-semibold text-gray-800 mb-2">{item.title}</h3>
                  <p className="text-sm text-gray-600 mb-3 line-clamp-2">{item.description}</p>



                  {/* Info */}
                  <div className="space-y-2 text-sm text-gray-600 mb-4">
                    <p>📁 <strong>{item.category}</strong></p>
                    <p>📍 <strong>{item.location}</strong></p>
                    <p>👤 <strong>{item.userName}</strong></p>



                    {item.userEmail && <p>📧 <strong>{item.userEmail}</strong></p>}
                  </div>

                  {/* Status Badge */}
                  <div className="flex justify-between items-center mb-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                      activeTab === 'lost'
                        ? item.status === 'open'
                          ? 'bg-yellow-100 text-yellow-800'
                          : 'bg-red-100 text-red-800'
                        : item.status === 'available'
                          ? 'bg-green-100 text-green-800'
                          : 'bg-gray-100 text-gray-800'
                    }`}>
                      {item.status}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          !loading && (
            <div className="bg-white rounded-lg shadow-md p-8 text-center">
              <p className="text-gray-600 text-lg">No items found. Check back soon!</p>
            </div>
          )
        )}
      </div>
    </div>
  )
}

