'use client'

import { apiOrigin } from '@/lib/apiOrigin'
import { useEffect, useCallback } from 'react'
import { useWebSocket } from './useWebSocket'
import { useTypingUsers } from './useTypingUsers'

interface UseThreadLiveOptions {
  threadId: number
  onNewPost?: (post: unknown) => void
}

export function useThreadLive({ threadId, onNewPost }: UseThreadLiveOptions) {
  const { typingUsers, handleTyping } = useTypingUsers()

  const handleMessage = useCallback(
    (data: unknown) => {
      const msg = data as Record<string, unknown>
      handleTyping(msg)
      if (msg.type === 'new_post') onNewPost?.(msg)
    },
    [onNewPost, handleTyping],
  )

  const { connected, send } = useWebSocket({
    url: apiOrigin() + '/api/ws/notifications',
    onMessage: handleMessage,
  })

  // Subscribe to thread when connected
  useEffect(() => {
    if (!connected || threadId <= 0) {
      return undefined
    }
    send({ type: 'thread_subscribe', threadId })
    return () => {
      send({ type: 'thread_unsubscribe', threadId })
    }
  }, [connected, threadId, send])

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
