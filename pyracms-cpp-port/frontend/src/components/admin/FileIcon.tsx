import type { ReactElement } from 'react'
import { Box } from '@mui/material'
import {
  AndroidOutlined,
  AudiotrackOutlined,
  CodeOutlined,
  DescriptionOutlined,
  FolderZipOutlined,
  FontDownloadOutlined,
  ImageOutlined,
  InsertDriveFileOutlined,
  MovieOutlined,
  PictureAsPdfOutlined,
  SettingsApplicationsOutlined,
  SlideshowOutlined,
  StorageOutlined,
  TableChartOutlined,
  TextSnippetOutlined,
  DrawOutlined,
} from '@mui/icons-material'
import { extensionOf, fileKind, type FileKind } from '@/lib/fileKinds'

const LOOK: Record<FileKind, [ReactElement, string]> = {
  image: [<ImageOutlined key="i" />, '#2e7d32'],
  video: [<MovieOutlined key="i" />, '#6a1b9a'],
  audio: [<AudiotrackOutlined key="i" />, '#ad1457'],
  pdf: [<PictureAsPdfOutlined key="i" />, '#c62828'],
  archive: [<FolderZipOutlined key="i" />, '#ef6c00'],
  code: [<CodeOutlined key="i" />, '#1565c0'],
  text: [<TextSnippetOutlined key="i" />, '#546e7a'],
  data: [<StorageOutlined key="i" />, '#00838f'],
  spreadsheet: [<TableChartOutlined key="i" />, '#2e7d32'],
  document: [<DescriptionOutlined key="i" />, '#1976d2'],
  presentation: [<SlideshowOutlined key="i" />, '#d84315'],
  design: [<DrawOutlined key="i" />, '#7b1fa2'],
  font: [<FontDownloadOutlined key="i" />, '#5d4037'],
  program: [<SettingsApplicationsOutlined key="i" />, '#455a64'],
  package: [<AndroidOutlined key="i" />, '#388e3c'],
  other: [<InsertDriveFileOutlined key="i" />, '#78909c'],
}

/** A coloured icon for the kind of file, with its extension underneath. */
export default function FileIcon({
  type,
  name = '',
}: {
  type: string
  name?: string
}) {
  const kind = fileKind(name, type)
  const [icon, color] = LOOK[kind]
  const ext = extensionOf(name)
  return (
    <Box
      data-testid={`file-icon-${kind}`}
      sx={{ color, textAlign: 'center', '& svg': { fontSize: 56 } }}
    >
      {icon}
      {ext && (
        <Box
          component="div"
          sx={{ fontSize: 12, fontWeight: 700, letterSpacing: 1 }}
        >
          .{ext.slice(0, 8)}
        </Box>
      )}
    </Box>
  )
}
