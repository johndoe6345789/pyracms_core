'use client'

import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Typography,
} from '@mui/material'
import { CodeEditor } from './CodeEditor'

export interface RevisionView {
  number: number
  title: string
  language: string
  code: string
  author: string
  date: string
}

/** Builds the dialog's revision from the API row + the table's row. */
export function toRevisionView(
  raw: Record<string, unknown> | undefined,
  row: { number: number; author: string; date: string } | undefined,
): RevisionView | null {
  if (!raw || !row) return null
  return {
    ...row,
    title: String(raw.title ?? ''),
    language: String(raw.language ?? 'plaintext'),
    code: String(raw.code ?? ''),
  }
}

interface Props {
  revision: RevisionView | null
  onClose: () => void
}

/** One past state of a snippet: its title and code, read-only. */
export function SnippetRevisionView({ revision: r, onClose }: Props) {
  return (
    <Dialog open={!!r} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>
        Revision {r?.number} {'—'} {r?.title}
      </DialogTitle>
      <DialogContent>
        <Typography variant="caption" color="text.secondary" display="block">
          {r?.author} {'·'} {r?.date}
        </Typography>
        {r && (
          <CodeEditor
            value={r.code}
            language={r.language}
            readOnly
            height="360px"
          />
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} data-testid="close-revision-view">
          Close
        </Button>
      </DialogActions>
    </Dialog>
  )
}
