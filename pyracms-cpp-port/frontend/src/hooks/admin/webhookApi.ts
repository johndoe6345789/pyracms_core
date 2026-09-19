import api from '@/lib/api'

export const WEBHOOK_EVENTS = [
  'article.created', 'article.updated', 'article.deleted',
  'article.published', 'forum.thread.created',
  'forum.post.created', 'comment.created', 'user.registered',
]

export interface Webhook {
  id: number
  url: string
  active: boolean
  events: string[]
  createdAt: string
}

export interface Delivery {
  id: number
  event: string
  statusCode: number
  deliveredAt: string
}

export interface WebhookDraft {
  url: string
  secret: string
  events: string[]
  active: boolean
}

export const fetchWebhooks = (tenantId: number) =>
  api.get(`/api/webhooks?tenant_id=${tenantId}`)
    .then((r) => (r.data || []) as Webhook[])

export const fetchDeliveries = (id: number) =>
  api.get(`/api/webhooks/${id}/deliveries?limit=20`)
    .then((r) => (r.data || []) as Delivery[])

/** Empty secret is omitted so an edit keeps the stored one. */
export function webhookBody(d: WebhookDraft) {
  return {
    url: d.url.trim(),
    events: d.events,
    active: d.active,
    ...(d.secret ? { secret: d.secret } : {}),
  }
}

export const createWebhook = (tenantId: number, d: WebhookDraft) =>
  api.post('/api/webhooks', { ...webhookBody(d), tenant_id: tenantId })

export const updateWebhook = (id: number, d: WebhookDraft) =>
  api.put(`/api/webhooks/${id}`, webhookBody(d))

export const deleteWebhook = (id: number) =>
  api.delete(`/api/webhooks/${id}`)
