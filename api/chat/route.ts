import { NextRequest, NextResponse } from 'next/server'
import connectDB from '@/lib/mongodb'
import ChatMessage from '@/models/ChatMessage'

export async function GET(request: NextRequest) {
  try {
    await connectDB()

    const { searchParams } = new URL(request.url)
    const matchId = searchParams.get('matchId')
    const limit = parseInt(searchParams.get('limit') || '50')
    const skip = parseInt(searchParams.get('skip') || '0')

    if (!matchId) {
      return NextResponse.json(
        {
          success: false,
          message: 'matchId is required',
        },
        { status: 400 }
      )
    }

    const messages = await ChatMessage.find({ matchId }).sort({ createdAt: 1 }).limit(limit).skip(skip)

    const total = await ChatMessage.countDocuments({ matchId })

    return NextResponse.json(
      {
        success: true,
        data: messages,
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
    console.error('Error fetching chat messages:', error)
    return NextResponse.json(
      {
        success: false,
        message: 'Failed to fetch messages',
      },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    await connectDB()

    const body = await request.json()

    const { senderId, senderName, receiverId, matchId, message } = body

    if (!senderId || !senderName || !receiverId || !matchId || !message) {
      return NextResponse.json(
        {
          success: false,
          message: 'Missing required fields',
        },
        { status: 400 }
      )
    }

    const chatMessage = await ChatMessage.create({
      senderId,
      senderName,
      receiverId,
      matchId,
      message,
    })

    return NextResponse.json(
      {
        success: true,
        data: chatMessage,
        message: 'Message sent successfully',
      },
      { status: 201 }
    )
  } catch (error) {
    console.error('Error creating chat message:', error)
    return NextResponse.json(
      {
        success: false,
        message: 'Failed to send message',
      },
      { status: 500 }
    )
  }
}
