'use client'

import { useEffect, useState } from 'react'

interface SpicetifyStatusProps {
  roomId: string
}

export default function SpicetifyStatus({ roomId }: SpicetifyStatusProps) {
  const [connected, setConnected] = useState(false)
  const [checking, setChecking] = useState(true)

  useEffect(() => {
    const checkStatus = async () => {
      try {
        const response = await fetch(`/api/rooms/${roomId}/status`)
        const data = await response.json()
        setConnected(data.connected)
      } catch (error) {
        console.error('Error checking Spicetify status:', error)
        setConnected(false)
      } finally {
        setChecking(false)
      }
    }

    checkStatus()
    const interval = setInterval(checkStatus, 5000) // Check every 5 seconds
    return () => clearInterval(interval)
  }, [roomId])

  if (checking) return null

  return (
    <div className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium ${
      connected 
        ? 'bg-green-50 border border-green-200 text-green-800' 
        : 'bg-gray-50 border border-gray-200 text-gray-600'
    }`}>
      <div className={`w-2 h-2 rounded-full ${connected ? 'bg-green-500 animate-pulse' : 'bg-gray-400'}`} />
      <span>
        {connected ? 'Spicetify Connected & Syncing' : 'Spicetify Not Connected'}
      </span>
    </div>
  )
}

