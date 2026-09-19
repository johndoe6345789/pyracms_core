'use client'

import { Drawer, Box } from '@mui/material'
import { usePathname } from 'next/navigation'
import DrawerHeader from './DrawerHeader'
import DrawerSection from './DrawerSection'
import DrawerFooter, { type FooterAction } from './DrawerFooter'
import { drawerPaperSx } from './drawerStyles'
import type { NavSection } from './navTypes'

interface Props {
  open: boolean
  onClose: () => void
  title: string
  subtitle?: string | undefined
  sections: NavSection[]
  /** Secondary action pinned to the bottom (e.g. back to portal) */
  footer?: FooterAction
  testId?: string
}

/**
 * Burger drawer shared by the portal and every site: gradient masthead,
 * grouped destinations with an active accent, pinned footer action.
 */
export default function AppDrawer({
  open,
  onClose,
  title,
  subtitle,
  sections,
  footer,
  testId = 'tenant-drawer',
}: Props) {
  const pathname = usePathname() ?? ''
  return (
    <Drawer
      anchor="left"
      open={open}
      onClose={onClose}
      data-testid={testId}
      slotProps={{ paper: { sx: drawerPaperSx } }}
    >
      <DrawerHeader title={title} subtitle={subtitle} onClose={onClose} />
      <Box sx={{ flexGrow: 1, overflowY: 'auto', py: 1 }}>
        {sections.map((section, i) => (
          <DrawerSection
            key={section.title ?? i}
            section={section}
            index={i}
            pathname={pathname}
            onClose={onClose}
          />
        ))}
      </Box>
      {footer && <DrawerFooter footer={footer} onClose={onClose} />}
    </Drawer>
  )
}
