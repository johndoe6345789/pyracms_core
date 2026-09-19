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
}

export interface RunResult {
  stdout: string
  stderr: string
  exitCode: number
  executionTime?: number
}

const RUNNABLE = [
  'python', 'javascript', 'cpp', 'rust', 'go',
  'java', 'ruby',
]

export const isRunnable = (language: string) =>
  RUNNABLE.includes(language)

const LANGUAGE_COLORS: Record<string, string> = {
  python: '#3572A5',
  javascript: '#f1e05a',
  typescript: '#2b7489',
  cpp: '#f34b7d',
  rust: '#dea584',
  go: '#00ADD8',
  java: '#b07219',
  ruby: '#701516',
}

export const langColor = (language: string) =>
  LANGUAGE_COLORS[language] ?? '#6e7681'

export function mapSnippet(
  s: Record<string, unknown>,
): Snippet {
  const created = String(s.createdAt ?? '')
  return {
    id: String(s.id),
    title: String(s.title ?? ''),
    language: String(s.language ?? 'plaintext'),
    code: String(s.code ?? ''),
    author: String(s.authorUsername || 'Unknown'),
    authorId: Number(s.authorId ?? 0),
    date: created.split('T')[0] ?? '',
    runCount: Number(s.runCount ?? 0),
    forkedFrom: Number(s.forkedFrom ?? 0),
    visibility: String(s.visibility ?? 'public'),
  }
}

export function mapRunResult(
  d: Record<string, unknown>,
): RunResult {
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
    ...(time != null
      ? { executionTime: Number(time) } : {}),
  }
}
