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
