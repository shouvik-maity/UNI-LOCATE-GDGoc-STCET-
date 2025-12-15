import { NextRequest, NextResponse } from 'next/server'
import connectDB from '@/lib/mongodb'
import LostItem from '@/models/LostItem'
import FoundItem from '@/models/FoundItem'
import Match from '@/models/Match'
import { AIAnalysisService } from '@/lib/ai-analysis'

export async function GET(request: NextRequest) {
  try {
    await connectDB()

    const { searchParams } = new URL(request.url)
    const minScore = parseInt(searchParams.get('minScore') || '10') // Lower threshold for potential matches
    const limit = parseInt(searchParams.get('limit') || '100')
    const category = searchParams.get('category')
    const userId = searchParams.get('userId') // Filter by specific user's lost items

    // Build query for lost items
    const lostQuery: any = {}
    if (category) {
      lostQuery.category = category
    }
    if (userId) {
      lostQuery.userId = userId
    }

    // Get lost items to analyze
    const lostItems = await LostItem.find(lostQuery).limit(limit).lean()
    
    if (lostItems.length === 0) {
      return NextResponse.json({
        success: true,
        data: [],
        message: 'No lost items found for analysis'
      })
    }

    // Get all found items for comparison
    const foundItemsQuery: any = {}
    if (category) {
      foundItemsQuery.category = category
    }
    const foundItems = await FoundItem.find(foundItemsQuery).lean()

    const potentialMatches: any[] = []
    let totalAnalyzed = 0

    // Analyze each lost item against all found items
    for (const lostItem of lostItems) {
      totalAnalyzed++
      
      // Skip items without required data
      if (!lostItem.title || !lostItem.description) {
        continue
      }

      // Perform AI analysis on lost item
      const lostAnalysis = await AIAnalysisService.analyzeItem(
        lostItem.image || '',
        lostItem.title,
        lostItem.description,
        lostItem.category
      )

      // Compare with all found items
      for (const foundItem of foundItems) {
        // Skip if same item or missing data
        if (!foundItem.title || !foundItem.description || 
            foundItem._id.toString() === lostItem._id.toString()) {
          continue
        }


        // Check if match already exists
        const existingMatch = await Match.findOne({
          lostItemId: (lostItem as any)._id.toString(),
          foundItemId: (foundItem as any)._id.toString()
        })

        // Perform AI analysis on found item
        const foundAnalysis = await AIAnalysisService.analyzeItem(
          foundItem.image || '',
          foundItem.title,
          foundItem.description,
          foundItem.category
        )

        // Find matches between lost and found items
        const matchAnalysis = await AIAnalysisService.findMatches(
          lostAnalysis,
          foundAnalysis,
          lostItem,
          foundItem
        )

        // Include potential matches above the (lower) threshold
        if (matchAnalysis.matchScore >= minScore) {
          const potentialMatch = {
            lostItem: {
              _id: lostItem._id,
              title: lostItem.title,
              description: lostItem.description,
              category: lostItem.category,
              location: lostItem.location,
              dateLost: lostItem.dateLost,
              userName: lostItem.userName,
              userEmail: lostItem.userEmail,
              userPhone: lostItem.userPhone,
              image: lostItem.image,
              aiAnalysis: lostAnalysis
            },
            foundItem: {
              _id: foundItem._id,
              title: foundItem.title,
              description: foundItem.description,
              category: foundItem.category,
              location: foundItem.location,
              dateFound: foundItem.dateFound,
              userName: foundItem.userName,
              userEmail: foundItem.userEmail,
              userPhone: foundItem.userPhone,
              image: foundItem.image,
              aiAnalysis: foundAnalysis
            },
            matchScore: matchAnalysis.matchScore,
            similarities: matchAnalysis.matchedFeatures,
            reasoning: matchAnalysis.reasoning,
            confidence: matchAnalysis.confidence,
            status: existingMatch ? existingMatch.status : 'potential',
            isExisting: !!existingMatch,
            potentialMatchId: existingMatch?._id || null,
            createdAt: existingMatch?.createdAt || new Date()
          }

          potentialMatches.push(potentialMatch)
        }
      }
    }

    // Sort by match score (highest first)
    potentialMatches.sort((a, b) => b.matchScore - a.matchScore)

    // Group by confidence level for reporting
    const reportData = {
      summary: {
        totalAnalyzed,
        totalPotentialMatches: potentialMatches.length,
        highConfidence: potentialMatches.filter(m => m.matchScore >= 80).length,
        mediumConfidence: potentialMatches.filter(m => m.matchScore >= 60 && m.matchScore < 80).length,
        lowConfidence: potentialMatches.filter(m => m.matchScore >= minScore && m.matchScore < 60).length,
        existingMatches: potentialMatches.filter(m => m.isExisting).length,
        newPotential: potentialMatches.filter(m => !m.isExisting).length
      },
      matches: potentialMatches
    }

    return NextResponse.json({
      success: true,
      data: reportData,
      message: `Found ${potentialMatches.length} potential matches from ${totalAnalyzed} analyzed items`
    })

  } catch (error: any) {
    console.error('Error fetching potential matches:', error)
    return NextResponse.json(
      { success: false, message: 'Failed to fetch potential matches' },
      { status: 500 }
    )
  }
}
