'use client'

import { useState } from 'react'
import { useParams } from 'next/navigation'
import { useSelector } from 'react-redux'
import { Container, Box } from '@mui/material'
import { BackButton } from '@/components/common/BackButton'
import {
  SnippetLoading, SnippetNotFound, SnippetActionError,
} from '@/components/code/SnippetStatus'
import { SnippetHeader } from '@/components/code/SnippetHeader'
import { SnippetComments } from '@/components/code/SnippetComments'
import { SnippetEditView } from '@/components/code/SnippetEditView'
import { SnippetReadView } from '@/components/code/SnippetReadView'
import { DeleteSnippetDialog } from '@/components/code/DeleteSnippetDialog'
import { useSnippet } from '@/hooks/useSnippet'
import { useSnippetRun } from '@/hooks/useSnippetRun'
import { useSnippetActions } from '@/hooks/useSnippetActions'
import { useTenantId } from '@/hooks/useTenantId'
import type { RootState } from '@/store/store'

export default function ViewSnippetPage() {
  const params = useParams()
  const slug = params.slug as string
  const id = params.id as string
  const base = `/site/${slug}/snippets`
  const { tenantId } = useTenantId(slug)
  const { snippet, loading, notFound, reload } = useSnippet(id)
  const { running, result, run } = useSnippetRun()
  const act = useSnippetActions(id, base, tenantId)
  const user = useSelector((s: RootState) => s.auth.user)
  const [editing, setEditing] = useState(false)
  const [confirmDel, setConfirmDel] = useState(false)

  if (loading) return <SnippetLoading />
  if (notFound || !snippet) return <SnippetNotFound base={base} />

  return (
    <Container maxWidth="md" sx={{ py: 6 }} data-testid="view-snippet-page">
      <Box sx={{ mb: 2 }}>
        <BackButton href={base} label="Back to Snippets" />
      </Box>
      <SnippetHeader s={snippet} />
      <SnippetActionError message={act.error}
        onClose={() => act.setError('')} />
      {editing ? (
        <SnippetEditView
          snippet={snippet}
          tenantId={tenantId}
          onDone={(saved) => {
            setEditing(false)
            if (saved) reload()
          }}
        />
      ) : (
        <SnippetReadView
          snippet={snippet}
          isOwner={!!user && user.id === snippet.authorId}
          running={running}
          result={result}
          onRun={() => run(id)}
          onFork={act.fork}
          onEdit={() => setEditing(true)}
          onDelete={() => setConfirmDel(true)}
        />
      )}
      <SnippetComments id={id} />
      <DeleteSnippetDialog
        open={confirmDel}
        onClose={() => setConfirmDel(false)}
        onConfirm={() => {
          setConfirmDel(false)
          act.remove()
        }}
      />
    </Container>
  )
}
