'use client'

import { useEffect, useState, useCallback } from 'react'
import { useWebSocket } from './useWebSocket'

interface TypingUser {
  userId: number
  timestamp: number
}

interface UseThreadLiveOptions {
  threadId: number
  onNewPost?: (post: unknown) => void
}

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080'

export function useThreadLive({ threadId, onNewPost }: UseThreadLiveOptions) {
  const [typingUsers, setTypingUsers] = useState<TypingUser[]>([])

  const handleMessage = useCallback((data: unknown) => {
    const msg = data as Record<string, unknown>
    if (msg.type === 'typing_start') {
      setTypingUsers(prev => {
        const filtered = prev.filter(u => u.userId !== (msg.userId as number))
        return [...filtered, { userId: msg.userId as number, timestamp: Date.now() }]
      })
    } else if (msg.type === 'typing_stop') {
      setTypingUsers(prev => prev.filter(u => u.userId !== (msg.userId as number)))
    } else if (msg.type === 'new_post') {
      onNewPost?.(msg)
    }
  }, [onNewPost])

  const { connected, send } = useWebSocket({
    url: `${API_URL}/api/ws/notifications`,
    onMessage: handleMessage,
  })

  // Subscribe to thread when connected
  useEffect(() => {
    if (connected && threadId > 0) {
      send({ type: 'thread_subscribe', threadId })
      return () => {
        send({ type: 'thread_unsubscribe', threadId })
      }
    }
  }, [connected, threadId, send])

  // Clean up stale typing indicators (older than 5 seconds)
  useEffect(() => {
    const interval = setInterval(() => {
      setTypingUsers(prev => prev.filter(u => Date.now() - u.timestamp < 5000))
    }, 2000)
    return () => clearInterval(interval)
  }, [])

  const sendTypingStart = useCallback(() => {
    send({ type: 'typing_start', threadId })
  }, [send, threadId])

  const sendTypingStop = useCallback(() => {
    send({ type: 'typing_stop', threadId })
  }, [send, threadId])

  return {
    connected,
    typingUsers,
    sendTypingStart,
    sendTypingStop,
  }
}
