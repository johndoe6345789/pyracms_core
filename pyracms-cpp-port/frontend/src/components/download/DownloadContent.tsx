'use client'

import { Box, Container, Typography } from '@mui/material'
import { useLauncherRelease, usePlatform } from '@/hooks/useLauncherRelease'
import DownloadHero from './DownloadHero'
import InstallNotes from './InstallNotes'
import PlatformTable from './PlatformTable'

/** Body of /download and /site/[slug]/download. */
export default function DownloadContent() {
  const state = useLauncherRelease()
  const platform = usePlatform()
  return (
    <Container maxWidth="md" sx={{ py: 4 }} data-testid="download-page">
      <Typography variant="h3" component="h1" gutterBottom>
        Get Hypernucleus
      </Typography>
      <Typography sx={{ mb: 3 }} color="text.secondary">
        Hypernucleus is the Qt 6 desktop launcher that installs and starts
        games from PyraCMS sites. Builds come from GitHub Releases.
      </Typography>
      <Box sx={{ mb: 4 }}>
        <DownloadHero state={state} platform={platform} />
      </Box>
      {state.status === 'ready' && state.release.assets.length > 0 && (
        <Box sx={{ mb: 4 }}><PlatformTable release={state.release} /></Box>
      )}
      <InstallNotes />
    </Container>
  )
}
