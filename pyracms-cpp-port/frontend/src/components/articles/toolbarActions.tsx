import {
  FormatBold, FormatItalic, Code,
  FormatQuote, Link as LinkIcon,
  Image as ImageIcon, TableChart,
  Title, FormatListBulleted,
  FormatListNumbered,
} from '@mui/icons-material'
import type { ToolbarAction } from './EditorToolbar'

export const MARKDOWN_ACTIONS: ToolbarAction[] = [
  { icon: <FormatBold />, label: 'Bold',
    prefix: '**', suffix: '**' },
  { icon: <FormatItalic />, label: 'Italic',
    prefix: '_', suffix: '_' },
  { icon: <Title />, label: 'Heading',
    prefix: '## ', suffix: '' },
  { icon: <LinkIcon />, label: 'Link',
    prefix: '[', suffix: '](url)' },
  { icon: <ImageIcon />, label: 'Image',
    prefix: '![alt](', suffix: ')' },
  { icon: <Code />, label: 'Code',
    prefix: '```\n', suffix: '\n```' },
  { icon: <FormatListBulleted />,
    label: 'Bullet List',
    prefix: '- ', suffix: '' },
  { icon: <FormatListNumbered />,
    label: 'Numbered List',
    prefix: '1. ', suffix: '' },
  { icon: <TableChart />, label: 'Table',
    prefix: '| Header | Header |\n'
      + '|--------|--------|\n| ',
    suffix: ' | Cell |' },
  { icon: <FormatQuote />, label: 'Quote',
    prefix: '> ', suffix: '' },
]

export const HTML_ACTIONS: ToolbarAction[] = [
  { icon: <FormatBold />, label: 'Bold',
    prefix: '<strong>', suffix: '</strong>' },
  { icon: <FormatItalic />, label: 'Italic',
    prefix: '<em>', suffix: '</em>' },
  { icon: <Title />, label: 'Heading',
    prefix: '<h2>', suffix: '</h2>' },
  { icon: <LinkIcon />, label: 'Link',
    prefix: '<a href="url">', suffix: '</a>' },
  { icon: <ImageIcon />, label: 'Image',
    prefix: '<img src="',
    suffix: '" alt="" />' },
  { icon: <Code />, label: 'Code',
    prefix: '<pre><code>',
    suffix: '</code></pre>' },
  { icon: <FormatListBulleted />, label: 'List',
    prefix: '<ul>\n  <li>',
    suffix: '</li>\n</ul>' },
  { icon: <FormatListNumbered />,
    label: 'Ordered List',
    prefix: '<ol>\n  <li>',
    suffix: '</li>\n</ol>' },
  { icon: <FormatQuote />, label: 'Quote',
    prefix: '<blockquote>',
    suffix: '</blockquote>' },
]

export const BBCODE_ACTIONS: ToolbarAction[] = [
  { icon: <FormatBold />, label: 'Bold',
    prefix: '[b]', suffix: '[/b]' },
  { icon: <FormatItalic />, label: 'Italic',
    prefix: '[i]', suffix: '[/i]' },
  { icon: <LinkIcon />, label: 'Link',
    prefix: '[url=',
    suffix: ']link text[/url]' },
  { icon: <Code />, label: 'Code',
    prefix: '[code]', suffix: '[/code]' },
  { icon: <FormatQuote />, label: 'Quote',
    prefix: '[quote]', suffix: '[/quote]' },
]

export function getToolbarActions(
  language: string,
): ToolbarAction[] {
  if (language === 'markdown'
    || language === 'Markdown') {
    return MARKDOWN_ACTIONS
  }
  if (language === 'html'
    || language === 'HTML') {
    return HTML_ACTIONS
  }
  return BBCODE_ACTIONS
}

export function getMarkdownActions() {
  return MARKDOWN_ACTIONS
}
