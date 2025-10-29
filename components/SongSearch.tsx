'use client'

import { useState } from 'react'
import { useSession } from 'next-auth/react'

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

  const searchSongs = async (searchQuery: string) => {
    if (!searchQuery.trim() || !session?.accessToken) return

    setLoading(true)
    try {
      const response = await fetch(
        `/api/spotify/search?q=${encodeURIComponent(searchQuery)}&token=${session.accessToken}`
      )
      const data = await response.json()
      setResults(data.tracks?.items || [])
    } catch (error) {
      console.error('Search error:', error)
    } finally {
      setLoading(false)
    }
  }

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
        onSongAdded?.()
      }
    } catch (error) {
      console.error('Add to queue error:', error)
    } finally {
      setAdding(null)
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    searchSongs(query)
  }

  return (
    <div className="w-full max-w-2xl mx-auto">
      <form onSubmit={handleSubmit} className="mb-6">
        <div className="flex gap-2">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search for songs..."
            className="flex-1 px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-green-500"
          />
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-3 bg-green-500 text-white rounded-lg hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed font-semibold"
          >
            {loading ? 'Searching...' : 'Search'}
          </button>
        </div>
      </form>

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

