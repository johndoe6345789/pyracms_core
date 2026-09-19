'use client'

import { useState } from 'react'
import { Box, ToggleButton, ToggleButtonGroup } from '@mui/material'
import { RevisionDiffBody, EmptyNote } from './RevisionDiffBody'
import { RevisionSelect, type DiffRevision } from './RevisionSelect'

interface RevisionDiffViewerProps {
  revisions: DiffRevision[]
}

export function RevisionDiffViewer({ revisions }: RevisionDiffViewerProps) {
  const multi = revisions.length > 1
  const [leftId, setLeftId] = useState(multi ? (revisions[0]?.id ?? '') : '')
  const [rightId, setRightId] = useState(
    multi ? (revisions[revisions.length - 1]?.id ?? '') : '',
  )
  const [splitView, setSplitView] = useState(true)

  const left = revisions.find((r) => r.id === leftId)
  const right = revisions.find((r) => r.id === rightId)

  if (revisions.length === 0) {
    return <EmptyNote text="No revisions available to compare." />
  }

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
      <Box
        sx={{
          display: 'flex',
          gap: 2,
          alignItems: 'center',
          flexWrap: 'wrap',
        }}
      >
        <RevisionSelect
          label="From Revision"
          value={leftId}
          revisions={revisions}
          onChange={setLeftId}
        />
        <RevisionSelect
          label="To Revision"
          value={rightId}
          revisions={revisions}
          onChange={setRightId}
        />
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

      <RevisionDiffBody left={left} right={right} splitView={splitView} />
    </Box>
  )
}
