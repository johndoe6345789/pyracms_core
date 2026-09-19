import {
  Typography,
  Paper,
  Box,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from '@mui/material'

interface Props {
  title: string
  heads: { label: string; right?: boolean }[]
  children: React.ReactNode
}

export default function AnalyticsPanel({ title, heads, children }: Props) {
  return (
    <Paper variant="outlined" sx={{ borderColor: 'divider' }}>
      <Box sx={{ px: 3, py: 2 }}>
        <Typography variant="h6">{title}</Typography>
      </Box>
      <TableContainer>
        <Table size="small">
          <TableHead>
            <TableRow>
              {heads.map((h) => (
                <TableCell key={h.label} align={h.right ? 'right' : 'left'}>
                  {h.label}
                </TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>{children}</TableBody>
        </Table>
      </TableContainer>
    </Paper>
  )
}
