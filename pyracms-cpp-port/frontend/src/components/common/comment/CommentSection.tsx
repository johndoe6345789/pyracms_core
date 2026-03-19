'use client'

import {
  useState, useEffect, useCallback,
} from 'react'
import { Box, Typography, Divider } from '@mui/material'
import { useSelector } from 'react-redux'
import type { RootState } from '@/store/store'
import api from '@/lib/api'
import type {
  Comment, CommentSectionProps,
} from './types'
import CommentForm from './CommentForm'
import CommentList from './CommentList'

export default function CommentSection({
  contentType,
  contentId,
}: CommentSectionProps) {
  const [comments, setComments] = useState<
    Comment[]
  >([])
  const [loading, setLoading] = useState(true)

  const isAuthenticated = useSelector(
    (s: RootState) => s.auth.isAuthenticated
  )

  const fetchComments = useCallback(async () => {
    try {
      const url =
        `/api/comments/${contentType}/${contentId}`
      const res = await api.get(url)
      setComments(res.data.comments || [])
    } catch { /* ignore */ }
    setLoading(false)
  }, [contentType, contentId])

  useEffect(() => {
    fetchComments()
  }, [fetchComments])

  return (
    <Box sx={{ mt: 4 }}>
      <Typography
        variant="h6"
        fontWeight={700}
        sx={{ mb: 2 }}
      >
        Comments
      </Typography>
      <Divider sx={{ mb: 2 }} />
      {isAuthenticated && (
        <CommentForm
          contentType={contentType}
          contentId={contentId}
          onSubmitted={fetchComments}
        />
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
