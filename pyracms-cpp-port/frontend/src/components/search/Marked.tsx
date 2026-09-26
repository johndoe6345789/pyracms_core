import { Box } from '@mui/material'
import { alpha } from '@mui/material/styles'
import { splitMarks } from '@/lib/search/marks'

/** Text with the server's matches shown as <mark> (never as raw HTML). */
export default function Marked({ text }: { text: string }) {
  return (
    <>
      {splitMarks(text).map((p, i) =>
        p.hit ? (
          <Box
            key={i}
            component="mark"
            sx={{
              bgcolor: (t) => alpha(t.palette.primary.main, 0.22),
              color: 'inherit',
              borderRadius: '3px',
              px: '2px',
              fontWeight: 600,
            }}
          >
            {p.text}
          </Box>
        ) : (
          <span key={i}>{p.text}</span>
        ),
      )}
    </>
  )
}
