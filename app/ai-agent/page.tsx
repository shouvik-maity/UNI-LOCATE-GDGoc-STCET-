'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/utils/useAuth'
import Link from 'next/link'

interface MatchResult {
  _id: string
  lostItem: {
    _id: string
    title: string
    description: string
    category: string
    location: string
    dateLost: string
    userName: string
    userEmail: string
    userPhone: string
    image: string
  }
  foundItem: {
    _id: string
    title: string
    description: string
    category: string
    location: string
    dateFound: string
    userName: string
    userEmail: string
    userPhone: string
    image: string
  }
  matchScore: number
  similarities: string[]
  status: string
  createdAt: string
}

export default function AIAgentPage() {
  const { user, loading } = useAuth()
  const [matches, setMatches] = useState<MatchResult[]>([])
  const [lostItems, setLostItems] = useState<any[]>([])
  const [foundItems, setFoundItems] = useState<any[]>([])
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [sortBy, setSortBy] = useState<'score' | 'date' | 'category'>('score')
  const [analysisStats, setAnalysisStats] = useState({
    totalAnalyzed: 0,
    matchesFound: 0,
    averageScore: 0,
    categories: [] as string[]
  })

  useEffect(() => {
    if (!loading && user) {
      fetchData()
    }
  }, [loading, user])



  const fetchData = async () => {
    try {
      // Fetch existing matches
      const matchesResponse = await fetch('/api/match?limit=50')
      const matchesData = await matchesResponse.json()

      if (matchesData.success) {
        setMatches(matchesData.data)
      }

      // Fetch all items for analysis
      const [lostResponse, foundResponse] = await Promise.all([
        fetch('/api/lost?limit=1000'),
        fetch('/api/found?limit=1000')
      ])

      const lostData = await lostResponse.json()
      const foundData = await foundResponse.json()

      if (lostData.success) {
        setLostItems(lostData.data)
      }
      if (foundData.success) {
        setFoundItems(foundData.data)
      }

      // Calculate analysis stats
      if (matchesData.success && lostData.success && foundData.success) {
        const totalItems = lostData.data.length + foundData.data.length
        const avgScore = matchesData.data.length > 0 
          ? Math.round(matchesData.data.reduce((sum: number, match: any) => sum + match.matchScore, 0) / matchesData.data.length)
          : 0

        setAnalysisStats({
          totalAnalyzed: totalItems,
          matchesFound: matchesData.data.length,
          averageScore: avgScore,
          categories: [...new Set([...lostData.data.map((item: any) => item.category), ...foundData.data.map((item: any) => item.category)])]
        })
      }
    } catch (error) {
      console.error('Error fetching data:', error)
    }
  }

  const runAIAnalysis = async () => {
    try {
      setIsAnalyzing(true)
      
      const response = await fetch('/api/ai/analyze', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'fullAnalysis',
          minScore: 30,
          categories: selectedCategory === 'all' ? [] : [selectedCategory]
        })
      })

      const data = await response.json()

      if (data.success) {
        // Refresh data after analysis
        await fetchData()
        
        // Show success message
        alert(`✅ AI Analysis Complete!\n\n` +
              `• Analyzed ${data.data.totalAnalyzed} items\n` +
              `• Found ${data.data.matchesCreated} new matches\n` +
              `• Average match score: ${data.data.averageScore}%\n` +
              `• High confidence matches: ${data.data.highConfidenceMatches}`)
      } else {
        throw new Error(data.message || 'Analysis failed')
      }
    } catch (error: any) {
      console.error('AI Analysis error:', error)
      alert(`❌ Analysis failed: ${error.message}`)
    } finally {
      setIsAnalyzing(false)
    }
  }


  // Filter and sort matches based on search criteria
  const filteredMatches = matches.filter(match => {
    // Skip matches with missing data
    if (!match || !match.lostItem || !match.foundItem) {
      return false
    }

    const matchesSearch = searchQuery === '' ||
      (match.lostItem.title || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (match.foundItem.title || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (match.lostItem.description || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (match.foundItem.description || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (match.similarities || []).some(s => s && s.toLowerCase().includes(searchQuery.toLowerCase()))

    const matchesCategory = selectedCategory === 'all' || 
      match.lostItem.category === selectedCategory || 
      match.foundItem.category === selectedCategory

    return matchesSearch && matchesCategory
  }).sort((a, b) => {
    switch (sortBy) {
      case 'score':
        return (b.matchScore || 0) - (a.matchScore || 0)
      case 'date':
        return new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime()
      case 'category':
        return (a.lostItem?.category || '').localeCompare(b.lostItem?.category || '')
      default:
        return 0
    }
  })

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white p-8 rounded-lg shadow-md text-center">
          <h2 className="text-2xl font-bold mb-4">🔐 Login Required</h2>
          <p className="text-gray-600 mb-6">Please log in to access the AI Agent.</p>
          <Link href="/login" className="bg-primary text-white px-6 py-3 rounded-lg font-semibold">
            Login Now
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        <h1 className="text-4xl font-bold text-primary mb-8">🤖 AI Agent Dashboard</h1>

        {/* Analysis Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-md p-6 text-center">
            <div className="text-3xl mb-2">📊</div>
            <p className="text-gray-600 text-sm">Items Analyzed</p>
            <p className="text-2xl font-bold text-blue-600">{analysisStats.totalAnalyzed}</p>
          </div>
          <div className="bg-white rounded-lg shadow-md p-6 text-center">
            <div className="text-3xl mb-2">🎯</div>
            <p className="text-gray-600 text-sm">Matches Found</p>
            <p className="text-2xl font-bold text-green-600">{analysisStats.matchesFound}</p>
          </div>
          <div className="bg-white rounded-lg shadow-md p-6 text-center">
            <div className="text-3xl mb-2">📈</div>
            <p className="text-gray-600 text-sm">Avg Score</p>
            <p className="text-2xl font-bold text-purple-600">{analysisStats.averageScore}%</p>
          </div>
          <div className="bg-white rounded-lg shadow-md p-6 text-center">
            <div className="text-3xl mb-2">🏷️</div>
            <p className="text-gray-600 text-sm">Categories</p>
            <p className="text-2xl font-bold text-orange-600">{analysisStats.categories.length}</p>
          </div>
        </div>

        {/* Control Panel */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-bold mb-2">🔍 AI Analysis Controls</h2>
              <p className="text-gray-600">Analyze and match lost & found items using advanced AI</p>
            </div>
            
            <button
              onClick={runAIAnalysis}
              disabled={isAnalyzing || lostItems.length === 0 || foundItems.length === 0}
              className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white px-6 py-3 rounded-lg font-semibold disabled:opacity-50 disabled:cursor-not-allowed transition"
            >
              {isAnalyzing ? (
                <span className="flex items-center gap-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  AI Analyzing...
                </span>
              ) : (
                '🚀 Run AI Analysis'
              )}
            </button>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div className="bg-gray-50 p-3 rounded-lg">
              <span className="font-semibold">📍 Lost Items:</span> {lostItems.length}
            </div>
            <div className="bg-gray-50 p-3 rounded-lg">
              <span className="font-semibold">✅ Found Items:</span> {foundItems.length}
            </div>
            <div className="bg-gray-50 p-3 rounded-lg">
              <span className="font-semibold">🤖 Potential Matches:</span> {lostItems.length * foundItems.length}
            </div>
          </div>
        </div>

        {/* Search and Filter */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between mb-4">
            <h2 className="text-xl font-bold">🎯 AI Match Results</h2>
            
            <div className="flex flex-wrap gap-3">
              <input
                type="text"
                placeholder="Search matches..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
              />
              
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary"
              >
                <option value="all">All Categories</option>
                {analysisStats.categories.map(category => (
                  <option key={category} value={category}>{category}</option>
                ))}
              </select>
              
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary"
              >
                <option value="score">Highest Score</option>
                <option value="date">Most Recent</option>
                <option value="category">By Category</option>
              </select>
            </div>
          </div>

          <p className="text-gray-600 text-sm">
            Showing {filteredMatches.length} of {matches.length} AI-generated matches
          </p>
        </div>

        {/* Matches Display */}
        <div className="space-y-6">
          {filteredMatches.length === 0 ? (
            <div className="bg-white rounded-lg shadow-md p-12 text-center">
              <div className="text-6xl mb-4">🤖</div>
              <h3 className="text-xl font-bold mb-2">No AI Matches Found</h3>
              <p className="text-gray-600 mb-6">
                {matches.length === 0 
                  ? 'Run AI analysis to generate intelligent matches between lost and found items'
                  : 'No matches match your current search criteria'
                }
              </p>
              {matches.length === 0 && (
                <button
                  onClick={runAIAnalysis}
                  disabled={isAnalyzing}
                  className="bg-primary text-white px-6 py-3 rounded-lg font-semibold hover:bg-primary-dark disabled:opacity-50"
                >
                  🚀 Start AI Analysis
                </button>
              )}
            </div>
          ) : (
            filteredMatches.map((match) => (
              <div key={match._id} className="bg-white rounded-lg shadow-md p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="text-2xl">🎯</div>
                    <div>
                      <h3 className="text-xl font-bold">Match Score: {match.matchScore}%</h3>
                      <span
                        className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${
                          match.matchScore >= 80
                            ? 'bg-green-100 text-green-800'
                            : match.matchScore >= 60
                            ? 'bg-yellow-100 text-yellow-800'
                            : 'bg-red-100 text-red-800'
                        }`}
                      >
                        {match.matchScore >= 80 ? '🟢 High Confidence' : 
                         match.matchScore >= 60 ? '🟡 Medium Confidence' : 
                         '🔴 Low Confidence'}
                      </span>
                    </div>
                  </div>
                  
                  <div className="text-right">
                    <p className="text-sm text-gray-600">
                      {new Date(match.createdAt).toLocaleDateString()}
                    </p>
                    <span
                      className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${
                        match.status === 'confirmed'
                          ? 'bg-green-100 text-green-800'
                          : match.status === 'rejected'
                          ? 'bg-red-100 text-red-800'
                          : match.status === 'resolved'
                          ? 'bg-blue-100 text-blue-800'
                          : 'bg-yellow-100 text-yellow-800'
                      }`}
                    >
                      {match.status === 'confirmed' ? '✅ Confirmed' :
                       match.status === 'rejected' ? '❌ Rejected' :
                       match.status === 'resolved' ? '🎉 Resolved' :
                       '⏳ Pending'}
                    </span>
                  </div>
                </div>


                {/* Items Comparison */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Lost Item */}
                  <div className="border border-red-200 rounded-lg p-4 bg-red-50">
                    <h4 className="font-bold text-red-800 mb-3 flex items-center gap-2">
                      📍 Lost Item
                    </h4>
                    {match.lostItem ? (
                      <div className="space-y-2">
                        <p><span className="font-semibold">Title:</span> {match.lostItem.title || 'N/A'}</p>
                        <p><span className="font-semibold">Description:</span> {match.lostItem.description || 'N/A'}</p>
                        <p><span className="font-semibold">Category:</span> {match.lostItem.category || 'N/A'}</p>
                        <p><span className="font-semibold">Location:</span> {match.lostItem.location || 'N/A'}</p>
                        <p><span className="font-semibold">Date Lost:</span> {match.lostItem.dateLost ? new Date(match.lostItem.dateLost).toLocaleDateString() : 'N/A'}</p>
                        <p><span className="font-semibold">Reported by:</span> {match.lostItem.userName || 'N/A'}</p>
                      </div>
                    ) : (
                      <div className="text-gray-500 italic">Lost item data not found</div>
                    )}
                    {match.lostItem?.image && (
                      <img
                        src={match.lostItem.image}
                        alt={match.lostItem.title || 'Lost item'}
                        className="w-full h-32 object-cover rounded-lg mt-3"
                      />
                    )}
                  </div>

                  {/* Found Item */}
                  <div className="border border-green-200 rounded-lg p-4 bg-green-50">
                    <h4 className="font-bold text-green-800 mb-3 flex items-center gap-2">
                      ✅ Found Item
                    </h4>
                    {match.foundItem ? (
                      <div className="space-y-2">
                        <p><span className="font-semibold">Title:</span> {match.foundItem.title || 'N/A'}</p>
                        <p><span className="font-semibold">Description:</span> {match.foundItem.description || 'N/A'}</p>
                        <p><span className="font-semibold">Category:</span> {match.foundItem.category || 'N/A'}</p>
                        <p><span className="font-semibold">Location:</span> {match.foundItem.location || 'N/A'}</p>
                        <p><span className="font-semibold">Date Found:</span> {match.foundItem.dateFound ? new Date(match.foundItem.dateFound).toLocaleDateString() : 'N/A'}</p>
                        <p><span className="font-semibold">Found by:</span> {match.foundItem.userName || 'N/A'}</p>
                      </div>
                    ) : (
                      <div className="text-gray-500 italic">Found item data not found</div>
                    )}
                    {match.foundItem?.image && (
                      <img
                        src={match.foundItem.image}
                        alt={match.foundItem.title || 'Found item'}
                        className="w-full h-32 object-cover rounded-lg mt-3"
                      />
                    )}
                  </div>
                </div>

                {/* AI Similarities */}
                <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <h4 className="font-bold text-blue-800 mb-3">🧠 AI Similarities Detected:</h4>
                  <ul className="space-y-2">
                    {match.similarities.map((similarity, index) => (
                      <li key={index} className="flex items-center gap-2 text-blue-700">
                        <span className="text-green-500">✓</span>
                        {similarity}
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-3 mt-6">
                  {match.status === 'pending' && (
                    <>
                      <button className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded font-semibold">
                        ✅ Confirm Match
                      </button>
                      <button className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded font-semibold">
                        ❌ Reject Match
                      </button>
                    </>
                  )}
                  <button className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded font-semibold">
                    📧 Contact Both Parties
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  )
}
