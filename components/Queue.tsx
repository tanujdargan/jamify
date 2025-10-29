'use client'

import { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'

interface QueueItemType {
  id: string
  spotifyTrackId: string
  trackName: string
  artistName: string
  albumArt?: string
  duration: number
  addedBy?: string
  addedAt: string
  isPlayed: boolean
}

interface QueueProps {
  roomId: string
  isHost?: boolean
  refreshTrigger?: number
}

export default function Queue({ roomId, isHost = false, refreshTrigger }: QueueProps) {
  const { data: session } = useSession()
  const [queue, setQueue] = useState<QueueItemType[]>([])
  const [loading, setLoading] = useState(true)
  const [playing, setPlaying] = useState<string | null>(null)

  const fetchQueue = async () => {
    try {
      const response = await fetch(`/api/rooms/${roomId}/queue`)
      const data = await response.json()
      setQueue(data)
    } catch (error) {
      console.error('Error fetching queue:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchQueue()
    const interval = setInterval(fetchQueue, 5000) // Poll every 5 seconds
    return () => clearInterval(interval)
  }, [roomId, refreshTrigger])

  const playTrack = async (trackId: string) => {
    if (!session?.accessToken) return
    
    setPlaying(trackId)
    try {
      await fetch('/api/spotify/play', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          trackUri: `spotify:track:${trackId}`,
          accessToken: session.accessToken,
        }),
      })
    } catch (error) {
      console.error('Error playing track:', error)
    } finally {
      setPlaying(null)
    }
  }

  const formatDuration = (ms: number) => {
    const minutes = Math.floor(ms / 60000)
    const seconds = Math.floor((ms % 60000) / 1000)
    return `${minutes}:${seconds.toString().padStart(2, '0')}`
  }

  if (loading) {
    return <div className="text-center py-8 text-gray-600">Loading queue...</div>
  }

  if (queue.length === 0) {
    return (
      <div className="text-center py-12 bg-gray-50 rounded-lg">
        <p className="text-gray-600 text-lg">No songs in queue yet</p>
        <p className="text-gray-500 text-sm mt-2">Search and add some songs to get started!</p>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      <h2 className="text-2xl font-bold text-gray-900 mb-4">Queue ({queue.length})</h2>
      {queue.map((item, index) => (
        <div
          key={item.id}
          className="flex items-center gap-4 p-4 bg-white rounded-lg shadow hover:shadow-md transition-shadow"
        >
          <div className="text-2xl font-bold text-gray-400 w-8">{index + 1}</div>
          {item.albumArt && (
            <img
              src={item.albumArt}
              alt={item.trackName}
              className="w-16 h-16 rounded"
            />
          )}
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-gray-900 truncate">{item.trackName}</h3>
            <p className="text-sm text-gray-600 truncate">{item.artistName}</p>
            <p className="text-xs text-gray-500">
              Added by {item.addedBy || 'Guest'} • {formatDuration(item.duration)}
            </p>
          </div>
          {isHost && (
            <button
              onClick={() => playTrack(item.spotifyTrackId)}
              disabled={playing === item.spotifyTrackId}
              className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
            >
              {playing === item.spotifyTrackId ? 'Playing...' : 'Play'}
            </button>
          )}
        </div>
      ))}
    </div>
  )
}

