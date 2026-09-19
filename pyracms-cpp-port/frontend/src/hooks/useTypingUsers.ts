'use client'

import { useCallback, useEffect, useState } from 'react'

interface TypingUser {
  userId: number
  timestamp: number
}

const STALE_MS = 5000

/** Tracks who is typing; entries expire after five seconds. */
export function useTypingUsers() {
  const [typingUsers, setTypingUsers] = useState<TypingUser[]>([])

  /** Applies a typing message; returns true when it was one. */
  const handleTyping = useCallback((msg: Record<string, unknown>) => {
    const userId = msg.userId as number
    if (msg.type === 'typing_start') {
      setTypingUsers((prev) => [
        ...prev.filter((u) => u.userId !== userId),
        { userId, timestamp: Date.now() },
      ])
    } else if (msg.type === 'typing_stop') {
      setTypingUsers((prev) => prev.filter((u) => u.userId !== userId))
    }
  }, [])

  // Clean up stale typing indicators
  useEffect(() => {
    const interval = setInterval(() => {
      setTypingUsers((prev) =>
        prev.filter((u) => Date.now() - u.timestamp < STALE_MS),
      )
    }, 2000)
    return () => clearInterval(interval)
  }, [])

  return { typingUsers, handleTyping }
}
