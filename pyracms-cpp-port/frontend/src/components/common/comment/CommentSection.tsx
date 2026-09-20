'use client'

import { useState, useEffect, useCallback } from 'react'
import { Box, Typography, Divider } from '@mui/material'
import { useParams } from 'next/navigation'
import { useSiteSession } from '@/hooks/useSiteSession'
import { can } from '@/lib/permissions'
import { UserRole } from '@/types'
import api from '@/lib/api'
import { apiErrorMessage } from '@/lib/apiError'
import { ErrorAlert } from '../ErrorAlert'
import type { ApiComment, Comment, CommentSectionProps } from './types'
import { buildTree } from './types'
import CommentForm from './CommentForm'
import CommentList from './CommentList'

export default function CommentSection({
  contentType,
  contentId,
}: CommentSectionProps) {
  const [comments, setComments] = useState<Comment[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const slug = (useParams()?.slug as string | undefined) ?? ''
  const signedIn = useSiteSession(slug)

  const fetchComments = useCallback(async () => {
    try {
      const res = await api.get(`/api/comments/${contentType}/${contentId}`)
      const flat: ApiComment[] = Array.isArray(res.data) ? res.data : []
      setComments(buildTree(flat))
      setError('')
    } catch (e) {
      setError(apiErrorMessage(e, 'Could not load comments'))
    }
    setLoading(false)
  }, [contentType, contentId])

  useEffect(() => {
    fetchComments()
  }, [fetchComments])

  return (
    <Box sx={{ mt: 4 }} data-testid="comment-section">
      <Typography variant="h6" fontWeight={700} sx={{ mb: 2 }}>
        Comments
      </Typography>
      <Divider sx={{ mb: 2 }} />
      <ErrorAlert error={error} testId="comments-error" />
      {can('comment', signedIn ? UserRole.User : null) ? (
        <CommentForm
          contentType={contentType}
          contentId={contentId}
          onSubmitted={fetchComments}
        />
      ) : (
        <Typography
          color="text.secondary"
          sx={{ mb: 2 }}
          data-testid="comment-login-hint"
        >
          Sign in to comment.
        </Typography>
      )}
      <CommentList
        comments={comments}
        loading={loading}
        contentType={contentType}
        contentId={contentId}
        onRefresh={fetchComments}
      />
    </Box>
  )
}
