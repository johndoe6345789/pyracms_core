/** Which languages the sandbox can run, and their badge colours. */
const RUNNABLE = [
  'python',
  'javascript',
  'c',
  'cpp',
  'rust',
  'go',
  'java',
  'ruby',
]

export const isRunnable = (language: string) => RUNNABLE.includes(language)

const LANGUAGE_COLORS: Record<string, string> = {
  python: '#3572A5',
  javascript: '#f1e05a',
  typescript: '#2b7489',
  c: '#555555',
  cpp: '#f34b7d',
  rust: '#dea584',
  go: '#00ADD8',
  java: '#b07219',
  ruby: '#701516',
}

export const langColor = (language: string) =>
  LANGUAGE_COLORS[language] ?? '#6e7681'
