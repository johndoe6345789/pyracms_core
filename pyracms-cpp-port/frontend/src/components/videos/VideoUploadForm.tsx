import { Box, Button, LinearProgress, Paper, Typography } from '@mui/material'
import { VideoFileOutlined } from '@mui/icons-material'
import { ErrorAlert } from '@/components/common/ErrorAlert'
import { VIDEO_ACCEPT, type VideoUploadState } from '@/hooks/useVideoUpload'
import VideoTextFields from './VideoTextFields'
import VisibilitySelect from './VisibilitySelect'

/** File picker with progress, then the details and Publish. */
export default function VideoUploadForm({ u }: { u: VideoUploadState }) {
  return (
    <Paper variant="outlined" sx={{ p: 3 }} data-testid="video-upload-form">
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
        <Button
          component="label"
          variant="outlined"
          startIcon={<VideoFileOutlined />}
          disabled={u.busy}
        >
          Select file
          <input
            hidden
            type="file"
            accept={VIDEO_ACCEPT}
            data-testid="video-file-input"
            onChange={(e) => u.pick(e.target.files?.[0])}
          />
        </Button>
        <Typography variant="body2" color="text.secondary" noWrap>
          {u.file ? u.file.name : 'MP4 or WebM video'}
        </Typography>
      </Box>
      {u.progress !== null && (
        <LinearProgress
          variant="determinate"
          value={u.progress}
          sx={{ mb: 2 }}
          data-testid="video-upload-progress"
        />
      )}
      <VideoTextFields
        title={u.title}
        description={u.description}
        onTitle={u.setTitle}
        onDescription={u.setDescription}
      />
      <VisibilitySelect value={u.visibility} onChange={u.setVisibility} />
      <ErrorAlert error={u.error} testId="video-upload-error" />
      <Button
        variant="contained"
        sx={{ mt: 2 }}
        disabled={u.busy || !u.file || !u.title.trim()}
        onClick={u.submit}
        data-testid="video-publish"
      >
        {u.busy ? 'Uploading…' : 'Publish'}
      </Button>
    </Paper>
  )
}
