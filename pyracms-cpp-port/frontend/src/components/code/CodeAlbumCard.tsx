import {
  Card,
  CardActionArea,
  CardContent,
  Typography,
  Box,
} from '@mui/material'
import Link from 'next/link'
import { CodeOutlined } from '@mui/icons-material'
import type { CodeAlbum } from '@/hooks/useCodeAlbums'

interface CodeAlbumCardProps {
  album: CodeAlbum
  slug: string
}

export default function CodeAlbumCard({ album, slug }: CodeAlbumCardProps) {
  return (
    <Card
      variant="outlined"
      sx={{
        height: '100%',
        borderColor: 'divider',
        transition: 'all 0.2s ease-in-out',
        '&:hover': {
          borderColor: 'primary.main',
          boxShadow: 3,
          transform: 'translateY(-4px)',
        },
      }}
    >
      <CardActionArea
        component={Link}
        href={`/site/${slug}/code/${album.id}`}
        sx={{ height: '100%' }}
      >
        <CardContent sx={{ p: 3 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1.5 }}>
            <Box
              sx={{
                width: 44,
                height: 44,
                borderRadius: 2,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                bgcolor: '#6366f114',
              }}
            >
              <CodeOutlined sx={{ color: '#6366f1', fontSize: 26 }} />
            </Box>
            <Typography variant="h5" component="h2">
              {album.name}
            </Typography>
          </Box>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            {album.description}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            {album.snippetCount} snippets
          </Typography>
        </CardContent>
      </CardActionArea>
    </Card>
  )
}
