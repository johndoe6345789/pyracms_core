import { Link as LinkIcon, Image as ImageIcon } from '@mui/icons-material'
import type { Editor } from '@tiptap/react'
import type { RichToolbarItem } from './richTextToolbarItems'

export function getInsertItems(editor: Editor): RichToolbarItem[] {
  return [
    {
      icon: <LinkIcon />,
      label: 'Link',
      action: () => {
        const url = window.prompt('Enter URL:')
        if (url) editor.chain().focus().setLink({ href: url }).run()
      },
      active: editor.isActive('link'),
    },
    {
      icon: <ImageIcon />,
      label: 'Image',
      action: () => {
        const url = window.prompt('Enter image URL:')
        if (url) editor.chain().focus().setImage({ src: url }).run()
      },
      active: false,
    },
  ]
}
