import { renderBBCode } from '@/components/articles/bbcodeRenderer'
import { renderBlocks } from './rst/rstBlocks'
import { rendererToApi } from './renderers'

/** reStructuredText -> HTML. Text is escaped; sanitise before displaying. */
export function renderRst(source: string): string {
  return renderBlocks(source.replace(/\r\n?/g, '\n').split('\n'))
}

/**
 * The HTML for an article or preview whose renderer is not Markdown
 * (Markdown has its own component). `renderer` may be an editor label or
 * an API name. Callers must still sanitise the result.
 */
export function renderContentHtml(content: string, renderer: string): string {
  switch (rendererToApi(renderer)) {
    case 'restructuredtext':
      return renderRst(content)
    case 'bbcode':
      return renderBBCode(content)
    default:
      return content
  }
}
