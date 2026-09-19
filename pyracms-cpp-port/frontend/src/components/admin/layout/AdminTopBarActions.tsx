import Link from 'next/link'
import { Box, Button } from '@mui/material'
import { ArrowBackOutlined } from '@mui/icons-material'
import NotificationBell
  from '@/components/common/NotificationBell'
import ThemeToggle
  from '@/components/common/ThemeToggle'
import LanguageSelect
  from '@/components/common/LanguageSelect'
import UserBubble
  from '@/components/common/UserBubble'

export default function AdminTopBarActions({
  slug,
}: {
  slug: string
}) {
  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        gap: { xs: 0.5, md: 1 },
      }}
    >
      <LanguageSelect />
      <ThemeToggle />
      <NotificationBell />
      <UserBubble />
      <Button
        component={Link}
        href={`/site/${slug}`}
        startIcon={<ArrowBackOutlined />}
        data-testid="admin-site-link"
        sx={{ color: 'text.secondary', ml: 1 }}
      >
        Site
      </Button>
    </Box>
  )
}
