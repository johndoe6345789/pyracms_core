'use client'

import { useParams } from 'next/navigation'
import { Container, Typography, Box, Button } from '@mui/material'
import { AddOutlined } from '@mui/icons-material'
import Link from 'next/link'
import { useThreadList } from '@/hooks/useThreadList'
import { BackButton } from '@/components/common/BackButton'
import { ThreadTable } from '@/components/forum/ThreadTable'

export default function ThreadListPage() {
  const params = useParams()
  const slug = params.slug as string
  const forumId = params.forumId as string
  const { forum, threads } = useThreadList(forumId)

  return (
    <Container maxWidth="lg" sx={{ py: 6 }}>
      <Box sx={{ mb: 2 }}>
        <BackButton href={`/site/${slug}/forum`} label="Back to Forums" />
      </Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 4, flexWrap: 'wrap', gap: 2 }}>
        <Box>
          <Typography variant="h3" component="h1" gutterBottom>{forum.name}</Typography>
          <Typography variant="body1" color="text.secondary">{forum.description}</Typography>
        </Box>
        <Button variant="contained" startIcon={<AddOutlined />} component={Link} href={`/site/${slug}/forum/thread/create`}>
          New Thread
        </Button>
      </Box>
      <ThreadTable threads={threads} slug={slug} />
    </Container>
  )
}
