import { NextRequest, NextResponse } from 'next/server'
import connectDB from '@/lib/mongodb'
import LostItem from '@/models/LostItem'
import FoundItem from '@/models/FoundItem'
import Match from '@/models/Match'
import User from '@/models/User'

export async function GET(request: NextRequest) {
  try {
    await connectDB()

    // Get total counts
    const [totalLostItems, totalFoundItems, totalMatches, totalUsers] = await Promise.all([
      LostItem.countDocuments({}),
      FoundItem.countDocuments({}),
      Match.countDocuments({}),
      User.countDocuments({})
    ])

    // Get completed matches (resolved matches + returned items)
    const completedLost = await LostItem.countDocuments({ status: 'returned' })
    const completedFound = await FoundItem.countDocuments({ status: 'returned' })
    const resolvedMatches = await Match.countDocuments({ status: 'resolved' })
    const confirmedMatches = await Match.countDocuments({ status: 'confirmed' })
    
    const completedMatches = completedLost + completedFound + resolvedMatches + confirmedMatches

    // Get pending matches
    const pendingMatches = await Match.countDocuments({ status: 'pending' })

    // Get average match score
    const matchScores = await Match.aggregate([
      {
        $match: { matchScore: { $exists: true, $ne: null } }
      },
      {
        $group: {
          _id: null,
          averageScore: { $avg: '$matchScore' }
        }
      }
    ])

    const averageMatchScore = matchScores.length > 0 ? Math.round(matchScores[0].averageScore) : 0

    // Calculate success rate
    const totalItems = totalLostItems + totalFoundItems
    const successRate = totalItems > 0 ? Math.round((completedMatches / totalItems) * 100) : 0

    // Get recent activity (last 7 days)
    const sevenDaysAgo = new Date()
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)

    const recentLost = await LostItem.countDocuments({ createdAt: { $gte: sevenDaysAgo } })
    const recentFound = await FoundItem.countDocuments({ createdAt: { $gte: sevenDaysAgo } })
    const recentMatches = await Match.countDocuments({ createdAt: { $gte: sevenDaysAgo } })

    // Get category breakdown
    const categoryStats = await Promise.all([
      LostItem.aggregate([
        { $group: { _id: '$category', count: { $sum: 1 } } },
        { $sort: { count: -1 } }
      ]),
      FoundItem.aggregate([
        { $group: { _id: '$category', count: { $sum: 1 } } },
        { $sort: { count: -1 } }
      ])
    ])

    const [lostCategories, foundCategories] = categoryStats

    // Get status breakdown
    const statusStats = await Promise.all([
      LostItem.aggregate([
        { $group: { _id: '$status', count: { $sum: 1 } } }
      ]),
      FoundItem.aggregate([
        { $group: { _id: '$status', count: { $sum: 1 } } }
      ]),
      Match.aggregate([
        { $group: { _id: '$status', count: { $sum: 1 } } }
      ])
    ])

    const [lostStatus, foundStatus, matchStatus] = statusStats

    // Get top locations
    const topLocations = await Promise.all([
      LostItem.aggregate([
        { $group: { _id: '$location', count: { $sum: 1 } } },
        { $sort: { count: -1 } },
        { $limit: 10 }
      ]),
      FoundItem.aggregate([
        { $group: { _id: '$location', count: { $sum: 1 } } },
        { $sort: { count: -1 } },
        { $limit: 10 }
      ])
    ])

    const [lostLocations, foundLocations] = topLocations

    // Calculate match confidence distribution
    const matchConfidence = await Match.aggregate([
      {
        $addFields: {
          confidenceLevel: {
            $switch: {
              branches: [
                { case: { $gte: ['$matchScore', 80] }, then: 'high' },
                { case: { $gte: ['$matchScore', 60] }, then: 'medium' }
              ],
              default: 'low'
            }
          }
        }
      },
      {
        $group: {
          _id: '$confidenceLevel',
          count: { $sum: 1 },
          averageScore: { $avg: '$matchScore' }
        }
      }
    ])

    // Get daily activity for the last 30 days
    const thirtyDaysAgo = new Date()
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

    const dailyActivity = await Match.aggregate([
      {
        $match: { createdAt: { $gte: thirtyDaysAgo } }
      },
      {
        $group: {
          _id: {
            date: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } }
          },
          matches: { $sum: 1 },
          averageScore: { $avg: '$matchScore' }
        }
      },
      { $sort: { '_id.date': 1 } }
    ])

    const stats = {
      overview: {
        totalLostItems,
        totalFoundItems,
        totalMatches,
        totalUsers,
        completedMatches,
        pendingMatches,
        averageMatchScore,
        successRate
      },
      recentActivity: {
        last7Days: {
          lost: recentLost,
          found: recentFound,
          matches: recentMatches
        }
      },
      categories: {
        lost: lostCategories,
        found: foundCategories
      },
      status: {
        lost: lostStatus,
        found: foundStatus,
        matches: matchStatus
      },
      locations: {
        lost: lostLocations,
        found: foundLocations
      },
      matchAnalysis: {
        confidence: matchConfidence,
        dailyActivity
      },
      timestamp: new Date().toISOString()
    }

    return NextResponse.json(
      {
        success: true,
        data: stats,
        message: 'Admin statistics retrieved successfully'
      },
      { status: 200 }
    )
  } catch (error) {
    console.error('Error fetching admin stats:', error)
    return NextResponse.json(
      {
        success: false,
        message: 'Failed to fetch admin statistics',
        error: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}
