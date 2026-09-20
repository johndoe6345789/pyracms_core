import {
  CodeOutlined,
  EditOutlined,
  TextFieldsOutlined,
  DescriptionOutlined,
} from '@mui/icons-material'

import { rendererToApi } from '@/lib/renderers'

export type EditorMode = 'monaco' | 'wysiwyg' | 'bbcode' | 'markdown'

/** The editor that suits a renderer: what you type is what it stores. */
export function defaultModeFor(renderer: string): EditorMode {
  switch (rendererToApi(renderer)) {
    case 'html':
      return 'wysiwyg'
    case 'markdown':
      return 'markdown'
    case 'bbcode':
      return 'bbcode'
    default:
      return 'monaco'
  }
}

const INCOMPATIBLE_PAIRS: [EditorMode, EditorMode][] = [
  ['wysiwyg', 'bbcode'],
  ['bbcode', 'wysiwyg'],
  ['wysiwyg', 'markdown'],
  ['markdown', 'wysiwyg'],
]

export function isIncompatible(from: EditorMode, to: EditorMode): boolean {
  return INCOMPATIBLE_PAIRS.some(([a, b]) => a === from && b === to)
}

const ic = { mr: 0.5, fontSize: 18 }

export const MODE_INFO: Record<
  EditorMode,
  { icon: React.ReactNode; label: string }
> = {
  monaco: { icon: <CodeOutlined sx={ic} />, label: 'Monaco' },
  wysiwyg: { icon: <EditOutlined sx={ic} />, label: 'WYSIWYG' },
  bbcode: {
    icon: <TextFieldsOutlined sx={ic} />,
    label: 'BBCode',
  },
  markdown: {
    icon: <DescriptionOutlined sx={ic} />,
    label: 'Markdown',
  },
}
