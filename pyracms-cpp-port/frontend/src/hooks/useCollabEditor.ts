'use client'

import { useEffect, useRef, useMemo } from 'react'
import * as Y from 'yjs'
import { WebsocketProvider } from 'y-websocket'

interface UseCollabEditorOptions {
  roomName: string
  enabled?: boolean
}

export function useCollabEditor({ roomName, enabled = true }: UseCollabEditorOptions) {
  const ydocRef = useRef<Y.Doc | null>(null)
  const providerRef = useRef<WebsocketProvider | null>(null)

  const wsUrl = useMemo(() => {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080'
    return apiUrl.replace(/^http/, 'ws') + '/api/ws/collab'
  }, [])

  useEffect(() => {
    if (!enabled) return

    const token = localStorage.getItem('token')
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
