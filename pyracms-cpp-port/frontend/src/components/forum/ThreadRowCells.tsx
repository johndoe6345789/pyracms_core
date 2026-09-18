'use client'

import { Box, Typography, TableCell } from '@mui/material'
import type { ReactElement } from 'react'

interface StatCellProps {
  icon: ReactElement
  value: string | number
  center?: boolean
}

/** A table cell holding a small icon next to a value. */
export function StatCell({ icon, value, center }: StatCellProps) {
  return (
    <TableCell {...(center ? { align: 'center' as const } : {})}>
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: center ? 'center' : 'flex-start',
          gap: 0.5,
        }}
      >
        {icon}
        <Typography variant="body2">{value}</Typography>
      </Box>
    </TableCell>
  )
}
