'use client'

import { Container, Box } from '@mui/material'
import CreateSiteButton from './CreateSiteButton'
import HeroBackdrop from './HeroBackdrop'
import HeroContent from './HeroContent'
import HeroLauncherButton from './HeroLauncherButton'
import ForkRibbon from '@/components/common/ForkRibbon'

const bgSx = {
  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 50%, #f093fb 100%)',
  position: 'relative',
  overflow: 'hidden',
  py: { xs: 8, md: 12 },
} as const

const colSx = {
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  textAlign: 'center',
} as const

export default function HeroSection() {
  return (
    <Box sx={bgSx}>
      <HeroBackdrop />
      <ForkRibbon />
      <Container maxWidth="lg" sx={{ position: 'relative', zIndex: 1 }}>
        <Box sx={colSx}>
          <HeroContent />
          <CreateSiteButton />
          <HeroLauncherButton />
        </Box>
      </Container>
    </Box>
  )
}
