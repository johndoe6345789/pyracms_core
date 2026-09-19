import { Alert, Box, Button, Typography } from '@mui/material'
import { DownloadOutlined } from '@mui/icons-material'
import type { ReleaseState } from '@/hooks/useLauncherRelease'
import type { Platform } from '@/lib/platform'
import { ARCH_LABEL, OS_LABEL, formatSize, pickAsset } from '@/lib/release'
import { releasesUrl } from '@/lib/repo'

interface Props {
  state: ReleaseState
  platform: Platform
}

const NONE =
  'No launcher release could be loaded (none published yet, ' +
  'or GitHub is unreachable / rate-limited).'
const EMPTY = 'This release has no launcher binaries yet.'

/** Primary download button, or an honest fallback to the Releases page. */
export default function DownloadHero({ state, platform }: Props) {
  if (state.status === 'loading') {
    return (
      <Typography data-testid="dl-loading">
        Checking for the latest release...
      </Typography>
    )
  }
  const rel = state.status === 'ready' ? state.release : null
  if (!rel || rel.assets.length === 0) {
    return (
      <Alert
        severity="info"
        data-testid="dl-fallback"
        action={
          <Button
            color="inherit"
            size="small"
            href={releasesUrl()}
            target="_blank"
            rel="noopener noreferrer"
          >
            Releases
          </Button>
        }
      >
        {rel ? EMPTY : NONE}
      </Alert>
    )
  }
  const asset = pickAsset(rel.assets, platform.os, platform.arch)
  return (
    <Box>
      {asset ? (
        <Button
          variant="contained"
          size="large"
          href={asset.url}
          startIcon={<DownloadOutlined />}
          data-testid="dl-primary"
        >
          Download Hypernucleus for {OS_LABEL[asset.os]} (
          {ARCH_LABEL[asset.arch]})
        </Button>
      ) : (
        <Typography data-testid="dl-no-match">
          We could not detect your system; pick a build below.
        </Typography>
      )}
      <Typography
        variant="caption"
        color="text.secondary"
        sx={{ display: 'block', mt: 1 }}
      >
        {rel.name} ({rel.tag}){asset ? ` - ${formatSize(asset.size)}` : ''}
        {rel.prerelease ? ' - pre-release' : ''}
      </Typography>
    </Box>
  )
}
