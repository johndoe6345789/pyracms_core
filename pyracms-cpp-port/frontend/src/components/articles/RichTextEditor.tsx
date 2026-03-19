'use client'

import { useEffect } from 'react'
import { Box, IconButton, Tooltip, Divider, Paper } from '@mui/material'
import {
  FormatBold,
  FormatItalic,
  FormatListBulleted,
  FormatListNumbered,
  Code,
  FormatQuote,
  Link as LinkIcon,
  Image as ImageIcon,
  Title,
} from '@mui/icons-material'
import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import TiptapLink from '@tiptap/extension-link'
import TiptapImage from '@tiptap/extension-image'

interface RichTextEditorProps {
  value: string
  onChange: (value: string) => void
}

export function RichTextEditor({ value, onChange }: RichTextEditorProps) {
  const editor = useEditor({
    extensions: [
      StarterKit,
      TiptapLink.configure({ openOnClick: false }),
      TiptapImage,
    ],
    content: value,
    onUpdate: ({ editor: e }) => {
      onChange(e.getHTML())
    },
  })

  useEffect(() => {
    if (editor && value !== editor.getHTML()) {
      editor.commands.setContent(value, false)
    }
  }, [value, editor])

  if (!editor) return null

  const toolbarItems = [
    { icon: <FormatBold />, label: 'Bold', action: () => editor.chain().focus().toggleBold().run(), active: editor.isActive('bold') },
    { icon: <FormatItalic />, label: 'Italic', action: () => editor.chain().focus().toggleItalic().run(), active: editor.isActive('italic') },
    { icon: <Title />, label: 'Heading 2', action: () => editor.chain().focus().toggleHeading({ level: 2 }).run(), active: editor.isActive('heading', { level: 2 }) },
    { icon: <Title sx={{ fontSize: 16 }} />, label: 'Heading 3', action: () => editor.chain().focus().toggleHeading({ level: 3 }).run(), active: editor.isActive('heading', { level: 3 }) },
    null, // divider
    { icon: <FormatListBulleted />, label: 'Bullet List', action: () => editor.chain().focus().toggleBulletList().run(), active: editor.isActive('bulletList') },
    { icon: <FormatListNumbered />, label: 'Ordered List', action: () => editor.chain().focus().toggleOrderedList().run(), active: editor.isActive('orderedList') },
    { icon: <Code />, label: 'Code Block', action: () => editor.chain().focus().toggleCodeBlock().run(), active: editor.isActive('codeBlock') },
    { icon: <FormatQuote />, label: 'Blockquote', action: () => editor.chain().focus().toggleBlockquote().run(), active: editor.isActive('blockquote') },
    null, // divider
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

  return (
    <Box sx={{ border: 1, borderColor: 'divider', borderRadius: 1, overflow: 'hidden' }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, px: 1, py: 0.5, bgcolor: 'background.default', borderBottom: 1, borderColor: 'divider', flexWrap: 'wrap' }}>
        {toolbarItems.map((item, idx) =>
          item === null ? (
            <Divider key={idx} orientation="vertical" flexItem sx={{ mx: 0.5 }} />
          ) : (
            <Tooltip key={item.label} title={item.label}>
              <IconButton
                size="small"
                onClick={item.action}
                color={item.active ? 'primary' : 'default'}
              >
                {item.icon}
              </IconButton>
            </Tooltip>
          )
        )}
      </Box>
      <Paper elevation={0} sx={{ borderRadius: 0 }}>
        <EditorContent
          editor={editor}
          style={{ minHeight: 300, padding: '16px' }}
        />
      </Paper>
      <style>{`
        .tiptap {
          outline: none;
          min-height: 300px;
        }
        .tiptap h2 { margin-top: 16px; margin-bottom: 8px; font-weight: 600; font-size: 1.5rem; }
        .tiptap h3 { margin-top: 12px; margin-bottom: 6px; font-weight: 600; font-size: 1.25rem; }
        .tiptap p { margin-bottom: 12px; line-height: 1.8; }
        .tiptap ul, .tiptap ol { padding-left: 24px; margin-bottom: 12px; }
        .tiptap blockquote { border-left: 3px solid #ccc; padding-left: 16px; margin: 12px 0; color: #666; }
        .tiptap pre { background: #1e293b; color: #e2e8f0; padding: 16px; border-radius: 4px; overflow: auto; }
        .tiptap code { background: #f1f5f9; padding: 2px 4px; border-radius: 2px; font-size: 0.875rem; }
        .tiptap pre code { background: none; padding: 0; }
        .tiptap img { max-width: 100%; height: auto; border-radius: 4px; }
      `}</style>
    </Box>
  )
}
