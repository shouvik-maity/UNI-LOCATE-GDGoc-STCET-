

import { NextRequest, NextResponse } from 'next/server'
import connectDB from '@/lib/mongodb'
import LostItem from '@/models/LostItem'
import FoundItem from '@/models/FoundItem'
import { AIAnalysisService } from '@/lib/ai-analysis'

export async function POST(request: NextRequest) {
  try {
    await connectDB()
    
    const { itemType, itemId } = await request.json()
    
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
