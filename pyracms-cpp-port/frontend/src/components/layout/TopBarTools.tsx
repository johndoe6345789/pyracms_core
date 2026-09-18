import { Box, Divider } from '@mui/material'
import { GlobalSearch } from '@/components/common/GlobalSearch'
import UserBubble from '@/components/common/UserBubble'
import NotificationBell from '@/components/common/NotificationBell'
import ThemeToggle from '@/components/common/ThemeToggle'
import LanguageSelect from '@/components/common/LanguageSelect'

/** Search, language, theme, notifications and the user bubble. */
export default function TopBarTools() {
  return (
    <Box
      sx={{ display: 'flex', alignItems: 'center', gap: { xs: 0.5, md: 1 } }}
    >
      <Box sx={{ display: { xs: 'none', md: 'block' } }}>
        <GlobalSearch />
      </Box>
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
