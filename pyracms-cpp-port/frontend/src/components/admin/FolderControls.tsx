import { useState } from 'react'
import FolderBar from './FolderBar'
import FolderTiles from './FolderTiles'
import FolderNameDialog from './FolderNameDialog'
import { childFolders } from '@/lib/folderPath'
import type { useFolders } from '@/hooks/admin/useFolders'

/** Breadcrumb, new-folder button and the open folder's sub-folders. */
export default function FolderControls({
  dirs,
}: {
  dirs: ReturnType<typeof useFolders>
}) {
  const [naming, setNaming] = useState(false)
  return (
    <>
      <FolderBar
        folder={dirs.folder}
        onOpen={dirs.setFolder}
        onNew={() => setNaming(true)}
      />
      <FolderTiles
        folders={childFolders(dirs.folders, dirs.folder)}
        onOpen={dirs.setFolder}
        onRemove={dirs.remove}
      />
      <FolderNameDialog
        open={naming}
        onClose={() => setNaming(false)}
        onCreate={dirs.create}
      />
    </>
  )
}
