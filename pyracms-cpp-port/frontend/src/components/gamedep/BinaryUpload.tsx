import {
  Paper,
  Typography,
  Box,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Button,
} from '@mui/material'
import { UploadOutlined } from '@mui/icons-material'

interface BinaryUploadProps {
  selectedOs: string
  onOsChange: (v: string) => void
  selectedArch: string
  onArchChange: (v: string) => void
}

export default function BinaryUpload({
  selectedOs,
  onOsChange,
  selectedArch,
  onArchChange,
}: BinaryUploadProps) {
  return (
    <Paper variant="outlined" sx={{ p: 4, mb: 4, borderColor: 'divider' }}>
      <Typography variant="h5" gutterBottom>
        Upload Binary
      </Typography>
      <Box sx={{ display: 'flex', gap: 2, mb: 2, flexWrap: 'wrap' }}>
        <FormControl size="small" sx={{ minWidth: 160 }}>
          <InputLabel>Operating System</InputLabel>
          <Select value={selectedOs} label="Operating System" onChange={(e) => onOsChange(e.target.value)}>
            <MenuItem value="Windows">Windows</MenuItem>
            <MenuItem value="Linux">Linux</MenuItem>
            <MenuItem value="macOS">macOS</MenuItem>
          </Select>
        </FormControl>
        <FormControl size="small" sx={{ minWidth: 140 }}>
          <InputLabel>Architecture</InputLabel>
          <Select value={selectedArch} label="Architecture" onChange={(e) => onArchChange(e.target.value)}>
            <MenuItem value="x64">x64</MenuItem>
            <MenuItem value="x86">x86</MenuItem>
            <MenuItem value="arm64">arm64</MenuItem>
          </Select>
        </FormControl>
        <Button variant="outlined" startIcon={<UploadOutlined />} component="label">
          Select Binary
          <input type="file" hidden />
        </Button>
      </Box>
    </Paper>
  )
}
