'use client'

import { useState } from 'react'
import api from '@/lib/api'
import { errMsg } from './threadTypes'

/** Reply box state, quoting and submission for a thread. */
export function useThreadReply(
  threadId: string,
  refresh: () => Promise<unknown>,
) {
  const [replyContent, setReplyContent] = useState('')
  const [replyError, setReplyError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const handleSubmitReply = () => {
    if (!replyContent.trim() || !threadId) return Promise.resolve()
    setSubmitting(true)
    setReplyError('')
    return api
      .post('/api/forum/posts', {
        threadId: Number(threadId),
        content: replyContent.trim(),
      })
      .then(() => {
        setReplyContent('')
        return refresh()
      })
      .catch((err) => setReplyError(errMsg(err, 'Could not post reply.')))
      .finally(() => setSubmitting(false))
  }

  const handleQuote = (author: string, content: string) => {
    const quote = `[quote=${author}]${content}[/quote]\n\n`
    setReplyContent((prev) => (prev ? `${prev}\n\n${quote}` : quote))
  }

  return {
    replyContent,
    setReplyContent,
    replyError,
    setReplyError,
    submitting,
    handleSubmitReply,
    handleQuote,
  }
}
