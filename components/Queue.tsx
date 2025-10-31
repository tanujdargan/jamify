'use client'

import { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import { toast } from 'sonner'

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
  hostId?: string
  allowedUsers?: string
  currentUserName?: string
}

export default function Queue({ roomId, isHost = false, refreshTrigger, hostId, allowedUsers, currentUserName }: QueueProps) {
  const { data: session } = useSession()
  const [queue, setQueue] = useState<QueueItemType[]>([])
  const [loading, setLoading] = useState(true)
  const [deleting, setDeleting] = useState<string | null>(null)
  const [clearing, setClearing] = useState(false)

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


  const deleteItem = async (itemId: string, trackName?: string) => {
    const item = queue.find(q => q.id === itemId)

    toast.error(`Removed "${item?.trackName || 'Song'}" from queue`, {
      description: 'Undo functionality coming soon',
      action: {
        label: 'Undo',
        onClick: async () => {
          console.log('Undo not yet implemented')
        }
      }
    })

    setDeleting(itemId)
    try {
      const response = await fetch(`/api/rooms/${roomId}/queue/${itemId}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        fetchQueue() // Refresh the queue
      } else {
        toast.error('Failed to remove song', {
          description: 'Please try again'
        })
      }
    } catch (error) {
      console.error('Error deleting item:', error)
      toast.error('Failed to remove song', {
        description: 'Network error occurred'
      })
    } finally {
      setDeleting(null)
    }
  }

  const clearQueue = async () => {
    const confirmToast = toast.error('Clear entire queue?', {
      description: 'This will remove all songs from the queue',
      closeButton: true,
      duration: 5000,
      action: {
        label: 'Confirm',
        onClick: async () => {
          setClearing(true)
          try {
            const response = await fetch(`/api/rooms/${roomId}/queue/clear`, {
              method: 'DELETE',
            })

            if (response.ok) {
              toast.success('Queue cleared', {
                description: 'All songs have been removed'
              })
              fetchQueue()
            } else {
              toast.error('Failed to clear queue', {
                description: 'Please try again'
              })
            }
          } catch (error) {
            console.error('Error clearing queue:', error)
            toast.error('Failed to clear queue', {
              description: 'Network error occurred'
            })
          } finally {
            setClearing(false)
          }
        }
      }
    })
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
      <div className="mb-4">
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-2xl font-bold text-gray-900">Queue ({queue.length})</h2>
          {isHost && queue.length > 0 && (
            <button
              onClick={clearQueue}
              disabled={clearing}
              className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 disabled:opacity-50 disabled:cursor-not-allowed font-medium transition-colors text-sm"
            >
              {clearing ? 'Clearing...' : 'Clear Queue'}
            </button>
          )}
        </div>
        {isHost && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-sm">
            <p className="text-blue-800">
              <strong>Auto-Sync:</strong> Install the Spicetify Companion extension to automatically sync this queue with your Spotify Desktop.
            </p>
            <a 
              href="https://github.com/tanujdargan/jamify#spicetify-setup" 
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 hover:text-blue-800 underline text-xs"
            >
              Learn more about Spicetify setup →
            </a>
          </div>
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
            <h3 className="font-semibold text-gray-900 truncate">{item.trackName}</h3>
            <p className="text-sm text-gray-600 truncate">{item.artistName}</p>
            <p className="text-xs text-gray-500">
              Added by {item.addedBy || 'Guest'} • {formatDuration(item.duration)}
            </p>
          </div>
          <div className="flex gap-2">
            {canDelete() && (
              <button
                onClick={() => deleteItem(item.id)}
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

