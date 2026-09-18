import { Box, Chip, Typography } from '@mui/material'
import { FileItem, formatFileSize } from '@/hooks/useFileManager'

export default function FileCardMeta({ file }: { file: FileItem }) {
  return (
    <>
      <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mb: 1 }}>
        <Chip
          label={formatFileSize(file.size)}
          size="small"
          variant="outlined"
        />
        <Chip
          label={`${file.downloads} downloads`}
          size="small"
          variant="outlined"
        />
      </Box>
      <Typography
        variant="body2"
        color="text.secondary"
        sx={{ mb: 1 }}
      >
        {file.type}
      </Typography>
    </>
  )
}
