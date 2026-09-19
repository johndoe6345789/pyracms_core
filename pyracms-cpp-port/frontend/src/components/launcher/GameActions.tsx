import { useState } from 'react'
import { Box, Button, Typography, Snackbar } from '@mui/material'
import type { Binary, Revision } from '@/hooks/useGameDepDetail'
import { actionState } from './gameActionState'
import PrimaryActionButton from './PrimaryActionButton'
import VersionSelect from './VersionSelect'
import GetLauncherLink from './GetLauncherLink'
import { useGamePlay } from './useGamePlay'

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
  const chosen = version || st.latest
  const { run, msg, setMsg } = useGamePlay({
    ...p,
    launch: st.isInstalled && !st.needsUpdate,
    version: chosen,
  })

  return (
    <Box data-testid="game-actions">
      <Box
        sx={{
          display: 'flex',
          gap: 1.5,
          alignItems: 'center',
          flexWrap: 'wrap',
        }}
      >
        <PrimaryActionButton
          label={st.label}
          disabled={!chosen}
          onClick={run}
        />
        {st.versions.length > 0 && (
          <VersionSelect
            versions={st.versions}
            value={chosen}
            onChange={setVersion}
          />
        )}
        {st.isInstalled && (
          <Button size="small" onClick={p.onUninstall}>
            Clear mark
          </Button>
        )}
      </Box>
      <Box sx={{ mt: 1.5 }}>
        <GetLauncherLink href={`/site/${p.slug}/download`} compact />
      </Box>
      <Typography
        variant="caption"
        color="text.secondary"
        sx={{ display: 'block', mt: 1 }}
      >
        Play/Install open the PyraCMS desktop client through a pyracms:// link;
        a browser cannot run games itself. &quot;Installed&quot; is only
        remembered in this browser and is not verified.
      </Typography>
      <Snackbar
        open={!!msg}
        autoHideDuration={6000}
        message={msg}
        onClose={() => setMsg('')}
      />
    </Box>
  )
}
