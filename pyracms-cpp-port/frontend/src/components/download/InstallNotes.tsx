import { Box, Typography } from '@mui/material'
import { OS_LABEL, type ReleaseOs } from '@/lib/release'

const STEPS: Record<ReleaseOs, string> = {
  win:
    'The build is not code-signed, so Windows SmartScreen may warn ' +
    '"Windows protected your PC". Choose "More info", then "Run anyway".',
  mac:
    'The build is not signed or notarized, so Gatekeeper blocks the ' +
    'first launch. Open System Settings > Privacy & Security and choose ' +
    '"Open Anyway", or right-click the app and pick Open.',
  lin:
    'Make the file executable (chmod +x hypernucleus-lin-*) and run it. ' +
    'It needs the Qt 6 runtime libraries on your system.',
}

/** Per-OS install instructions and the pyracms:// deep-link explanation. */
export default function InstallNotes() {
  return (
    <Box data-testid="dl-install">
      <Typography variant="h6" component="h2" gutterBottom>
        Installing
      </Typography>
      {(Object.keys(STEPS) as ReleaseOs[]).map((os) => (
        <Typography key={os} variant="body2" sx={{ mb: 1 }}>
          <strong>{OS_LABEL[os]}:</strong> {STEPS[os]}
        </Typography>
      ))}
      <Typography variant="h6" component="h2" sx={{ mt: 3 }} gutterBottom>
        How it connects to the website
      </Typography>
      <Typography variant="body2" data-testid="dl-deeplink">
        Hypernucleus registers the pyracms:// link scheme. The Play and Install
        buttons on a site&apos;s Games page open links such as
        pyracms://install/&lt;site&gt;/&lt;game&gt; and hand them to the
        launcher; a browser cannot run games itself. If nothing happens, the
        launcher is not installed yet or has not been started once.
      </Typography>
    </Box>
  )
}
