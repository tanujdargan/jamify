import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ roomId: string; itemId: string }> }
) {
  try {
    const { itemId } = await params

    await prisma.queueItem.update({
      where: { id: itemId },
      data: { addedToSpotify: true },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error updating spotify sync status:', error)
    return NextResponse.json({ error: 'Failed to update' }, { status: 500 })
  }
}

