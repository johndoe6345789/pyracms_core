import NextLink from 'next/link'
import {
  Box,
  Button,
  ToggleButton,
  ToggleButtonGroup,
  Typography,
} from '@mui/material'
import { FileUploadOutlined } from '@mui/icons-material'
import VideoSearchField from './VideoSearchField'
import type { VideoSort } from '@/lib/videos'

interface Props {
  slug: string
  canUpload: boolean
  sort: VideoSort
  onSort: (s: VideoSort) => void
  onSearch: (q: string) => void
}

/** Title row with search and upload, then the Latest/Popular toggle. */
export default function VideosHeader(p: Props) {
  return (
    <Box sx={{ mb: 3 }}>
      <Box
        sx={{
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          gap: 2,
          mb: 2,
        }}
      >
        <Typography variant="h4" component="h1" sx={{ mr: 'auto' }}>
          Videos
        </Typography>
        <VideoSearchField onSearch={p.onSearch} />
        {p.canUpload && (
          <Button
            variant="contained"
            component={NextLink}
            href={`/site/${p.slug}/videos/upload`}
            startIcon={<FileUploadOutlined />}
            data-testid="video-upload-link"
          >
            Upload
          </Button>
        )}
      </Box>
      <ToggleButtonGroup
        exclusive
        size="small"
        value={p.sort}
        onChange={(_, v: VideoSort | null) => v && p.onSort(v)}
        aria-label="Sort videos"
      >
        <ToggleButton value="newest">Latest</ToggleButton>
        <ToggleButton value="popular">Popular</ToggleButton>
      </ToggleButtonGroup>
    </Box>
  )
}
