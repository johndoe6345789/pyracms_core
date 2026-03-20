'use client'

import {
  TableCell, TableRow, IconButton, Chip,
} from '@mui/material'
import {
  DeleteOutlined, OpenInNewOutlined,
} from '@mui/icons-material'
import Link from 'next/link'
import type { TenantRow } from '@/hooks/useSuperAdminTenants'

interface Props {
  tenant: TenantRow
  onDelete: (id: number) => void
}

export default function TenantTableRow({
  tenant: t,
  onDelete,
}: Props) {
  return (
    <TableRow data-testid={`tenant-row-${t.slug}`}>
      <TableCell>{t.name}</TableCell>
      <TableCell sx={{ fontFamily: 'monospace' }}>
        {t.slug}
      </TableCell>
      <TableCell>{t.owner}</TableCell>
      <TableCell>{t.createdAt}</TableCell>
      <TableCell>
        <Chip
          label={t.isActive ? 'Active' : 'Inactive'}
          color={t.isActive ? 'success' : 'default'}
          size="small"
        />
      </TableCell>
      <TableCell align="right">
        <IconButton
          component={Link}
          href={`/site/${t.slug}`}
          size="small"
          aria-label={`Open ${t.name}`}
          data-testid={`open-tenant-${t.slug}`}
        >
          <OpenInNewOutlined fontSize="small" />
        </IconButton>
        <IconButton
          size="small"
          color="error"
          aria-label={`Delete ${t.name}`}
          data-testid={`delete-tenant-${t.slug}`}
          onClick={() => onDelete(t.id)}
        >
          <DeleteOutlined fontSize="small" />
        </IconButton>
      </TableCell>
    </TableRow>
  )
}
