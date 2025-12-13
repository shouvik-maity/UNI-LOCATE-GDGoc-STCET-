import { NextRequest, NextResponse } from 'next/server'
import connectDB from '@/lib/mongodb'
import LostItem from '@/models/LostItem'

export async function GET(request: NextRequest) {
  try {
    await connectDB()

    const { searchParams } = new URL(request.url)
    const category = searchParams.get('category')
    const status = searchParams.get('status') || 'open'
    const limit = parseInt(searchParams.get('limit') || '20')
    const skip = parseInt(searchParams.get('skip') || '0')

    const query: any = { status }
    if (category && category !== 'all') {
      query.category = category
    }

    const items = await LostItem.find(query).sort({ createdAt: -1 }).limit(limit).skip(skip)

    const total = await LostItem.countDocuments(query)

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
    console.error('Error fetching lost items:', error)
    return NextResponse.json(
      {
        success: false,
        message: 'Failed to fetch lost items',
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
    const { title, description, category, image, location, dateLost, userId, userName, userEmail, userPhone } = body

    if (!title || !description || !category || !image || !location || !dateLost || !userId) {
      return NextResponse.json(
        {
          success: false,
          message: 'Missing required fields',
        },
        { status: 400 }
      )
    }

    const lostItem = await LostItem.create({
      title,
      description,
      category,
      image,
      location,
      dateLost: new Date(dateLost),
      userId,
      userName,
      userEmail,
      userPhone,
    })

    return NextResponse.json(
      {
        success: true,
        data: lostItem,
        message: 'Lost item reported successfully',
      },
      { status: 201 }
    )
  } catch (error) {
    console.error('Error creating lost item:', error)
    return NextResponse.json(
      {
        success: false,
        message: 'Failed to create lost item',
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

    console.log('Updating lost item:', { itemId, status })

    if (!itemId || !status) {
      return NextResponse.json(
        {
          success: false,
          message: 'Missing itemId or status',
        },
        { status: 400 }
      )
    }

    const updatedItem = await LostItem.findByIdAndUpdate(
      itemId,
      { status },
      { new: true, runValidators: false }
    )

    console.log('Updated lost item result:', updatedItem)

    if (!updatedItem) {
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
        data: updatedItem,
        message: 'Lost item updated successfully',
      },
      { status: 200 }
    )
  } catch (error: any) {
    console.error('Error updating lost item:', error)
    return NextResponse.json(
      {
        success: false,
        message: error.message || 'Failed to update lost item',
      },
      { status: 500 }
    )
  }
}
