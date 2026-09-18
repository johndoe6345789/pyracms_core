'use client'

import { Paper, Typography } from '@mui/material'
import ReactDiffViewer, {
  DiffMethod,
} from 'react-diff-viewer-continued'
import type { DiffRevision } from './RevisionSelect'

interface RevisionDiffBodyProps {
  left: DiffRevision | undefined
  right: DiffRevision | undefined
  splitView: boolean
}

export function EmptyNote({ text }: { text: string }) {
  return (
    <Paper variant="outlined" sx={{ p: 3, borderColor: 'divider' }}>
      <Typography color="text.secondary">{text}</Typography>
    </Paper>
  )
}

const title = (r: DiffRevision) =>
  `${r.label} (${r.author} - ${r.date})`

export function RevisionDiffBody(
  { left, right, splitView }: RevisionDiffBodyProps
) {
  if (!left || !right) {
    return <EmptyNote text="Select two revisions to compare." />
  }
  return (
    <Paper
      variant="outlined"
      sx={{ overflow: 'auto', borderColor: 'divider' }}
    >
      <ReactDiffViewer
        oldValue={left.content}
        newValue={right.content}
        splitView={splitView}
        compareMethod={DiffMethod.WORDS}
        leftTitle={title(left)}
        rightTitle={title(right)}
        useDarkTheme={false}
      />
    </Paper>
  )
}
