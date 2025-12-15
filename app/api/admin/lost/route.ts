
import { NextRequest, NextResponse } from 'next/server'
import connectDB from '@/lib/mongodb'
import LostItem from '@/models/LostItem'

// Simple in-memory cache for mobile performance
const cache = new Map()
const CACHE_DURATION = 5 * 60 * 1000 // 5 minutes

export async function GET(request: NextRequest) {
  try {
    await connectDB()


    const { searchParams } = new URL(request.url)
    const category = searchParams.get('category')
    const status = searchParams.get('status') || 'all'
    const userId = searchParams.get('userId')
    const limit = parseInt(searchParams.get('limit') || '1000')
    const skip = parseInt(searchParams.get('skip') || '0')

    const query: any = {}
    if (category && category !== 'all') {
      query.category = category
    }
    if (status !== 'all') {
      query.status = status
    }
    if (userId) {
      query.userId = userId
    }

    // Create cache key for this query
    const cacheKey = `lost_${userId}_${status}_${category}_${limit}_${skip}`
    const cached = cache.get(cacheKey)
    
    // Return cached result if valid (less than 5 minutes old)
    if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
      console.log('📦 Serving cached data for mobile performance')
      return NextResponse.json(
        {
          success: true,
          data: cached.data,
          pagination: cached.pagination,
          cached: true,
        },
        { status: 200 }
      )
    }



    // Optimize query by selecting only necessary fields for mobile performance
    const items = await LostItem.find(query)
      .select('title description category image location dateLost userId userName userEmail userPhone status createdAt updatedAt aiAnalysis')
      .sort({ createdAt: -1 })
      .limit(limit)
      .skip(skip)
      .lean()

    const total = await LostItem.countDocuments(query)


    const responseData = {
      success: true,
      data: items,
      pagination: {
        total,
        skip,
        limit,
        hasMore: skip + limit < total,
      },
    }

    // Cache the result for mobile performance
    cache.set(cacheKey, {
      data: items,
      pagination: responseData.pagination,
      timestamp: Date.now(),
    })

    return NextResponse.json(responseData, { status: 200 })
  } catch (error) {
    console.error('Error fetching admin lost items:', error)
    return NextResponse.json(
      {
        success: false,
        message: 'Failed to fetch lost items',
      },
      { status: 500 }
    )
  }
}


export async function DELETE(request: NextRequest) {
  try {
    await connectDB()

    const { searchParams } = new URL(request.url)
    const itemId = searchParams.get('id')

    if (!itemId) {
      return NextResponse.json(
        {
          success: false,
          message: 'Item ID is required',
        },
        { status: 400 }
      )
    }

    const deletedItem = await LostItem.findByIdAndDelete(itemId)

    if (!deletedItem) {
      return NextResponse.json(
        {
          success: false,
          message: 'Lost item not found',
        },
        { status: 404 }
      )
    }

    return NextResponse.json(
      {
        success: true,
        message: 'Lost item deleted successfully',
      },
      { status: 200 }
    )
  } catch (error: any) {
    console.error('Error deleting lost item:', error)
    return NextResponse.json(
      {
        success: false,
        message: error.message || 'Failed to delete lost item',
      },
      { status: 500 }
    )
  }
}

export async function PATCH(request: NextRequest) {
  try {
    await connectDB()

    let body
    try {
      body = await request.json()
    } catch (parseError) {
      console.error('Error parsing request body:', parseError)
      return NextResponse.json(
        {
          success: false,
          message: 'Invalid JSON in request body',
        },
        { status: 400 }
      )
    }

    const { itemId, status, bulkUpdate = false, itemIds = [] } = body

    console.log('Updating lost item:', { itemId, status, bulkUpdate, itemIds })

    if (!status) {
      return NextResponse.json(
        {
          success: false,
          message: 'Missing status',
        },
        { status: 400 }
      )
    }

    let result
    const updateData = {
      status,
      updatedAt: new Date(),
    }

    if (bulkUpdate && itemIds.length > 0) {
      // Bulk update multiple items
      const updateResult = await LostItem.updateMany(
        { _id: { $in: itemIds } },
        updateData
      )
      
      result = {
        matchedCount: updateResult.matchedCount,
        modifiedCount: updateResult.modifiedCount,
        message: `Successfully updated ${updateResult.modifiedCount} lost items`
      }
    } else if (itemId) {
      // Single item update
      const updatedItem = await LostItem.findByIdAndUpdate(
        itemId,
        updateData,
        { new: true, runValidators: false }
      )

      if (!updatedItem) {
        return NextResponse.json(
          {
            success: false,
            message: 'Lost item not found',
          },
          { status: 404 }
        )
      }

      result = {
        item: updatedItem,
        message: 'Lost item updated successfully'
      }
    } else {
      return NextResponse.json(
        {
          success: false,
          message: 'Either itemId (single) or itemIds (bulk) must be provided',
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
  } catch (error: any) {
    console.error('Error updating lost item:', error)
    return NextResponse.json(
      {
        success: false,
        message: 'Failed to update lost item',
        error: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}
