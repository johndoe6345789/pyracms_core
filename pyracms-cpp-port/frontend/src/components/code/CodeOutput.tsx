'use client'

import { Box, Typography, CircularProgress, Chip } from '@mui/material'
import { CheckCircleOutlined, ErrorOutlined, TimerOutlined } from '@mui/icons-material'

interface CodeOutputProps {
  stdout?: string
  stderr?: string
  exitCode?: number | null
  executionTime?: number | null
  isLoading?: boolean
}

export function CodeOutput({ stdout, stderr, exitCode, executionTime, isLoading }: CodeOutputProps) {
  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, p: 3, bgcolor: '#1e293b', borderRadius: 1 }}>
        <CircularProgress size={20} sx={{ color: '#94a3b8' }} />
        <Typography sx={{ color: '#94a3b8', fontFamily: 'monospace' }}>Running...</Typography>
      </Box>
    )
  }

  const hasOutput = stdout || stderr
  if (!hasOutput && exitCode === undefined) return null

  return (
    <Box sx={{ borderRadius: 1, overflow: 'hidden', border: 1, borderColor: 'divider' }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, px: 2, py: 1, bgcolor: exitCode === 0 ? '#f0fdf4' : exitCode != null ? '#fef2f2' : '#f8fafc', borderBottom: 1, borderColor: 'divider' }}>
        {exitCode === 0 && <CheckCircleOutlined sx={{ fontSize: 16, color: '#16a34a' }} />}
        {exitCode != null && exitCode !== 0 && <ErrorOutlined sx={{ fontSize: 16, color: '#dc2626' }} />}
        <Typography variant="caption" sx={{ fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', color: exitCode === 0 ? '#166534' : exitCode != null ? '#991b1b' : '#64748b' }}>
          Output
        </Typography>
        {exitCode != null && (
          <Chip label={`Exit: ${exitCode}`} size="small" sx={{ height: 20, fontSize: '0.7rem', bgcolor: exitCode === 0 ? '#dcfce7' : '#fee2e2', color: exitCode === 0 ? '#166534' : '#991b1b' }} />
        )}
        {executionTime != null && (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, ml: 'auto' }}>
            <TimerOutlined sx={{ fontSize: 14, color: '#64748b' }} />
            <Typography variant="caption" color="text.secondary">
              {executionTime < 1000 ? `${executionTime}ms` : `${(executionTime / 1000).toFixed(2)}s`}
            </Typography>
          </Box>
        )}
      </Box>
      {stdout && (
        <Box component="pre" sx={{ m: 0, px: 3, py: 2, bgcolor: '#1e293b', color: '#e2e8f0', fontFamily: '"Fira Code", "JetBrains Mono", monospace', fontSize: '0.875rem', lineHeight: 1.7, overflow: 'auto', whiteSpace: 'pre' }}>
          <code>{stdout}</code>
        </Box>
      )}
      {stderr && (
        <Box component="pre" sx={{ m: 0, px: 3, py: 2, bgcolor: '#1c1017', color: '#fca5a5', fontFamily: '"Fira Code", "JetBrains Mono", monospace', fontSize: '0.875rem', lineHeight: 1.7, overflow: 'auto', whiteSpace: 'pre' }}>
          <code>{stderr}</code>
        </Box>
      )}
    </Box>
  )
}
