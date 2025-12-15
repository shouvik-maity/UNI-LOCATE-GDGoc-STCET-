import { NextRequest, NextResponse } from 'next/server'
import connectDB from '@/lib/mongodb'
import LostItem from '@/models/LostItem'
import FoundItem from '@/models/FoundItem'
import Match from '@/models/Match'
import { GoogleGenerativeAI } from '@google/generative-ai'

// Environment validation
const GEMINI_API_KEY = process.env.GEMINI_API_KEY
if (!GEMINI_API_KEY) {
  console.warn('⚠️ GEMINI_API_KEY environment variable is not set. AI matching will use fallback algorithms.')
}

const genAI = GEMINI_API_KEY ? new GoogleGenerativeAI(GEMINI_API_KEY) : null



// Fallback matching algorithm for when AI is unavailable
function fallbackMatching(lostItem: any, foundItem: any): { score: number; similarities: string[]; details: any } {
  let score = 0
  const similarities: string[] = []
  const differences: string[] = []
  
  // Category matching (30 points max)
  if (lostItem.category === foundItem.category) {
    score += 30
    similarities.push(`Same category: ${lostItem.category}`)
  } else {
    differences.push(`Different categories: ${lostItem.category} vs ${foundItem.category}`)
  }
  
  // Title similarity (25 points max)
  const titleSimilarity = calculateStringSimilarity(lostItem.title.toLowerCase(), foundItem.title.toLowerCase())
  if (titleSimilarity > 0.7) {
    score += 25
    similarities.push('Similar titles')
  } else if (titleSimilarity > 0.4) {
    score += 15
    similarities.push('Partially similar titles')
  } else {
    differences.push('Different titles')
  }
  
  // Description similarity (20 points max)
  const descSimilarity = calculateStringSimilarity(lostItem.description.toLowerCase(), foundItem.description.toLowerCase())
  if (descSimilarity > 0.6) {
    score += 20
    similarities.push('Similar descriptions')
  } else if (descSimilarity > 0.3) {
    score += 10
    similarities.push('Partially similar descriptions')
  }
  
  // Location proximity (15 points max)
  if (lostItem.location === foundItem.location) {
    score += 15
    similarities.push('Same location')
  } else if (isLocationNearby(lostItem.location, foundItem.location)) {
    score += 8
    similarities.push('Nearby locations')
  } else {
    differences.push('Different locations')
  }
  
  // Date proximity (10 points max)
  if (lostItem.dateLost && foundItem.dateFound) {
    const daysDiff = Math.abs(new Date(lostItem.dateLost).getTime() - new Date(foundItem.dateFound).getTime()) / (1000 * 60 * 60 * 24)
    if (daysDiff <= 7) {
      score += 10
      similarities.push('Close dates')
    } else if (daysDiff <= 30) {
      score += 5
      similarities.push('Similar timeframe')
    } else {
      differences.push('Different timeframes')
    }
  }
  
  const confidence = score >= 70 ? 'high' : score >= 50 ? 'medium' : 'low'
  
  return {
    score: Math.min(score, 100),
    similarities,
    details: {
      confidence,
      differences,
      productDetails: {
        condition: 'Assessed by algorithm',
        uniqueIdentifiers: []
      },
      recommendation: score >= 70 ? 'High confidence match - likely same item' : 
                     score >= 50 ? 'Possible match - requires manual verification' : 
                     'Low confidence - unlikely to be same item'
    }
  }
}

// Helper function to calculate string similarity
function calculateStringSimilarity(str1: string, str2: string): number {
  const longer = str1.length > str2.length ? str1 : str2
  const shorter = str1.length > str2.length ? str2 : str1
  
  if (longer.length === 0) return 1.0
  
  const editDistance = levenshteinDistance(longer, shorter)
  return (longer.length - editDistance) / longer.length
}

// Levenshtein distance algorithm
function levenshteinDistance(str1: string, str2: string): number {
  const matrix = []
  
  for (let i = 0; i <= str2.length; i++) {
    matrix[i] = [i]
  }
  
  for (let j = 0; j <= str1.length; j++) {
    matrix[0][j] = j
  }
  
  for (let i = 1; i <= str2.length; i++) {
    for (let j = 1; j <= str1.length; j++) {
      if (str2.charAt(i - 1) === str1.charAt(j - 1)) {
        matrix[i][j] = matrix[i - 1][j - 1]
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j - 1] + 1,
          matrix[i][j - 1] + 1,
          matrix[i - 1][j] + 1
        )
      }
    }
  }
  
  return matrix[str2.length][str1.length]
}

// Simple location proximity check
function isLocationNearby(location1: string, location2: string): boolean {
  const normalizeLocation = (loc: string) => loc.toLowerCase().trim()
  const loc1 = normalizeLocation(location1)
  const loc2 = normalizeLocation(location2)
  
  // Exact match
  if (loc1 === loc2) return true
  
  // Check if one location contains the other (for partial matches)
  return loc1.includes(loc2) || loc2.includes(loc1)
}

// Enhanced AI analysis with retry logic and fallbacks
async function analyzeItemsMatch(lostItem: any, foundItem: any): Promise<{ score: number; similarities: string[]; details: any }> {
  // If AI is not available, use fallback immediately
  if (!genAI) {
    console.log('🤖 AI unavailable, using fallback matching algorithm')
    return fallbackMatching(lostItem, foundItem)
  }

  const maxRetries = 3
  let lastError: Error | null = null
  
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {

      const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' })

      const prompt = `
      You are an expert product matching system for lost and found items. Analyze both items and determine if they could be the same product.

      LOST ITEM:
      - Title: ${lostItem.title}
      - Description: ${lostItem.description}
      - Category: ${lostItem.category}
      - Location: ${lostItem.location}
      - Date: ${lostItem.dateLost}

      FOUND ITEM:
      - Title: ${foundItem.title}
      - Description: ${foundItem.description}
      - Category: ${foundItem.category}
      - Location: ${foundItem.location}
      - Date: ${foundItem.dateFound}

      Analyze these factors for product matching:
      1. CATEGORY MATCH: Same or compatible categories
      2. BRAND/MODEL: Identify specific brands, models, or unique identifiers
      3. VISUAL CHARACTERISTICS: Color, size, design features, wear patterns
      4. CONDITION: New, used, damaged, etc.
      5. SERIAL NUMBERS: Look for any identifying numbers or codes
      6. TIMELINE: How close are the dates
      7. LOCATION: Geographic proximity
      8. UNIQUE FEATURES: Any distinctive characteristics

      Provide detailed analysis in JSON format:
      {
        "matchScore": <number 0-100>,
        "similarities": [<array of specific matching features>],
        "differences": [<array of notable differences>],
        "confidence": "<high/medium/low>",
        "productDetails": {
          "brand": "<detected brand or null>",
          "model": "<detected model or null>",
          "color": "<detected color or null>",
          "condition": "<condition assessment>",
          "uniqueIdentifiers": [<array of potential serial numbers>]
        },
        "recommendation": "<brief recommendation>"
      }

      Scoring Guidelines:
      - 90-100%: Very likely same item (same brand, model, color, close timeline)
      - 70-89%: Probably same item (similar features, compatible timeline)
      - 50-69%: Possible match (some similarities but notable differences)
      - Below 50%: Unlikely to be the same item
      `

      // Set timeout for AI requests (30 seconds)
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('AI request timeout')), 30000)
      )

      let analysisText = ''
      
      if (lostItem.image && foundItem.image) {
        try {
          // Convert base64 images to proper format
          const lostImageData = lostItem.image.replace(/^data:image\/[a-z]+;base64,/, '')
          const foundImageData = foundItem.image.replace(/^data:image\/[a-z]+;base64,/, '')
          
          const result = await Promise.race([
            model.generateContent([
              {
                inlineData: {
                  data: lostImageData,
                  mimeType: 'image/jpeg'
                }
              },
              {
                inlineData: {
                  data: foundImageData,
                  mimeType: 'image/jpeg'
                }
              },
              prompt
            ]),
            timeoutPromise
          ])
          analysisText = (result as any).response.text()
        } catch (imageError) {
          console.log(`Image analysis failed (attempt ${attempt}), falling back to text-only:`, imageError)
          // Fallback to text-only analysis
          const result = await Promise.race([
            model.generateContent(prompt),
            timeoutPromise
          ])
          analysisText = (result as any).response.text()
        }
      } else {
        // Text-only analysis
        const result = await Promise.race([
          model.generateContent(prompt),
          timeoutPromise
        ])
        analysisText = (result as any).response.text()
      }

      // Extract JSON from response with improved parsing
      let analysis
      try {
        const jsonMatch = analysisText.match(/\{[\s\S]*\}/)
        if (!jsonMatch) {
          throw new Error('No JSON found in response')
        }

        // Clean up the JSON string
        let jsonString = jsonMatch[0]
        // Remove any markdown code blocks
        jsonString = jsonString.replace(/```json\s*/g, '').replace(/```\s*/g, '')
        
        analysis = JSON.parse(jsonString)
      } catch (parseError) {
        console.error(`Failed to parse Gemini response as JSON (attempt ${attempt}):`, parseError)
        console.error('Response text:', analysisText)
        lastError = new Error(`JSON parsing failed: ${parseError}`)
        continue // Try again
      }
      
      // Validate analysis structure
      if (!analysis || typeof analysis.matchScore !== 'number') {
        lastError = new Error('Invalid analysis structure from AI')
        continue // Try again
      }
      
      return {
        score: Math.max(0, Math.min(100, analysis.matchScore || 0)),
        similarities: Array.isArray(analysis.similarities) ? analysis.similarities : [],
        details: {
          ...analysis,
          differences: Array.isArray(analysis.differences) ? analysis.differences : [],
          productDetails: analysis.productDetails || {},
          confidence: analysis.confidence || 'medium'
        }
      }
      
    } catch (error) {
      console.error(`Error analyzing match with Gemini (attempt ${attempt}):`, error)
      lastError = error instanceof Error ? error : new Error('Unknown error')
      
      if (attempt === maxRetries) {
        console.error('All AI attempts failed, using fallback matching')
        return fallbackMatching(lostItem, foundItem)
      }
      
      // Wait before retry (exponential backoff)
      const delay = Math.pow(2, attempt - 1) * 1000
      await new Promise(resolve => setTimeout(resolve, delay))
    }
  }
  
  // Should not reach here, but fallback just in case
  console.error('Unexpected error in AI analysis, using fallback')
  return fallbackMatching(lostItem, foundItem)
}

export async function POST(request: NextRequest) {
  try {
    await connectDB()

    const body = await request.json()
    const { lostItemId, foundItemId } = body

    if (!lostItemId || !foundItemId) {
      return NextResponse.json(
        {
          success: false,
          message: 'Missing lostItemId or foundItemId',
        },
        { status: 400 }
      )
    }

    // Get both items
    const lostItem = await LostItem.findById(lostItemId)
    const foundItem = await FoundItem.findById(foundItemId)

    if (!lostItem || !foundItem) {
      return NextResponse.json(
        {
          success: false,
          message: 'Lost item or found item not found',
        },
        { status: 404 }
      )
    }

    // Check if match already exists
    const existingMatch = await Match.findOne({
      lostItemId,
      foundItemId,
    })

    if (existingMatch) {
      return NextResponse.json(
        {
          success: true,
          data: existingMatch,
          message: 'Match already exists',
        },
        { status: 200 }
      )
    }


    // Analyze items with Gemini AI
    const { score, similarities, details } = await analyzeItemsMatch(lostItem, foundItem)

    // Create match with enhanced details
    const match = await Match.create({
      lostItemId,
      foundItemId,
      matchScore: score,
      similarities,
      differences: details.differences || [],
      confidence: details.confidence || 'medium',
      productDetails: details.productDetails || {},
      recommendation: details.recommendation || '',
      lostItemUserId: lostItem.userId,
      foundItemUserId: foundItem.userId,
    })

    return NextResponse.json(
      {
        success: true,
        data: match,
        message: 'Match analyzed and created successfully',
        analysis: {
          score,
          similarities,
          details,
        },
      },
      { status: 201 }
    )
  } catch (error) {
    console.error('Error creating match:', error)
    return NextResponse.json(
      {
        success: false,
        message: 'Failed to create match',
      },
      { status: 500 }
    )
  }
}



export async function GET(request: NextRequest) {
  try {
    await connectDB()

    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status') || 'all' // Default to 'all' to get all matches
    const limit = parseInt(searchParams.get('limit') || '20')
    const skip = parseInt(searchParams.get('skip') || '0')

    let query = {}
    if (status && status !== 'all') {
      query = { status }
    }

    const matches = await Match.find(query).sort({ matchScore: -1 }).limit(limit).skip(skip)

    const total = await Match.countDocuments(query)

    return NextResponse.json(
      {
        success: true,
        data: matches,
        pagination: {
          total,
          skip,
          limit,
          hasMore: skip + limit < total,
        },
      },
      { status: 200 }
    )
  } catch (error) {
    console.error('Error fetching matches:', error)
    return NextResponse.json(
      {
        success: false,
        message: 'Failed to fetch matches',
      },
      { status: 500 }
    )
  }
}


// Update match status endpoint (PATCH)
export async function PATCH(request: NextRequest) {
  try {
    await connectDB()

    const body = await request.json()
    const { matchId, status, bulkUpdate = false, matchIds = [] } = body

    // Validate status
    const validStatuses = ['pending', 'confirmed', 'rejected', 'resolved']
    if (!validStatuses.includes(status)) {
      return NextResponse.json(
        {
          success: false,
          message: 'Invalid status. Must be one of: ' + validStatuses.join(', '),
        },
        { status: 400 }
      )
    }

    let result
    const updateData = {
      status,
      updatedAt: new Date(),
    }

    if (bulkUpdate && matchIds.length > 0) {
      // Bulk update multiple matches
      const updateResult = await Match.updateMany(
        { _id: { $in: matchIds } },
        updateData
      )
      
      result = {
        matchedCount: updateResult.matchedCount,
        modifiedCount: updateResult.modifiedCount,
        message: `Successfully updated ${updateResult.modifiedCount} matches`
      }
    } else if (matchId) {
      // Single match update
      const updatedMatch = await Match.findByIdAndUpdate(
        matchId,
        updateData,
        { new: true }
      )

      if (!updatedMatch) {
        return NextResponse.json(
          {
            success: false,
            message: 'Match not found',
          },
          { status: 404 }
        )
      }

      result = {
        match: updatedMatch,
        message: 'Match status updated successfully'
      }
    } else {
      return NextResponse.json(
        {
          success: false,
          message: 'Either matchId (single) or matchIds (bulk) must be provided',
        },
        { status: 400 }
      )
    }

    return NextResponse.json(
      {
        success: true,
        data: result,
        message: result.message,
      },
      { status: 200 }
    )
  } catch (error) {
    console.error('Error updating match status:', error)
    return NextResponse.json(
      {
        success: false,
        message: 'Failed to update match status',
        error: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}

// Batch automatic matching endpoint
export async function PUT(request: NextRequest) {
  try {
    await connectDB()

    const body = await request.json()
    const { autoMatch = true, minScore = 30 } = body

    if (!autoMatch) {
      return NextResponse.json(
        {
          success: false,
          message: 'Auto-match must be enabled',
        },
        { status: 400 }
      )
    }

    // Get all pending lost and found items
    const lostItems = await LostItem.find({ 
      status: { $in: ['open', 'claimed'] }
    }).lean()
    
    const foundItems = await FoundItem.find({ 
      status: { $in: ['available', 'claimed'] }
    }).lean()

    const matchesCreated = []
    const matchesAnalyzed = []

    // Analyze potential matches
    for (const lostItem of lostItems) {
      for (const foundItem of foundItems) {
        // Skip if same user
        if (lostItem.userId === foundItem.userId) continue


        // Check if match already exists
        const lostItemId = (lostItem as any)._id.toString()
        const foundItemId = (foundItem as any)._id.toString()
        
        const existingMatch = await Match.findOne({
          lostItemId,
          foundItemId,
        })

        if (existingMatch) continue

        try {
          const { score, similarities, details } = await analyzeItemsMatch(lostItem, foundItem)
          matchesAnalyzed.push({
            lostItemId,
            foundItemId,
            score,
            similarities,
            details
          })

          // Create match if score meets threshold
          if (score >= minScore) {
            const match = await Match.create({
              lostItemId,
              foundItemId,
              matchScore: score,
              similarities,
              differences: details.differences || [],
              confidence: details.confidence || 'medium',
              productDetails: details.productDetails || {},
              recommendation: details.recommendation || '',
              lostItemUserId: lostItem.userId,
              foundItemUserId: foundItem.userId,
            })

            matchesCreated.push(match)
          }
        } catch (error) {
          console.error(`Error analyzing match for items ${lostItemId} and ${foundItemId}:`, error)
        }
      }
    }

    return NextResponse.json(
      {
        success: true,
        message: 'Batch matching completed',
        data: {
          totalLostItems: lostItems.length,
          totalFoundItems: foundItems.length,
          matchesAnalyzed: matchesAnalyzed.length,
          matchesCreated: matchesCreated.length,
          averageScore: matchesAnalyzed.length > 0 
            ? matchesAnalyzed.reduce((sum, m) => sum + m.score, 0) / matchesAnalyzed.length 
            : 0,
        },
        matchesCreated,
        topMatches: matchesAnalyzed
          .sort((a, b) => b.score - a.score)
          .slice(0, 10)
          .map(m => ({
            lostItemId: m.lostItemId,
            foundItemId: m.foundItemId,
            score: m.score,
            similarities: m.similarities.slice(0, 3), // Top 3 similarities
          })),
      },
      { status: 200 }
    )
  } catch (error) {
    console.error('Error in batch matching:', error)
    return NextResponse.json(
      {
        success: false,
        message: 'Failed to perform batch matching',
      },
      { status: 500 }
    )
  }
}
