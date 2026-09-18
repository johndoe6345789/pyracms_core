/** Formats a backend timestamp as "YYYY-MM-DD HH:mm". */
export function formatForumDate(value?: string | null): string {
  if (!value) return ''
  return value.replace('T', ' ').substring(0, 16)
}
