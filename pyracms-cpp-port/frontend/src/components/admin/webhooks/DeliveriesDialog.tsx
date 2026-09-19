'use client'

import { useEffect, useState } from 'react'
import {
  Dialog, DialogTitle, DialogContent, DialogActions, Button,
  List, ListItem, ListItemText, Typography,
} from '@mui/material'
import {
  fetchDeliveries, type Delivery,
} from '@/hooks/admin/webhookApi'

interface Props { webhookId: number | null; onClose: () => void }

export default function DeliveriesDialog(
  { webhookId, onClose }: Props,
) {
  const [rows, setRows] = useState<Delivery[] | null>(null)
  useEffect(() => {
    if (webhookId === null) return
    setRows(null)
    fetchDeliveries(webhookId).then(setRows).catch(() => setRows([]))
  }, [webhookId])
  return (
    <Dialog open={webhookId !== null} onClose={onClose} fullWidth
      data-testid="deliveries-dialog">
      <DialogTitle>Recent deliveries</DialogTitle>
      <DialogContent>
        {rows?.length === 0 && (
          <Typography color="text.secondary">
            No deliveries yet.
          </Typography>
        )}
        <List dense>
          {(rows ?? []).map((r) => (
            <ListItem key={r.id} data-testid={`delivery-${r.id}`}>
              <ListItemText primary={`${r.event} - ${r.statusCode}`}
                secondary={new Date(r.deliveredAt).toLocaleString()} />
            </ListItem>
          ))}
        </List>
      </DialogContent>
      <DialogActions><Button onClick={onClose}>Close</Button>
      </DialogActions>
    </Dialog>
  )
}
