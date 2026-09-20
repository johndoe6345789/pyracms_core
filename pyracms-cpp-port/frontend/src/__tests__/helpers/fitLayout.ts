/**
 * jsdom lays nothing out, so give every row `state.rowWidth` px and every
 * link 100px, and let tests trigger the ResizeObserver by hand.
 */
export const layout = { rowWidth: 500 }
export const observers: (() => void)[] = []

export function stubLayout() {
  Object.defineProperty(HTMLElement.prototype, 'clientWidth', {
    configurable: true,
    get: () => layout.rowWidth,
  })
  Object.defineProperty(HTMLElement.prototype, 'offsetWidth', {
    configurable: true,
    get: () => 100,
  })
  global.ResizeObserver = class {
    constructor(cb: () => void) {
      observers.push(cb)
    }
    observe() {}
    disconnect() {}
  } as unknown as typeof ResizeObserver
}

export const fitLinks = (n: number) =>
  Array.from({ length: n }, (_, i) => ({
    key: `k${i}`,
    label: `Link ${i}`,
    href: `/l${i}`,
    icon: null,
  }))
