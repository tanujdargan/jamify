'use client'

import { useSession, signIn } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useState } from 'react'

export default function Home() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [creating, setCreating] = useState(false)

  const createRoom = async () => {
    setCreating(true)
    try {
      const response = await fetch('/api/rooms/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: 'My Jam Session' }),
      })
      
      if (response.ok) {
        const room = await response.json()
        router.push(`/room/${room.id}`)
      }
    } catch (error) {
      console.error('Error creating room:', error)
    } finally {
      setCreating(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-400 via-green-500 to-green-600 flex items-center justify-center px-4">
      <div className="max-w-2xl w-full">
        <div className="text-center mb-12">
          <h1 className="text-6xl font-bold text-white mb-4">Jamify</h1>
          <p className="text-xl text-white/90">
            Create collaborative music rooms where everyone can add songs to your Spotify queue
          </p>
        </div>

        <div className="bg-white rounded-2xl shadow-2xl p-8 space-y-6">
          {status === 'loading' ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500 mx-auto"></div>
              <p className="text-gray-600 mt-4">Loading...</p>
            </div>
          ) : !session ? (
            <div className="space-y-4">
              <h2 className="text-2xl font-bold text-gray-900">Get Started</h2>
              <p className="text-gray-600">
                Connect your Spotify account to create rooms and control playback
              </p>
              <button
                onClick={() => signIn('spotify')}
                className="w-full py-4 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors font-semibold text-lg"
              >
                Connect with Spotify
              </button>
              <div className="pt-6 border-t border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900 mb-3">How it works:</h3>
                <ul className="space-y-2 text-gray-600">
                  <li className="flex items-start">
                    <span className="mr-2">1.</span>
                    <span>Connect your Spotify account</span>
                  </li>
                  <li className="flex items-start">
                    <span className="mr-2">2.</span>
                    <span>Create a room and share the QR code</span>
                  </li>
                  <li className="flex items-start">
                    <span className="mr-2">3.</span>
                    <span>Friends scan and add songs to the queue</span>
                  </li>
                  <li className="flex items-start">
                    <span className="mr-2">4.</span>
                    <span>Songs play on your Spotify account</span>
                  </li>
                </ul>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <h2 className="text-2xl font-bold text-gray-900">
                Welcome, {session.user?.name}!
              </h2>
              <p className="text-gray-600">
                Create a new room to start jamming with friends
              </p>
              <button
                onClick={createRoom}
                disabled={creating}
                className="w-full py-4 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors font-semibold text-lg disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {creating ? 'Creating Room...' : 'Create New Room'}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
