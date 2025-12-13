import { NextRequest, NextResponse } from 'next/server'
import connectDB from '@/lib/mongodb'
import FoundItem from '@/models/FoundItem'


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


    // Optimize query by selecting only necessary fields for mobile performance
    const items = await FoundItem.find(query)
      .select('title description category image location dateFound userId userName userEmail userPhone status createdAt updatedAt')
      .sort({ createdAt: -1 })
      .limit(limit)
      .skip(skip)
      .lean()

    const total = await FoundItem.countDocuments(query)

    return NextResponse.json(
      {
        success: true,
        data: items,
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
    console.error('Error fetching admin found items:', error)
    return NextResponse.json(
      {
        success: false,
        message: 'Failed to fetch found items',
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

    console.log('Updating found item:', { itemId, status, bulkUpdate, itemIds })

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
      const updateResult = await FoundItem.updateMany(
        { _id: { $in: itemIds } },
        updateData
      )
      
      result = {
        matchedCount: updateResult.matchedCount,
        modifiedCount: updateResult.modifiedCount,
        message: `Successfully updated ${updateResult.modifiedCount} found items`
      }
    } else if (itemId) {
      // Single item update
      const updatedItem = await FoundItem.findByIdAndUpdate(
        itemId,
        updateData,
        { new: true, runValidators: false }
      )

      if (!updatedItem) {
        return NextResponse.json(
          {
            success: false,
            message: 'Found item not found',
          },
          { status: 404 }
        )
      }

      result = {
        item: updatedItem,
        message: 'Found item updated successfully'
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
    console.error('Error updating found item:', error)
    return NextResponse.json(
      {
        success: false,
        message: 'Failed to update found item',
        error: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}
