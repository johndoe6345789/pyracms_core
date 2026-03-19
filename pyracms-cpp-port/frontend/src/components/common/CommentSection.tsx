'use client'

import { useState, useEffect, useCallback } from 'react'
import {
  Box, Typography, TextField, Button, Avatar, IconButton, Divider,
  CircularProgress, Dialog, DialogTitle, DialogContent, DialogActions,
  Collapse
} from '@mui/material'
import {
  ThumbUpOutlined, ThumbUp, ThumbDownOutlined, ThumbDown,
  ReplyOutlined, EditOutlined, DeleteOutlined, ExpandMoreOutlined,
  ExpandLessOutlined
} from '@mui/icons-material'
import { useSelector } from 'react-redux'
import type { RootState } from '@/store/store'
import api from '@/lib/api'

interface Comment {
  id: number
  user_id: number
  username: string
  avatar: string | null
  content: string
  parent_id: number | null
  upvotes: number
  downvotes: number
  user_vote: number | null
  created_at: string
  updated_at: string
  children: Comment[]
}

interface CommentSectionProps {
  contentType: string
  contentId: number
}

function CommentItem({
  comment,
  contentType,
  contentId,
  depth,
  onRefresh,
}: {
  comment: Comment
  contentType: string
  contentId: number
  depth: number
  onRefresh: () => void
}) {
  const [replying, setReplying] = useState(false)
  const [editing, setEditing] = useState(false)
  const [replyText, setReplyText] = useState('')
  const [editText, setEditText] = useState(comment.content)
  const [deleteOpen, setDeleteOpen] = useState(false)
  const [childrenExpanded, setChildrenExpanded] = useState(true)
  const [submitting, setSubmitting] = useState(false)

  const isAuthenticated = useSelector((state: RootState) => state.auth.isAuthenticated)
  const currentUser = useSelector((state: RootState) => state.auth.user)
  const isOwner = currentUser?.id === comment.user_id

  const handleVote = async (value: number) => {
    if (!isAuthenticated) return
    try {
      const newValue = comment.user_vote === value ? 0 : value
      await api.post(`/api/comments/${comment.id}/vote`, { value: newValue })
      onRefresh()
    } catch { /* ignore */ }
  }

  const handleReply = async () => {
    if (!replyText.trim()) return
    setSubmitting(true)
    try {
      await api.post(`/api/comments/${contentType}/${contentId}`, {
        content: replyText,
        parent_id: comment.id,
      })
      setReplyText('')
      setReplying(false)
      onRefresh()
    } catch { /* ignore */ }
    setSubmitting(false)
  }

  const handleEdit = async () => {
    if (!editText.trim()) return
    setSubmitting(true)
    try {
      await api.put(`/api/comments/${comment.id}`, { content: editText })
      setEditing(false)
      onRefresh()
    } catch { /* ignore */ }
    setSubmitting(false)
  }

  const handleDelete = async () => {
    try {
      await api.delete(`/api/comments/${comment.id}`)
      setDeleteOpen(false)
      onRefresh()
    } catch { /* ignore */ }
  }

  const timeAgo = (dateStr: string) => {
    const diff = Date.now() - new Date(dateStr).getTime()
    const minutes = Math.floor(diff / 60000)
    if (minutes < 1) return 'just now'
    if (minutes < 60) return `${minutes}m ago`
    const hours = Math.floor(minutes / 60)
    if (hours < 24) return `${hours}h ago`
    const days = Math.floor(hours / 24)
    if (days < 30) return `${days}d ago`
    const months = Math.floor(days / 30)
    return `${months}mo ago`
  }

  return (
    <Box sx={{ ml: depth > 0 ? 3 : 0, mt: 2 }}>
      <Box sx={{ display: 'flex', gap: 1.5 }}>
        <Avatar
          src={comment.avatar || undefined}
          sx={{ width: 32, height: 32, fontSize: 14 }}
        >
          {comment.username[0]?.toUpperCase()}
        </Avatar>
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
            <Typography variant="body2" fontWeight={600}>
              {comment.username}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {timeAgo(comment.created_at)}
            </Typography>
            {comment.updated_at !== comment.created_at && (
              <Typography variant="caption" color="text.secondary" fontStyle="italic">
                (edited)
              </Typography>
            )}
          </Box>

          {editing ? (
            <Box sx={{ mb: 1 }}>
              <TextField
                fullWidth
                multiline
                minRows={2}
                size="small"
                value={editText}
                onChange={(e) => setEditText(e.target.value)}
              />
              <Box sx={{ display: 'flex', gap: 1, mt: 1 }}>
                <Button size="small" variant="contained" onClick={handleEdit} disabled={submitting}>
                  Save
                </Button>
                <Button size="small" onClick={() => { setEditing(false); setEditText(comment.content) }}>
                  Cancel
                </Button>
              </Box>
            </Box>
          ) : (
            <Typography variant="body2" sx={{ mb: 0.5, whiteSpace: 'pre-wrap' }}>
              {comment.content}
            </Typography>
          )}

          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
            <IconButton size="small" onClick={() => handleVote(1)} disabled={!isAuthenticated}>
              {comment.user_vote === 1 ? <ThumbUp fontSize="small" color="primary" /> : <ThumbUpOutlined fontSize="small" />}
            </IconButton>
            <Typography variant="caption" color="text.secondary">
              {comment.upvotes - comment.downvotes}
            </Typography>
            <IconButton size="small" onClick={() => handleVote(-1)} disabled={!isAuthenticated}>
              {comment.user_vote === -1 ? <ThumbDown fontSize="small" color="error" /> : <ThumbDownOutlined fontSize="small" />}
            </IconButton>

            {isAuthenticated && depth < 4 && (
              <Button size="small" startIcon={<ReplyOutlined />} onClick={() => setReplying(!replying)} sx={{ ml: 1, textTransform: 'none' }}>
                Reply
              </Button>
            )}
            {isOwner && (
              <>
                <IconButton size="small" onClick={() => setEditing(true)}>
                  <EditOutlined fontSize="small" />
                </IconButton>
                <IconButton size="small" onClick={() => setDeleteOpen(true)}>
                  <DeleteOutlined fontSize="small" />
                </IconButton>
              </>
            )}
          </Box>

          {replying && (
            <Box sx={{ mt: 1, mb: 1 }}>
              <TextField
                fullWidth
                multiline
                minRows={2}
                size="small"
                placeholder="Write a reply..."
                value={replyText}
                onChange={(e) => setReplyText(e.target.value)}
              />
              <Box sx={{ display: 'flex', gap: 1, mt: 1 }}>
                <Button size="small" variant="contained" onClick={handleReply} disabled={submitting || !replyText.trim()}>
                  Reply
                </Button>
                <Button size="small" onClick={() => { setReplying(false); setReplyText('') }}>
                  Cancel
                </Button>
              </Box>
            </Box>
          )}

          {comment.children.length > 0 && (
            <>
              <Button
                size="small"
                onClick={() => setChildrenExpanded(!childrenExpanded)}
                startIcon={childrenExpanded ? <ExpandLessOutlined /> : <ExpandMoreOutlined />}
                sx={{ textTransform: 'none', mt: 0.5 }}
              >
                {childrenExpanded ? 'Hide' : 'Show'} {comment.children.length} {comment.children.length === 1 ? 'reply' : 'replies'}
              </Button>
              <Collapse in={childrenExpanded}>
                {comment.children.map((child) => (
                  <CommentItem
                    key={child.id}
                    comment={child}
                    contentType={contentType}
                    contentId={contentId}
                    depth={depth + 1}
                    onRefresh={onRefresh}
                  />
                ))}
              </Collapse>
            </>
          )}
        </Box>
      </Box>

      <Dialog open={deleteOpen} onClose={() => setDeleteOpen(false)}>
        <DialogTitle>Delete Comment</DialogTitle>
        <DialogContent>
          <Typography>Are you sure you want to delete this comment?</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteOpen(false)}>Cancel</Button>
          <Button onClick={handleDelete} color="error" variant="contained">Delete</Button>
        </DialogActions>
      </Dialog>
    </Box>
  )
}

export default function CommentSection({ contentType, contentId }: CommentSectionProps) {
  const [comments, setComments] = useState<Comment[]>([])
  const [loading, setLoading] = useState(true)
  const [newComment, setNewComment] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const isAuthenticated = useSelector((state: RootState) => state.auth.isAuthenticated)

  const fetchComments = useCallback(async () => {
    try {
      const res = await api.get(`/api/comments/${contentType}/${contentId}`)
      setComments(res.data.comments || [])
    } catch { /* ignore */ }
    setLoading(false)
  }, [contentType, contentId])

  useEffect(() => {
    fetchComments()
  }, [fetchComments])

  const handleSubmit = async () => {
    if (!newComment.trim()) return
    setSubmitting(true)
    try {
      await api.post(`/api/comments/${contentType}/${contentId}`, {
        content: newComment,
        parent_id: null,
      })
      setNewComment('')
      fetchComments()
    } catch { /* ignore */ }
    setSubmitting(false)
  }

  return (
    <Box sx={{ mt: 4 }}>
      <Typography variant="h6" fontWeight={700} sx={{ mb: 2 }}>
        Comments
      </Typography>
      <Divider sx={{ mb: 2 }} />

      {isAuthenticated && (
        <Box sx={{ mb: 3 }}>
          <TextField
            fullWidth
            multiline
            minRows={3}
            placeholder="Write a comment..."
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
          />
          <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 1 }}>
            <Button
              variant="contained"
              onClick={handleSubmit}
              disabled={submitting || !newComment.trim()}
            >
              Post Comment
            </Button>
          </Box>
        </Box>
      )}

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
          <CircularProgress />
        </Box>
      ) : comments.length === 0 ? (
        <Box sx={{ p: 4, textAlign: 'center' }}>
          <Typography color="text.secondary">
            No comments yet. Be the first!
          </Typography>
        </Box>
      ) : (
        comments.map((comment) => (
          <CommentItem
            key={comment.id}
            comment={comment}
            contentType={contentType}
            contentId={contentId}
            depth={0}
            onRefresh={fetchComments}
          />
        ))
      )}
    </Box>
  )
}
