const h = (fs: string, mt: number, mb: number, fw = 600) => ({
  fontSize: fs,
  fontWeight: fw,
  mt,
  mb,
})

export const MARKDOWN_STYLES = {
  '& h1': h('2rem', 3, 1, 700),
  '& h2': h('1.5rem', 2, 1),
  '& h3': h('1.25rem', 2, 1),
  '& p': { mb: 2, lineHeight: 1.8 },
  '& ul, & ol': { pl: 3, mb: 2 },
  '& blockquote': {
    borderLeft: '3px solid',
    borderColor: 'divider',
    pl: 2,
    ml: 0,
    color: 'text.secondary',
  },
  '& pre': {
    bgcolor: '#1e293b',
    color: '#e2e8f0',
    p: 2,
    borderRadius: 1,
    overflow: 'auto',
  },
  '& code': {
    bgcolor: '#f1f5f9',
    px: 0.5,
    borderRadius: 0.5,
    fontSize: '0.875rem',
  },
  '& pre code': { bgcolor: 'transparent', p: 0 },
  '& table': {
    borderCollapse: 'collapse',
    width: '100%',
    mb: 2,
  },
  '& th, & td': {
    border: '1px solid',
    borderColor: 'divider',
    px: 2,
    py: 1,
  },
  '& th': { bgcolor: 'background.default', fontWeight: 600 },
  '& img': { maxWidth: '100%', height: 'auto' },
  '& input[type="checkbox"]': { mr: 1 },
}

const MONO_FONT = '"Fira Code","JetBrains Mono", monospace'

export const fieldSx = {
  '& .MuiOutlinedInput-notchedOutline': { border: 'none' },
  '& .MuiInputBase-input': {
    fontFamily: MONO_FONT,
    fontSize: '0.875rem',
    lineHeight: 1.7,
  },
}

export const frameSx = {
  border: 1,
  borderColor: 'divider',
  borderRadius: 1,
  overflow: 'hidden',
}
