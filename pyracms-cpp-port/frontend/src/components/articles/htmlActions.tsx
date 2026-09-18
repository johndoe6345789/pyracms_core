import {
  FormatBold, FormatItalic, Code,
  FormatQuote, Link as LinkIcon,
  Image as ImageIcon, Title,
  FormatListBulleted, FormatListNumbered,
} from '@mui/icons-material'
import type { ToolbarAction } from './EditorToolbar'

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
