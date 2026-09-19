'use client'

import {
  Table, TableHead, TableRow, TableCell, TableBody, IconButton,
  Chip, Paper, TableContainer,
} from '@mui/material'
import {
  EditOutlined, DeleteOutline, HistoryOutlined,
} from '@mui/icons-material'
import type { Webhook } from '@/hooks/admin/webhookApi'

interface Props {
  hooks: Webhook[]
  onEdit: (w: Webhook) => void
  onDelete: (w: Webhook) => void
  onDeliveries: (w: Webhook) => void
}

export default function WebhookTable(p: Props) {
  return (
    <TableContainer component={Paper} variant="outlined">
      <Table size="small">
        <TableHead><TableRow>
          <TableCell>URL</TableCell><TableCell>Events</TableCell>
          <TableCell>Status</TableCell>
          <TableCell align="right">Actions</TableCell>
        </TableRow></TableHead>
        <TableBody>
          {p.hooks.map((w) => (
            <TableRow key={w.id} data-testid={`webhook-row-${w.id}`}>
              <TableCell>{w.url}</TableCell>
              <TableCell>{w.events.join(', ')}</TableCell>
              <TableCell><Chip size="small"
                color={w.active ? 'success' : 'default'}
                label={w.active ? 'Active' : 'Paused'} /></TableCell>
              <TableCell align="right">
                <IconButton aria-label="Deliveries"
                  onClick={() => p.onDeliveries(w)}>
                  <HistoryOutlined /></IconButton>
                <IconButton aria-label="Edit"
                  onClick={() => p.onEdit(w)}><EditOutlined />
                </IconButton>
                <IconButton aria-label="Delete"
                  onClick={() => p.onDelete(w)}>
                  <DeleteOutline /></IconButton>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  )
}
