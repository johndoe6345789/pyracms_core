import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Button,
} from '@mui/material'
import { DownloadOutlined } from '@mui/icons-material'
import type { Binary } from '@/hooks/useGameDepDetail'

interface BinaryMatrixProps {
  binaries: Binary[]
}

export default function BinaryMatrix({ binaries }: BinaryMatrixProps) {
  return (
    <TableContainer component={Paper} variant="outlined">
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>Operating System</TableCell>
            <TableCell>Architecture</TableCell>
            <TableCell>Size</TableCell>
            <TableCell>Download</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {binaries.map((bin, i) => (
            <TableRow key={i}>
              <TableCell>{bin.os}</TableCell>
              <TableCell>{bin.arch}</TableCell>
              <TableCell>{bin.size}</TableCell>
              <TableCell>
                <Button
                  size="small"
                  startIcon={<DownloadOutlined />}
                  href={bin.url}
                >
                  Download
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  )
}
