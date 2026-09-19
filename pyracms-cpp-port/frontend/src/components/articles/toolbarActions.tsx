import {
  FormatBold,
  FormatItalic,
  Code,
  FormatQuote,
  Link as LinkIcon,
} from '@mui/icons-material'
import type { ToolbarAction } from './EditorToolbar'
import { MARKDOWN_ACTIONS } from './markdownActions'
import { HTML_ACTIONS } from './htmlActions'

const BBCODE_ACTIONS: ToolbarAction[] = [
  { icon: <FormatBold />, label: 'Bold', prefix: '[b]', suffix: '[/b]' },
  { icon: <FormatItalic />, label: 'Italic', prefix: '[i]', suffix: '[/i]' },
  {
    icon: <LinkIcon />,
    label: 'Link',
    prefix: '[url=',
    suffix: ']link text[/url]',
  },
  { icon: <Code />, label: 'Code', prefix: '[code]', suffix: '[/code]' },
  {
    icon: <FormatQuote />,
    label: 'Quote',
    prefix: '[quote]',
    suffix: '[/quote]',
  },
]

export function getToolbarActions(language: string): ToolbarAction[] {
  const l = language.toLowerCase()
  if (l === 'markdown') return MARKDOWN_ACTIONS
  if (l === 'html') return HTML_ACTIONS
  return BBCODE_ACTIONS
}

export function getMarkdownActions() {
  return MARKDOWN_ACTIONS
}
