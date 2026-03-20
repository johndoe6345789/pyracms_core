'use client'

import { useEffect } from 'react'
import { Box, Paper } from '@mui/material'
import {
  useEditor, EditorContent,
} from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import TiptapLink from '@tiptap/extension-link'
import TiptapImage from '@tiptap/extension-image'
import { RichTextToolbar } from './RichTextToolbar'
import { TIPTAP_STYLES } from './tiptapStyles'

interface RichTextEditorProps {
  value: string
  onChange: (value: string) => void
}

export function RichTextEditor({
  value, onChange,
}: RichTextEditorProps) {
  const editor = useEditor({
    extensions: [
      StarterKit,
      TiptapLink.configure({
        openOnClick: false }),
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

  return (
    <section aria-label="Rich text editor">
      <Box sx={{
        border: 1, borderColor: 'divider',
        borderRadius: 1, overflow: 'hidden',
      }}>
        <RichTextToolbar editor={editor} />
        <Paper
          elevation={0}
          sx={{ borderRadius: 0 }}>
          <EditorContent
            editor={editor}
            data-testid="rich-text-content"
            style={{
              minHeight: 300, padding: '16px',
            }} />
        </Paper>
        <style>{TIPTAP_STYLES}</style>
      </Box>
    </section>
  )
}
