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

export interface BBCodeBtn {
  icon: React.ReactNode
  label: string
  tag: string
  hasAttr?: boolean
  attrPrompt?: string
}

export const BUTTONS: BBCodeBtn[] = [
  { icon: <FormatBold />, label: 'Bold', tag: 'b' },
  { icon: <FormatItalic />, label: 'Italic', tag: 'i' },
  { icon: <FormatUnderlined />, label: 'Underline', tag: 'u' },
  {
    icon: <LinkIcon />,
    label: 'URL',
    tag: 'url',
    hasAttr: true,
    attrPrompt: 'Enter URL:',
  },
  { icon: <ImageIcon />, label: 'Image', tag: 'img' },
  { icon: <Code />, label: 'Code', tag: 'code' },
  { icon: <FormatQuote />, label: 'Quote', tag: 'quote' },
  { icon: <FormatListBulleted />, label: 'List', tag: 'list' },
  {
    icon: <Palette />,
    label: 'Color',
    tag: 'color',
    hasAttr: true,
    attrPrompt: 'Enter color (e.g. #ff0000):',
  },
  {
    icon: <FormatSize />,
    label: 'Size',
    tag: 'size',
    hasAttr: true,
    attrPrompt: 'Enter size (e.g. 14, 20):',
  },
]
