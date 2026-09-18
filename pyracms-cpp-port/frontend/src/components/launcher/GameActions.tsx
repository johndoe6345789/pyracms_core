import { useState } from 'react'
import {
  Box, Button, MenuItem, Select, Typography, Snackbar,
} from '@mui/material'
import {
  PlayArrow, DownloadOutlined, UpdateOutlined,
} from '@mui/icons-material'
import type { Binary, Revision } from '@/hooks/useGameDepDetail'
import { deepLink, detectOs, pickBinary } from '@/lib/launcher'

interface Props {
  slug: string
  name: string
  revisions: Revision[]
  binaries: Binary[]
  installedVersion: string | undefined
  onInstalled: (version: string) => void
  onUninstall: () => void
}

/** Primary action. Deep link first; binary download as the fallback. */
export default function GameActions(p: Props) {
  const published = p.revisions.filter((r) => r.published)
  const versions = published.length ? published : p.revisions
  const latest = versions[0]?.version ?? ''
  const [version, setVersion] = useState(latest)
  const [msg, setMsg] = useState('')
  const chosen = version || latest
  const isInstalled = !!p.installedVersion
  const needsUpdate = isInstalled && p.installedVersion !== latest
  const bin = pickBinary(p.binaries, detectOs())

  const run = () => {
    const kind = isInstalled && !needsUpdate ? 'launch' : 'install'
    window.location.href = deepLink(kind, p.slug, p.name)
    if (bin) window.setTimeout(() => { window.location.href = bin.url }, 1500)
    p.onInstalled(chosen)
    setMsg(bin
      ? 'Opening the PyraCMS desktop client; downloading the build for ' +
        'your OS in case it is not installed.'
      : 'Asked the PyraCMS desktop client to handle this. If nothing ' +
        'opened, install the client.')
  }

  const label = !isInstalled ? 'Install' : needsUpdate ? 'Update' : 'Play'
  const Icon = !isInstalled ? DownloadOutlined
    : needsUpdate ? UpdateOutlined : PlayArrow

  return (
    <Box data-testid="game-actions">
      <Box sx={{ display: 'flex', gap: 1.5, alignItems: 'center',
        flexWrap: 'wrap' }}>
        <Button variant="contained" size="large" startIcon={<Icon />}
          onClick={run} disabled={!chosen}
          data-testid="primary-action"
          sx={{ px: 5, bgcolor: needsUpdate ? '#1a9fff' : '#5ba32b',
            '&:hover': { bgcolor: needsUpdate ? '#1387e0' : '#4a8a22' } }}>
          {label}
        </Button>
        {versions.length > 0 && (
          <Select size="small" value={chosen}
            onChange={(e) => setVersion(String(e.target.value))}
            inputProps={{ 'aria-label': 'Version' }}>
            {versions.map((r) => (
              <MenuItem key={r.version} value={r.version}>
                v{r.version}
              </MenuItem>
            ))}
          </Select>
        )}
        {isInstalled && (
          <Button size="small" onClick={p.onUninstall}>Clear mark</Button>
        )}
      </Box>
      <Typography variant="caption" color="text.secondary"
        sx={{ display: 'block', mt: 1 }}>
        Play/Install open the PyraCMS desktop client through a pyracms://
        link; a browser cannot run games itself. &quot;Installed&quot; is
        only remembered in this browser and is not verified.
      </Typography>
      <Snackbar open={!!msg} autoHideDuration={6000} message={msg}
        onClose={() => setMsg('')} />
    </Box>
  )
}
