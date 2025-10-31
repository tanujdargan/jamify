import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ roomId: string }> }
) {
  try {
    const { roomId } = await params

    // Delete all unplayed queue items for this room
    const result = await prisma.queueItem.deleteMany({
      where: {
        roomId,
        isPlayed: false,
      },
    })

    return NextResponse.json({
      success: true,
      deletedCount: result.count,
    })
  } catch (error) {
    console.error('Error clearing queue:', error)
    return NextResponse.json({ error: 'Failed to clear queue' }, { status: 500 })
  }
}
