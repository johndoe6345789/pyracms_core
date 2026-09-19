export const monacoMock = () => {
  const React = require('react')
  return {
    __esModule: true,
    default: (p: {
      value: string
      onChange: (v?: string) => void
      options: { readOnly: boolean }
    }) =>
      React.createElement('textarea', {
        'data-testid': 'monaco',
        value: p.value,
        readOnly: p.options.readOnly,
        onChange: (e: { target: { value: string } }) =>
          p.onChange(e.target.value),
      }),
  }
}
