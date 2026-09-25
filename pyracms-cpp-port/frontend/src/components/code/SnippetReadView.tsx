'use client'

import { Box } from '@mui/material'
import { SnippetCodeBlock } from './SnippetCodeBlock'
import { SnippetHistoryButton } from './SnippetHistoryButton'
import { ArticleTagChips } from '@/components/articles/ArticleTagChips'
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
  historyHref: string
  siteSlug: string
  onRun: () => void
  onFork: () => void
  onEdit: () => void
  onDelete: () => void
  onAttachmentsChanged: () => void
}

export function SnippetReadView(p: Props) {
  const { snippet, result, running } = p
  return (
    <>
      <Box sx={{ mb: 2, display: 'flex', gap: 1, flexWrap: 'wrap' }}>
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
        <SnippetHistoryButton href={p.historyHref} />
      </Box>
      {snippet.tags.length > 0 && (
        <ArticleTagChips tags={snippet.tags} searchSlug={p.siteSlug} />
      )}
      <SnippetCodeBlock snippet={snippet} />
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
