'use client'

import { Box } from '@mui/material'
import PortalShell from '@/components/layout/PortalShell'
import SiteFooter from '@/components/layout/SiteFooter'
import ForkRibbon from '@/components/common/ForkRibbon'
import DownloadContent from '@/components/download/DownloadContent'

export default function DownloadPage() {
  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'background.default' }}>
      <PortalShell />
      <Box component="main" id="main-content" sx={{ position: 'relative' }}>
        <ForkRibbon />
        <DownloadContent />
      </Box>
      <SiteFooter />
    </Box>
  )
}
