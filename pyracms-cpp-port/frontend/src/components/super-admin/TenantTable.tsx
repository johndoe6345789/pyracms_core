'use client'

import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Typography,
} from '@mui/material'
import type { TenantRow } from '@/hooks/useSuperAdminTenants'
import TenantTableRow from './TenantTableRow'

interface Props {
  tenants: TenantRow[]
  onDelete: (id: number) => void
}

/** Header, empty state and one row per tenant. */
export default function TenantTable({ tenants, onDelete }: Props) {
  return (
    <TableContainer
      component={Paper}
      variant="outlined"
      data-testid="tenant-management-table"
    >
      <Table aria-label="Tenant management table">
        <TableHead>
          <TableRow>
            <TableCell>Name</TableCell>
            <TableCell>Slug</TableCell>
            <TableCell>Owner</TableCell>
            <TableCell>Created</TableCell>
            <TableCell>Status</TableCell>
            <TableCell align="right">Actions</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {tenants.length === 0 && (
            <TableRow>
              <TableCell colSpan={6}>
                <Typography color="text.secondary">
                  No tenants found.
                </Typography>
              </TableCell>
            </TableRow>
          )}
          {tenants.map((t) => (
            <TenantTableRow key={t.id} tenant={t} onDelete={onDelete} />
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  )
}
