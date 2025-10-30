import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  try {
    const { trackUri, accessToken } = await req.json()

    if (!trackUri || !accessToken) {
      return NextResponse.json({ error: 'Missing trackUri or accessToken' }, { status: 400 })
    }

    const response = await fetch(
      `https://api.spotify.com/v1/me/player/queue?uri=${encodeURIComponent(trackUri)}`,
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }
    )

    if (response.status === 204) {
      return NextResponse.json({ success: true })
    }

    if (!response.ok) {
      const errorText = await response.text()
      console.error('Spotify queue error:', response.status, errorText)
      return NextResponse.json({ 
        error: 'Failed to add to Spotify queue',
        status: response.status,
        details: errorText 
      }, { status: response.status })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error adding to Spotify queue:', error)
    return NextResponse.json({ 
      error: 'Failed to add to queue',
      message: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}

