import { NextRequest, NextResponse } from 'next/server'

async function handleSearch(query: string, accessToken: string) {
  if (!query || !accessToken) {
    return NextResponse.json({ error: 'Missing query or token' }, { status: 400 })
  }

  try {
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
      return NextResponse.json({
        error: 'Spotify API request failed',
        details: errorData,
        status: response.status
      }, { status: response.status })
    }

    const data = await response.json()
    return NextResponse.json(data)
  } catch (error) {
    console.error('Error searching Spotify:', error)
    return NextResponse.json({
      error: 'Failed to search',
      message: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}

export async function GET(req: NextRequest) {
  try {
    const searchParams = req.nextUrl.searchParams
    const query = searchParams.get('q')
    const accessToken = searchParams.get('token')

    return handleSearch(query || '', accessToken || '')
  } catch (error) {
    console.error('Error in GET search:', error)
    return NextResponse.json({
      error: 'Failed to search',
      message: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const { query, accessToken } = await req.json()

    return handleSearch(query || '', accessToken || '')
  } catch (error) {
    console.error('Error in POST search:', error)
    return NextResponse.json({
      error: 'Failed to search',
      message: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}

