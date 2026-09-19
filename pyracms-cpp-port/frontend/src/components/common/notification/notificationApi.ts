import api from '@/lib/api'
import type { Notification } from './notificationIcons'

type Raw = Record<string, unknown>
const text = (v: unknown) => (typeof v === 'string' ? v : '')

/** Accepts the API's camelCase rows and the legacy snake_case ones. */
export function mapNotification(r: Raw): Notification {
  return {
    id: Number(r.id),
    type: text(r.type) || 'system',
    title: text(r.title),
    message: text(r.message),
    link: typeof r.link === 'string' && r.link ? r.link : null,
    is_read: Boolean(r.isRead ?? r.is_read),
    created_at: text(r.createdAt) || text(r.created_at),
  }
}

/** The list route replies with a bare array (older ones wrapped it). */
export function mapNotificationList(data: unknown): Notification[] {
  const rows = Array.isArray(data)
    ? data : (data as { notifications?: unknown })?.notifications
  return Array.isArray(rows) ? rows.map(mapNotification) : []
}

export const fetchNotifications = (limit: number, offset = 0) =>
  api.get(`/api/notifications?limit=${limit}&offset=${offset}`)
    .then((r) => mapNotificationList(r.data))

export const markNotificationRead = (id: number) =>
  api.put(`/api/notifications/${id}/read`)

export const markAllNotificationsRead = () =>
  api.put('/api/notifications/read-all')

export const deleteNotification = (id: number) =>
  api.delete(`/api/notifications/${id}`)
