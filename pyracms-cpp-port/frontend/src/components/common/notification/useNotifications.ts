import { useState, useEffect, useCallback } from 'react'
import { useSelector } from 'react-redux'
import type { RootState } from '@/store/store'
import api from '@/lib/api'
import { useWebSocket } from '@/hooks/useWebSocket'
import type { Notification }
  from './NotificationList'

export function useNotifications() {
  const [items, setItems] =
    useState<Notification[]>([])
  const [unread, setUnread] = useState(0)
  const [loading, setLoading] = useState(false)
  const isAuth = useSelector(
    (s: RootState) => s.auth.isAuthenticated)
  const API = process.env.NEXT_PUBLIC_API_URL
    || 'http://localhost:8080'
  const onWs = useCallback(
    (data: unknown) => {
      const m = data as Record<string, unknown>
      if (m.type !== 'notification') return
      setUnread((c) => c + 1)
      setItems((p) => [{
        id: m.id as number,
        type: (m.notificationType as string)
          || 'system',
        title: (m.title as string) || '',
        message: (m.message as string) || '',
        link: m.link as string | null,
        is_read: false,
        created_at: new Date().toISOString(),
      }, ...p].slice(0, 20))
    }, [])
  useWebSocket({
    url: isAuth
      ? `${API}/api/ws/notifications` : '',
    onMessage: onWs, autoReconnect: isAuth })
  useEffect(() => {
    if (!isAuth) return
    api.get('/api/notifications/unread-count')
      .then((r) => setUnread(r.data.count))
      .catch(() => {})
  }, [isAuth])
  const fetchList = async () => {
    setLoading(true)
    try {
      const r = await api.get(
        '/api/notifications?limit=20')
      setItems(r.data.notifications || [])
    } catch { /* ignore */ }
    setLoading(false)
  }
  const markAll = async () => {
    try {
      await api.put(
        '/api/notifications/read-all')
      setItems((p) => p.map(
        (n) => ({ ...n, is_read: true })))
      setUnread(0)
    } catch { /* ignore */ }
  }
  const markOne = async (id: number) => {
    try {
      await api.put(
        `/api/notifications/${id}/read`)
      setItems((p) => p.map((n) =>
        n.id === id
          ? { ...n, is_read: true } : n))
      setUnread((c) => Math.max(0, c - 1))
    } catch { /* ignore */ }
  }
  return {
    items, unread, loading, isAuth,
    fetchList, markAll, markOne,
  }
}
