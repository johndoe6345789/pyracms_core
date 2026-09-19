'use client'

import { useState } from 'react'
import type { useThread } from '@/hooks/useThread'
import { useThreadLive } from '@/hooks/useThreadLive'
import { useTypingSender } from './useTypingSender'

/** Live socket, paging and reply submit wiring for a thread view. */
export function useThreadContentState(
  t: ReturnType<typeof useThread>,
  threadId: string,
) {
  const live = useThreadLive({
    threadId: Number(threadId) || 0,
    onNewPost: () => {
      t.refresh()
    },
  })
  const [page, setPage] = useState(1)
  const onTyping = useTypingSender(live.sendTypingStart)
  // Jump to the last page after posting (the new reply is at the end).
  const onSubmit = () => t.handleSubmitReply().then(() => setPage(9999))
  return { live, page, setPage, onTyping, onSubmit }
}
