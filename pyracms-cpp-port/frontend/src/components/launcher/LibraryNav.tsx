'use client'

import type { ReactNode } from 'react'
import { Box, Drawer } from '@mui/material'

interface Props {
  mobile: boolean
  drawer: boolean
  onCloseDrawer: () => void
  sidebar: ReactNode
}

/** Fixed sidebar on desktop; slide-in drawer on mobile. */
export default function LibraryNav({
  mobile,
  drawer,
  onCloseDrawer,
  sidebar,
}: Props) {
  return (
    <>
      {!mobile && (
        <Box
          sx={{
            width: 280,
            flexShrink: 0,
            bgcolor: '#1b2838',
            borderRight: '1px solid #2a475e',
          }}
        >
          {sidebar}
        </Box>
      )}
      <Drawer open={drawer} onClose={onCloseDrawer}>
        <Box sx={{ width: 300, height: '100%' }}>{sidebar}</Box>
      </Drawer>
    </>
  )
}
