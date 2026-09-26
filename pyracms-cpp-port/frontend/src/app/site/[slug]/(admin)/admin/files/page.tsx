'use client'

import { Box } from '@mui/material'
import { useFileManager } from '@/hooks/useFileManager'
import { useTenantId } from '@/hooks/useTenantId'
import { useState } from 'react'
import { useParams } from 'next/navigation'
import UploadDropzone from '@/components/admin/UploadDropzone'
import FileGrid from '@/components/admin/FileGrid'
import FilesHeader from '@/components/admin/FilesHeader'
import { ErrorAlert } from '@/components/common/ErrorAlert'
import ConfirmDialog from '@/components/admin/ConfirmDialog'
import FolderControls from '@/components/admin/FolderControls'
import MoveFileDialog from '@/components/admin/MoveFileDialog'
import type { FileItem } from '@/hooks/useFileManager'

export default function AdminFilesPage() {
  const params = useParams()
  const slug = params.slug as string
  const { tenantId } = useTenantId(slug)
  const {
    files,
    error,
    deleteDialogOpen,
    selectedFile,
    dragOver,
    handleDeleteClick,
    handleDeleteConfirm,
    handleDeleteCancel,
    handleDragOver,
    handleDragLeave,
    handleDrop,
    uploadFiles,
    setVisibility,
    dirs,
  } = useFileManager(tenantId)
  const [moving, setMoving] = useState<FileItem | null>(null)

  return (
    <Box data-testid="admin-files-page">
      <FilesHeader />
      <ErrorAlert error={error} testId="files-error" />
      <FolderControls dirs={dirs} />
      <UploadDropzone
        dragOver={dragOver}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onFilesSelected={uploadFiles}
      />
      <FileGrid
        files={files}
        onDelete={handleDeleteClick}
        onMove={setMoving}
        onVisibility={setVisibility}
      />
      <MoveFileDialog
        key={moving?.uuid ?? 'none'}
        file={moving}
        folders={dirs.folders}
        onClose={() => setMoving(null)}
        onMove={(f, to) => dirs.move(f.uuid, to)}
      />
      <ConfirmDialog
        open={deleteDialogOpen}
        title="Delete File"
        message={
          'Are you sure you want to' +
          ' delete "' +
          selectedFile?.name +
          '"? This action cannot' +
          ' be undone.'
        }
        onConfirm={handleDeleteConfirm}
        onCancel={handleDeleteCancel}
      />
    </Box>
  )
}
