'use client'

import { useParams } from 'next/navigation'
import {
  Container,
  Typography,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Paper,
  TableContainer,
} from '@mui/material'
import { useTenantId } from '@/hooks/useTenantId'
import { useAuditLog } from '@/hooks/admin/useAuditLog'
import { ErrorAlert } from '@/components/common/ErrorAlert'

export default function AuditLogPage() {
  const slug = useParams().slug as string
  const { tenantId } = useTenantId(slug)
  const { rows, loading, error } = useAuditLog(tenantId)
  return (
    <Container maxWidth="xl" sx={{ py: { xs: 3, md: 6 } }}>
      <Typography variant="h3" component="h1" gutterBottom>
        Audit Log
      </Typography>
      <Typography color="text.secondary" sx={{ mb: 3 }}>
        Recent administrative actions on this site.
      </Typography>
      <ErrorAlert error={error} testId="audit-error" />
      {!loading && !error && rows.length === 0 && (
        <Typography color="text.secondary">No audit entries yet.</Typography>
      )}
      {rows.length > 0 && (
        <TableContainer component={Paper} variant="outlined">
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>When</TableCell>
                <TableCell>Actor</TableCell>
                <TableCell>Action</TableCell>
                <TableCell>Target</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {rows.map((r) => (
                <TableRow key={r.id} data-testid={`audit-row-${r.id}`}>
                  <TableCell>
                    {new Date(r.createdAt).toLocaleString()}
                  </TableCell>
                  <TableCell>{r.actor}</TableCell>
                  <TableCell>{r.action}</TableCell>
                  <TableCell>{r.target}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </Container>
  )
}
