import { Box, List, Typography } from '@mui/material'
import DrawerNavItem from './DrawerNavItem'
import { isActive, type NavSection } from './navTypes'

interface Props {
  section: NavSection
  index: number
  pathname: string
  onClose: () => void
}

/** A titled group of destinations. */
export default function DrawerSection({
  section,
  index,
  pathname,
  onClose,
}: Props) {
  return (
    <Box
      component="nav"
      aria-label={section.title ?? 'Navigation'}
      sx={{ px: 1.5, py: 0.5 }}
    >
      {section.title && (
        <Typography
          variant="overline"
          color="text.secondary"
          sx={{ px: 1.5, fontWeight: 700, letterSpacing: '.08em' }}
        >
          {section.title}
        </Typography>
      )}
      <List
        disablePadding
        data-testid={index === 0 ? 'drawer-nav-list' : undefined}
      >
        {section.items.map((item) => (
          <DrawerNavItem
            key={item.key}
            item={item}
            active={isActive(pathname, item)}
            onClose={onClose}
          />
        ))}
      </List>
    </Box>
  )
}
