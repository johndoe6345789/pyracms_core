import { useState } from 'react'
import { Box, Button, Typography, Snackbar } from '@mui/material'
import type { Binary, Revision } from '@/hooks/useGameDepDetail'
import { deepLink, detectOs, pickBinary } from '@/lib/launcher'
import {
  actionState, MSG_WITH_BINARY, MSG_NO_BINARY,
} from './gameActionState'
import PrimaryActionButton from './PrimaryActionButton'
import VersionSelect from './VersionSelect'
import { safeHref } from '@/lib/safeUrl'

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
  const st = actionState(p.revisions, p.installedVersion)
  const [version, setVersion] = useState(st.latest)
  const [msg, setMsg] = useState('')
  const chosen = version || st.latest
  const bin = pickBinary(p.binaries, detectOs())

  const run = () => {
    const kind = st.isInstalled && !st.needsUpdate ? 'launch' : 'install'
    window.location.href = deepLink(kind, p.slug, p.name)
    const dl = bin && safeHref(bin.url)
    if (dl) window.setTimeout(() => { window.location.href = dl }, 1500)
    p.onInstalled(chosen)
    setMsg(bin ? MSG_WITH_BINARY : MSG_NO_BINARY)
  }

  return (
    <Box data-testid="game-actions">
      <Box sx={{ display: 'flex', gap: 1.5, alignItems: 'center',
        flexWrap: 'wrap' }}>
        <PrimaryActionButton
          label={st.label} disabled={!chosen} onClick={run} />
        {st.versions.length > 0 && (
          <VersionSelect
            versions={st.versions} value={chosen} onChange={setVersion} />
        )}
        {st.isInstalled && (
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
