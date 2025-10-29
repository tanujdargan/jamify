import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  try {
    const { trackUri, accessToken } = await req.json()

    if (!trackUri || !accessToken) {
      return NextResponse.json({ error: 'Missing trackUri or accessToken' }, { status: 400 })
    }

    const response = await fetch('https://api.spotify.com/v1/me/player/play', {
      method: 'PUT',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        uris: [trackUri],
      }),
    })

    if (response.status === 204) {
      return NextResponse.json({ success: true })
    }

    if (!response.ok) {
      const error = await response.text()
      console.error('Spotify play error:', error)
      return NextResponse.json({ error: 'Failed to play track' }, { status: response.status })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error playing track:', error)
    return NextResponse.json({ error: 'Failed to play track' }, { status: 500 })
  }
}

