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
  addedToSpotify: boolean
}

interface QueueProps {
  roomId: string
  isHost?: boolean
  refreshTrigger?: number
  hostId?: string
  allowedUsers?: string
  currentUserName?: string
}

export default function Queue({ roomId, isHost = false, refreshTrigger, hostId, allowedUsers, currentUserName }: QueueProps) {
  const { data: session } = useSession()
  const [queue, setQueue] = useState<QueueItemType[]>([])
  const [loading, setLoading] = useState(true)
  const [processing, setProcessing] = useState<string | null>(null)
  const [deleting, setDeleting] = useState<string | null>(null)

  // Check if current user can delete songs
  const canDelete = () => {
    if (isHost) return true
    if (!currentUserName || !allowedUsers) return false
    const allowed = allowedUsers.split(',').map(u => u.trim().toLowerCase())
    return allowed.includes(currentUserName.toLowerCase())
  }

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

  const addToSpotifyQueue = async (itemId: string, trackId: string) => {
    if (!session?.accessToken) return
    
    setProcessing(trackId)
    try {
      const response = await fetch('/api/spotify/queue', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          trackUri: `spotify:track:${trackId}`,
          accessToken: session.accessToken,
        }),
      })
      
      if (response.ok) {
        // Mark as added to Spotify
        await fetch(`/api/rooms/${roomId}/queue/${itemId}/spotify-sync`, {
          method: 'PATCH',
        })
        alert('Song added to your Spotify queue!')
        fetchQueue() // Refresh to show updated status
      } else {
        const data = await response.json()
        alert(`Failed to add to Spotify queue: ${data.error}`)
      }
    } catch (error) {
      console.error('Error adding to Spotify queue:', error)
      alert('Failed to add to queue. Make sure Spotify is open and playing.')
    } finally {
      setProcessing(null)
    }
  }

  const deleteItem = async (itemId: string, addedToSpotify: boolean) => {
    const message = addedToSpotify 
      ? 'This song is already in your Spotify queue and cannot be removed from Spotify via API. Remove from Jamify queue anyway?' 
      : 'Remove this song from the queue?'
    
    if (!confirm(message)) return
    
    setDeleting(itemId)
    try {
      const response = await fetch(`/api/rooms/${roomId}/queue/${itemId}`, {
        method: 'DELETE',
      })
      
      if (response.ok) {
        fetchQueue() // Refresh the queue
      } else {
        alert('Failed to remove song')
      }
    } catch (error) {
      console.error('Error deleting item:', error)
      alert('Failed to remove song')
    } finally {
      setDeleting(null)
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

  const addAllToSpotify = async () => {
    if (!session?.accessToken || queue.length === 0) return
    
    const unsyncedSongs = queue.filter(item => !item.addedToSpotify)
    if (unsyncedSongs.length === 0) {
      alert('All songs are already in your Spotify queue!')
      return
    }
    
    if (!confirm(`Add ${unsyncedSongs.length} songs to your Spotify queue?`)) return
    
    let successCount = 0
    for (const item of unsyncedSongs) {
      try {
        const response = await fetch('/api/spotify/queue', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            trackUri: `spotify:track:${item.spotifyTrackId}`,
            accessToken: session.accessToken,
          }),
        })
        if (response.ok) {
          // Mark as added to Spotify
          await fetch(`/api/rooms/${roomId}/queue/${item.id}/spotify-sync`, {
            method: 'PATCH',
          })
          successCount++
        }
        // Small delay between requests to avoid rate limiting
        await new Promise(resolve => setTimeout(resolve, 200))
      } catch (error) {
        console.error('Error adding track:', error)
      }
    }
    
    alert(`Added ${successCount} of ${unsyncedSongs.length} songs to Spotify!`)
    fetchQueue() // Refresh to show updated statuses
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-2xl font-bold text-gray-900">Queue ({queue.length})</h2>
        {isHost && queue.length > 0 && (
          <button
            onClick={addAllToSpotify}
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium"
          >
            Add All to Spotify
          </button>
        )}
      </div>
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
            <div className="flex items-center gap-2">
              <h3 className="font-semibold text-gray-900 truncate">{item.trackName}</h3>
              {item.addedToSpotify && (
                <span className="px-2 py-1 bg-green-100 text-green-700 text-xs font-semibold rounded whitespace-nowrap">
                  In Spotify
                </span>
              )}
            </div>
            <p className="text-sm text-gray-600 truncate">{item.artistName}</p>
            <p className="text-xs text-gray-500">
              Added by {item.addedBy || 'Guest'} • {formatDuration(item.duration)}
            </p>
          </div>
          <div className="flex gap-2">
            {isHost && (
              <button
                onClick={() => addToSpotifyQueue(item.id, item.spotifyTrackId)}
                disabled={processing === item.spotifyTrackId || item.addedToSpotify}
                className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed font-medium whitespace-nowrap"
              >
                {item.addedToSpotify ? 'Added ✓' : processing === item.spotifyTrackId ? 'Adding...' : 'Add to Spotify'}
              </button>
            )}
            {canDelete() && (
              <button
                onClick={() => deleteItem(item.id, item.addedToSpotify)}
                disabled={deleting === item.id}
                className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
              >
                {deleting === item.id ? 'Removing...' : 'Remove'}
              </button>
            )}
          </div>
        </div>
      ))}
    </div>
  )
}

