/**
 * The editor shows friendly renderer labels; the API knows them by their
 * own names (`restructuredtext`, with `rst` accepted as a short alias).
 * One mapping, used for both directions so create, edit and load agree.
 */
export const RENDERER_LABELS = [
  'HTML',
  'Markdown',
  'BBCode',
  'reStructuredText',
]

const API_NAMES: Record<string, string> = {
  html: 'html',
  markdown: 'markdown',
  bbcode: 'bbcode',
  rst: 'restructuredtext',
  restructuredtext: 'restructuredtext',
}

/** Editor label (or API name) -> the name the API accepts. */
export function rendererToApi(label: string): string {
  const key = label.toLowerCase()
  return API_NAMES[key] ?? key
}

/** API renderer name -> the editor label to select. */
export function rendererFromApi(name: string): string {
  const api = rendererToApi(name)
  return (
    RENDERER_LABELS.find((l) => rendererToApi(l) === api) ??
    api.charAt(0).toUpperCase() + api.slice(1)
  )
}
