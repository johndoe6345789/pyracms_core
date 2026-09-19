import type { Notification } from './notificationIcons'

/** Maps a pushed websocket message to a list item. */
export function wsNotification(m: Record<string, unknown>): Notification {
  return {
    id: m.id as number,
    type: (m.notificationType as string) || 'system',
    title: (m.title as string) || '',
    message: (m.message as string) || '',
    link: m.link as string | null,
    is_read: false,
    created_at: new Date().toISOString(),
  }
}
