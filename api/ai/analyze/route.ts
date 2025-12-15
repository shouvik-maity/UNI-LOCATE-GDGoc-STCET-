


import { NextRequest, NextResponse } from 'next/server'
import connectDB from '@/lib/mongodb'
import LostItem from '@/models/LostItem'
import FoundItem from '@/models/FoundItem'
import Match from '@/models/Match'
import { AIAnalysisService } from '@/lib/ai-analysis'

export async function POST(request: NextRequest) {
  try {
    await connectDB()
    
    const { action, itemType, itemId, minScore = 30, categories = [] } = await request.json()
    
    // Handle full analysis action
    if (action === 'fullAnalysis') {
      return await performFullAnalysis(minScore, categories)
    }
    
    // Handle individual item analysis (original functionality)
    if (!itemType || !itemId) {
      return NextResponse.json(
        { success: false, message: 'Missing itemType or itemId' },
        { status: 400 }
      )
    }

    let item
    if (itemType === 'lost') {
      item = await LostItem.findById(itemId)
    } else if (itemType === 'found') {
      item = await FoundItem.findById(itemId)
    } else {
      return NextResponse.json(
        { success: false, message: 'Invalid itemType' },
        { status: 400 }
      )
    }

    if (!item) {
      return NextResponse.json(
        { success: false, message: 'Item not found' },
        { status: 404 }
      )
    }

    // Perform AI analysis
    const aiAnalysis = await AIAnalysisService.analyzeItem(
      item.image,
      item.title,
      item.description,
      item.category
    )

    // Update item with AI analysis
    if (itemType === 'lost') {
      await LostItem.findByIdAndUpdate(itemId, {
        aiAnalysis: aiAnalysis
      })
    } else {
      await FoundItem.findByIdAndUpdate(itemId, {
        aiAnalysis: aiAnalysis
      })
    }

    return NextResponse.json({
      success: true,
      message: 'AI analysis completed successfully',
      data: {
        analysis: aiAnalysis
      }
    })

  } catch (error: any) {
    console.error('AI Analysis error:', error)
    return NextResponse.json(
      { success: false, message: 'Failed to analyze item' },
      { status: 500 }
    )
  }
}

async function performFullAnalysis(minScore: number, categories: string[]) {
  try {
    console.log('Starting full AI analysis...')
    
    // Fetch all lost and found items
    const lostItemsQuery = LostItem.find({})
    const foundItemsQuery = FoundItem.find({})
    
    // Apply category filters if specified
    if (categories.length > 0) {
      lostItemsQuery.where('category').in(categories)
      foundItemsQuery.where('category').in(categories)
    }
    
    const [lostItems, foundItems] = await Promise.all([
      lostItemsQuery.exec(),
      foundItemsQuery.exec()
    ])
    
    console.log(`Found ${lostItems.length} lost items and ${foundItems.length} found items`)
    
    if (lostItems.length === 0 || foundItems.length === 0) {
      return NextResponse.json({
        success: false,
        message: 'Need both lost and found items to perform analysis'
      }, { status: 400 })
    }
    
    let matchesCreated = 0
    let totalAnalyzed = 0
    let highConfidenceMatches = 0
    
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
      
      // Update lost item with AI analysis
      await LostItem.findByIdAndUpdate(lostItem._id, {
        aiAnalysis: lostAnalysis
      })
      
      // Compare with all found items
      for (const foundItem of foundItems) {
        // Skip if same item or missing data
        if (!foundItem.title || !foundItem.description || 
            foundItem._id.toString() === lostItem._id.toString()) {
          continue
        }
        

        // Check if match already exists
        const existingMatch = await Match.findOne({
          lostItemId: lostItem._id.toString(),
          foundItemId: foundItem._id.toString()
        })
        
        if (existingMatch) continue
        
        // Perform AI analysis on found item
        const foundAnalysis = await AIAnalysisService.analyzeItem(
          foundItem.image || '',
          foundItem.title,
          foundItem.description,
          foundItem.category
        )
        
        // Update found item with AI analysis
        await FoundItem.findByIdAndUpdate(foundItem._id, {
          aiAnalysis: foundAnalysis
        })
        
        // Find matches between lost and found items
        const matchAnalysis = await AIAnalysisService.findMatches(
          lostAnalysis,
          foundAnalysis,
          lostItem,
          foundItem
        )
        

        // Only create matches above minimum score
        if (matchAnalysis.matchScore >= minScore) {
          // Convert confidence score to enum
          let confidence: 'high' | 'medium' | 'low'
          if (matchAnalysis.matchScore >= 80) {
            confidence = 'high'
          } else if (matchAnalysis.matchScore >= 60) {
            confidence = 'medium'
          } else {
            confidence = 'low'
          }
          
          const newMatch = new Match({
            lostItemId: lostItem._id.toString(),
            foundItemId: foundItem._id.toString(),
            lostItemUserId: lostItem.userId?.toString() || '',
            foundItemUserId: foundItem.userId?.toString() || '',
            matchScore: matchAnalysis.matchScore,
            similarities: matchAnalysis.matchedFeatures,
            differences: [], // Could be enhanced later
            confidence: confidence,
            productDetails: {
              brand: lostItem.title?.split(' ')[0] || '',
              model: '',
              color: '',
              condition: '',
              uniqueIdentifiers: matchAnalysis.matchedFeatures.slice(0, 3)
            },
            recommendation: matchAnalysis.reasoning,
            status: 'pending',
            notes: `AI Analysis: ${matchAnalysis.reasoning}`
          })
          
          await newMatch.save()
          matchesCreated++
          
          if (matchAnalysis.matchScore >= 80) {
            highConfidenceMatches++
          }
        }
      }
    }
    
    // Calculate statistics
    const allMatches = await Match.find({})
    const averageScore = allMatches.length > 0 
      ? Math.round(allMatches.reduce((sum, match) => sum + match.matchScore, 0) / allMatches.length)
      : 0
    
    console.log(`Analysis complete: ${matchesCreated} new matches created`)
    
    return NextResponse.json({
      success: true,
      message: 'Full AI analysis completed successfully',
      data: {
        totalAnalyzed: totalAnalyzed,
        matchesCreated: matchesCreated,
        highConfidenceMatches: highConfidenceMatches,
        averageScore: averageScore,
        totalMatches: allMatches.length
      }
    })
    
  } catch (error: any) {
    console.error('Full analysis error:', error)
    return NextResponse.json(
      { success: false, message: `Analysis failed: ${error.message}` },
      { status: 500 }
    )
  }
}
