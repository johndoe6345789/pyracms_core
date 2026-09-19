/** Replaces the "@partial" before `caret` with "@username ". */
export function insertMention(
  value: string,
  caret: number,
  username: string,
): string {
  const head = value.substring(0, caret).replace(/@\w*$/, `@${username} `)
  return head + value.substring(caret)
}
