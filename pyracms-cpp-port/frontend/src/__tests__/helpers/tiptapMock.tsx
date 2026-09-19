export const chain: Record<string, jest.Mock> = {}
;[
  'focus',
  'toggleBold',
  'toggleItalic',
  'toggleHeading',
  'toggleBulletList',
  'toggleOrderedList',
  'toggleCodeBlock',
  'toggleBlockquote',
  'setLink',
  'setImage',
  'run',
].forEach((k) => {
  chain[k] = jest.fn(() => chain)
})

export const editor = {
  chain: () => chain,
  isActive: jest.fn((n: string) => n === 'bold'),
  getHTML: jest.fn(() => '<p>a</p>'),
  commands: { setContent: jest.fn() },
}
export const state = {
  mockEditor: editor as unknown,
  onUpdate: (() => {}) as (a: { editor: typeof editor }) => void,
  options: {} as Record<string, unknown>,
}

export const tiptapReact = {
  useEditor: (
    o: { onUpdate: typeof state.onUpdate } & Record<string, unknown>,
  ) => {
    state.options = o
    state.onUpdate = o.onUpdate
    return state.mockEditor
  },
  EditorContent: () => <div data-testid="rich-text-content" />,
}
