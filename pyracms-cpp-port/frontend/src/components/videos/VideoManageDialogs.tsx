'use client'

import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
} from '@mui/material'
import GalleryDeleteDialog from '@/components/gallery/GalleryDeleteDialog'
import { ErrorAlert } from '@/components/common/ErrorAlert'
import VideoTextFields from './VideoTextFields'
import VisibilitySelect from './VisibilitySelect'
import type { VideoManageState } from '@/hooks/useVideoManage'

/** Edit (title, description, visibility) and delete-confirm dialogs. */
export default function VideoManageDialogs({ m }: { m: VideoManageState }) {
  const err = <ErrorAlert error={m.error} testId="video-manage-error" />
  return (
    <>
      <Dialog
        open={m.dialog === 'edit'}
        onClose={m.close}
        fullWidth
        data-testid="video-edit-dialog"
      >
        <DialogTitle>Edit video</DialogTitle>
        <DialogContent>
          <VideoTextFields
            title={m.form.title}
            description={m.form.description}
            onTitle={(title) => m.set({ title })}
            onDescription={(description) => m.set({ description })}
          />
          <VisibilitySelect
            value={m.form.visibility}
            onChange={(visibility) => m.set({ visibility })}
          />
          {err}
        </DialogContent>
        <DialogActions>
          <Button onClick={m.close}>Cancel</Button>
          <Button
            variant="contained"
            disabled={m.busy || !m.form.title.trim()}
            onClick={m.save}
            data-testid="video-edit-save"
          >
            Save
          </Button>
        </DialogActions>
      </Dialog>
      <GalleryDeleteDialog
        open={m.dialog === 'delete'}
        noun="video"
        name={m.form.title}
        albums={false}
        busy={m.busy}
        err={err}
        onClose={m.close}
        onConfirm={m.confirmDelete}
      />
    </>
  )
}
