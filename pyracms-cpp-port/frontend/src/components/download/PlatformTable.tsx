import {
  Link as MuiLink, Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, Typography,
} from '@mui/material'
import {
  ARCH_LABEL, OS_LABEL, formatSize, type LauncherRelease,
} from '@/lib/release'

const mono = { fontFamily: 'monospace', fontSize: 12, wordBreak: 'break-all' }

/** Every published build with size and SHA-256 (when GitHub reports it). */
export default function PlatformTable(
  { release }: { release: LauncherRelease },
) {
  return (
    <TableContainer data-testid="dl-table">
      <Table size="small" aria-label="All Hypernucleus downloads">
        <TableHead>
          <TableRow>
            <TableCell>Platform</TableCell>
            <TableCell>Architecture</TableCell>
            <TableCell>Size</TableCell>
            <TableCell>SHA-256</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {release.assets.map((a) => (
            <TableRow key={a.name} data-testid={`dl-row-${a.os}-${a.arch}`}>
              <TableCell>
                <MuiLink href={a.url}>{OS_LABEL[a.os]}</MuiLink>
              </TableCell>
              <TableCell>{ARCH_LABEL[a.arch]}</TableCell>
              <TableCell>{formatSize(a.size)}</TableCell>
              <TableCell sx={mono}>{a.sha256 ?? 'see SHA256SUMS'}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      {release.sumsUrl && (
        <Typography variant="caption">
          Verify downloads against{' '}
          <MuiLink href={release.sumsUrl}>SHA256SUMS</MuiLink>.
        </Typography>
      )}
    </TableContainer>
  )
}
