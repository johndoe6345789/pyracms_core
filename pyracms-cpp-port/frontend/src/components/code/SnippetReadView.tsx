'use client'

import { Box } from '@mui/material'
import { CodeEditor } from './CodeEditor'
import { CodeOutput } from './CodeOutput'
import { SnippetToolbar } from './SnippetToolbar'
import { SnippetAttachments } from './SnippetAttachments'
import { isRunnable, type RunResult, type Snippet } from '@/lib/snippets'

interface Props {
  snippet: Snippet
  isOwner: boolean
  running: boolean
  result: RunResult | null
  tenantId: number | null
  onRun: () => void
  onFork: () => void
  onEdit: () => void
  onDelete: () => void
  onAttachmentsChanged: () => void
}

export function SnippetReadView(p: Props) {
  const { snippet, result, running } = p
  const lines = snippet.code.split('\n').length
  const height = `${Math.min(600, Math.max(120, lines * 19 + 20))}px`
  return (
    <>
      <Box sx={{ mb: 2 }}>
        <SnippetToolbar
          runnable={isRunnable(snippet.language)}
          running={running}
          isOwner={p.isOwner}
          code={snippet.code}
          onRun={p.onRun}
          onFork={p.onFork}
          onEdit={p.onEdit}
          onDelete={p.onDelete}
        />
      </Box>
      <Box
        sx={{
          border: 1,
          borderColor: 'divider',
          borderRadius: 1,
          overflow: 'hidden',
          mb: 3,
        }}
        data-testid="snippet-code-block"
      >
        <CodeEditor
          value={snippet.code}
          language={snippet.language}
          readOnly
          height={height}
        />
      </Box>
      {(running || result) && (
        <Box sx={{ mb: 3 }}>
          <CodeOutput
            stdout={result?.stdout}
            stderr={result?.stderr}
            exitCode={result?.exitCode}
            executionTime={result?.executionTime}
            isLoading={running}
          />
        </Box>
      )}
      <SnippetAttachments
        snippetId={snippet.id}
        tenantId={p.tenantId}
        attachments={snippet.attachments}
        isOwner={p.isOwner}
        onChanged={p.onAttachmentsChanged}
      />
    </>
  )
}
