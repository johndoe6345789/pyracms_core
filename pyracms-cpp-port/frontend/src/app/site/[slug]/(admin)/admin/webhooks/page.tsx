'use client'

import { useState } from 'react'
import { useParams } from 'next/navigation'
import { Container, Typography, Button, Box } from '@mui/material'
import { useTenantId } from '@/hooks/useTenantId'
import { useWebhooks } from '@/hooks/admin/useWebhooks'
import type { Webhook } from '@/hooks/admin/webhookApi'
import { ErrorAlert } from '@/components/common/ErrorAlert'
import WebhookTable from '@/components/admin/webhooks/WebhookTable'
import WebhookForm from '@/components/admin/webhooks/WebhookForm'
import DeliveriesDialog from '@/components/admin/webhooks/DeliveriesDialog'
import ConfirmDialog from '@/components/admin/ConfirmDialog'

export default function WebhooksPage() {
  const slug = useParams().slug as string
  const { tenantId } = useTenantId(slug)
  const { hooks, loading, error, save, remove } = useWebhooks(tenantId)
  const [form, setForm] = useState<Webhook | 'new' | null>(null)
  const [del, setDel] = useState<Webhook | null>(null)
  const [log, setLog] = useState<number | null>(null)
  return (
    <Container maxWidth="xl" sx={{ py: 6 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
        <Typography variant="h3" component="h1" gutterBottom>
          Webhooks
        </Typography>
        <Button
          variant="contained"
          onClick={() => setForm('new')}
          data-testid="webhook-new"
        >
          New webhook
        </Button>
      </Box>
      <ErrorAlert error={error} testId="webhook-error" />
      {!loading && hooks.length === 0 && (
        <Typography color="text.secondary">No webhooks configured.</Typography>
      )}
      {hooks.length > 0 && (
        <WebhookTable
          hooks={hooks}
          onEdit={setForm}
          onDelete={setDel}
          onDeliveries={(w) => setLog(w.id)}
        />
      )}
      {form !== null && (
        <WebhookForm
          open
          webhook={form === 'new' ? null : form}
          onClose={() => setForm(null)}
          onSave={save}
        />
      )}
      <DeliveriesDialog webhookId={log} onClose={() => setLog(null)} />
      <ConfirmDialog
        open={del !== null}
        title="Delete webhook"
        message={`Delete ${del?.url ?? ''}?`}
        onCancel={() => setDel(null)}
        onConfirm={() => {
          if (del) remove(del.id)
          setDel(null)
        }}
      />
    </Container>
  )
}
