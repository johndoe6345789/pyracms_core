export type TurboParse =
  | { ok: true; user: string; pass: string }
  | { ok: false; error: string }

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
    data = JSON.parse(raw)
  } catch {
    return {
      ok: false,
      error: 'Clipboard does not contain valid Turbologin JSON.',
    }
  }
  if (!data.user || !data.pass) {
    return {
      ok: false,
      error: 'Clipboard JSON is missing required fields (user, pass).',
    }
  }
  return { ok: true, user: String(data.user), pass: String(data.pass) }
}

export const CLIPBOARD_DENIED =
  'Could not read clipboard. Please allow clipboard access and try again.'
