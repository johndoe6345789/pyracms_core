export const LANGUAGES = [
  { value: 'python', label: 'Python' },
  { value: 'javascript', label: 'JavaScript' },
  { value: 'typescript', label: 'TypeScript' },
  { value: 'c', label: 'C' },
  { value: 'cpp', label: 'C++' },
  { value: 'rust', label: 'Rust' },
  { value: 'go', label: 'Go' },
  { value: 'java', label: 'Java' },
  { value: 'ruby', label: 'Ruby' },
  { value: 'csharp', label: 'C#' },
  { value: 'php', label: 'PHP' },
  { value: 'swift', label: 'Swift' },
  { value: 'kotlin', label: 'Kotlin' },
  { value: 'sql', label: 'SQL' },
  { value: 'html', label: 'HTML' },
  { value: 'css', label: 'CSS' },
  { value: 'shell', label: 'Shell' },
]

const has = (code: string, ...parts: string[]) =>
  parts.every((p) => code.includes(p))
const any = (code: string, ...parts: string[]) =>
  parts.some((p) => code.includes(p))

// C headers and nothing that only C++ has
const isC = (code: string) =>
  any(code, '<stdio.h>', '<stdlib.h>', '<string.h>', '<math.h>') &&
  !any(code, 'std::', 'iostream', 'using namespace', '<vector>', 'class ')

/** Best-effort guess of the language of a code sample. */
export function detectLanguage(code: string): string | null {
  if (has(code, 'def ', 'print(')) return 'python'
  if (any(code, 'function ', 'const ', '=>')) return 'javascript'
  if (isC(code)) return 'c'
  if (any(code, '#include', 'std::')) return 'cpp'
  if (has(code, 'fn ', 'let mut ')) return 'rust'
  if (has(code, 'func ', 'package ')) return 'go'
  if (any(code, 'public class', 'System.out')) return 'java'
  return null
}
