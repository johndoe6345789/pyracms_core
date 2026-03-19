'use client'

import { useCallback, useRef } from 'react'
import { Box, Button, ButtonGroup, Paper, Typography, TextField, Divider } from '@mui/material'
import {
  FormatBold,
  FormatItalic,
  FormatUnderlined,
  Link as LinkIcon,
  Image as ImageIcon,
  Code,
  FormatQuote,
  FormatListBulleted,
  Palette,
  FormatSize,
} from '@mui/icons-material'
import DOMPurify from 'dompurify'

interface BBCodeEditorProps {
  value: string
  onChange: (value: string) => void
}

interface BBCodeButton {
  icon: React.ReactNode
  label: string
  tag: string
  hasAttr?: boolean
  attrPrompt?: string
}

const BBCODE_BUTTONS: BBCodeButton[] = [
  { icon: <FormatBold />, label: 'Bold', tag: 'b' },
  { icon: <FormatItalic />, label: 'Italic', tag: 'i' },
  { icon: <FormatUnderlined />, label: 'Underline', tag: 'u' },
  { icon: <LinkIcon />, label: 'URL', tag: 'url', hasAttr: true, attrPrompt: 'Enter URL:' },
  { icon: <ImageIcon />, label: 'Image', tag: 'img' },
  { icon: <Code />, label: 'Code', tag: 'code' },
  { icon: <FormatQuote />, label: 'Quote', tag: 'quote' },
  { icon: <FormatListBulleted />, label: 'List', tag: 'list' },
  { icon: <Palette />, label: 'Color', tag: 'color', hasAttr: true, attrPrompt: 'Enter color (e.g., red, #ff0000):' },
  { icon: <FormatSize />, label: 'Size', tag: 'size', hasAttr: true, attrPrompt: 'Enter size (e.g., 14, 20):' },
]

function renderBBCode(bbcode: string): string {
  let html = bbcode
  html = html.replace(/\[b\]([\s\S]*?)\[\/b\]/gi, '<strong>$1</strong>')
  html = html.replace(/\[i\]([\s\S]*?)\[\/i\]/gi, '<em>$1</em>')
  html = html.replace(/\[u\]([\s\S]*?)\[\/u\]/gi, '<u>$1</u>')
  html = html.replace(/\[url=([^\]]+)\]([\s\S]*?)\[\/url\]/gi, '<a href="$1">$2</a>')
  html = html.replace(/\[url\]([\s\S]*?)\[\/url\]/gi, '<a href="$1">$1</a>')
  html = html.replace(/\[img\]([\s\S]*?)\[\/img\]/gi, '<img src="$1" style="max-width:100%" />')
  html = html.replace(/\[code\]([\s\S]*?)\[\/code\]/gi, '<pre style="background:#1e293b;color:#e2e8f0;padding:12px;border-radius:4px;overflow:auto"><code>$1</code></pre>')
  html = html.replace(/\[quote\]([\s\S]*?)\[\/quote\]/gi, '<blockquote style="border-left:3px solid #ccc;padding-left:12px;margin:8px 0;color:#666">$1</blockquote>')
  html = html.replace(/\[list\]([\s\S]*?)\[\/list\]/gi, (_match, content: string) => {
    const items = content.split(/\[\*\]/).filter((s: string) => s.trim())
    return '<ul>' + items.map((item: string) => `<li>${item.trim()}</li>`).join('') + '</ul>'
  })
  html = html.replace(/\[color=([^\]]+)\]([\s\S]*?)\[\/color\]/gi, '<span style="color:$1">$2</span>')
  html = html.replace(/\[size=([^\]]+)\]([\s\S]*?)\[\/size\]/gi, '<span style="font-size:$1px">$2</span>')
  html = html.replace(/\n/g, '<br />')
  return DOMPurify.sanitize(html)
}

export function BBCodeEditor({ value, onChange }: BBCodeEditorProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  const insertTag = useCallback((tag: string, hasAttr?: boolean, attrPrompt?: string) => {
    const textarea = textareaRef.current
    if (!textarea) return

    const start = textarea.selectionStart
    const end = textarea.selectionEnd
    const selectedText = value.substring(start, end)

    let openTag: string
    const closeTag = `[/${tag}]`

    if (hasAttr && attrPrompt) {
      const attr = window.prompt(attrPrompt)
      if (attr === null) return
      openTag = `[${tag}=${attr}]`
    } else {
      openTag = `[${tag}]`
    }

    if (tag === 'list') {
      const listContent = selectedText
        ? selectedText.split('\n').map((line) => `[*]${line}`).join('\n')
        : '[*]item'
      const replacement = `${openTag}\n${listContent}\n${closeTag}`
      onChange(value.substring(0, start) + replacement + value.substring(end))
      return
    }

    const replacement = `${openTag}${selectedText || tag}${closeTag}`
    onChange(value.substring(0, start) + replacement + value.substring(end))

    setTimeout(() => {
      textarea.focus()
      const newPos = start + openTag.length + (selectedText ? selectedText.length : tag.length)
      textarea.setSelectionRange(newPos, newPos)
    }, 0)
  }, [value, onChange])

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
      <Box sx={{ border: 1, borderColor: 'divider', borderRadius: 1, overflow: 'hidden' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, px: 1, py: 0.5, bgcolor: 'background.default', borderBottom: 1, borderColor: 'divider', flexWrap: 'wrap' }}>
          <ButtonGroup variant="outlined" size="small">
            {BBCODE_BUTTONS.map((btn) => (
              <Button
                key={btn.tag}
                onClick={() => insertTag(btn.tag, btn.hasAttr, btn.attrPrompt)}
                title={btn.label}
                sx={{ minWidth: 36, px: 1 }}
              >
                {btn.icon}
              </Button>
            ))}
          </ButtonGroup>
        </Box>
        <TextField
          inputRef={textareaRef}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          fullWidth
          multiline
          minRows={12}
          maxRows={30}
          placeholder="Write your BBCode content here..."
          sx={{ '& .MuiOutlinedInput-notchedOutline': { border: 'none' } }}
        />
      </Box>

      <Paper variant="outlined" sx={{ p: 3, minHeight: 200, borderColor: 'divider' }}>
        <Typography variant="subtitle2" color="text.secondary" gutterBottom>
          Preview
        </Typography>
        <Divider sx={{ mb: 2 }} />
        {value ? (
          <Box dangerouslySetInnerHTML={{ __html: renderBBCode(value) }} sx={{ lineHeight: 1.8 }} />
        ) : (
          <Typography variant="body2" color="text.secondary">Nothing to preview yet.</Typography>
        )}
      </Paper>
    </Box>
  )
}
