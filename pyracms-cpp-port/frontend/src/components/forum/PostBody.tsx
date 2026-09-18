'use client'

import { Box, Typography } from '@mui/material'

const QUOTE_RE = /\[quote=([^\]]*)\]([\s\S]*?)\[\/quote\]/g

type Part =
  | { kind: 'text'; text: string }
  | { kind: 'quote'; author: string; text: string }

function parse(content: string): Part[] {
  const parts: Part[] = []
  let last = 0
  for (const m of content.matchAll(QUOTE_RE)) {
    const at = m.index ?? 0
    if (at > last) {
      parts.push({ kind: 'text', text: content.slice(last, at) })
    }
    parts.push({ kind: 'quote', author: m[1] ?? '', text: m[2] ?? '' })
    last = at + m[0].length
  }
  if (last < content.length) {
    parts.push({ kind: 'text', text: content.slice(last) })
  }
  return parts
}

/** Renders post text, turning [quote=x]..[/quote] into blockquotes. */
export function PostBody({ content }: { content: string }) {
  return (
    <Box sx={{ mb: 2 }} data-testid="post-body">
      {parse(content).map((p, i) => p.kind === 'quote' ? (
        <Box
          key={i}
          component="blockquote"
          sx={{
            m: 0, mb: 1.5, px: 2, py: 1,
            borderLeft: 4, borderColor: 'primary.main',
            bgcolor: 'action.hover', borderRadius: 1,
          }}
        >
          <Typography variant="caption" color="text.secondary">
            {p.author} wrote:
          </Typography>
          <Typography variant="body2" sx={{ whiteSpace: 'pre-line' }}>
            {p.text.trim()}
          </Typography>
        </Box>
      ) : (
        <Typography
          key={i}
          variant="body1"
          sx={{ whiteSpace: 'pre-line', lineHeight: 1.8 }}
        >
          {p.text.trim()}
        </Typography>
      ))}
    </Box>
  )
}
