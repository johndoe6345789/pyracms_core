'use client'

import {
  Paper, Typography, Box, Button,
} from '@mui/material'
import {
  AddOutlined,
  PostAddOutlined,
  UploadFileOutlined,
} from '@mui/icons-material'
import Link from 'next/link'
import SystemHealthPanel
  from './SystemHealthPanel'

export default function QuickActionsPanel() {
  return (
    <Paper
      variant="outlined"
      sx={{ p: 3, borderColor: 'divider' }}
    >
      <Typography variant="h6" gutterBottom>
        Quick Actions
      </Typography>
      <Box sx={{
        display: 'flex',
        flexDirection: 'column', gap: 1,
      }}>
        <Button
          variant="outlined"
          startIcon={<AddOutlined />}
          component={Link}
          href="/admin/articles/new"
          fullWidth
          data-testid="create-article-btn"
        >
          Create Article
        </Button>
        <Button
          variant="outlined"
          startIcon={<PostAddOutlined />}
          component={Link}
          href="/admin/forum/new"
          fullWidth
          data-testid="new-forum-post-btn"
        >
          New Forum Post
        </Button>
        <Button
          variant="outlined"
          startIcon={<UploadFileOutlined />}
          component={Link}
          href="/admin/files"
          fullWidth
          data-testid="upload-file-btn"
        >
          Upload File
        </Button>
      </Box>
      <SystemHealthPanel />
    </Paper>
  )
}
