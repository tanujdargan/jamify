'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { useSession } from 'next-auth/react'
import Queue from '@/components/Queue'
import SongSearch from '@/components/SongSearch'

interface Room {
  id: string
  name: string
  hostId: string
  allowedUsers?: string
  createdAt: string
}

export default function JoinRoomPage() {
  const { data: session } = useSession()
  const params = useParams()
  const roomId = params.roomId as string
  const [room, setRoom] = useState<Room | null>(null)
  const [loading, setLoading] = useState(true)
  const [queueRefresh, setQueueRefresh] = useState(0)

  useEffect(() => {
    const fetchRoom = async () => {
      try {
        const response = await fetch(`/api/rooms/${roomId}`)
        const data = await response.json()
        setRoom(data)
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
    <div className="min-h-screen bg-gradient-to-br from-green-400 via-green-500 to-green-600 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-2xl shadow-2xl p-8 mb-8">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-gray-900 mb-2">{room.name}</h1>
            <p className="text-gray-600">Add songs to the queue!</p>
          </div>

          <div className="mb-8">
            <SongSearch roomId={roomId} onSongAdded={handleSongAdded} />
          </div>

          <div className="border-t border-gray-200 pt-8">
            <Queue 
              roomId={roomId} 
              isHost={false} 
              refreshTrigger={queueRefresh}
              hostId={room.hostId}
              allowedUsers={room.allowedUsers}
              currentUserName={session?.user?.name || ''}
            />
          </div>
        </div>

        <div className="text-center">
          <a
            href="/"
            className="inline-block px-6 py-3 bg-white text-green-600 rounded-lg hover:bg-gray-100 transition-colors font-semibold shadow-lg"
          >
            Create Your Own Room
          </a>
        </div>
      </div>
    </div>
  )
}

