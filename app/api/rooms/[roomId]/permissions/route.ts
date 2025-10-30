import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import { prisma } from '@/lib/prisma'

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ roomId: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { roomId } = await params
    const { allowedUsers } = await req.json()

    // Verify the user is the host
    const room = await prisma.room.findUnique({
      where: { id: roomId },
    })

    if (!room || room.hostId !== session.user.email) {
      return NextResponse.json({ error: 'Only the host can update permissions' }, { status: 403 })
    }

    const updatedRoom = await prisma.room.update({
      where: { id: roomId },
      data: { allowedUsers },
    })

    return NextResponse.json(updatedRoom)
  } catch (error) {
    console.error('Error updating permissions:', error)
    return NextResponse.json({ error: 'Failed to update permissions' }, { status: 500 })
  }
}

