'use client'

import { useState } from 'react'
import {
  Box, FormControl, InputLabel, MenuItem, Select,
  ToggleButton, ToggleButtonGroup, Paper, Typography,
} from '@mui/material'
import ReactDiffViewer, { DiffMethod } from 'react-diff-viewer-continued'

interface Revision {
  id: string
  label: string
  date: string
  author: string
  content: string
}

interface RevisionDiffViewerProps {
  revisions: Revision[]
}

export function RevisionDiffViewer({ revisions }: RevisionDiffViewerProps) {
  const [leftId, setLeftId] = useState(revisions.length > 1 ? revisions[0].id : '')
  const [rightId, setRightId] = useState(revisions.length > 1 ? revisions[revisions.length - 1].id : '')
  const [splitView, setSplitView] = useState(true)

  const leftRevision = revisions.find((r) => r.id === leftId)
  const rightRevision = revisions.find((r) => r.id === rightId)

  if (revisions.length === 0) {
    return (
      <Paper variant="outlined" sx={{ p: 3, borderColor: 'divider' }}>
        <Typography color="text.secondary">No revisions available to compare.</Typography>
      </Paper>
    )
  }

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
      <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', flexWrap: 'wrap' }}>
        <FormControl size="small" sx={{ minWidth: 200 }}>
          <InputLabel>From Revision</InputLabel>
          <Select value={leftId} label="From Revision" onChange={(e) => setLeftId(e.target.value)}>
            {revisions.map((rev) => (
              <MenuItem key={rev.id} value={rev.id}>
                {rev.label} - {rev.author} ({rev.date})
              </MenuItem>
            ))}
          </Select>
        </FormControl>
        <FormControl size="small" sx={{ minWidth: 200 }}>
          <InputLabel>To Revision</InputLabel>
          <Select value={rightId} label="To Revision" onChange={(e) => setRightId(e.target.value)}>
            {revisions.map((rev) => (
              <MenuItem key={rev.id} value={rev.id}>
                {rev.label} - {rev.author} ({rev.date})
              </MenuItem>
            ))}
          </Select>
        </FormControl>
        <ToggleButtonGroup
          value={splitView ? 'split' : 'unified'}
          exclusive
          onChange={(_, val) => val && setSplitView(val === 'split')}
          size="small"
        >
          <ToggleButton value="split">Side by Side</ToggleButton>
          <ToggleButton value="unified">Unified</ToggleButton>
        </ToggleButtonGroup>
      </Box>

      {leftRevision && rightRevision ? (
        <Paper variant="outlined" sx={{ overflow: 'auto', borderColor: 'divider' }}>
          <ReactDiffViewer
            oldValue={leftRevision.content}
            newValue={rightRevision.content}
            splitView={splitView}
            compareMethod={DiffMethod.WORDS}
            leftTitle={`${leftRevision.label} (${leftRevision.author} - ${leftRevision.date})`}
            rightTitle={`${rightRevision.label} (${rightRevision.author} - ${rightRevision.date})`}
            useDarkTheme={false}
          />
        </Paper>
      ) : (
        <Paper variant="outlined" sx={{ p: 3, borderColor: 'divider' }}>
          <Typography color="text.secondary">Select two revisions to compare.</Typography>
        </Paper>
      )}
    </Box>
  )
}
