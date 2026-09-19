export type TurboParse =
  { ok: true; user: string; pass: string } | { ok: false; error: string }

const MAX_LEN = 4096

/** Validates the clipboard text copied from Vault as a Turbologin. */
export function parseTurbologin(raw: string): TurboParse {
  if (!raw.trim()) {
    return {
      ok: false,
      error: 'Clipboard is empty. Copy a Turbologin from Vault first.',
    }
  }
  let data: Record<string, unknown>
  try {
    if (raw.length > MAX_LEN) throw new Error('too large')
    data = JSON.parse(raw)
    if (!data || typeof data !== 'object' || Array.isArray(data)) {
      throw new Error('not an object')
    }
  } catch {
    return {
      ok: false,
      error: 'Clipboard does not contain valid Turbologin JSON.',
    }
  }
  if (
    typeof data.user !== 'string' ||
    typeof data.pass !== 'string' ||
    !data.user ||
    !data.pass ||
    data.user.length > 320 ||
    data.pass.length > 1024
  ) {
    return {
      ok: false,
      error: 'Clipboard JSON is missing required fields (user, pass).',
    }
  }
  return { ok: true, user: data.user, pass: data.pass }
}

export const CLIPBOARD_DENIED =
  'Could not read clipboard. Please allow clipboard access and try again.'
