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
            <button
              onClick={() => setShowQR(!showQR)}
              className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 font-semibold"
            >
              {showQR ? 'Hide QR Code' : 'Show QR Code'}
            </button>
          </div>

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
            <Queue roomId={roomId} isHost={isHost} refreshTrigger={queueRefresh} />
          </div>
        </div>
      </div>
    </div>
  )
}

