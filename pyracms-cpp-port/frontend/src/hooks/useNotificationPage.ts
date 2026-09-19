'use client'

import { useState, useEffect } from 'react'
import { useActionError } from '@/hooks/useActionError'
import {
  fetchNotifications,
  markNotificationRead,
  markAllNotificationsRead,
  deleteNotification,
} from '@/components/common/notification/notificationApi'

type Notification = Awaited<ReturnType<typeof fetchNotifications>>[number]

/** State and actions for the full notifications page. */
export function useNotificationPage(enabled: boolean) {
  const [items, setItems] = useState<Notification[]>([])
  const [loading, setLoading] = useState(true)
  const { error, setError, fail } = useActionError()

  useEffect(() => {
    if (!enabled) return
    fetchNotifications(100)
      .then(setItems)
      .catch(fail('Could not load notifications'))
      .finally(() => setLoading(false))
  }, [enabled, fail])

  const markRead = (id: number) => {
    setError('')
    markNotificationRead(id)
      .then(() =>
        setItems((p) =>
          p.map((n) => (n.id === id ? { ...n, is_read: true } : n)),
        ),
      )
      .catch(fail('Could not mark as read'))
  }
  const markAll = () => {
    setError('')
    markAllNotificationsRead()
      .then(() => setItems((p) => p.map((n) => ({ ...n, is_read: true }))))
      .catch(fail('Could not mark all read'))
  }
  const remove = (id: number) => {
    setError('')
    deleteNotification(id)
      .then(() => setItems((p) => p.filter((n) => n.id !== id)))
      .catch(fail('Could not delete notification'))
  }
  return { items, loading, error, markRead, markAll, remove }
}
