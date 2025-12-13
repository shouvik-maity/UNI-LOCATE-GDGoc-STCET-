import { NextRequest, NextResponse } from 'next/server'
import connectDB from '@/lib/mongodb'
import FoundItem from '@/models/FoundItem'

export async function GET(request: NextRequest) {
  try {
    await connectDB()

    const { searchParams } = new URL(request.url)
    const category = searchParams.get('category')
    const status = searchParams.get('status') || 'available'
    const limit = parseInt(searchParams.get('limit') || '20')
    const skip = parseInt(searchParams.get('skip') || '0')

    const query: any = { status }
    if (category && category !== 'all') {
      query.category = category
    }

    const items = await FoundItem.find(query).sort({ createdAt: -1 }).limit(limit).skip(skip)

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
    console.error('Error fetching found items:', error)
    return NextResponse.json(
      {
        success: false,
        message: 'Failed to fetch found items',
      },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    await connectDB()

    const body = await request.json()

    // Validation
    const { title, description, category, image, location, dateFound, userId, userName, userEmail, userPhone } = body

    if (!title || !description || !category || !image || !location || !dateFound || !userId) {
      return NextResponse.json(
        {
          success: false,
          message: 'Missing required fields',
        },
        { status: 400 }
      )
    }

    const foundItem = await FoundItem.create({
      title,
      description,
      category,
      image,
      location,
      dateFound: new Date(dateFound),
      userId,
      userName,
      userEmail,
      userPhone,
    })

    return NextResponse.json(
      {
        success: true,
        data: foundItem,
        message: 'Found item reported successfully',
      },
      { status: 201 }
    )
  } catch (error) {
    console.error('Error creating found item:', error)
    return NextResponse.json(
      {
        success: false,
        message: 'Failed to create found item',
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

    const { itemId, status } = body

    console.log('Updating found item:', { itemId, status })

    if (!itemId || !status) {
      return NextResponse.json(
        {
          success: false,
          message: 'Missing itemId or status',
        },
        { status: 400 }
      )
    }

    const updatedItem = await FoundItem.findByIdAndUpdate(
      itemId,
      { status },
      { new: true, runValidators: false }
    )

    console.log('Updated found item result:', updatedItem)

    if (!updatedItem) {
      return NextResponse.json(
        {
          success: false,
          message: 'Found item not found',
        },
        { status: 404 }
      )
    }

    return NextResponse.json(
      {
        success: true,
        data: updatedItem,
        message: 'Found item updated successfully',
      },
      { status: 200 }
    )
  } catch (error: any) {
    console.error('Error updating found item:', error)
    return NextResponse.json(
      {
        success: false,
        message: error.message || 'Failed to update found item',
      },
      { status: 500 }
    )
  }
}
