import { NextRequest, NextResponse } from 'next/server'

// Cache for access tokens to avoid repeated auth requests
let cachedToken: { token: string; expiresAt: number } | null = null

async function getAccessToken(): Promise<string> {
  const clientId = process.env.SPOTIFY_CLIENT_ID
  const clientSecret = process.env.SPOTIFY_CLIENT_SECRET

  if (!clientId || !clientSecret) {
    throw new Error('Missing Spotify credentials in environment variables')
  }

  // Return cached token if still valid
  if (cachedToken && cachedToken.expiresAt > Date.now()) {
    return cachedToken.token
  }

  // Get new token using Client Credentials flow
  const auth = Buffer.from(`${clientId}:${clientSecret}`).toString('base64')

  const response = await fetch('https://accounts.spotify.com/api/token', {
    method: 'POST',
    headers: {
      Authorization: `Basic ${auth}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: 'grant_type=client_credentials',
  })

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}))
    console.error('Spotify auth error:', response.status, errorData)
    throw new Error(`Failed to authenticate with Spotify: ${response.statusText}`)
  }

  const data = await response.json()
  const expiresAt = Date.now() + data.expires_in * 1000 - 60000 // Refresh 1 minute before expiry

  cachedToken = {
    token: data.access_token,
    expiresAt,
  }

  return data.access_token
}

async function handleSearch(query: string) {
  if (!query || !query.trim()) {
    return NextResponse.json({ error: 'Missing query' }, { status: 400 })
  }

  try {
    const accessToken = await getAccessToken()

    const response = await fetch(
      `https://api.spotify.com/v1/search?q=${encodeURIComponent(query)}&type=track&limit=10`,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }
    )

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      console.error('Spotify API error:', response.status, errorData)
      return NextResponse.json(
        {
          error: 'Spotify API request failed',
          details: errorData,
          status: response.status,
        },
        { status: response.status }
      )
    }

    const data = await response.json()
    return NextResponse.json(data)
  } catch (error) {
    console.error('Error searching Spotify:', error)
    return NextResponse.json(
      {
        error: 'Failed to search',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}

export async function GET(req: NextRequest) {
  try {
    const searchParams = req.nextUrl.searchParams
    const query = searchParams.get('q')

    return handleSearch(query || '')
  } catch (error) {
    console.error('Error in GET search:', error)
    return NextResponse.json(
      {
        error: 'Failed to search',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}

export async function POST(req: NextRequest) {
  try {
    const { query } = await req.json()

    return handleSearch(query || '')
  } catch (error) {
    console.error('Error in POST search:', error)
    return NextResponse.json(
      {
        error: 'Failed to search',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}

