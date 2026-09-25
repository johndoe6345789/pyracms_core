import { dayOf } from './dates'
import { mapAttachment, type SnippetAttachment } from './snippetAttachments'

export type { SnippetAttachment }
export { isRunnable, langColor } from './snippetLanguages'

export interface Snippet {
  id: string
  title: string
  language: string
  code: string
  author: string
  authorId: number
  date: string
  runCount: number
  forkedFrom: number
  visibility: string
  attachments: SnippetAttachment[]
}

export interface RunResult {
  stdout: string
  stderr: string
  exitCode: number
  executionTime?: number
}

export function mapSnippet(s: Record<string, unknown>): Snippet {
  const created = String(s.createdAt ?? '')
  return {
    id: String(s.id),
    title: String(s.title ?? ''),
    language: String(s.language ?? 'plaintext'),
    code: String(s.code ?? ''),
    author: String(s.authorUsername || 'Unknown'),
    authorId: Number(s.authorId ?? 0),
    date: dayOf(created),
    runCount: Number(s.runCount ?? 0),
    forkedFrom: Number(s.forkedFrom ?? 0),
    visibility: String(s.visibility ?? 'public'),
    attachments: Array.isArray(s.attachments)
      ? s.attachments.map((a) => mapAttachment(a as Record<string, unknown>))
      : [],
  }
}

export function mapRunResult(d: Record<string, unknown>): RunResult {
  const code = Number(d.exitCode ?? 0)
  const out = String(d.output ?? d.stdout ?? '')
  const err = String(d.stderr ?? '')
  const time = d.executionTimeMs ?? d.executionTime
  return {
    // Backend merges stderr into output; surface
    // failures in the error pane.
    stdout: code === 0 ? out : '',
    stderr: code === 0 ? err : err || out,
    exitCode: code,
    ...(time != null ? { executionTime: Number(time) } : {}),
  }
}
