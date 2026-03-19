import { Box, Typography, Button, Paper, Divider } from '@mui/material'
import { PlayArrowOutlined, EditOutlined } from '@mui/icons-material'
import CodeResult from './CodeResult'
import type { CodeSnippetData } from '@/hooks/useCodeAlbum'

interface CodeSnippetProps {
  snippet: CodeSnippetData
}

export default function CodeSnippet({ snippet }: CodeSnippetProps) {
  return (
    <Paper variant="outlined" sx={{ borderColor: 'divider', overflow: 'hidden' }}>
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          px: 3,
          py: 2,
          bgcolor: 'background.default',
        }}
      >
        <Typography variant="h5" component="h2">
          {snippet.title}
        </Typography>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button variant="contained" size="small" startIcon={<PlayArrowOutlined />} color="success">
            Run
          </Button>
          <Button variant="outlined" size="small" startIcon={<EditOutlined />}>
            Edit
          </Button>
        </Box>
      </Box>
      <Divider />
      <Box
        component="pre"
        sx={{
          m: 0,
          p: 3,
          bgcolor: '#1e293b',
          color: '#e2e8f0',
          fontFamily: '"Fira Code", "JetBrains Mono", "Cascadia Code", monospace',
          fontSize: '0.875rem',
          lineHeight: 1.7,
          overflow: 'auto',
          whiteSpace: 'pre',
        }}
      >
        <code>{snippet.code}</code>
      </Box>
      {snippet.result && <CodeResult result={snippet.result} />}
    </Paper>
  )
}
