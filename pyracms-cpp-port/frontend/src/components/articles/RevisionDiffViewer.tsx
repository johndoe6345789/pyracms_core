'use client'

import { useState } from 'react'
import {
  Box,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  ToggleButton,
  ToggleButtonGroup,
  Paper,
  Typography,
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

const PLACEHOLDER_REVISIONS: Revision[] = [
  {
    id: 'rev-1',
    label: 'Revision 1',
    date: '2026-03-10 09:00',
    author: 'Alice',
    content: '# Getting Started\n\nThis is the first version of the article.\n\n## Introduction\n\nWelcome to the tutorial.\n\n## Setup\n\nInstall the dependencies:\n\n```\nnpm install\n```\n',
  },
  {
    id: 'rev-2',
    label: 'Revision 2',
    date: '2026-03-12 14:30',
    author: 'Bob',
    content: '# Getting Started with Next.js\n\nThis is the updated version of the article.\n\n## Introduction\n\nWelcome to the Next.js tutorial.\n\n## Setup\n\nInstall the dependencies:\n\n```bash\nnpm install next react react-dom\n```\n\n## Running\n\nStart the dev server:\n\n```bash\nnpm run dev\n```\n',
  },
  {
    id: 'rev-3',
    label: 'Revision 3',
    date: '2026-03-15 11:00',
    author: 'Alice',
    content: '# Getting Started with Next.js\n\nThis is the latest version of the article with expanded content.\n\n## Introduction\n\nWelcome to the Next.js tutorial. Next.js is a powerful React framework.\n\n## Prerequisites\n\n- Node.js 18+\n- npm or yarn\n\n## Setup\n\nInstall the dependencies:\n\n```bash\nnpm install next react react-dom\n```\n\n## Running\n\nStart the dev server:\n\n```bash\nnpm run dev\n```\n\nOpen http://localhost:3000 in your browser.\n',
  },
]

export function RevisionDiffViewer({ revisions }: RevisionDiffViewerProps) {
  const allRevisions = revisions.length > 0 ? revisions : PLACEHOLDER_REVISIONS
  const [leftId, setLeftId] = useState(allRevisions.length > 1 ? allRevisions[0].id : '')
  const [rightId, setRightId] = useState(allRevisions.length > 1 ? allRevisions[allRevisions.length - 1].id : '')
  const [splitView, setSplitView] = useState(true)

  const leftRevision = allRevisions.find((r) => r.id === leftId)
  const rightRevision = allRevisions.find((r) => r.id === rightId)

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
      <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', flexWrap: 'wrap' }}>
        <FormControl size="small" sx={{ minWidth: 200 }}>
          <InputLabel>From Revision</InputLabel>
          <Select value={leftId} label="From Revision" onChange={(e) => setLeftId(e.target.value)}>
            {allRevisions.map((rev) => (
              <MenuItem key={rev.id} value={rev.id}>
                {rev.label} - {rev.author} ({rev.date})
              </MenuItem>
            ))}
          </Select>
        </FormControl>
        <FormControl size="small" sx={{ minWidth: 200 }}>
          <InputLabel>To Revision</InputLabel>
          <Select value={rightId} label="To Revision" onChange={(e) => setRightId(e.target.value)}>
            {allRevisions.map((rev) => (
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
