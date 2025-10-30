'use client'

import { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import { useParams } from 'next/navigation'
import QRCode from '@/components/QRCode'
import Queue from '@/components/Queue'
import SongSearch from '@/components/SongSearch'

interface Room {
  id: string
  name: string
  hostId: string
  allowedUsers?: string
  createdAt: string
}

export default function RoomPage() {
  const { data: session } = useSession()
  const params = useParams()
  const roomId = params.roomId as string
  const [room, setRoom] = useState<Room | null>(null)
  const [loading, setLoading] = useState(true)
  const [queueRefresh, setQueueRefresh] = useState(0)
  const [showQR, setShowQR] = useState(true)
  const [showPermissions, setShowPermissions] = useState(false)
  const [allowedUsers, setAllowedUsers] = useState('')

  useEffect(() => {
    const fetchRoom = async () => {
      try {
        const response = await fetch(`/api/rooms/${roomId}`)
        const data = await response.json()
        setRoom(data)
        setAllowedUsers(data.allowedUsers || '')
      } catch (error) {
        console.error('Error fetching room:', error)
      } finally {
        setLoading(false)
      }
    }

    if (roomId) {
      fetchRoom()
    }
  }, [roomId])

  const saveAllowedUsers = async () => {
    try {
      const response = await fetch(`/api/rooms/${roomId}/permissions`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ allowedUsers }),
      })
      
      if (response.ok) {
        alert('Permissions updated!')
        setShowPermissions(false)
        const data = await response.json()
        setRoom(prev => prev ? { ...prev, allowedUsers: data.allowedUsers } : null)
      }
    } catch (error) {
      console.error('Error updating permissions:', error)
      alert('Failed to update permissions')
    }
  }

  const isHost = session?.user?.email === room?.hostId

  const joinUrl = typeof window !== 'undefined' 
    ? `${window.location.origin}/join/${roomId}`
    : ''

  const handleSongAdded = () => {
    setQueueRefresh(prev => prev + 1)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-green-500 mx-auto"></div>
          <p className="text-gray-600 mt-4">Loading room...</p>
        </div>
      </div>
    )
  }

  if (!room) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Room not found</h1>
          <a href="/" className="text-green-500 hover:text-green-600">
            Go back home
          </a>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="bg-white rounded-2xl shadow-lg p-8 mb-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">{room.name}</h1>
              {isHost && (
                <p className="text-green-600 font-semibold mt-1">You are the host</p>
              )}
            </div>
            <div className="flex gap-2">
              {isHost && (
                <button
                  onClick={() => setShowPermissions(!showPermissions)}
                  className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 font-semibold"
                >
                  Manage Permissions
                </button>
              )}
              <button
                onClick={() => setShowQR(!showQR)}
                className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 font-semibold"
              >
                {showQR ? 'Hide QR Code' : 'Show QR Code'}
              </button>
            </div>
          </div>

          {showPermissions && isHost && (
            <div className="bg-blue-50 rounded-lg p-6 mb-6">
              <h3 className="text-lg font-bold text-gray-900 mb-3">Allow Users to Manage Queue</h3>
              <p className="text-sm text-gray-600 mb-4">
                Enter names (separated by commas) of people who can remove songs from the queue. Anyone can add songs.
              </p>
              <input
                type="text"
                value={allowedUsers}
                onChange={(e) => setAllowedUsers(e.target.value)}
                placeholder="e.g., Alice, Bob, Charlie"
                className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 mb-3"
              />
              <div className="flex gap-2">
                <button
                  onClick={saveAllowedUsers}
                  className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 font-semibold"
                >
                  Save
                </button>
                <button
                  onClick={() => setShowPermissions(false)}
                  className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 font-semibold"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}

          {showQR && (
            <div className="bg-gray-50 rounded-lg p-6 mb-6">
              <div className="flex flex-col md:flex-row items-center gap-6">
                <div className="flex-shrink-0">
                  <QRCode url={joinUrl} size={200} />
                </div>
                <div className="flex-1 text-center md:text-left">
                  <h2 className="text-xl font-bold text-gray-900 mb-2">
                    Scan to join
                  </h2>
                  <p className="text-gray-600 mb-4">
                    Share this QR code with friends to let them add songs to the queue
                  </p>
                  <div className="bg-white p-3 rounded border border-gray-200 break-all text-sm">
                    {joinUrl}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          <div className="bg-white rounded-2xl shadow-lg p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Add Songs</h2>
            <SongSearch roomId={roomId} onSongAdded={handleSongAdded} />
          </div>

          <div className="bg-white rounded-2xl shadow-lg p-8">
            <Queue 
              roomId={roomId} 
              isHost={isHost} 
              refreshTrigger={queueRefresh}
              hostId={room.hostId}
              allowedUsers={room.allowedUsers}
              currentUserName={session?.user?.name || ''}
            />
          </div>
        </div>
      </div>
    </div>
  )
}

