import { useRef } from 'react'

/** Returns a callback that calls `send` at most once every 3 seconds. */
export function useTypingSender(send: () => void) {
  const last = useRef(0)
  return () => {
    if (Date.now() - last.current < 3000) return
    last.current = Date.now()
    send()
  }
}
