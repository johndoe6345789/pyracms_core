import {
  Box,
  Typography,
  Divider,
} from '@mui/material'

interface CodeResultProps {
  result: string
}

export default function CodeResult(
  { result }: CodeResultProps,
) {
  return (
    <>
      <Divider />
      <Box
        sx={{
          px: 3,
          py: 1,
          bgcolor: '#f0fdf4',
          borderTop: '2px solid',
          borderColor: '#86efac',
        }}
        data-testid="code-result-header"
      >
        <Typography
          variant="caption"
          sx={{
            color: '#166534',
            fontWeight: 600,
            textTransform:
              'uppercase',
            letterSpacing: '0.05em',
          }}
        >
          Output
        </Typography>
      </Box>
      <Box
        component="pre"
        data-testid="code-result-output"
        sx={{
          m: 0,
          px: 3,
          py: 2,
          bgcolor: '#f0fdf4',
          color: '#166534',
          fontFamily:
            '"Fira Code", '
            + '"JetBrains Mono", '
            + '"Cascadia Code", '
            + 'monospace',
          fontSize: '0.875rem',
          lineHeight: 1.7,
          overflow: 'auto',
          whiteSpace: 'pre',
        }}
      >
        <code>{result}</code>
      </Box>
    </>
  )
}
