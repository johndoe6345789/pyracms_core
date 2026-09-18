'use client'

import { useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useSelector } from 'react-redux'
import {
  Container, Box, Alert, Typography, CircularProgress,
  Dialog, DialogTitle, DialogContent, DialogActions,
  DialogContentText, Button,
} from '@mui/material'
import { BackButton } from '@/components/common/BackButton'
import { CodeEditor } from '@/components/code/CodeEditor'
import { CodeOutput } from '@/components/code/CodeOutput'
import { SnippetHeader } from '@/components/code/SnippetHeader'
import { SnippetToolbar } from '@/components/code/SnippetToolbar'
import { SnippetComments } from '@/components/code/SnippetComments'
import { SnippetEditorForm } from '@/components/code/SnippetEditorForm'
import { useSnippet } from '@/hooks/useSnippet'
import { useSnippetRun } from '@/hooks/useSnippetRun'
import { useSnippetEditor } from '@/hooks/useSnippetEditor'
import { useTenantId } from '@/hooks/useTenantId'
import { isRunnable, type Snippet } from '@/lib/snippets'
import api from '@/lib/api'
import type { RootState } from '@/store/store'

function EditView({ snippet, tenantId, onDone }: {
  snippet: Snippet
  tenantId: number | null
  onDone: (saved: boolean) => void
}) {
  const editor = useSnippetEditor(tenantId, snippet)
  return (
    <SnippetEditorForm
      editor={editor}
      saveLabel="Save Changes"
      onSaved={() => onDone(true)}
      onCancel={() => onDone(false)}
    />
  )
}

export default function ViewSnippetPage() {
  const params = useParams()
  const router = useRouter()
  const slug = params.slug as string
  const id = params.id as string
  const base = `/site/${slug}/snippets`
  const { tenantId } = useTenantId(slug)
  const { snippet, loading, notFound, reload } = useSnippet(id)
  const { running, result, run } = useSnippetRun()
  const user = useSelector((s: RootState) => s.auth.user)
  const [editing, setEditing] = useState(false)
  const [confirmDel, setConfirmDel] = useState(false)
  const [error, setError] = useState('')

  const fail = (m: string) => () => setError(m)

  const fork = () => {
    api.post(`/api/snippets/${id}/fork`, { tenant_id: tenantId })
      .then(res => router.push(`${base}/${res.data.id}`))
      .catch(fail('Log in to fork this snippet.'))
  }
  const remove = () => {
    setConfirmDel(false)
    api.delete(`/api/snippets/${id}`)
      .then(() => router.push(base))
      .catch(fail('Failed to delete snippet.'))
  }
  const doneEditing = (saved: boolean) => {
    setEditing(false)
    if (saved) reload()
  }

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 10 }}>
        <CircularProgress aria-label="Loading snippet" />
      </Box>
    )
  }
  if (notFound || !snippet) {
    return (
      <Container maxWidth="md" sx={{ py: 6 }}>
        <BackButton href={base} label="Back to Snippets" />
        <Typography sx={{ mt: 3 }} data-testid="snippet-not-found">
          Snippet not found.
        </Typography>
      </Container>
    )
  }

  const isOwner = !!user && user.id === snippet.authorId
  const lines = snippet.code.split('\n').length
  const height = `${Math.min(600, Math.max(120, lines * 19 + 20))}px`

  return (
    <Container
      maxWidth="md"
      sx={{ py: 6 }}
      data-testid="view-snippet-page"
    >
      <Box sx={{ mb: 2 }}>
        <BackButton href={base} label="Back to Snippets" />
      </Box>
      <SnippetHeader s={snippet} />
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}
          onClose={() => setError('')}>
          {error}
        </Alert>
      )}
      {editing ? (
        <EditView
          snippet={snippet}
          tenantId={tenantId}
          onDone={doneEditing}
        />
      ) : (
        <>
          <Box sx={{ mb: 2 }}>
            <SnippetToolbar
              runnable={isRunnable(snippet.language)}
              running={running}
              isOwner={isOwner}
              code={snippet.code}
              onRun={() => run(id)}
              onFork={fork}
              onEdit={() => setEditing(true)}
              onDelete={() => setConfirmDel(true)}
            />
          </Box>
          <Box
            sx={{
              border: 1, borderColor: 'divider',
              borderRadius: 1, overflow: 'hidden', mb: 3,
            }}
            data-testid="snippet-code-block"
          >
            <CodeEditor
              value={snippet.code}
              onChange={() => {}}
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
        </>
      )}
      <SnippetComments id={id} />
      <Dialog open={confirmDel}
        onClose={() => setConfirmDel(false)}>
        <DialogTitle>Delete snippet?</DialogTitle>
        <DialogContent>
          <DialogContentText>
            This permanently deletes this snippet.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmDel(false)}>
            Cancel
          </Button>
          <Button color="error" onClick={remove}
            data-testid="confirm-delete-btn">
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  )
}
