import { captureVideoInfo, frameTime } from '@/lib/videoFrame'

const file = new File(['x'], 'a.mp4', { type: 'video/mp4' })
const realCreate = document.createElement.bind(document)
let video: HTMLVideoElement
let ctx: { drawImage: jest.Mock } | null

beforeEach(() => {
  URL.createObjectURL = jest.fn(() => 'blob:1')
  URL.revokeObjectURL = jest.fn()
  ctx = { drawImage: jest.fn() }
  jest.spyOn(document, 'createElement').mockImplementation((tag: string) => {
    const el = realCreate(tag)
    if (tag === 'video') video = el as HTMLVideoElement
    if (el instanceof HTMLCanvasElement) {
      el.getContext = jest.fn(() => ctx) as never
      el.toBlob = (cb) => cb(new Blob(['png']))
    }
    return el
  })
})
afterEach(() => jest.restoreAllMocks())

const meta = (duration: number) => {
  Object.defineProperty(video, 'duration', { value: duration })
  video.dispatchEvent(new Event('loadedmetadata'))
}
const fire = (name: string) => video.dispatchEvent(new Event(name))

it('seeks to about a second or 10% of short clips', () => {
  expect(frameTime(60)).toBe(1)
  expect(frameTime(5)).toBe(0.5)
})

it('reads the duration and grabs a PNG frame', async () => {
  const p = captureVideoInfo(file)
  meta(20)
  fire('seeked')
  const info = await p
  expect(info.duration).toBe(20)
  expect(info.frame).toBeInstanceOf(Blob)
  expect(ctx?.drawImage).toHaveBeenCalled()
  expect(URL.revokeObjectURL).toHaveBeenCalledWith('blob:1')
})

it('gives no frame when the file cannot be read', async () => {
  const p = captureVideoInfo(file)
  fire('error')
  fire('error')
  expect(await p).toEqual({ duration: 0, frame: null })
})

it('keeps the duration when drawing is impossible', async () => {
  ctx = null
  const p = captureVideoInfo(file)
  meta(Infinity)
  fire('seeked')
  expect(await p).toEqual({ duration: 0, frame: null })
})

it('survives a failing draw', async () => {
  ctx = {
    drawImage: jest.fn(() => {
      throw new Error('x')
    }),
  }
  const p = captureVideoInfo(file)
  meta(8)
  fire('seeked')
  expect(await p).toEqual({ duration: 8, frame: null })
})

it('gives up after the timeout', async () => {
  jest.useFakeTimers()
  const p = captureVideoInfo(file, 100)
  jest.advanceTimersByTime(100)
  expect(await p).toEqual({ duration: 0, frame: null })
  jest.useRealTimers()
})
