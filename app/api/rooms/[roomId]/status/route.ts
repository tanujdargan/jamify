import { NextRequest, NextResponse } from 'next/server'

// Store last ping time for each room
const roomPings = new Map<string, number>()

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ roomId: string }> }
) {
  const { roomId } = await params
  const lastPing = roomPings.get(roomId)
  const isConnected = lastPing && (Date.now() - lastPing) < 10000 // Connected if pinged within 10s
  
  return NextResponse.json({
    connected: !!isConnected,
    lastPing: lastPing || null,
  })
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ roomId: string }> }
) {
  const { roomId } = await params
  roomPings.set(roomId, Date.now())
  
  return NextResponse.json({ success: true })
}

