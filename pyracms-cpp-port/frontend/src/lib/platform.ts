import type { ReleaseArch, ReleaseOs } from './releaseTypes'

export interface Platform {
  os: ReleaseOs | null
  arch: ReleaseArch
}

interface UaData {
  platform?: string
  getHighEntropyValues?: (h: string[]) => Promise<Record<string, string>>
}
type Nav = { userAgent?: string; userAgentData?: UaData }

function osOf(ua: string, uaPlatform?: string): ReleaseOs | null {
  const s = `${uaPlatform ?? ''} ${ua}`
  if (/Android|iPhone|iPad|iPod|CrOS/i.test(s)) return null
  if (/Windows/i.test(s)) return 'win'
  if (/Mac OS X|Macintosh|macOS/i.test(s)) return 'mac'
  if (/Linux|X11/i.test(s)) return 'lin'
  return null
}

/** Apple GPU via WebGL (UAs hide Apple Silicon); null when unknowable. */
export function appleGpu(): boolean | null {
  try {
    const gl = document.createElement('canvas').getContext('webgl')
    const ext = gl?.getExtension('WEBGL_debug_renderer_info')
    if (!gl || !ext) return null
    return /Apple (M\d|GPU)/i.test(
      String(gl.getParameter(ext.UNMASKED_RENDERER_WEBGL)),
    )
  } catch {
    return null
  }
}

/** Synchronous best guess from the user agent alone. */
export function detectPlatform(
  nav: Nav | undefined = globalThis.navigator,
): Platform {
  const ua = nav?.userAgent ?? ''
  const os = osOf(ua, nav?.userAgentData?.platform)
  const arm = /aarch64|arm64|\barm\b/i.test(ua)
  // Macs sold since 2020 are mostly Apple Silicon; UAs never say so
  const arch: ReleaseArch = arm || os === 'mac' ? 'arm64' : 'x86_64'
  return { os, arch }
}

/** Refines the guess with client hints and (on macOS) the GPU name. */
export async function refinePlatform(
  base: Platform,
  nav: Nav | undefined = globalThis.navigator,
): Promise<Platform> {
  try {
    const hint = await nav?.userAgentData?.getHighEntropyValues?.([
      'architecture',
    ])
    const a = hint?.architecture
    if (a === 'arm') return { ...base, arch: 'arm64' }
    if (a === 'x86') return { ...base, arch: 'x86_64' }
  } catch {
    /* fall through */
  }
  const apple = base.os === 'mac' ? appleGpu() : null
  if (apple === null) return base
  return { ...base, arch: apple ? 'arm64' : 'x86_64' }
}
