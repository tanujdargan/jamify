import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ roomId: string }> }
) {
  try {
    const { roomId } = await params
    const { spotifyTrackId, trackName, artistName, albumArt, duration, addedBy } = await req.json()

    const queueItem = await prisma.queueItem.create({
      data: {
        roomId,
        spotifyTrackId,
        trackName,
        artistName,
        albumArt,
        duration,
        addedBy,
      },
    })

    return NextResponse.json(queueItem)
  } catch (error) {
    console.error('Error adding to queue:', error)
    return NextResponse.json({ error: 'Failed to add to queue' }, { status: 500 })
  }
}

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ roomId: string }> }
) {
  try {
    const { roomId } = await params
    const queueItems = await prisma.queueItem.findMany({
      where: { 
        roomId,
        isPlayed: false 
      },
      orderBy: { addedAt: 'asc' },
    })

    return NextResponse.json(queueItems)
  } catch (error) {
    console.error('Error fetching queue:', error)
    return NextResponse.json({ error: 'Failed to fetch queue' }, { status: 500 })
  }
}

