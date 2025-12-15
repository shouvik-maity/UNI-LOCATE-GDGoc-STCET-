'use client'


import { useState, useEffect } from 'react'
import { useAuth } from '@/utils/useAuth'
import Link from 'next/link'
import ImageWithFallback from '@/components/ImageWithFallback'

interface AdminStats {
  totalLostItems: number
  totalFoundItems: number
  completedMatches: number
}

interface ItemDetail {
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

export default function AdminPage() {
  const { user, loading } = useAuth()

  const [stats, setStats] = useState<AdminStats>({
    totalLostItems: 0,
    totalFoundItems: 0,
    completedMatches: 0,
  })
  const [loadingStats, setLoadingStats] = useState(false)
  const [error, setError] = useState('')
  const [successMessage, setSuccessMessage] = useState('')

  const [activeTab, setActiveTab] = useState<'lost' | 'found'>('lost')
  const [lostItems, setLostItems] = useState<any[]>([])
  const [foundItems, setFoundItems] = useState<any[]>([])
  
  // Filtering and search
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [selectedStatus, setSelectedStatus] = useState('all')
  const [sortBy, setSortBy] = useState<'newest' | 'oldest' | 'alphabetical'>('newest')
  
  // Modal states
  const [selectedItem, setSelectedItem] = useState<ItemDetail | null>(null)
  const [showItemModal, setShowItemModal] = useState(false)
  const [showImageModal, setShowImageModal] = useState(false)
  

  // Bulk action states
  const [selectedItems, setSelectedItems] = useState<string[]>([])
  const [bulkActionLoading, setBulkActionLoading] = useState(false)
  
  // Export states
  const [exportLoading, setExportLoading] = useState(false)
  const [showExportModal, setShowExportModal] = useState(false)
  
  // Pagination states
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(20)
  const [totalItems, setTotalItems] = useState({ lost: 0, found: 0 })


  useEffect(() => {
    if (!loading && user) {
      fetchData()
    }
  }, [loading, user])

  // Reset to first page when switching tabs
  useEffect(() => {
    setCurrentPage(1)
    if (user) {
      fetchData()
    }
  }, [activeTab, user])


  const fetchData = async () => {
    try {
      setLoadingStats(true)
      setError('')



      // Allow all authenticated users to access admin functionality
      if (!user) {
        setError('User not authenticated')
        return
      }




      // Mobile-optimized limits - smaller limits for mobile, larger for desktop
      const isMobile = window.innerWidth <= 768
      const defaultLimit = isMobile ? 10 : 20
      
      // Calculate skip based on current page and items per page
      const skip = (currentPage - 1) * itemsPerPage
      const limit = Math.min(itemsPerPage, defaultLimit)
      

      // Fetch lost and found items data with pagination (remove user filtering)
      const [lostRes, foundRes] = await Promise.all([
        fetch(`/api/admin/lost?limit=${limit}&skip=${skip}&status=all`),
        fetch(`/api/admin/found?limit=${limit}&skip=${skip}&status=all`),
      ])

      // Process lost items API
      let lostData = { success: false, message: 'Invalid response', data: [], pagination: { total: 0 } }
      try {
        lostData = await lostRes.json()
      } catch (e) {
        console.error('Failed to parse lost items response:', e)
      }

      // Process found items API
      let foundData = { success: false, message: 'Invalid response', data: [], pagination: { total: 0 } }
      try {
        foundData = await foundRes.json()
      } catch (e) {
        console.error('Failed to parse found items response:', e)
      }

      // Update items data with fallback handling
      if (lostData.success && Array.isArray(lostData.data)) {
        setLostItems(lostData.data)
      } else {
        setLostItems([])
        console.warn('Failed to load lost items:', lostData.message)
      }

      if (foundData.success && Array.isArray(foundData.data)) {
        setFoundItems(foundData.data)
      } else {
        setFoundItems([])
        console.warn('Failed to load found items:', foundData.message)
      }

      // Calculate stats
      const totalLostItems = lostData.pagination?.total || 0
      const totalFoundItems = foundData.pagination?.total || 0
      const completedMatches = lostData.success && foundData.success
        ? lostData.data.filter((i: any) => i.status === 'returned').length +
          foundData.data.filter((i: any) => i.status === 'returned').length
        : 0

      setStats({
        totalLostItems,
        totalFoundItems,
        completedMatches,
      })

      // Show success message if at least some data was loaded
      const loadedCount = [lostData.success, foundData.success].filter(Boolean).length
      if (loadedCount > 0) {
        setSuccessMessage(`✅ Loaded ${loadedCount}/2 data sources successfully`)
        setTimeout(() => setSuccessMessage(''), 3000)
      }

    } catch (error: any) {
      console.error('Critical error in fetchData:', error)
      setError(`❌ Failed to fetch data: ${error.message || 'Unknown error'}`)
    } finally {
      setLoadingStats(false)
    }
  }

  // Enhanced filtering functions
  const filterItems = (items: any[]) => {
    return items.filter(item => {
      const matchesSearch = searchTerm === '' || 
        item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.userName.toLowerCase().includes(searchTerm.toLowerCase())
      
      const matchesCategory = selectedCategory === 'all' || item.category === selectedCategory
      const matchesStatus = selectedStatus === 'all' || item.status === selectedStatus
      
      return matchesSearch && matchesCategory && matchesStatus
    })
  }

  const sortItems = (items: any[]) => {
    const sorted = [...items]
    switch (sortBy) {
      case 'alphabetical':
        return sorted.sort((a, b) => a.title.localeCompare(b.title))
      case 'oldest':
        return sorted.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime())
      case 'newest':
      default:
        return sorted.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    }
  }

  const filteredLostItems = sortItems(filterItems(lostItems))
  const filteredFoundItems = sortItems(filterItems(foundItems))

  // Handle item selection for bulk actions
  const handleItemSelect = (itemId: string) => {
    setSelectedItems(prev => 
      prev.includes(itemId) 
        ? prev.filter(id => id !== itemId)
        : [...prev, itemId]
    )
  }

  const handleSelectAll = (itemType: 'lost' | 'found') => {
    let items: any[] = []
    if (itemType === 'lost') {
      items = filteredLostItems
    } else if (itemType === 'found') {
      items = filteredFoundItems
    }
    
    if (selectedItems.length === items.length) {
      setSelectedItems([])
    } else {
      setSelectedItems(items.map(item => item._id))
    }
  }

  // Enhanced notification system
  const addNotification = (type: 'success' | 'error' | 'info', message: string, duration = 5000) => {
    setSuccessMessage(message)
    if (type !== 'error') {
      setTimeout(() => setSuccessMessage(''), duration)
    }
  }

  // Export functionality
  const handleExport = async (format: 'csv' | 'excel') => {
    try {
      setExportLoading(true)
      
      let data: any[] = []
      let filename = ''
      
      if (activeTab === 'lost') {
        data = filteredLostItems
        filename = 'lost-items'
      } else if (activeTab === 'found') {
        data = filteredFoundItems
        filename = 'found-items'
      }

      if (format === 'csv') {
        const csvContent = convertToCSV(data)
        downloadCSV(csvContent, `${filename}-${new Date().toISOString().split('T')[0]}.csv`)
        addNotification('success', `Exported ${data.length} items as CSV`)
      } else if (format === 'excel') {
        const csvContent = convertToCSV(data)
        downloadCSV(csvContent, `${filename}-${new Date().toISOString().split('T')[0]}.xlsx`)
        addNotification('success', `Exported ${data.length} items as Excel`)
      }
      
      setShowExportModal(false)
    } catch (error: any) {
      setError(`Export failed: ${error.message}`)
      setTimeout(() => setError(''), 5000)
    } finally {
      setExportLoading(false)
    }
  }

  const convertToCSV = (data: any[]) => {
    if (data.length === 0) return ''
    
    const headers = Object.keys(data[0])
    const csvRows = []
    
    csvRows.push(headers.join(','))
    
    for (const row of data) {
      const values = headers.map(header => {
        const value = row[header]
        if (typeof value === 'object' && value !== null) {
          return JSON.stringify(value)
        }
        return `"${String(value).replace(/"/g, '""')}"`
      })
      csvRows.push(values.join(','))
    }
    
    return csvRows.join('\n')
  }

  const downloadCSV = (csvContent: string, filename: string) => {
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    const url = URL.createObjectURL(blob)
    
    link.setAttribute('href', url)
    link.setAttribute('download', filename)
    link.style.visibility = 'hidden'
    
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  // Bulk action handlers
  const handleBulkStatusUpdate = async (status: string, itemType?: 'lost' | 'found') => {
    if (selectedItems.length === 0) return
    
    const currentTab = itemType || activeTab
    
    try {
      setBulkActionLoading(true)
      
      const endpoint = currentTab === 'lost' ? '/api/lost' : '/api/found'
      const promises = selectedItems.map(itemId => 
        fetch(endpoint, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ itemId, status }),
        })
      )
      const results = await Promise.allSettled(promises)
      const successCount = results.filter(r => r.status === 'fulfilled' && r.value.ok).length
      const failCount = selectedItems.length - successCount
      
      if (failCount > 0) {
        addNotification('error', `Updated ${successCount} items, ${failCount} failed`)
      } else {
        addNotification('success', `✅ Successfully updated ${successCount} items`)
      }
      
      setSelectedItems([])
      fetchData()
    } catch (error: any) {
      addNotification('error', `❌ ${error.message || 'Bulk update failed'}`)
    } finally {
      setBulkActionLoading(false)
    }
  }


  const handleMarkAsReturned = async (itemId: string, itemType: 'lost' | 'found') => {
    try {
      setError('')
      const endpoint = itemType === 'lost' ? '/api/lost' : '/api/found'
      
      const response = await fetch(endpoint, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ itemId, status: 'returned' }),
      })

      const data = await response.json()

      if (!data.success) {
        throw new Error(data.message || 'Failed to update item')
      }

      addNotification('success', '✅ Item marked as returned!')
      
      // Update stats
      setStats((prevStats) => ({
        ...prevStats,
        completedMatches: prevStats.completedMatches + 1,
      }))
      
      // Add a small delay to ensure database write is completed
      setTimeout(() => {
        fetchData()
      }, 500)
    } catch (error: any) {
      console.error('Error marking as returned:', error)
      setError(`❌ ${error.message || 'Failed to mark item as returned'}`)
      setTimeout(() => setError(''), 5000)
    }
  }

  // Modal handlers
  const showItemDetails = (item: any) => {
    setSelectedItem(item)
    setShowItemModal(true)
  }

  const showImage = (imageUrl: string) => {
    setSelectedItem({ ...selectedItem!, image: imageUrl } as ItemDetail)
    setShowImageModal(true)
  }


  // Categories and statuses for filtering
  const categories = ['all', 'Electronics', 'Accessories', 'Clothing', 'Books', 'Bags', 'Jewelry', 'Documents', 'Other']
  const statuses = ['all', 'open', 'available', 'returned', 'archived']

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white p-8 rounded-lg shadow-md text-center">
          <h2 className="text-2xl font-bold mb-4">Admin Access Required</h2>
          <p className="text-gray-600 mb-6">Please log in with admin account.</p>
          <Link href="/" className="text-blue-500 hover:underline">
            Go back home
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 sm:py-12">
      <div className="container mx-auto px-4 sm:px-6">
        <h1 className="text-3xl sm:text-4xl font-bold text-primary mb-8">👨‍💼 Admin Dashboard</h1>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
            {error}
          </div>
        )}

        {successMessage && (
          <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-6">
            {successMessage}
          </div>
        )}

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
          <div className="bg-white rounded-lg shadow-md p-6 text-center">
            <p className="text-gray-600 text-sm mb-2">📍 Lost Items</p>
            <p className="text-3xl font-bold text-red-600">{stats.totalLostItems}</p>
          </div>
          <div className="bg-white rounded-lg shadow-md p-6 text-center">
            <p className="text-gray-600 text-sm mb-2">✅ Found Items</p>
            <p className="text-3xl font-bold text-green-600">{stats.totalFoundItems}</p>
          </div>
          <div className="bg-white rounded-lg shadow-md p-6 text-center">
            <p className="text-gray-600 text-sm mb-2">🎉 Returned</p>
            <p className="text-3xl font-bold text-blue-600">{stats.completedMatches}</p>
          </div>
        </div>

        {/* Enhanced Header with Controls */}
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 mb-8">
          {/* Tabs */}
          <div className="flex gap-4 border-b border-gray-300 flex-wrap">
            {['lost', 'found'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab as any)}
                className={`px-4 py-2 font-semibold border-b-2 transition capitalize ${
                  activeTab === tab ? 'border-primary text-primary' : 'border-transparent text-gray-600 hover:text-primary'
                }`}
              >
                {tab === 'lost' ? '📍 Lost Items' : '✅ Found Items'}
              </button>
            ))}
          </div>

          {/* Controls */}
          <div className="flex gap-3">
            <button
              onClick={fetchData}
              disabled={loadingStats}
              className="bg-blue-500 hover:bg-blue-600 disabled:bg-blue-300 text-white px-4 py-2 rounded-lg text-sm font-semibold transition"
            >
              {loadingStats ? '🔄 Loading...' : '🔄 Refresh Data'}
            </button>
            
            {(error && !loadingStats) && (
              <button
                onClick={fetchData}
                className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg text-sm font-semibold transition animate-pulse"
              >
                ❌ Retry
              </button>
            )}
            
            <button
              onClick={() => setShowExportModal(true)}
              className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-semibold transition"
            >
              📤 Export
            </button>
          </div>
        </div>

        {/* Main Content */}
        <div className="bg-white rounded-lg shadow-md p-6">
          {loadingStats ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
              <p className="mt-4 text-gray-600">Loading data...</p>
            </div>
          ) : (
            <div>
              {/* Search and Filter Controls */}
              <div className="mb-6 flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
                <div className="flex-1 max-w-md">
                  <input
                    type="text"
                    placeholder="Search items..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                  />
                </div>
                
                <div className="flex flex-wrap gap-3">
                  <select
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary"
                  >
                    {categories.map(cat => (
                      <option key={cat} value={cat}>{cat === 'all' ? 'All Categories' : cat}</option>
                    ))}
                  </select>
                  
                  <select
                    value={selectedStatus}
                    onChange={(e) => setSelectedStatus(e.target.value)}
                    className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary"
                  >
                    {statuses.map(status => (
                      <option key={status} value={status}>
                        {status === 'all' ? 'All Statuses' : status.charAt(0).toUpperCase() + status.slice(1)}
                      </option>
                    ))}
                  </select>
                  
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value as any)}
                    className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary"
                  >
                    <option value="newest">Newest First</option>
                    <option value="oldest">Oldest First</option>
                    <option value="alphabetical">Alphabetical</option>
                  </select>
                </div>
              </div>

              {/* Bulk Actions */}
              {selectedItems.length > 0 && (
                <div className="mb-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
                  <div className="flex items-center justify-between">
                    <span className="text-blue-800 font-medium">
                      {selectedItems.length} item(s) selected
                    </span>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleBulkStatusUpdate('returned')}
                        disabled={bulkActionLoading}
                        className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded text-sm font-semibold disabled:opacity-50"
                      >
                        {bulkActionLoading ? 'Updating...' : 'Mark as Returned'}
                      </button>
                      <button
                        onClick={() => handleBulkStatusUpdate('archived')}
                        disabled={bulkActionLoading}
                        className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded text-sm font-semibold disabled:opacity-50"
                      >
                        {bulkActionLoading ? 'Updating...' : 'Archive'}
                      </button>
                      <button
                        onClick={() => setSelectedItems([])}
                        className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded text-sm font-semibold"
                      >
                        Clear Selection
                      </button>
                    </div>
                  </div>
                </div>
              )}


              {/* Items List */}
              <div className="mb-4 flex items-center justify-between">
                <h2 className="text-2xl font-bold">
                  {activeTab === 'lost' ? '📍 Lost Items' : '✅ Found Items'} 
                  <span className="text-lg text-gray-500 ml-2">
                    ({activeTab === 'lost' ? filteredLostItems.length : filteredFoundItems.length})
                  </span>
                </h2>
                
                {(activeTab === 'lost' || activeTab === 'found') && (activeTab === 'lost' ? filteredLostItems : filteredFoundItems).length > 0 && (
                  <button
                    onClick={() => handleSelectAll(activeTab)}
                    className="text-sm text-primary hover:text-primary-dark font-semibold"
                  >
                    {(() => {
                      const items = activeTab === 'lost' ? filteredLostItems : filteredFoundItems;
                      return selectedItems.length === items.length ? 'Deselect All' : 'Select All';
                    })()}
                  </button>
                )}
              </div>

              {/* Pagination Controls */}
              <div className="mb-6 flex items-center justify-between bg-gray-50 p-4 rounded-lg">
                <div className="flex items-center gap-4">
                  <span className="text-sm text-gray-600">
                    Page {currentPage}
                  </span>
                  <select
                    value={itemsPerPage}
                    onChange={(e) => {
                      setItemsPerPage(Number(e.target.value))
                      setCurrentPage(1)
                    }}
                    className="px-3 py-1 border border-gray-300 rounded text-sm"
                  >
                    <option value={10}>10 per page</option>
                    <option value={20}>20 per page</option>
                    <option value={50}>50 per page</option>
                  </select>
                </div>
                
                <div className="flex gap-2">
                  <button
                    onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                    disabled={currentPage === 1}
                    className="px-3 py-1 border border-gray-300 rounded text-sm disabled:opacity-50"
                  >
                    Previous
                  </button>
                  <button
                    onClick={() => setCurrentPage(prev => prev + 1)}
                    disabled={(activeTab === 'lost' ? filteredLostItems : filteredFoundItems).length < itemsPerPage}
                    className="px-3 py-1 border border-gray-300 rounded text-sm disabled:opacity-50"
                  >
                    Next
                  </button>
                </div>
              </div>

              {(activeTab === 'lost' ? filteredLostItems : filteredFoundItems).length === 0 ? (
                <p className="text-gray-600 py-8 text-center">
                  {searchTerm || selectedCategory !== 'all' || selectedStatus !== 'all' 
                    ? 'No items match your search criteria'
                    : `No ${activeTab} items reported yet`
                  }
                </p>
              ) : (
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-1">
                  {(activeTab === 'lost' ? filteredLostItems : filteredFoundItems).map((item) => (
                    <div key={item._id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition">
                      <div className="flex items-start gap-4">
                        {/* Checkbox for bulk selection */}
                        <input
                          type="checkbox"
                          checked={selectedItems.includes(item._id)}
                          onChange={() => handleItemSelect(item._id)}
                          className="mt-1 h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"
                        />
                        


                        {/* Image preview */}
                        <div className="w-16 h-16">
                          <ImageWithFallback
                            src={item.image || ''}
                            alt={item.title}
                            className="w-16 h-16 object-cover rounded-lg cursor-pointer hover:opacity-80"
                            fallbackClassName="w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center"
                            maxSize={1000000}
                            showRetry={false}
                            onRetry={() => {}}
                          />
                        </div>
                        
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <h3 className="font-bold text-lg truncate">{item.title}</h3>
                              <p className="text-gray-600 text-sm mt-1 line-clamp-2">{item.description}</p>
                              
                              <div className="flex gap-2 mt-3 flex-wrap text-xs">
                                <span className="bg-gray-100 px-2 py-1 rounded">📁 {item.category}</span>
                                <span className="bg-gray-100 px-2 py-1 rounded">📍 {item.location}</span>
                                <span className="bg-gray-100 px-2 py-1 rounded">👤 {item.userName}</span>
                                <span className="bg-gray-100 px-2 py-1 rounded">
                                  📅 {new Date(item.createdAt).toLocaleDateString()}
                                </span>
                              </div>
                            </div>
                            
                            <div className="flex items-center gap-2 ml-4">
                              <span
                                className={`px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap ${
                                  item.status === 'returned'
                                    ? 'bg-green-100 text-green-800'
                                    : activeTab === 'lost'
                                    ? 'bg-yellow-100 text-yellow-800'
                                    : 'bg-blue-100 text-blue-800'
                                }`}
                              >
                                {item.status === 'returned' 
                                  ? '✅ Returned' 
                                  : activeTab === 'lost' 
                                  ? '⏳ Open' 
                                  : '📦 Available'
                                }
                              </span>
                            </div>
                          </div>
                          
                          {/* Action buttons */}
                          <div className="flex gap-2 mt-3">
                            <button
                              onClick={() => showItemDetails(item)}
                              className="text-primary hover:text-primary-dark text-sm font-semibold"
                            >
                              👁️ View Details
                            </button>
                            
                            {item.status !== 'returned' && (
                              <button
                                onClick={() => handleMarkAsReturned(item._id, activeTab)}
                                className="bg-green-500 hover:bg-green-600 text-white px-3 py-1 rounded text-xs font-semibold transition"
                              >
                                ✅ Mark Returned
                              </button>
                            )}
                            


                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Item Detail Modal */}
        {showItemModal && selectedItem && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <h2 className="text-2xl font-bold">{selectedItem.title}</h2>
                  <button
                    onClick={() => setShowItemModal(false)}
                    className="text-gray-500 hover:text-gray-700 text-2xl"
                  >
                    ×
                  </button>
                </div>
                


                {selectedItem.image && (
                  <div className="mb-4">
                    <ImageWithFallback
                      src={selectedItem.image}
                      alt={selectedItem.title}
                      className="w-full h-64 object-cover rounded-lg cursor-pointer hover:opacity-90 transition"
                      fallbackClassName="w-full h-64 bg-gray-100 rounded-lg flex items-center justify-center"
                      maxSize={2000000}
                      showRetry={true}
                      onRetry={() => {}}
                    />
                  </div>
                )}
                
                <div className="space-y-3">
                  <div>
                    <label className="font-semibold text-gray-700">Description:</label>
                    <p className="text-gray-600">{selectedItem.description}</p>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="font-semibold text-gray-700">Category:</label>
                      <p className="text-gray-600">{selectedItem.category}</p>
                    </div>
                    <div>
                      <label className="font-semibold text-gray-700">Location:</label>
                      <p className="text-gray-600">{selectedItem.location}</p>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="font-semibold text-gray-700">Date:</label>
                      <p className="text-gray-600">
                        {selectedItem.dateLost 
                          ? new Date(selectedItem.dateLost).toLocaleDateString()
                          : selectedItem.dateFound 
                          ? new Date(selectedItem.dateFound).toLocaleDateString()
                          : 'N/A'
                        }
                      </p>
                    </div>
                    <div>
                      <label className="font-semibold text-gray-700">Status:</label>
                      <p className="text-gray-600 capitalize">{selectedItem.status}</p>
                    </div>
                  </div>
                  
                  <div>
                    <label className="font-semibold text-gray-700">Reported By:</label>
                    <p className="text-gray-600">{selectedItem.userName}</p>
                    <p className="text-gray-600">{selectedItem.userEmail}</p>
                    <p className="text-gray-600">{selectedItem.userPhone}</p>
                  </div>
                  
                  <div>
                    <label className="font-semibold text-gray-700">Reported On:</label>
                    <p className="text-gray-600">{new Date(selectedItem.createdAt).toLocaleDateString()}</p>
                  </div>
                </div>
                
                <div className="flex gap-3 mt-6">

                  {selectedItem.status !== 'returned' && (
                    <button
                      onClick={async () => {
                        await handleMarkAsReturned(selectedItem._id, activeTab)
                        setShowItemModal(false)
                      }}
                      className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded font-semibold"
                    >
                      ✅ Mark as Returned
                    </button>
                  )}
                  
                  <button
                    onClick={() => setShowItemModal(false)}
                    className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded font-semibold"
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Image Modal */}
        {showImageModal && selectedItem && selectedItem.image && (
          <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center p-4 z-50">
            <div className="relative max-w-4xl max-h-[90vh]">
              <button
                onClick={() => setShowImageModal(false)}
                className="absolute top-4 right-4 text-white bg-black bg-opacity-50 rounded-full w-10 h-10 flex items-center justify-center hover:bg-opacity-75 z-10"
              >
                ×
              </button>
              <img
                src={selectedItem.image}
                alt={selectedItem.title}
                className="max-w-full max-h-full object-contain rounded-lg"
              />
            </div>
          </div>
        )}

        {/* Export Modal */}
        {showExportModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg max-w-md w-full">
              <div className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <h2 className="text-xl font-bold">📤 Export Data</h2>
                  <button
                    onClick={() => setShowExportModal(false)}
                    className="text-gray-500 hover:text-gray-700 text-2xl"
                  >
                    ×
                  </button>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Export Format
                    </label>
                    <div className="grid grid-cols-2 gap-3">
                      <button
                        onClick={() => handleExport('csv')}
                        disabled={exportLoading}
                        className="flex items-center justify-center gap-2 p-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition disabled:opacity-50"
                      >
                        📄 CSV
                      </button>
                      <button
                        onClick={() => handleExport('excel')}
                        disabled={exportLoading}
                        className="flex items-center justify-center gap-2 p-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition disabled:opacity-50"
                      >
                        📊 Excel
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Data Source
                    </label>
                    <div className="text-sm text-gray-600">
                      {activeTab === 'lost' && 'Exporting lost items data'}
                      {activeTab === 'found' && 'Exporting found items data'}
                    </div>
                  </div>

                  {exportLoading && (
                    <div className="flex items-center gap-2 text-blue-600">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                      <span className="text-sm">Exporting...</span>
                    </div>
                  )}
                </div>

                <div className="flex gap-3 mt-6">
                  <button
                    onClick={() => setShowExportModal(false)}
                    className="flex-1 bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded font-semibold"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
