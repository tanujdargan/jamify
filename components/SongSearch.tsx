'use client'

import { useState, useEffect, useCallback } from 'react'
import { useSession } from 'next-auth/react'
import { toast } from 'sonner'

interface Track {
  id: string
  name: string
  artists: Array<{ name: string }>
  album: {
    name: string
    images: Array<{ url: string }>
  }
  duration_ms: number
  uri: string
}

interface SongSearchProps {
  roomId: string
  onSongAdded?: () => void
}

export default function SongSearch({ roomId, onSongAdded }: SongSearchProps) {
  const { data: session } = useSession()
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<Track[]>([])
  const [loading, setLoading] = useState(false)
  const [adding, setAdding] = useState<string | null>(null)

  const searchSongs = useCallback(async (searchQuery: string) => {
    if (!searchQuery.trim()) {
      setResults([])
      return
    }

    if (!session?.accessToken) {
      console.warn('Cannot search: missing access token')
      toast.error('Not authenticated', {
        description: 'Please log in with Spotify to search for songs'
      })
      return
    }

    // Check if session has a token refresh error
    if (session.error === 'RefreshAccessTokenError') {
      toast.error('Session expired', {
        description: 'Please log out and log back in to continue'
      })
      return
    }

    setLoading(true)
    try {
      const response = await fetch('/api/spotify/search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query: searchQuery,
          accessToken: session.accessToken
        })
      })

      const data = await response.json()

      if (!response.ok) {
        console.error('Search failed:', data)
        toast.error('Search failed', {
          description: data.error || 'Unable to search for songs'
        })
        setResults([])
        return
      }

      const tracks = data.tracks?.items || []
      setResults(tracks)

      if (tracks.length === 0) {
        toast.info('No results found', {
          description: `No songs matching "${searchQuery}"`
        })
      }
    } catch (error) {
      console.error('Search error:', error)
      toast.error('Search error', {
        description: 'Network error occurred while searching'
      })
    } finally {
      setLoading(false)
    }
  }, [session])

  // Debounced search effect
  useEffect(() => {
    const timer = setTimeout(() => {
      searchSongs(query)
    }, 500) // Wait 500ms after user stops typing

    return () => clearTimeout(timer)
  }, [query, searchSongs])

  const addToQueue = async (track: Track) => {
    setAdding(track.id)
    try {
      const response = await fetch(`/api/rooms/${roomId}/queue`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          spotifyTrackId: track.id,
          trackName: track.name,
          artistName: track.artists.map((a) => a.name).join(', '),
          albumArt: track.album.images[0]?.url,
          duration: track.duration_ms,
          addedBy: session?.user?.name || 'Guest',
        }),
      })

      if (response.ok) {
        toast.success('Added to queue', {
          description: `"${track.name}" by ${track.artists.map((a) => a.name).join(', ')}`
        })
        onSongAdded?.()
      } else {
        toast.error('Failed to add song', {
          description: 'Please try again'
        })
      }
    } catch (error) {
      console.error('Add to queue error:', error)
      toast.error('Failed to add song', {
        description: 'Network error occurred'
      })
    } finally {
      setAdding(null)
    }
  }

  return (
    <div className="w-full max-w-2xl mx-auto">
      <div className="mb-6">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Start typing to search for songs..."
          className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-green-500 text-base"
          autoComplete="off"
          spellCheck="false"
          autoCapitalize="off"
          autoCorrect="off"
        />
        {loading && (
          <p className="text-sm text-gray-500 mt-2">Searching...</p>
        )}
      </div>

      <div className="space-y-3">
        {results.map((track) => (
          <div
            key={track.id}
            className="flex items-center gap-4 p-4 bg-white rounded-lg shadow hover:shadow-md transition-shadow"
          >
            {track.album.images[0] && (
              <img
                src={track.album.images[0].url}
                alt={track.album.name}
                className="w-16 h-16 rounded"
              />
            )}
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-gray-900 truncate">{track.name}</h3>
              <p className="text-sm text-gray-600 truncate">
                {track.artists.map((a) => a.name).join(', ')}
              </p>
            </div>
            <button
              onClick={() => addToQueue(track)}
              disabled={adding === track.id}
              className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
            >
              {adding === track.id ? 'Adding...' : 'Add'}
            </button>
          </div>
        ))}
      </div>
    </div>
  )
}

