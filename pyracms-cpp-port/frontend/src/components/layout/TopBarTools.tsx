import { Box, Divider, IconButton, Tooltip } from '@mui/material'
import { DownloadOutlined } from '@mui/icons-material'
import Link from 'next/link'
import { GlobalSearch } from '@/components/common/GlobalSearch'
import UserBubble from '@/components/common/UserBubble'
import NotificationBell from '@/components/common/NotificationBell'
import ThemeToggle from '@/components/common/ThemeToggle'
import LanguageSelect from '@/components/common/LanguageSelect'

/** Search, language, theme, notifications and the user bubble. */
export default function TopBarTools(
  { downloadHref = '/download' }: { downloadHref?: string },
) {
  return (
    <Box
      sx={{ display: 'flex', alignItems: 'center', gap: { xs: 0.5, md: 1 } }}
    >
      <Box sx={{ display: { xs: 'none', md: 'block' } }}>
        <GlobalSearch />
      </Box>
      <Tooltip title="Get the launcher">
        <IconButton component={Link} href={downloadHref}
          aria-label="Get the launcher" data-testid="get-launcher">
          <DownloadOutlined />
        </IconButton>
      </Tooltip>
      <LanguageSelect />
      <ThemeToggle />
      <NotificationBell />
      <Divider
        orientation="vertical"
        flexItem
        sx={{ mx: 0.5, display: { xs: 'none', md: 'block' } }}
      />
      <UserBubble />
    </Box>
  )
}
