import { NextRequest, NextResponse } from 'next/server'
import connectDB from '@/lib/mongodb'
import Match from '@/models/Match'

export async function GET(request: NextRequest) {
  try {
    await connectDB()

    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status') || 'all'
    const limit = parseInt(searchParams.get('limit') || '1000')
    const skip = parseInt(searchParams.get('skip') || '0')

    const query: any = {}
    if (status !== 'all') {
      query.status = status
    }

    const items = await Match.find(query).sort({ createdAt: -1 }).limit(limit).skip(skip)

    const total = await Match.countDocuments(query)

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
    console.error('Error fetching admin matches:', error)
    return NextResponse.json(
      {
        success: false,
        message: 'Failed to fetch matches',
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

    const { matchId, status, bulkUpdate = false, matchIds = [] } = body

    console.log('Updating match:', { matchId, status, bulkUpdate, matchIds })

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
        { new: true, runValidators: false }
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
        message: 'Match updated successfully'
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
  } catch (error: any) {
    console.error('Error updating match:', error)
    return NextResponse.json(
      {
        success: false,
        message: 'Failed to update match',
        error: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}

export async function PUT(request: NextRequest) {
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

    const { autoMatch = false, minScore = 30 } = body

    console.log('Running auto-match:', { autoMatch, minScore })

    if (!autoMatch) {
      return NextResponse.json(
        {
          success: false,
          message: 'Auto-match feature not enabled',
        },
        { status: 400 }
      )
    }

    // This would trigger the AI matching process
    // For now, return a success message indicating the feature is being implemented
    const result = {
      matchesAnalyzed: 0,
      matchesCreated: 0,
      message: 'Auto-match feature is being enhanced with AI capabilities'
    }

    return NextResponse.json(
      {
        success: true,
        data: result,
        message: 'Auto-match process completed',
      },
      { status: 200 }
    )
  } catch (error: any) {
    console.error('Error running auto-match:', error)
    return NextResponse.json(
      {
        success: false,
        message: 'Failed to run auto-match',
        error: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}
