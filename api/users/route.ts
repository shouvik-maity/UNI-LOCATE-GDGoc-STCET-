import { NextRequest, NextResponse } from 'next/server'
import connectDB from '@/lib/mongodb'
import User from '@/models/User'

export async function POST(request: NextRequest) {
  try {
    await connectDB()

    const body = await request.json()
    const { firebaseUid, email, name, phone } = body

    if (!firebaseUid || !email || !name || !phone) {
      return NextResponse.json(
        {
          success: false,
          message: 'Missing required fields',
        },
        { status: 400 }
      )
    }

    // Check if user already exists
    const existingUser = await User.findOne({ firebaseUid })
    if (existingUser) {
      return NextResponse.json(
        {
          success: true,
          data: existingUser,
          message: 'User already exists',
        },
        { status: 200 }
      )
    }

    const user = await User.create({
      firebaseUid,
      email,
      name,
      phone,
    })

    return NextResponse.json(
      {
        success: true,
        data: user,
        message: 'User created successfully',
      },
      { status: 201 }
    )
  } catch (error) {
    console.error('Error creating user:', error)
    return NextResponse.json(
      {
        success: false,
        message: 'Failed to create user',
      },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    await connectDB()

    const { searchParams } = new URL(request.url)
    const firebaseUid = searchParams.get('firebaseUid')

    if (!firebaseUid) {
      return NextResponse.json(
        {
          success: false,
          message: 'firebaseUid is required',
        },
        { status: 400 }
      )
    }

    const user = await User.findOne({ firebaseUid })

    if (!user) {
      return NextResponse.json(
        {
          success: false,
          message: 'User not found',
        },
        { status: 404 }
      )
    }

    return NextResponse.json(
      {
        success: true,
        data: user,
      },
      { status: 200 }
    )
  } catch (error) {
    console.error('Error fetching user:', error)
    return NextResponse.json(
      {
        success: false,
        message: 'Failed to fetch user',
      },
      { status: 500 }
    )
  }
}
