export interface VideoInfo {
  /** seconds; 0 when the browser could not read it */
  duration: number
  /** a PNG still, or null when none could be grabbed */
  frame: Blob | null
}

/** Seek target for the still: about 1s in, or 10% of a short clip. */
export const frameTime = (duration: number) => Math.min(1, duration * 0.1)

function drawFrame(v: HTMLVideoElement, done: (b: Blob | null) => void) {
  const canvas = document.createElement('canvas')
  canvas.width = v.videoWidth || 640
  canvas.height = v.videoHeight || 360
  const ctx = canvas.getContext('2d')
  if (!ctx) return done(null)
  ctx.drawImage(v, 0, 0, canvas.width, canvas.height)
  canvas.toBlob((b) => done(b), 'image/png')
}

/** Reads a local video's duration and grabs a PNG frame from it. */
export function captureVideoInfo(
  file: File,
  timeoutMs = 15000,
): Promise<VideoInfo> {
  return new Promise((resolve) => {
    const url = URL.createObjectURL(file)
    const v = document.createElement('video')
    let duration = 0
    let settled = false
    const finish = (frame: Blob | null) => {
      if (settled) return
      settled = true
      clearTimeout(timer)
      URL.revokeObjectURL(url)
      resolve({ duration, frame })
    }
    const timer = setTimeout(() => finish(null), timeoutMs)
    v.preload = 'auto'
    v.muted = true
    v.addEventListener('error', () => finish(null))
    v.addEventListener('loadedmetadata', () => {
      duration = Number.isFinite(v.duration) ? v.duration : 0
      v.currentTime = frameTime(duration)
    })
    v.addEventListener('seeked', () => {
      try {
        drawFrame(v, finish)
      } catch {
        finish(null)
      }
    })
    v.src = url
  })
}
