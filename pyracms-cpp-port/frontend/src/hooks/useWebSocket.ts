'use client'

import { useEffect, useRef, useCallback, useState } from 'react'
import { currentToken } from '@/lib/session'
import { buildWsUrl, parseWsData } from './wsUrl'

interface UseWebSocketOptions {
  url: string
  onMessage?: (data: unknown) => void
  onConnect?: () => void
  onDisconnect?: () => void
  autoReconnect?: boolean
  reconnectInterval?: number
}

export function useWebSocket({
  url,
  onMessage,
  onConnect,
  onDisconnect,
  autoReconnect = true,
  reconnectInterval = 3000,
}: UseWebSocketOptions) {
  const wsRef = useRef<WebSocket | null>(null)
  const timerRef = useRef<NodeJS.Timeout>(null)
  const [connected, setConnected] = useState(false)

  const connect = useCallback(() => {
    const token = currentToken()
    if (!token) return
    const ws = new WebSocket(buildWsUrl(url, token))
    ws.onopen = () => {
      setConnected(true)
      onConnect?.()
    }
    ws.onmessage = (event) => {
      onMessage?.(parseWsData(event.data))
    }
    ws.onclose = () => {
      setConnected(false)
      onDisconnect?.()
      if (autoReconnect) {
        timerRef.current = setTimeout(connect, reconnectInterval)
      }
    }
    ws.onerror = () => {
      ws.close()
    }
    wsRef.current = ws
  }, [
    url,
    onMessage,
    onConnect,
    onDisconnect,
    autoReconnect,
    reconnectInterval,
  ])

  useEffect(() => {
    connect()
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current)
      const ws = wsRef.current
      if (ws) {
        // Detach first so closing here never schedules a reconnect.
        ws.onclose = null
        ws.close()
      }
    }
  }, [connect])

  const send = useCallback((data: unknown) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(typeof data === 'string' ? data : JSON.stringify(data))
    }
  }, [])

  return { connected, send, ws: wsRef }
}
