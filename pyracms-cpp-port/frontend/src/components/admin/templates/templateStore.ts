import { DEFAULT_TEMPLATES, type Templates } from './defaultTemplates'

export const TEMPLATES_KEY = 'site_templates'

/** Parses saved templates; unknown sections and non-text are dropped. */
export function parseTemplates(raw: string): Templates | null {
  try {
    const j = JSON.parse(raw)
    if (!j || typeof j !== 'object') return null
    const out = { ...DEFAULT_TEMPLATES }
    for (const k of Object.keys(out) as (keyof Templates)[]) {
      if (typeof j[k] === 'string') out[k] = j[k]
    }
    return out
  } catch {
    return null
  }
}
