'use client'

import { useEffect, useRef, useMemo } from 'react'
import * as Y from 'yjs'
import { currentToken } from '@/lib/session'
import { wsUrl as apiWsUrl } from '@/lib/apiOrigin'
import { WebsocketProvider } from 'y-websocket'

interface UseCollabEditorOptions {
  roomName: string
  enabled?: boolean
}

export function useCollabEditor(
  { roomName, enabled = true }: UseCollabEditorOptions,
) {
  const ydocRef = useRef<Y.Doc | null>(null)
  const providerRef = useRef<WebsocketProvider | null>(null)

  const wsUrl = useMemo(() => {
    return apiWsUrl('/api/ws/collab')
  }, [])

  useEffect(() => {
    if (!enabled) return

    const token = currentToken()
    if (!token) return

    const ydoc = new Y.Doc()
    ydocRef.current = ydoc

    const provider = new WebsocketProvider(
      wsUrl + '?token=' + token + '&room=' + roomName,
      roomName,
      ydoc
    )
    providerRef.current = provider

    return () => {
      provider.disconnect()
      ydoc.destroy()
      ydocRef.current = null
      providerRef.current = null
    }
  }, [wsUrl, roomName, enabled])

  return {
    ydoc: ydocRef.current,
    provider: providerRef.current,
  }
}
