import {
  FormatBold, FormatItalic,
  FormatListBulleted, FormatListNumbered,
  Code, FormatQuote,
  Link as LinkIcon, Image as ImageIcon,
  Title,
} from '@mui/icons-material'
import type { Editor } from '@tiptap/react'

export interface RichToolbarItem {
  icon: React.ReactNode
  label: string
  action: () => void
  active: boolean
}

export function getRichToolbarItems(
  editor: Editor,
): (RichToolbarItem | null)[] {
  return [
    { icon: <FormatBold />, label: 'Bold',
      action: () => editor.chain()
        .focus().toggleBold().run(),
      active: editor.isActive('bold') },
    { icon: <FormatItalic />, label: 'Italic',
      action: () => editor.chain()
        .focus().toggleItalic().run(),
      active: editor.isActive('italic') },
    { icon: <Title />, label: 'Heading 2',
      action: () => editor.chain()
        .focus().toggleHeading({ level: 2 })
        .run(),
      active: editor.isActive(
        'heading', { level: 2 }) },
    { icon: <Title sx={{ fontSize: 16 }} />,
      label: 'Heading 3',
      action: () => editor.chain()
        .focus().toggleHeading({ level: 3 })
        .run(),
      active: editor.isActive(
        'heading', { level: 3 }) },
    null,
    { icon: <FormatListBulleted />,
      label: 'Bullet List',
      action: () => editor.chain()
        .focus().toggleBulletList().run(),
      active: editor.isActive('bulletList') },
    { icon: <FormatListNumbered />,
      label: 'Ordered List',
      action: () => editor.chain()
        .focus().toggleOrderedList().run(),
      active: editor.isActive('orderedList') },
    { icon: <Code />, label: 'Code Block',
      action: () => editor.chain()
        .focus().toggleCodeBlock().run(),
      active: editor.isActive('codeBlock') },
    { icon: <FormatQuote />,
      label: 'Blockquote',
      action: () => editor.chain()
        .focus().toggleBlockquote().run(),
      active: editor.isActive('blockquote') },
    null,
    { icon: <LinkIcon />, label: 'Link',
      action: () => {
        const url = window.prompt('Enter URL:')
        if (url) editor.chain()
          .focus().setLink({ href: url }).run()
      },
      active: editor.isActive('link') },
    { icon: <ImageIcon />, label: 'Image',
      action: () => {
        const url = window.prompt(
          'Enter image URL:')
        if (url) editor.chain()
          .focus().setImage({ src: url }).run()
      },
      active: false },
  ]
}
