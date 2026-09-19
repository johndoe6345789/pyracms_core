'use client'

import { useState } from 'react'
import { useSelector } from 'react-redux'
import { SnippetActionError } from '@/components/code/SnippetStatus'
import CommentSection from '@/components/common/CommentSection'
import { SnippetEditView } from '@/components/code/SnippetEditView'
import { SnippetReadView } from '@/components/code/SnippetReadView'
import { DeleteSnippetDialog } from '@/components/code/DeleteSnippetDialog'
import { useSnippetRun } from '@/hooks/useSnippetRun'
import type { useSnippet } from '@/hooks/useSnippet'
import type { useSnippetActions } from '@/hooks/useSnippetActions'
import type { RootState } from '@/store/store'

interface Props {
  id: string
  tenantId: number | null
  snippet: NonNullable<ReturnType<typeof useSnippet>['snippet']>
  act: ReturnType<typeof useSnippetActions>
  reload: () => void
}

export default function SnippetBody(p: Props) {
  const { id, tenantId, snippet, act, reload } = p
  const { running, result, run } = useSnippetRun()
  const user = useSelector((s: RootState) => s.auth.user)
  const [editing, setEditing] = useState(false)
  const [confirmDel, setConfirmDel] = useState(false)

  return (
    <>
      <SnippetActionError
        message={act.error}
        onClose={() => act.setError('')}
      />
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
      <CommentSection contentType="snippet" contentId={Number(id)} />
      <DeleteSnippetDialog
        open={confirmDel}
        onClose={() => setConfirmDel(false)}
        onConfirm={() => {
          setConfirmDel(false)
          act.remove()
        }}
      />
    </>
  )
}
