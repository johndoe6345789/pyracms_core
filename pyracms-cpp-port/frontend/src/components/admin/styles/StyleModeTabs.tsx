import { Box, Button, Tab, Tabs } from '@mui/material'
import { ContentCopyOutlined } from '@mui/icons-material'
import type { ThemeMode } from './siteThemes'

interface Props {
  mode: ThemeMode
  onMode: (m: ThemeMode) => void
  onCopyToOther: () => void
}

/** Light look or dark look: each is styled (and saved) separately. */
export default function StyleModeTabs({ mode, onMode, onCopyToOther }: Props) {
  const other = mode === 'light' ? 'dark' : 'light'
  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: 1,
        mb: 2,
        borderBottom: 1,
        borderColor: 'divider',
      }}
    >
      <Tabs
        value={mode}
        onChange={(_, m: ThemeMode) => onMode(m)}
        aria-label="Which look to edit"
      >
        <Tab value="light" label="Light look" data-testid="mode-light" />
        <Tab value="dark" label="Dark look" data-testid="mode-dark" />
      </Tabs>
      <Button
        size="small"
        startIcon={<ContentCopyOutlined />}
        onClick={onCopyToOther}
        data-testid="copy-look"
      >
        Copy this look to the {other} look
      </Button>
    </Box>
  )
}
