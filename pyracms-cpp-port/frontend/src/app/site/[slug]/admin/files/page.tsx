'use client'

import { Typography, Box } from '@mui/material'
import { useFileManager } from '@/hooks/useFileManager'
import { useTenantId } from '@/hooks/useTenantId'
import { useParams } from 'next/navigation'
import UploadDropzone from '@/components/admin/UploadDropzone'
import FileGrid from '@/components/admin/FileGrid'
import ConfirmDialog from '@/components/admin/ConfirmDialog'

export default function AdminFilesPage() {
  const params = useParams()
  const slug = params.slug as string
  const { tenantId } = useTenantId(slug)
  const {
    files, deleteDialogOpen, selectedFile, dragOver,
    handleDeleteClick, handleDeleteConfirm, handleDeleteCancel,
    handleDragOver, handleDragLeave, handleDrop,
  } = useFileManager(tenantId)

  return (
    <Box>
      <Typography variant="h3" sx={{ mb: 1 }}>File Manager</Typography>
      <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
        Upload and manage files across the platform.
      </Typography>
      <UploadDropzone
        dragOver={dragOver} onDragOver={handleDragOver}
        onDragLeave={handleDragLeave} onDrop={handleDrop}
      />
      <FileGrid files={files} onDelete={handleDeleteClick} />
      <ConfirmDialog
        open={deleteDialogOpen}
        title="Delete File"
        message={`Are you sure you want to delete "${selectedFile?.name}"? This action cannot be undone.`}
        onConfirm={handleDeleteConfirm}
        onCancel={handleDeleteCancel}
      />
    </Box>
  )
}
